import {useState, useEffect, useCallback, useRef} from 'react'
import CameraPlace from './components/CameraPlace'
import './App.css'
import {RTMClient, RTMStreamChannel} from 'agora-rtm-sdk';
const SERVERS = {
    iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
}
const APP_ID = "54c7aeb3855b44978c4a150d3d5fb244"
const UID = String(Math.floor(Math.random() * 10000))
function App() {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const localStreamRef = useRef<MediaStream | null>(null)
    const rtmRef = useRef<RTMClient | null>(null)
    const chanelRef = useRef<RTMStreamChannel>(null)
    chanelRef.current.join(() => {
        console.log('Joined channel successfully');
    })
    useEffect(() => {
        const initializeRTM = async () => {
            if (!rtmRef.current) {
                rtmRef.current = new RTMClient(APP_ID, UID);
            }
            await rtmRef.current.login();
            chanelRef.current =  rtmRef.current.createStreamChannel('main-channel');
            await chanelRef.current.join();
        };
        initializeRTM();

        return () => {
            if (rtmRef.current) {
                rtmRef.current.logout();
            }
        };
    }, []);
    const createOffer = useCallback(async () => {
        if (!localStream) return

        const peerConnection = new RTCPeerConnection(SERVERS)

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
        })

        peerConnection.ontrack = (event) => {
            const [stream] = event.streams
            setRemoteStream(stream)
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate)
            }
        }

        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        console.log('Offer created:', offer)
    }, [localStream])

    // Only call createOffer when local stream is available and we want to connect
    useEffect(() => {
        if (localStream && isConnected) {
            createOffer();
        }
    }, [localStream, isConnected, createOffer]);
    useEffect(() => {
        // Initialize local camera stream
        const initializeCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                localStreamRef.current = stream
                setLocalStream(stream)
            } catch (error) {
                console.error('Error accessing camera:', error)
            }
        }

        initializeCamera()

        // Cleanup function
        return () => {
            localStreamRef.current?.getTracks().forEach(track => track.stop())
        }
    }, []) // Empty dependency array to run only once

    const handleConnect = () => {
        setIsConnected(!isConnected)
        // TODO: Implement WebRTC connection logic here
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>RTC Messenger</h1>
                <div className="connection-status">
                    <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
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
                        <button
                            className={`connect-btn ${isConnected ? 'disconnect' : 'connect'}`}
                            onClick={handleConnect}
                        >
                            {isConnected ? 'Disconnect' : 'Start Call'}
                        </button>

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
