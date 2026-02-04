import AgoraRTM, { type RtmChannel, type RtmClient } from "agora-rtm-sdk";

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
    appId: string;
    uid: string;
    token?: string;
    channelName?: string;
}

export interface SignalingClientEventMap {
    'member-joined': (memberId: string) => void;
    'member-left': (memberId: string) => void;
    'message-from-peer': (message: SignalingMessage, memberId: string) => void;
    'connected': () => void;
    'disconnected': () => void;
}

export abstract class BaseSignalingClient {
    protected config: SignalingClientConfig;
    protected eventListeners: Map<keyof SignalingClientEventMap, Set<Function>> = new Map();

    constructor(config: SignalingClientConfig) {
        this.config = config;
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract joinChannel(channelName: string): Promise<void>;
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
        ...args: any[]
    ): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                (listener as any)(...args);
            });
        }
    }
}

export class AgoraSignalingClient extends BaseSignalingClient {
    private rtmClient: RtmClient | null = null;
    private channel: RtmChannel | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.warn('Already connected');
            return;
        }

        try {
            this.rtmClient = AgoraRTM.createInstance(this.config.appId);
            await this.rtmClient.login({
                token: this.config.token,
                uid: this.config.uid
            });
            this.isConnected = true;
            this.emit('connected');
        } catch (error) {
            console.error('Failed to connect:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            console.warn('Already disconnected');
            return;
        }

        try {
            if (this.channel) {
                await this.leaveChannel();
            }
            await this.rtmClient?.logout();
            this.isConnected = false;
            this.rtmClient = null;
            this.emit('disconnected');
        } catch (error) {
            console.error('Failed to disconnect:', error);
            throw error;
        }
    }

    async joinChannel(channelName: string): Promise<void> {
        if (!this.isConnected || !this.rtmClient) {
            throw new Error('Not connected. Call connect() first.');
        }

        try {
            this.channel = this.rtmClient.createChannel(channelName);
            await this.channel.join();

            this.channel.on('MemberJoined', (memberId: string) => {
                this.emit('member-joined', memberId);
            });

            this.channel.on('MemberLeft', (memberId: string) => {
                this.emit('member-left', memberId);
            });

            // Setup RTM message listener
            this.rtmClient.on('MessageFromPeer', (message, memberId) => {
                try {
                    const parsedMessage = JSON.parse(message.text!) as SignalingMessage;
                    this.emit('message-from-peer', parsedMessage, memberId);
                } catch (error) {
                    console.error('Failed to parse message from peer:', error);
                }
            });
        } catch (error) {
            console.error('Failed to join channel:', error);
            throw error;
        }
    }

    async leaveChannel(): Promise<void> {
        if (!this.channel) {
            console.warn('Not in a channel');
            return;
        }

        try {
            await this.channel.leave();
            this.channel = null;
        } catch (error) {
            console.error('Failed to leave channel:', error);
            throw error;
        }
    }

    async sendMessageToPeer(
        message: SignalingMessage,
        peerId: string
    ): Promise<void> {
        if (!this.isConnected || !this.rtmClient) {
            throw new Error('Not connected. Call connect() first.');
        }

        try {
            await this.rtmClient.sendMessageToPeer(
                {
                    text: JSON.stringify(message)
                },
                peerId
            );
        } catch (error) {
            console.error('Failed to send message to peer:', error);
            throw error;
        }
    }

    isChannelJoined(): boolean {
        return this.channel !== null;
    }
}

export function createSignalingClient(
    config: SignalingClientConfig
): BaseSignalingClient {
    return new AgoraSignalingClient(config);
}
