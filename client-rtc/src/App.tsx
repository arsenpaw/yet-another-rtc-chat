import CameraPlace from './components/CameraPlace'
import './App.css'
import useRtcConnection from "./hooks/useRtcConnection.ts";


const APP_ID = "54c7aeb3855b44978c4a150d3d5fb244"
const UID = String(Math.floor(Math.random() * 10000))


function App() {
    const {remoteStream, localStream} = useRtcConnection({appId: APP_ID, userId: UID, token: undefined})
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
