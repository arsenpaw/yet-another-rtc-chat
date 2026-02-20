import * as signalR from "@microsoft/signalr";
import { BaseSignalingClient } from "../interfaces";
import type {
    SignalingMessage,
    OfferMessage,
    AnswerMessage,
    IceCandidateMessage,
    SignalRSignalingClientConfig,
    SignalRSignalingClientEventMap,
    SignalingClientEventMap,
    RoomInfoDto,
    ParticipantDto
} from "../interfaces";

export class SignalRSignalingClient extends BaseSignalingClient {
    private connection: signalR.HubConnection | null = null;
    private isConnected: boolean = false;
    private currentRoomId: string | null = null;
    private hubUrl: string;
    private accessToken?: () => string | Promise<string>;
    private participantIdMap: Map<string, string> = new Map();

    constructor(config: SignalRSignalingClientConfig) {
        super(config);
        this.hubUrl = config.hubUrl;
        this.accessToken = config.accessToken;
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.warn('Already connected');
            return;
        }

        console.log('Connecting to SignalR hub:', this.hubUrl);

        try {
            const builder = new signalR.HubConnectionBuilder()
                .withUrl(this.hubUrl, {
                    accessTokenFactory: this.accessToken
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information);

            this.connection = builder.build();

            this.connection.onreconnecting((error) => {
                console.log('SignalR reconnecting...', error?.message);
                this.emit('connection-state-changed', 'Reconnecting', error?.message || 'Connection lost');
            });

            this.connection.onreconnected((connectionId) => {
                console.log('SignalR reconnected, connectionId:', connectionId);
                this.emit('connection-state-changed', 'Connected', `Reconnected with ID: ${connectionId || 'unknown'}`);
            });

            this.connection.onclose((error) => {
                console.log('SignalR connection closed', error?.message);
                this.isConnected = false;
                this.emit('connection-state-changed', 'Disconnected', error?.message || 'Connection closed');
                this.emit('disconnected');
            });

            this.setupClientCallbacks();

            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR connected successfully');
            this.emit('connection-state-changed', 'Connected', 'Successfully connected');
            this.emit('connected');
        } catch (error) {
            console.error('Failed to connect:', error);
            throw error;
        }
    }

    private setupClientCallbacks(): void {
        if (!this.connection) return;

        this.connection.on('Error', (message: string) => {
            console.error('SignalR Error:', message);
            this.emitExtended('error', message);
        });

        this.connection.on('JoinedRoom', (roomInfo: RoomInfoDto) => {
            console.log('Joined room:', roomInfo);
            this.emitExtended('joined-room', roomInfo);
        });

        this.connection.on('ParticipantsList', (participants: ParticipantDto[]) => {
            console.log('Participants list received:', participants);
            participants.forEach(p => {
                this.participantIdMap.set(p.connectionId, p.userId);
            });
            this.emitExtended('participants-list', participants);
            const status: Record<string, string> = {};
            participants.forEach(p => {
                status[p.connectionId] = p.isConnected ? 'online' : 'offline';
            });
            this.emit('peers-online-status-changed', status);
        });

        this.connection.on('ParticipantJoined', (participant: ParticipantDto) => {
            console.log('Participant joined:', participant);
            this.participantIdMap.set(participant.connectionId, participant.userId);
            this.emitExtended('participant-joined', participant);
            this.emit('member-joined', participant.connectionId);
        });

        this.connection.on('ParticipantLeft', (participantId: string) => {
            console.log('Participant left:', participantId);
            this.participantIdMap.delete(participantId);
            this.emitExtended('participant-left', participantId);
            this.emit('member-left', participantId);
        });

        this.connection.on('RoomClosed', () => {
            console.log('Room closed');
            this.currentRoomId = null;
            this.emitExtended('room-closed');
        });

        this.connection.on('ReceiveOffer', (fromParticipantId: string, sdp: string) => {
            console.log('Received offer from:', fromParticipantId);
            const message: OfferMessage = {
                type: 'offer',
                message: { type: 'offer', sdp }
            };
            this.emit('message-from-peer', message, fromParticipantId);
        });

        this.connection.on('ReceiveAnswer', (fromParticipantId: string, sdp: string) => {
            console.log('Received answer from:', fromParticipantId);
            const message: AnswerMessage = {
                type: 'answer',
                message: { type: 'answer', sdp }
            };
            this.emit('message-from-peer', message, fromParticipantId);
        });

        this.connection.on('ReceiveIceCandidate', (fromParticipantId: string, candidate: string) => {
            console.log('Received ICE candidate from:', fromParticipantId);
            try {
                const iceCandidate = JSON.parse(candidate) as RTCIceCandidate;
                const message: IceCandidateMessage = {
                    type: 'ice-candidate',
                    message: iceCandidate
                };
                this.emit('message-from-peer', message, fromParticipantId);
            } catch (error) {
                console.error('Failed to parse ICE candidate:', error);
            }
        });
    }

    private emitExtended<T extends keyof SignalRSignalingClientEventMap>(
        event: T,
        ...args: Parameters<SignalRSignalingClientEventMap[T]>
    ): void {
        const listeners = this.eventListeners.get(event as keyof SignalingClientEventMap);
        if (listeners) {
            listeners.forEach(listener => {
                (listener as (...args: unknown[]) => void)(...args);
            });
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            console.warn('Already disconnected');
            return;
        }

        console.log('Disconnecting from SignalR hub');

        try {
            if (this.currentRoomId) {
                await this.leaveChannel();
            }
            await this.connection?.stop();
            this.isConnected = false;
            this.connection = null;
            console.log('Disconnected successfully');
            this.emit('disconnected');
        } catch (error) {
            console.error('Failed to disconnect:', error);
            throw error;
        }
    }

    async tryCreateRoom(maxParticipants: number = 10): Promise<string> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.log('Trying to create room with max participants:', maxParticipants);

        const createdRoomId = await this.connection.invoke<string>('CreateRoom', maxParticipants);
        console.log('Room created:', createdRoomId);
        return createdRoomId;
    }

    async join(roomId: string): Promise<void> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.log('Joining room:', roomId);

        try {
            await this.connection.invoke('JoinRoom', roomId);
            this.currentRoomId = roomId;
            console.log('Joined room successfully:', roomId);
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }

    async startCall(): Promise<string> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.log('Starting call, creating room');

        const createdRoomId = await this.tryCreateRoom();
        await this.join(createdRoomId);
        return createdRoomId;
    }

    async joinCall(roomId: string): Promise<void> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.log('Joining call:', roomId);
        await this.join(roomId);
    }


    async leaveChannel(): Promise<void> {
        if (!this.currentRoomId || !this.connection) {
            console.warn('Not in a channel');
            return;
        }

        console.log('Leaving channel:', this.currentRoomId);

        try {
            await this.connection.invoke('LeaveRoom');
            console.log('Left channel successfully');
            this.currentRoomId = null;
            this.participantIdMap.clear();
        } catch (error) {
            console.error('Failed to leave channel:', error);
            throw error;
        }
    }

    async sendMessageToPeer(
        message: SignalingMessage,
        peerId: string
    ): Promise<void> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected. Call connect() first.');
        }

        if (!this.currentRoomId) {
            throw new Error('Not in a room. Call startCall() or joinCall() first.');
        }

        console.log('Sending message to peer:', peerId, 'type:', message.type);

        try {
            switch (message.type) {
                case 'offer':
                    await this.connection.invoke(
                        'SendOffer',
                        peerId,
                        message.message.sdp
                    );
                    console.log('Offer sent to:', peerId);
                    break;
                case 'answer':
                    await this.connection.invoke(
                        'SendAnswer',
                        peerId,
                        message.message.sdp
                    );
                    console.log('Answer sent to:', peerId);
                    break;
                case 'ice-candidate':
                    await this.connection.invoke(
                        'SendIceCandidate',
                        peerId,
                        JSON.stringify(message.message)
                    );
                    console.log('ICE candidate sent to:', peerId);
                    break;
            }
        } catch (error) {
            console.error('Failed to send message to peer:', error);
            throw error;
        }
    }

    async createRoom(maxParticipants: number = 10): Promise<string> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.log('Creating room');

        try {
            const roomId = await this.connection.invoke<string>('CreateRoom', maxParticipants);
            console.log('Room created:', roomId);
            return roomId;
        } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
        }
    }

    async closeRoom(roomId: string): Promise<void> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.log('Closing room:', roomId);

        try {
            await this.connection.invoke('CloseRoom', roomId);
            console.log('Room closed:', roomId);
        } catch (error) {
            console.error('Failed to close room:', error);
            throw error;
        }
    }

    isChannelJoined(): boolean {
        return this.currentRoomId !== null;
    }

    getCurrentRoomId(): string | null {
        return this.currentRoomId;
    }

    getConnectionState(): signalR.HubConnectionState | null {
        return this.connection?.state ?? null;
    }
}

export function createSignalRSignalingClient(
    config: SignalRSignalingClientConfig
): SignalRSignalingClient {
    return new SignalRSignalingClient(config);
}
