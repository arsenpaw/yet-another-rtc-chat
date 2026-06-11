import { useCallback, useEffect, useRef } from "react";
import { BaseSignalingClient, type SignalingMessage } from "@/shared/api/signaling/interfaces";
import { useRTCStore } from "../model/rtc-store";
import { config } from "@/shared/config";

export const useRTC = (signalingClient: BaseSignalingClient | null) => {
    const { setLocalStream, addRemoteStream, removeRemoteStream } = useRTCStore();
    const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

    const startLocalVideo = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        setLocalStream(stream);
        return stream;
    }, [setLocalStream]);

    const createPeer = useCallback((targetId: string, stream: MediaStream) => {
        const pc = new RTCPeerConnection(config.rtcConfig);

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                signalingClient?.sendMessageToPeer({
                    type: 'ice-candidate',
                    message: event.candidate,
                }, targetId);
            }
        };

        pc.ontrack = (event) => {
            addRemoteStream(targetId, event.streams[0]);
        };

        peerConnections.current[targetId] = pc;
        return pc;
    }, [signalingClient, addRemoteStream]);

    useEffect(() => {
        if (!signalingClient) return;

        const handleMemberJoined = async (memberId: string) => {
            const stream = useRTCStore.getState().localStream;
            if (!stream) return;

            const pc = createPeer(memberId, stream);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            signalingClient.sendMessageToPeer({ type: 'offer', message: offer }, memberId);
        };

        const handleMessage = async (data: SignalingMessage, senderId: string) => {
            const stream = useRTCStore.getState().localStream;
            if (!stream) return;

            let pc = peerConnections.current[senderId];
            if (!pc) pc = createPeer(senderId, stream);

            switch (data.type) {
                case 'offer':
                    await pc.setRemoteDescription(new RTCSessionDescription(data.message));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    signalingClient.sendMessageToPeer({ type: 'answer', message: answer }, senderId);
                    break;
                case 'answer':
                    await pc.setRemoteDescription(new RTCSessionDescription(data.message));
                    break;
                case 'ice-candidate':
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(data.message));
                    }
                    break;
            };
        };

        const handleMemberLeft = (memberId: string) => {
            peerConnections.current[memberId]?.close();
            delete peerConnections.current[memberId];
            removeRemoteStream(memberId);
        };

        signalingClient.on('member-joined', handleMemberJoined);
        signalingClient.on('message-from-peer', handleMessage);
        signalingClient.on('member-left', handleMemberLeft);

        return () => {
            signalingClient.off('member-joined', handleMemberJoined);
            signalingClient.off('message-from-peer', handleMessage);
            signalingClient.off('member-left', handleMemberLeft);

            Object.values(peerConnections.current).forEach(pc => pc.close());
            peerConnections.current = {};
        };

    }, [signalingClient, createPeer, removeRemoteStream]);

    return { startLocalVideo };
}
