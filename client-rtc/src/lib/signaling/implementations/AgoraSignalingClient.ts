import AgoraRTM, { type RtmChannel, type RtmClient } from "agora-rtm-sdk";
import { BaseSignalingClient } from "../interfaces";
import type { SignalingClientConfig, SignalingMessage } from "../interfaces";

export class AgoraSignalingClient extends BaseSignalingClient {
    private rtmClient: RtmClient | null = null;
    private channel: RtmChannel | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.warn('Already connected');
            return;
        }

        const appId = import.meta.env.VITE_APP_ID;
        const token = import.meta.env.VITE_AGORA_TOKEN;
        if (!appId) {
            throw new Error('VITE_APP_ID environment variable is not set');
        }
        this.rtmClient = AgoraRTM.createInstance(appId);

        this.rtmClient.on('ConnectionStateChanged', (newState, reason) => {
            this.emit('connection-state-changed', newState, reason);
        });

        this.rtmClient.on('PeersOnlineStatusChanged', (status) => {
            this.emit('peers-online-status-changed', status);
        });

        await this.rtmClient.login({
            token: token || undefined,
            uid: this.config.uid
        });
        this.isConnected = true;
        this.emit('connected');
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            console.warn('Already disconnected');
            return;
        }

        if (this.channel) {
            await this.leaveChannel();
            this.channel = null;
        }
        await this.rtmClient?.logout();
        this.isConnected = false;
        this.rtmClient = null;
        this.emit('disconnected');
    }

    private async joinChannel(channelName: string): Promise<void> {
        if (!this.isConnected || !this.rtmClient) {
            throw new Error('Not connected. Call connect() first.');
        }

        this.channel = this.rtmClient.createChannel(channelName);
        await this.channel.join();

        this.channel.on('MemberJoined', (memberId: string) => {
            this.emit('member-joined', memberId);
        });

        this.channel.on('MemberLeft', (memberId: string) => {
            this.emit('member-left', memberId);
        });

        this.rtmClient.on('MessageFromPeer', (message, memberId) => {
            try {
                const parsedMessage = JSON.parse(message.text!) as SignalingMessage;
                this.emit('message-from-peer', parsedMessage, memberId);
            } catch (error) {
                console.error('Failed to parse message from peer:', error);
            }
        });
    }

    async startCall(): Promise<string> {
        const roomId = crypto.randomUUID();
        await this.joinChannel(roomId);
        return roomId;
    }

    async joinCall(roomId: string): Promise<void> {
        await this.joinChannel(roomId);
    }

    async leaveChannel(): Promise<void> {
        if (!this.channel) {
            console.warn('Not in a channel');
            return;
        }

        await this.channel.leave();
    }

    async sendMessageToPeer(
        message: SignalingMessage,
        peerId: string
    ): Promise<void> {
        if (!this.isConnected || !this.rtmClient) {
            throw new Error('Not connected. Call connect() first.');
        }

        await this.rtmClient.sendMessageToPeer(
            {
                text: JSON.stringify(message)
            },
            peerId
        );
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
