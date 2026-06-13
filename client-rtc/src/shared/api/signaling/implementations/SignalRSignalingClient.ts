import * as signalR from "@microsoft/signalr";
import { BaseSignalingClient } from "../interfaces";
import type {
    SignalingMessage,
    SignalRSignalingClientConfig,
    SignalRSignalingClientEventMap,
    SignalingClientEventMap,
} from "../interfaces";
import type { ParticipantDto, RoomDetailDto } from "../../rooms";

/**
 * Drives the refactored backend, which splits room membership and WebRTC signaling
 * into two hubs:
 *   - `/hubs/rooms`     — JoinRoom / LeaveRoom (+ Participant* and RoomClosed events)
 *   - `/hubs/signaling` — SendOffer / SendAnswer / SendIceCandidate (routed by userId)
 *
 * Peers are addressed by their Auth0 `userId` (the `memberId` in the event map),
 * because the two hub connections have distinct connectionIds.
 */
export class SignalRSignalingClient extends BaseSignalingClient {
    private roomsConnection: signalR.HubConnection | null = null;
    private signalingConnection: signalR.HubConnection | null = null;
    private isConnected: boolean = false;
    private currentRoomId: string | null = null;
    private readonly roomsHubUrl: string;
    private readonly signalingHubUrl: string;
    private readonly accessToken?: () => string | Promise<string>;

    constructor(config: SignalRSignalingClientConfig) {
        super(config);
        this.roomsHubUrl = config.roomsHubUrl;
        this.signalingHubUrl = config.signalingHubUrl;
        this.accessToken = config.accessToken;
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.warn('Already connected');
            return;
        }

        this.roomsConnection = this.buildConnection(this.roomsHubUrl);
        this.signalingConnection = this.buildConnection(this.signalingHubUrl);

        this.setupRoomsCallbacks();
        this.setupSignalingCallbacks();

        await Promise.all([
            this.roomsConnection.start(),
            this.signalingConnection.start(),
        ]);

        this.isConnected = true;
        this.emit('connection-state-changed', 'Connected', 'Successfully connected');
        this.emit('connected');
    }

    private buildConnection(url: string): signalR.HubConnection {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(url, { accessTokenFactory: this.accessToken })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.onreconnecting((error) => {
            this.emit('connection-state-changed', 'Reconnecting', error?.message || 'Connection lost');
        });

        connection.onreconnected((connectionId) => {
            this.emit('connection-state-changed', 'Connected', `Reconnected with ID: ${connectionId || 'unknown'}`);
        });

        connection.onclose((error) => {
            this.isConnected = false;
            this.emit('connection-state-changed', 'Disconnected', error?.message || 'Connection closed');
            this.emit('disconnected');
        });

        return connection;
    }

    private setupRoomsCallbacks(): void {
        const connection = this.roomsConnection;
        if (!connection) return;

        connection.on('Error', (message: string) => {
            console.error('Rooms hub error:', message);
            this.emit('error', message);
        });

        connection.on('JoinedRoom', (room: RoomDetailDto) => {
            this.emitExtended('joined-room', room);
        });

        connection.on('ParticipantsList', (participants: ParticipantDto[]) => {
            this.emitExtended('participants-list', participants);
            const status: Record<string, string> = {};
            participants.forEach(p => {
                status[p.userId] = p.isConnected ? 'online' : 'offline';
            });
            this.emit('peers-online-status-changed', status);
        });

        connection.on('ParticipantJoined', (participant: ParticipantDto) => {
            this.emitExtended('participant-joined', participant);
            this.emit('member-joined', participant.userId);
        });

        connection.on('ParticipantLeft', (userId: string) => {
            this.emitExtended('participant-left', userId);
            this.emit('member-left', userId);
        });

        connection.on('RoomClosed', () => {
            this.currentRoomId = null;
            this.emitExtended('room-closed');
        });
    }

    private setupSignalingCallbacks(): void {
        const connection = this.signalingConnection;
        if (!connection) return;

        connection.on('Error', (message: string) => {
            console.error('Signaling hub error:', message);
            this.emit('error', message);
        });

        connection.on('ReceiveOffer', (fromUserId: string, sdp: string) => {
            this.emit('message-from-peer', { type: 'offer', message: { type: 'offer', sdp } }, fromUserId);
        });

        connection.on('ReceiveAnswer', (fromUserId: string, sdp: string) => {
            this.emit('message-from-peer', { type: 'answer', message: { type: 'answer', sdp } }, fromUserId);
        });

        connection.on('ReceiveIceCandidate', (fromUserId: string, candidate: string) => {
            try {
                const iceCandidate = JSON.parse(candidate) as RTCIceCandidate;
                this.emit('message-from-peer', { type: 'ice-candidate', message: iceCandidate }, fromUserId);
            } catch (error) {
                console.error('Failed to parse ICE candidate:', error);
            }
        });
    }

    /** Subscribe to a rooms-hub lifecycle event not present on the base event map. */
    onRoom<T extends keyof SignalRSignalingClientEventMap>(
        event: T,
        listener: SignalRSignalingClientEventMap[T],
    ): void {
        this.on(
            event as keyof SignalingClientEventMap,
            listener as SignalingClientEventMap[keyof SignalingClientEventMap],
        );
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

        if (this.currentRoomId) {
            await this.leaveChannel();
        }

        await Promise.all([
            this.roomsConnection?.stop(),
            this.signalingConnection?.stop(),
        ]);

        this.isConnected = false;
        this.roomsConnection = null;
        this.signalingConnection = null;
        this.emit('disconnected');
    }

    /**
     * Rooms are created via the REST API (`createRoom`), not the hub. Create the room
     * first, then call {@link joinCall} with the returned id.
     */
    async startCall(): Promise<string> {
        throw new Error('startCall is not supported. Create a room via the REST API, then call joinCall(roomId).');
    }

    async joinCall(roomId: string): Promise<void> {
        if (!this.isConnected || !this.roomsConnection) {
            throw new Error('Not connected. Call connect() first.');
        }

        await this.roomsConnection.invoke('JoinRoom', roomId);
        this.currentRoomId = roomId;
    }

    async leaveChannel(): Promise<void> {
        if (!this.currentRoomId || !this.roomsConnection) {
            console.warn('Not in a room');
            return;
        }

        await this.roomsConnection.invoke('LeaveRoom');
        this.currentRoomId = null;
    }

    async sendMessageToPeer(message: SignalingMessage, peerUserId: string): Promise<void> {
        if (!this.isConnected || !this.signalingConnection) {
            throw new Error('Not connected. Call connect() first.');
        }

        if (!this.currentRoomId) {
            throw new Error('Not in a room. Call joinCall() first.');
        }

        switch (message.type) {
            case 'offer':
                await this.signalingConnection.invoke('SendOffer', peerUserId, message.message.sdp);
                break;
            case 'answer':
                await this.signalingConnection.invoke('SendAnswer', peerUserId, message.message.sdp);
                break;
            case 'ice-candidate':
                await this.signalingConnection.invoke('SendIceCandidate', peerUserId, JSON.stringify(message.message));
                break;
        }
    }

    isChannelJoined(): boolean {
        return this.currentRoomId !== null;
    }

    getCurrentRoomId(): string | null {
        return this.currentRoomId;
    }
}

export function createSignalRSignalingClient(
    config: SignalRSignalingClientConfig
): SignalRSignalingClient {
    return new SignalRSignalingClient(config);
}
