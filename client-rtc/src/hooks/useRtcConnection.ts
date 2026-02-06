import {useCallback, useEffect, useRef, useState} from 'react';
import {createSignalingClient, type BaseSignalingClient, type SignalingMessage} from '../lib/signaling';

const SERVERS = {
    iceServers: [
        {urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']}
    ]
};

const UseRtcConnection = ({appId, uid, channel, token, localStream}: {
    appId: string,
    uid: string,
    channel: string,
    token?: string,
    localStream: MediaStream | null
}) => {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const signalingRef = useRef<BaseSignalingClient | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
    const isCallActive = useRef(false);
    const ignoreOffer = useRef(false);
    const isSettingRemoteAnswerPending = useRef(false);
    const makingOffer = useRef(false);


    const createPeerConnection = useCallback((targetMemberId: string) => {
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
                    {type: 'ice-candidate', message: event.candidate},
                    targetMemberId
                );
            }
        };

        return pc;
    }, [localStream]);

    const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, memberId: string) => {
        const pc = peerConnectionRef.current || createPeerConnection(memberId);
        const offerCollision =
            !makingOffer &&
            (pc.signalingState === "stable" || isSettingRemoteAnswerPending);
        const isPolite = memberId > uid;
        ignoreOffer.current = !isPolite && offerCollision;
        if (ignoreOffer.current) {
            return;

        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));


        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        signalingRef.current?.sendMessageToPeer(
            {type: 'answer', message: answer},
            memberId
        );

        processIceQueue(pc);
    }, [createPeerConnection, uid]);

    const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        processIceQueue(pc);
    }, []);

    const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        if (!pc.remoteDescription) {
            iceCandidateQueue.current.push(new RTCIceCandidate(candidate));
        } else {
            await pc.addIceCandidate(candidate);
        }
    }, []);

    const processIceQueue = (pc: RTCPeerConnection) => {
        while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            if (candidate) pc.addIceCandidate(candidate);
        }
    };

    const startCall = useCallback(async () => {
        if (isCallActive.current) return;
        isCallActive.current = true;

        signalingRef.current = createSignalingClient({appId, uid, token, channelName: channel});
        await signalingRef.current.connect();
        await signalingRef.current.joinChannel(channel);

        signalingRef.current.on('member-joined', async (memberId: string) => {
            try {
                makingOffer.current = true;
                const pc = createPeerConnection(memberId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                signalingRef.current?.sendMessageToPeer(
                    {type: 'offer', message: offer},
                    memberId
                );
            } catch (err) {
                console.error(err);
            } finally {
                makingOffer.current = false;
            }

        });

        signalingRef.current.on('message-from-peer', async (msg: SignalingMessage, memberId: string) => {
            switch (msg.type) {
                case 'offer':
                    await handleOffer(msg.message, memberId);
                    break;
                case 'answer':
                    await handleAnswer(msg.message);
                    break;
                case 'ice-candidate':
                    await handleIceCandidate(msg.message);
                    break;
            }
        });

    }, [appId, channel, createPeerConnection, handleAnswer, handleIceCandidate, handleOffer, token, uid]);

    const endCall = useCallback(async () => {
        isCallActive.current = false;
        signalingRef.current?.disconnect();
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

    return {startCall, endCall, remoteStream};
};

export default UseRtcConnection;