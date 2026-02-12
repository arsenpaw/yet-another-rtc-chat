export type SignalingMessageType = 'offer' | 'answer' | 'ice-candidate';

export interface OfferMessage {
    type: 'offer';
    message: RTCSessionDescriptionInit;
}

export interface AnswerMessage {
    type: 'answer';
    message: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage {
    type: 'ice-candidate';
    message: RTCIceCandidate;
}

export type SignalingMessage = OfferMessage | AnswerMessage | IceCandidateMessage;

export interface SignalingClientConfig {
    uid: string;
    channelName?: string;
}

export interface SignalingClientEventMap {
    'member-joined': (memberId: string) => void;
    'member-left': (memberId: string) => void;
    'message-from-peer': (message: SignalingMessage, memberId: string) => void;
    'connected': () => void;
    'disconnected': () => void;
    'connection-state-changed': (newState: string, reason: string) => void;
    'peers-online-status-changed': (status: Record<string, string>) => void;
}

export interface RoomInfoDto {
    id: string;
    maxParticipants: number;
    currentParticipants: number;
}

export interface ParticipantDto {
    connectionId: string;
    userId: string;
    isConnected: boolean;
}

export interface SignalRSignalingClientConfig extends SignalingClientConfig {
    hubUrl: string;
    accessToken?: () => string | Promise<string>;
}

export interface SignalRSignalingClientEventMap extends SignalingClientEventMap {
    'error': (message: string) => void;
    'joined-room': (roomInfo: RoomInfoDto) => void;
    'participants-list': (participants: ParticipantDto[]) => void;
    'participant-joined': (participant: ParticipantDto) => void;
    'participant-left': (participantId: string) => void;
    'room-closed': () => void;
}

export abstract class BaseSignalingClient {
    protected config: SignalingClientConfig;
    protected eventListeners: Map<keyof SignalingClientEventMap, Set<SignalingClientEventMap[keyof SignalingClientEventMap]>> = new Map();

    constructor(config: SignalingClientConfig) {
        this.config = config;
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract startCall(): Promise<string>;
    abstract joinCall(roomId: string): Promise<void>;
    abstract leaveChannel(): Promise<void>;
    abstract sendMessageToPeer(message: SignalingMessage, peerId: string): Promise<void>;

    on<T extends keyof SignalingClientEventMap>(
        event: T,
        listener: SignalingClientEventMap[T]
    ): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)?.add(listener);
    }

    off<T extends keyof SignalingClientEventMap>(
        event: T,
        listener: SignalingClientEventMap[T]
    ): void {
        this.eventListeners.get(event)?.delete(listener);
    }

    protected emit<T extends keyof SignalingClientEventMap>(
        event: T,
        ...args: Parameters<SignalingClientEventMap[T]>
    ): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                (listener as (...args: unknown[]) => void)(...args);
            });
        }
    }
}
