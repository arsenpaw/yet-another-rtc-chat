import { useEffect, useRef, useState } from 'react';
import { createSignalRSignalingClient, type BaseSignalingClient } from "@/shared/api";
import { config } from '@/shared/config';

export const useSignaling = ({ userId, accessTokenFactory }: {
    userId: string,
    accessTokenFactory?: () => Promise<string | null>
}) => {
    const clientRef = useRef<BaseSignalingClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const tokenFactoryAdapter = accessTokenFactory ? async () => (await accessTokenFactory()) ?? "" : undefined;

        const client = createSignalRSignalingClient({
            uid: userId,
            signalingHubUrl: config.signalingHubUrl,
            roomsHubUrl: config.roomsHubUrl,
            accessToken: tokenFactoryAdapter,
        });

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        client.on('connected', onConnect);
        client.on('disconnected', onDisconnect);

        client.connect().catch(console.error);
        clientRef.current = client;

        return () => {
            client.off('connected', onConnect);
            client.off('disconnected', onDisconnect);
            client.disconnect();
            clientRef.current = null;
        };
    }, [userId]);

    return { client: clientRef.current, isConnected };
}