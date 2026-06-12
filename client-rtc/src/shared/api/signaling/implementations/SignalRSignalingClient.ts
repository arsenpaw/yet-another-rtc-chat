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
} from "../interfaces";
import type {
    RoomInfoDto,
    ParticipantDto
} from "@/shared/api/models";

export class SignalRSignalingClient extends BaseSignalingClient {
    private signalingConnection: signalR.HubConnection | null = null;
    private roomsConnection: signalR.HubConnection | null = null;
    private isConnected: boolean = false;
    private currentRoomId: string | null = null;
    private signalingHubUrl: string;
    private roomsHubUrl: string;
    private accessToken?: () => string | Promise<string>;
    private participantIdMap: Map<string, string> = new Map();

    constructor(config: SignalRSignalingClientConfig) {
        super(config);
        this.signalingHubUrl = config.signalingHubUrl;
        this.roomsHubUrl = config.roomsHubUrl;
        this.accessToken = config.accessToken;
    }

    private createConnection(hubUrl: string): signalR.HubConnection {
        return new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, { accessTokenFactory: this.accessToken })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();
    }

    private setupLifecycleListeners(connection: signalR.HubConnection, name: string) {
        connection.onreconnecting((error) => {
            console.trace(`${name} reconnecting...`, error?.message);
            this.emit('connection-state-changed', 'Reconnecting', error?.message || 'Connection lost');
        });

        connection.onreconnected((connectionId) => {
            console.trace(`${name} reconnected, connectionId:`, connectionId);
            this.emit('connection-state-changed', 'Connected', `Reconnected with ID: ${connectionId || 'unknown'}`);
        });

        connection.onclose((err) => {
            if (this.isConnected) {
                this.isConnected = false;
                this.emit('connection-state-changed', 'Disconnected', `${name} closed: ${err?.message}`);
                this.emit('disconnected');
            }
        });
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.warn('Already connected');
            return;
        }

        console.trace('Connecting to SignalR hub:', this.signalingHubUrl);

        // const builder = new signalR.HubConnectionBuilder()
        //     .withUrl(this.signalingHubUrl, {
        //         accessTokenFactory: this.accessToken
        //     })
        //     .withAutomaticReconnect()
        //     .configureLogging(signalR.LogLevel.Information);

        this.signalingConnection = this.createConnection(this.signalingHubUrl);
        this.roomsConnection = this.createConnection(this.roomsHubUrl);

        this.setupLifecycleListeners(this.signalingConnection, 'SignalR');
        this.setupLifecycleListeners(this.roomsConnection, 'Rooms');

        this.setupClientCallbacks();

        try {
            await Promise.all([
                this.signalingConnection.start(),
                this.roomsConnection.start()
            ]);

            this.isConnected = true;
            console.trace('Both SignalR hubs connected successfully');
            this.emit('connection-state-changed', 'Connected', 'All hubs ready');
            this.emit('connected');
        } catch (err) {
            console.trace('Failed to connect to SignalR hubs', err);
            this.emit('connection-state-changed', 'Error', 'Failed to connect to SignalR hubs');
        }
    }

    private setupClientCallbacks(): void {
        if (!this.signalingConnection || !this.roomsConnection) return;

        this.roomsConnection.on('JoinedRoom', (roomInfo: RoomInfoDto) => {
            console.trace('Joined room:', roomInfo);
            this.emitExtended('joined-room', roomInfo);
        });

        this.roomsConnection.on('ParticipantsList', (participants: ParticipantDto[]) => {
            console.trace('Participants list received:', participants);
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

        this.roomsConnection.on('ParticipantJoined', (participant: ParticipantDto) => {
            console.trace('Participant joined:', participant);
            this.participantIdMap.set(participant.connectionId, participant.userId);
            this.emitExtended('participant-joined', participant);
            this.emit('member-joined', participant.connectionId);
        });

        this.roomsConnection.on('ParticipantLeft', (participantId: string) => {
            console.trace('Participant left:', participantId);
            this.participantIdMap.delete(participantId);
            this.emitExtended('participant-left', participantId);
            this.emit('member-left', participantId);
        });

        this.roomsConnection.on('RoomClosed', () => {
            console.trace('Room closed');
            this.currentRoomId = null;
            this.emitExtended('room-closed');
        });

        this.roomsConnection.on('Error', (msg => this.emit('error', `RoomsHub: ${msg}`)));

        this.signalingConnection.on('ReceiveOffer', (fromParticipantId: string, sdp: string) => {
            console.trace('Received offer from:', fromParticipantId);
            const message: OfferMessage = {
                type: 'offer',
                message: { type: 'offer', sdp }
            };
            this.emit('message-from-peer', message, fromParticipantId);
        });

        this.signalingConnection.on('ReceiveAnswer', (fromParticipantId: string, sdp: string) => {
            console.trace('Received answer from:', fromParticipantId);
            const message: AnswerMessage = {
                type: 'answer',
                message: { type: 'answer', sdp }
            };
            this.emit('message-from-peer', message, fromParticipantId);
        });

        this.signalingConnection.on('ReceiveIceCandidate', (fromParticipantId: string, candidate: string) => {
            console.trace('Received ICE candidate from:', fromParticipantId);
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

        this.signalingConnection.on('Error', (msg => this.emit('error', `SignalingHub: ${msg}`)));
    }

    async join(roomId: string): Promise<void> {
        if (!this.isConnected || !this.roomsConnection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.trace('Joining room:', roomId);

        await this.roomsConnection.invoke('JoinRoom', roomId);
        this.currentRoomId = roomId;
        console.trace('Joined room successfully:', roomId);
    }

    async leaveChannel(): Promise<void> {
        if (!this.currentRoomId || !this.roomsConnection) {
            console.warn('Not in a channel');
            return;
        }

        console.trace('Leaving channel:', this.currentRoomId);

        await this.roomsConnection.invoke('LeaveRoom');
        console.trace('Left channel successfully');
        this.currentRoomId = null;
        this.participantIdMap.clear();
    }

    async sendMessageToPeer(
        message: SignalingMessage,
        peerId: string
    ): Promise<void> {
        if (!this.isConnected || !this.signalingConnection) {
            throw new Error('Not connected. Call connect() first.');
        }

        if (!this.currentRoomId) {
            throw new Error('Not in a room. Call startCall() or joinCall() first.');
        }

        console.trace('Sending message to peer:', peerId, 'type:', message.type);

        switch (message.type) {
            case 'offer':
                await this.signalingConnection.invoke(
                    'SendOffer',
                    peerId,
                    message.message.sdp
                );
                console.trace('Offer sent to:', peerId);
                break;
            case 'answer':
                await this.signalingConnection.invoke(
                    'SendAnswer',
                    peerId,
                    message.message.sdp
                );
                console.trace('Answer sent to:', peerId);
                break;
            case 'ice-candidate':
                await this.signalingConnection.invoke(
                    'SendIceCandidate',
                    peerId,
                    JSON.stringify(message.message)
                );
                console.trace('ICE candidate sent to:', peerId);
                break;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            console.warn('Already disconnected');
            return;
        }

        console.trace('Disconnecting from SignalR hub');

        this.isConnected = false;
        if (this.currentRoomId && this.roomsConnection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.roomsConnection.invoke('LeaveRoom');
            } catch (e) {
                console.warn('Failed to leave room gracefully, closing connection anyway');
            }
        }

        await Promise.all([
            this.roomsConnection?.stop(),
            this.signalingConnection?.stop()
        ])
        this.roomsConnection = null;
        this.signalingConnection = null;
        this.currentRoomId = null;

        console.trace('Disconnected successfully');
        this.emit('disconnected');
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

    async joinCall(roomId: string): Promise<void> {
        if (!this.isConnected || !this.roomsConnection) {
            throw new Error('Not connected. Call connect() first.');
        }

        console.trace('Joining call:', roomId);

        await this.join(roomId);
    }
}

export function createSignalRSignalingClient(
    config: SignalRSignalingClientConfig
): SignalRSignalingClient {
    return new SignalRSignalingClient(config);
}
