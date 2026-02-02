import {useState, useEffect, useCallback, useRef} from 'react'
import CameraPlace from './components/CameraPlace'
import './App.css'
import AgoraRTM, {RtmChannel, RtmClient, RtmMessage} from 'agora-rtm-sdk';

const SERVERS = {
    iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
}
const APP_ID = "54c7aeb3855b44978c4a150d3d5fb244"
const UID = String(Math.floor(Math.random() * 10000))

interface Message {
    type: string,
    message: string,
}

function App() {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const localStreamRef = useRef<MediaStream | null>(null)
    const rtmRef = useRef<RtmClient | null>(null)
    const chanelRef = useRef<RtmChannel>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const isMountedRef = useRef(false)
    const offerCreatedRef = useRef(false)

    const createPeerConnection = useCallback((memberId: string) => {

        // Create peer connection if it doesn't exist
        if (!peerConnectionRef.current) {
            peerConnectionRef.current = new RTCPeerConnection(SERVERS)

            // Add local stream tracks to peer connection
            localStreamRef.current?.getTracks().forEach(track => {
                peerConnectionRef.current?.addTrack(track, localStreamRef.current!)
            })

            // Handle remote stream
            peerConnectionRef.current.ontrack = (event) => {
                const [stream] = event.streams
                if (stream && !remoteStream) {
                    setRemoteStream(stream)
                }
            }

            // Handle ICE candidates
            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("Sending ICE candidate:", event.candidate)
                    rtmRef.current?.sendMessageToPeer(
                        {
                            text: JSON.stringify({
                                type: 'ice-candidate',
                                message: event.candidate
                            })
                        },
                        memberId
                    ).catch(err => console.error('Failed to send ICE candidate:', err))
                }
            }

            // Handle connection state changes
            peerConnectionRef.current.onconnectionstatechange = () => {
                console.log('Connection state:', peerConnectionRef.current?.connectionState)
            }

            // Handle ICE connection state changes
            peerConnectionRef.current.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', peerConnectionRef.current?.iceConnectionState)
            }
        }

    }, [remoteStream])
    // Create WebRTC offer with local stream and set up peer connection
    const createOffer = useCallback(async (memberId: string) => {
        createPeerConnection(memberId)
        if (!localStreamRef.current || offerCreatedRef.current) return
        offerCreatedRef.current = true

        // Create and set local description
        const offer = await peerConnectionRef.current?.createOffer()
        await peerConnectionRef.current?.setLocalDescription(offer)
        console.log('Offer created:', offer)

        // Send offer to remote peer via RTM
        await rtmRef.current?.sendMessageToPeer(
            {
                text: JSON.stringify({
                    type: 'offer',
                    message: offer
                })
            },
            UID
        )
    }, [createPeerConnection])
    const createAnswer = useCallback(async (memberId: string, offer: RTCSessionDescriptionInit) => {
        createPeerConnection(memberId)
        await peerConnectionRef.current?.setRemoteDescription(offer)
        const answer = await peerConnectionRef.current?.createAnswer()
        await peerConnectionRef.current?.setLocalDescription(answer)
        await rtmRef.current?.sendMessageToPeer(
            {
                text: JSON.stringify({
                    type: 'answer',
                    message: offer
                })
            },
            UID
        )
    }, [createPeerConnection])
    const addAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        await peerConnectionRef.current?.setRemoteDescription(answer)
    }, [])
    // ...existing code...
    useEffect(() => {
        if (isMountedRef.current) return
        isMountedRef.current = true

        const initializeApp = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                localStreamRef.current = stream
                setLocalStream(stream)

                if (!rtmRef.current) {
                    rtmRef.current = AgoraRTM.createInstance(APP_ID)
                }
                await rtmRef.current.login({token: undefined, uid: UID})
                chanelRef.current = rtmRef.current.createChannel('main-channel')
                await chanelRef.current.join()
                chanelRef.current.on("MemberJoined", async (memberId) => {
                    console.log('Member joined:', memberId)
                    if (!offerCreatedRef.current) {
                        await createOffer(memberId)
                    }
                })
                rtmRef.current.on("MessageFromPeer", async (message, MemberId) => {
                    const parsedMessage = JSON.parse(message.text!) as Message
                    console.log('Parsed message:', parsedMessage)
                    if (parsedMessage.type === 'offer') {
                        await createAnswer(MemberId, parsedMessage.message)
                    }
                    if (parsedMessage.type === 'answer') {
                        await addAnswer(parsedMessage.message)
                    }
                    if (parsedMessage.type === 'ice-candidate') {
                        if (peerConnectionRef.current) {
                            await peerConnectionRef.current.addIceCandidate(parsedMessage.message)
                        }
                    }
                    console.log('Message from peer:', message, MemberId)
                })

            } catch (error) {
                console.error('App initialization failed:', error)
            }
        }

        initializeApp()

        // Cleanup function
        return () => {
            const cleanup = async () => {
                try {
                    localStreamRef.current?.getTracks().forEach(track => track.stop())
                    if (chanelRef.current) {
                        await chanelRef.current.leave()
                    }
                    if (rtmRef.current) {
                        await rtmRef.current.logout()
                    }
                } catch (error) {
                    console.error('Cleanup failed:', error)
                }
            }
            cleanup()
        }
    }, []) // Empty dependency array - runs only once on mount


    return (
        <div className="app">
            <header className="app-header">
                <h1>RTC Messenger</h1>
                <div className="connection-status">

                </div>
            </header>

            <main className="main-content">
                <div className="left-side">
                    <div className="local-video-section">
                        <h2>Your Camera</h2>
                        <CameraPlace
                            isLocalCamera={true}
                            stream={localStream}
                            muted={true}
                        />
                    </div>

                    <div className="controls-section">


                    </div>
                </div>

                <div className="right-side">
                    <div className="remote-video-section">
                        <h2>Remote User</h2>
                        <CameraPlace
                            isLocalCamera={false}
                            stream={remoteStream}
                            muted={false}
                        />
                    </div>

                    <div className="chat-section">
                        <h3>Chat</h3>
                        <div className="chat-messages">
                            <div className="message received">
                                <span className="message-text">Hello! Ready to start the call?</span>
                                <span className="message-time">12:30</span>
                            </div>
                            <div className="message sent">
                                <span className="message-text">Yes, let's begin!</span>
                                <span className="message-time">12:31</span>
                            </div>
                        </div>
                        <div className="chat-input">
                            <input type="text" placeholder="Type your message..."/>
                            <button>Send</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
