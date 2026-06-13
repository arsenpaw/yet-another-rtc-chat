import { useCallback, useEffect, useRef, useState } from 'react';
import { config } from "@/shared/config";
import {
    createSignalRSignalingClient,
    type BaseSignalingClient,
    type SignalingMessage,
} from "@/shared/api";

const SERVERS = {
    iceServers: [
        { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }
    ]
};

interface UseRtcConnectionParams {
    /** The local user's Auth0 subject — used to address peers and break offer glare. */
    uid: string;
    localStream: MediaStream | null;
    getAccessToken: () => string | Promise<string>;
    onError?: (error: unknown) => void;
    onRoomClosed?: () => void;
    /** Fired when the server rejects the join because this user is already in the room. */
    onAlreadyInRoom?: () => void;
}

/**
 * Owns a single peer connection for a 1:1 call (backend room cap is 2). Peers are
 * addressed by Auth0 userId; existing participants send the offer to a newcomer.
 */
const useRtcConnection = ({ uid, localStream, getAccessToken, onError, onRoomClosed, onAlreadyInRoom }: UseRtcConnectionParams) => {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const signalingRef = useRef<BaseSignalingClient | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
    const isCallActive = useRef(false);
    const ignoreOffer = useRef(false);
    const isSettingRemoteAnswerPending = useRef(false);
    const makingOffer = useRef(false);

    const createPeerConnection = useCallback((peerUserId: string) => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        const pc = new RTCPeerConnection(SERVERS);
        peerConnectionRef.current = pc;

        if (localStream) {
            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });
        }

        pc.ontrack = (event) => {
            const [stream] = event.streams;
            setRemoteStream(stream);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && signalingRef.current) {
                signalingRef.current.sendMessageToPeer(
                    { type: 'ice-candidate', message: event.candidate },
                    peerUserId
                );
            }
        };

        return pc;
    }, [localStream]);

    const processIceQueue = (pc: RTCPeerConnection) => {
        while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            if (candidate) pc.addIceCandidate(candidate);
        }
    };

    const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, peerUserId: string) => {
        const pc = peerConnectionRef.current || createPeerConnection(peerUserId);

        const offerCollision =
            makingOffer.current || (pc.signalingState !== "stable" && !isSettingRemoteAnswerPending.current);
        const isPolite = peerUserId > uid;
        ignoreOffer.current = !isPolite && offerCollision;
        if (ignoreOffer.current) {
            return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await signalingRef.current?.sendMessageToPeer(
            { type: 'answer', message: answer },
            peerUserId
        );

        processIceQueue(pc);
    }, [createPeerConnection, uid]);

    const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        isSettingRemoteAnswerPending.current = true;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        isSettingRemoteAnswerPending.current = false;
        processIceQueue(pc);
    }, []);

    const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        if (!pc.remoteDescription) {
            iceCandidateQueue.current.push(new RTCIceCandidate(candidate));
        } else {
            try {
                await pc.addIceCandidate(candidate);
            } catch (err) {
                if (!ignoreOffer.current) throw err;
            }
        }
    }, []);

    const setupSignaling = useCallback(async () => {
        const signaling = createSignalRSignalingClient({
            uid,
            roomsHubUrl: config.roomsHubUrl,
            signalingHubUrl: config.signalingHubUrl,
            accessToken: getAccessToken,
        });
        signalingRef.current = signaling;

        signaling.on('error', (error: unknown) => {
            onError?.(error);
        });

        signaling.onRoom('room-closed', () => {
            onRoomClosed?.();
        });

        signaling.onRoom('already-in-room', () => {
            isCallActive.current = false;
            onAlreadyInRoom?.();
        });

        signaling.on('member-joined', async (peerUserId: string) => {
            try {
                makingOffer.current = true;
                const pc = createPeerConnection(peerUserId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await signalingRef.current?.sendMessageToPeer(
                    { type: 'offer', message: offer },
                    peerUserId,
                );
            } catch (err) {
                console.error('Failed to send offer:', err);
            } finally {
                makingOffer.current = false;
            }
        });

        signaling.on('member-left', () => {
            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;
            setRemoteStream(null);
            iceCandidateQueue.current = [];
        });

        signaling.on('message-from-peer', async (msg: SignalingMessage, peerUserId: string) => {
            switch (msg.type) {
                case 'offer':
                    await handleOffer(msg.message, peerUserId);
                    break;
                case 'answer':
                    await handleAnswer(msg.message);
                    break;
                case 'ice-candidate':
                    await handleIceCandidate(msg.message);
                    break;
            }
        });

        await signaling.connect();
    }, [createPeerConnection, handleAnswer, handleIceCandidate, handleOffer, uid, getAccessToken, onError, onRoomClosed, onAlreadyInRoom]);

    const joinCall = useCallback(async (roomId: string) => {
        if (isCallActive.current) return;
        isCallActive.current = true;

        await setupSignaling();
        await signalingRef.current!.joinCall(roomId);
    }, [setupSignaling]);

    const endCall = useCallback(async () => {
        isCallActive.current = false;
        await signalingRef.current?.disconnect();
        signalingRef.current = null;
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        setRemoteStream(null);
        iceCandidateQueue.current = [];
    }, []);

    useEffect(() => {
        return () => {
            endCall();
        };
    }, [endCall]);

    useEffect(() => {
        const pc = peerConnectionRef.current;
        if (!pc || !localStream) return;

        const senders = pc.getSenders();
        const localTracks = localStream.getTracks();

        localTracks.forEach(track => {
            const sender = senders.find(s => s.track?.kind === track.kind);
            if (sender) {
                sender.replaceTrack(track);
            }
        });
    }, [localStream]);

    return { joinCall, endCall, remoteStream };
};

export default useRtcConnection;
