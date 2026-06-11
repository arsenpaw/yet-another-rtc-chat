import { useCallback, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRTCStore } from "@/entities/rtc/model";
import { useRTC } from "@/entities/rtc/hooks";
import { useSignaling } from "@/shared/lib/hooks";

export const useRoomSession = (roomId: string) => {
    const { user, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

    const accessTokenFactory = useCallback(async () => {
        const token = await getAccessTokenSilently();
        return token ?? "";
    }, [getAccessTokenSilently]);

    const { client, isConnected: signalingConnected } = useSignaling({
        userId: user?.sub || "",
        accessTokenFactory
    });

    const { startLocalVideo } = useRTC(client);

    const localStream = useRTCStore(state => state.localStream);
    const remoteStreams = useRTCStore(state => state.remoteStreams);
    const setConnected = useRTCStore(state => state.setConnected);
    const resetStore = useRTCStore(state => state.reset);

    useEffect(() => {
        setConnected(signalingConnected);
    }, [signalingConnected, setConnected]);

    useEffect(() => {
        if (isLoading || !isAuthenticated || !client || !roomId) return;

        const setupSession = async () => {
            try {
                await startLocalVideo();
                await client.joinCall(roomId);
            } catch (err) {
                console.error('Failed to setup room session:', err);
            }
        };

        setupSession();

        return () => {
            if (signalingConnected) {
                client.leaveChannel();
            }
            resetStore();
        };
    }, [roomId, client, isAuthenticated, isLoading, startLocalVideo, signalingConnected, resetStore]);

    return {
        localStream,
        remoteStreams,
        isAuthenticated,
        isAuthLoading: isLoading,
        isConnected: signalingConnected
    };
};
