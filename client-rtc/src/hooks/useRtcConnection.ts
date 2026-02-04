import {useCallback, useEffect, useRef, useState} from 'react';
import {createSignalingClient, type BaseSignalingClient, type SignalingMessage} from '../lib/signaling';

const SERVERS = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

const UseRtcConnection = ({appId, userId, token}: { appId: string, userId: string, token?: string }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const localStreamRef = useRef<MediaStream | null>(null)
    const signalingRef = useRef<BaseSignalingClient | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const isMountedRef = useRef(false)
    const offerCreatedRef = useRef(false)
    const remoteMemberIdRef = useRef<string | null>(null)

    const createPeerConnection = useCallback((memberId: string) => {
        if (!peerConnectionRef.current) {
            peerConnectionRef.current = new RTCPeerConnection(SERVERS)
            localStreamRef.current?.getTracks().forEach(track => {
                peerConnectionRef.current?.addTrack(track, localStreamRef.current!)
            })
            peerConnectionRef.current.ontrack = (event) => {
                const [stream] = event.streams
                if (stream && !remoteStream) {
                    setRemoteStream(stream)
                }
            }
            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("Sending ICE candidate:", event.candidate)
                    signalingRef.current?.sendMessageToPeer(
                        {
                            type: 'ice-candidate',
                            message: event.candidate
                        },
                        memberId
                    ).catch(err => console.error('Failed to send ICE candidate:', err))
                }
            }
            peerConnectionRef.current.onconnectionstatechange = () => {
                console.log('Connection state:', peerConnectionRef.current?.connectionState)
            }

            peerConnectionRef.current.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', peerConnectionRef.current?.iceConnectionState)
            }
        }

    }, [remoteStream])
    const createOffer = useCallback(async (memberId: string) => {
        try {
            createPeerConnection(memberId)
            if (!localStreamRef.current || offerCreatedRef.current) return
            offerCreatedRef.current = true

            const offer = await peerConnectionRef.current?.createOffer()
            if (!offer) {
                console.error('Failed to create offer')
                offerCreatedRef.current = false
                return
            }
            await peerConnectionRef.current?.setLocalDescription(offer)
            await signalingRef.current?.sendMessageToPeer(
                {
                    type: 'offer',
                    message: offer
                },
                memberId
            )
        } catch (error) {
            console.error('Error creating offer:', error)
            offerCreatedRef.current = false
        }
    }, [createPeerConnection])
    const createAnswer = useCallback(async (memberId: string, offer: RTCSessionDescriptionInit) => {
        try {
            createPeerConnection(memberId)
            await peerConnectionRef.current?.setRemoteDescription(offer)
            const answer = await peerConnectionRef.current?.createAnswer()
            if (!answer) {
                console.error('Failed to create answer')
                return
            }
            await peerConnectionRef.current?.setLocalDescription(answer)
            await signalingRef.current?.sendMessageToPeer(
                {
                    type: 'answer',
                    message: answer
                },
                memberId
            )
        } catch (error) {
            console.error('Error creating answer:', error)
        }
    }, [createPeerConnection])
    const addAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        if (!peerConnectionRef.current?.currentRemoteDescription) {
            await peerConnectionRef.current?.setRemoteDescription(answer)
        }
    }, [])

    useEffect(() => {
        if (isMountedRef.current) return
        isMountedRef.current = true

        const initializeApp = async () => {
            try {
                // Initialize local camera stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                localStreamRef.current = stream
                setLocalStream(stream)

                // Initialize signaling client
                if (!signalingRef.current) {
                    signalingRef.current = createSignalingClient({
                        appId,
                        userId,
                        token,
                        channelName: 'main-channel'
                    })
                }

                // Connect to signaling server
                await signalingRef.current.connect()

                // Join channel
                await signalingRef.current.joinChannel('main-channel')

                // Setup event listeners
                signalingRef.current.on('member-joined', async (memberId: string) => {
                    console.log('Member joined:', memberId)
                    remoteMemberIdRef.current = memberId
                    if (!offerCreatedRef.current) {
                        await createOffer(memberId)
                    }
                })

                signalingRef.current.on('member-left', (memberId: string) => {
                    console.log('Member left:', memberId)
                    if (remoteMemberIdRef.current === memberId) {
                        remoteMemberIdRef.current = null
                        setRemoteStream(null)
                    }
                })

                signalingRef.current.on('message-from-peer', async (message: SignalingMessage, memberId: string) => {
                    console.log('Message from peer:', message, memberId)

                    if (message.type === 'offer') {
                        await createAnswer(memberId, message.message)
                    }

                    if (message.type === 'answer') {
                        await addAnswer(message.message)
                    }

                    if (message.type === 'ice-candidate') {
                        if (peerConnectionRef.current) {
                            await peerConnectionRef.current.addIceCandidate(message.message)
                        }
                    }
                })

            } catch (error) {
                console.error('App initialization failed:', error)
            }
        }

        initializeApp()

        return () => {
            const cleanup = async () => {
                try {
                    localStreamRef.current?.getTracks().forEach(track => track.stop())
                    if (signalingRef.current) {
                        await signalingRef.current.disconnect()
                    }
                } catch (error) {
                    console.error('Cleanup failed:', error)
                }
            }
            cleanup()
        }
    }, [addAnswer, appId, createAnswer, createOffer, token, userId])

    return ({
        remoteStream: remoteStream,
        localStream: localStream
    })

};

export default UseRtcConnection;