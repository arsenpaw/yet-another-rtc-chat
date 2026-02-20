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

        try {
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
                this.channel = null;
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

    private async joinChannel(channelName: string): Promise<void> {
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

    async startCall(): Promise<string> {
        const roomId = crypto.randomUUID();
        console.log('Starting call:', roomId);
        await this.joinChannel(roomId);
        return roomId;
    }

    async joinCall(roomId: string): Promise<void> {
        console.log('Joining call:', roomId);
        await this.joinChannel(roomId);
    }

    async leaveChannel(): Promise<void> {
        if (!this.channel) {
            console.warn('Not in a channel');
            return;
        }

        try {
            await this.channel.leave();
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
