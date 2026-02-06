import {useCallback, useRef, useState} from 'react';
import {createSignalingClient, type BaseSignalingClient, type SignalingMessage} from '../lib/signaling';

const SERVERS = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

const UseRtcConnection = ({appId, uid, channel, token, localStream}: {
    appId: string,
    uid: string,
    channel: string,
    token?: string,
    localStream: MediaStream
}) => {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const signalingRef = useRef<BaseSignalingClient | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const remoteMemberIdRef = useRef<string | null>(null)

    const createPeerConnection = useCallback((memberId: string) => {
        if (!peerConnectionRef.current) {
            peerConnectionRef.current = new RTCPeerConnection(SERVERS)

            if (!localStream) {
                console.error('ERROR: localStream is null when creating peer connection')
                return
            }

            localStream.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, localStream!)
            })
            peerConnectionRef.current.ontrack = (event) => {
                const [stream] = event.streams
                if (stream) {
                    setRemoteStream(stream)
                } else {
                    console.warn('WARNING: stream is null in ontrack event')
                }
            }
            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    signalingRef.current?.sendMessageToPeer(
                        {
                            type: 'ice-candidate',
                            message: event.candidate
                        },
                        memberId
                    ).catch(err => console.error('Failed to send ICE candidate:', err))
                }
            }
        }

    }, [localStream])
    const createOffer = useCallback(async (memberId: string) => {
        try {
            createPeerConnection(memberId)

            if (!peerConnectionRef.current) {
                console.error('ERROR: peerConnectionRef.current is null after createPeerConnection')
                return
            }

            const offer = await peerConnectionRef.current.createOffer()
            if (!offer) {
                console.error('Failed to create offer: offer is null')
                return
            }

            await peerConnectionRef.current.setLocalDescription(offer)

            if (!signalingRef.current) {
                console.error('ERROR: signalingRef.current is null when trying to send offer')
                return
            }

            await signalingRef.current.sendMessageToPeer(
                {
                    type: 'offer',
                    message: offer
                },
                memberId
            )
        } catch (error) {
            console.error('Error creating offer:', error)
        }
    }, [createPeerConnection])
    const createAnswer = useCallback(async (memberId: string, offer: RTCSessionDescriptionInit) => {
        try {
            createPeerConnection(memberId)

            if (!peerConnectionRef.current) {
                console.error('ERROR: peerConnectionRef.current is null after createPeerConnection')
                return
            }

            // Check if remote description is already set
            if (peerConnectionRef.current.currentRemoteDescription) {
                // Remote description already set, skipping setRemoteDescription in createAnswer
            } else {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
            }

            const answer = await peerConnectionRef.current.createAnswer()
            if (!answer) {
                console.error('Failed to create answer: answer is null')
                return
            }

            await peerConnectionRef.current.setLocalDescription(answer)

            if (!signalingRef.current) {
                console.error('ERROR: signalingRef.current is null when trying to send answer')
                return
            }

            await signalingRef.current.sendMessageToPeer(
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
        try {
            if (!peerConnectionRef.current) {
                console.error('ERROR: peerConnectionRef.current is null in addAnswer')
                return
            }

            const currentRemoteDesc = peerConnectionRef.current.currentRemoteDescription

            // Only set remote description if not already set
            if (currentRemoteDesc) {
                // Remote description already set - skipping to avoid overwriting
                return
            }

            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (error) {
            console.error('Error adding answer:', error)
        }
    }, [])


    const startCall = useCallback(async () => {
        try {
            remoteMemberIdRef.current = null
            setRemoteStream(null)

            if (peerConnectionRef.current && peerConnectionRef.current.connectionState !== 'closed') {
                peerConnectionRef.current.close()
            }
            peerConnectionRef.current = null

            signalingRef.current = createSignalingClient({
                appId,
                uid: uid,
                token,
                channelName: channel
            })

            if (!signalingRef.current) {
                console.error('ERROR: Failed to create signaling client')
                return
            }

            await signalingRef.current.connect()

            await signalingRef.current.joinChannel(channel)
            signalingRef.current.on('member-joined', async (memberId: string) => {
                remoteMemberIdRef.current = memberId
                await createOffer(memberId)
            })

            signalingRef.current.on('member-left', (memberId: string) => {
                if (remoteMemberIdRef.current === memberId) {
                    remoteMemberIdRef.current = null
                    setRemoteStream(null)
                }
            })

            signalingRef.current.on('message-from-peer', async (message: SignalingMessage, memberId: string) => {
                if (message.type === 'offer') {
                    await createAnswer(memberId, message.message)
                } else if (message.type === 'answer') {
                    await addAnswer(message.message)
                } else if (message.type === 'ice-candidate') {
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.addIceCandidate(message.message)
                        } catch (error) {
                            console.error('Failed to add ICE candidate:', error)
                        }
                    } else {
                        console.error('ERROR: peerConnectionRef.current is null when receiving ICE candidate')
                    }
                }
            })

        } catch (error) {
            console.error('Failed to start call:', error)
        }
    }, [addAnswer, appId, channel, createAnswer, createOffer, token, uid])

    const endCall = useCallback(async () => {
        try {
            if (signalingRef.current) {
                await signalingRef.current.disconnect()
            } else {
                console.warn('WARNING: signalingRef.current is null in endCall')
            }

            if (peerConnectionRef.current) {
                peerConnectionRef.current.close()
            } else {
                console.warn('WARNING: peerConnectionRef.current is null in endCall')
            }

        } catch (error) {
            console.error('Cleanup failed:', error)
        }
    }, [])

    return ({
        startCall,
        endCall,
        remoteStream: remoteStream
    })

};

export default UseRtcConnection;