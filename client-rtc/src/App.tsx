import CameraPlace from "./components/CameraPlace";
import "./App.css";
import useRtcConnection from "./hooks/useRtcConnection.ts";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./hooks/useAuth.ts";

const UID = String(Math.floor(Math.random() * 10000));

function App() {
  const [searchParams] = useSearchParams();
  const [isCallActive, setIsCallActive] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const roomId = searchParams.get("room");

  const userId = searchParams.get("uid") || UID;

  useEffect(() => {
    let isMounted = true;

    const initializeStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (isMounted) {
        streamRef.current = stream;
        setLocalStream(stream);
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    initializeStream();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const { remoteStream, startCall, joinCall, endCall } = useRtcConnection({
    uid: userId,
    localStream: localStream,
    onError: (error) => toast.error(`Signaling error: ${error}`),
  });
  const handleStartCall = async () => {
    if (!localStream) return;
    try {
      if (roomId) {
        await joinCall(roomId);
      } else {
        const newRoomId = await startCall();
        if (newRoomId) {
          const link = `${window.location.origin}${window.location.pathname}?room=${newRoomId}`;
          setInvitationLink(link);
        }
      }
      setIsCallActive(true);
    } catch (error) {
      toast.error(`Call failed: ${error}`);
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall();
      setIsCallActive(false);
      setInvitationLink(null);
    } catch (error) {
      toast.error(`End call failed: ${error}`);
    }
  };

  const { isLoading, username, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  const connectionState = localStream ? "connected" : "connecting";
  return (
    <div className="app">
      <header className="app-header">
        <h1>RTC Messenger</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {username && <span style={{ color: "#ccc" }}>👤 {username}</span>}
          <button
            onClick={logout}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: "#e74c3c",
              color: "white",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
          <div className="connection-status">
            <span
              className={`status-indicator ${connectionState === "connected" ? "connected" : "disconnected"}`}
            ></span>
          </div>
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
              className={`connect-btn ${isCallActive ? "call-active" : "call-inactive"}`}
              onClick={isCallActive ? handleEndCall : handleStartCall}
              disabled={!localStream}
              title={
                isCallActive ? "End Call" : roomId ? "Join Room" : "Start Call"
              }
            >
              {isCallActive
                ? "📞 End Call"
                : roomId
                  ? "� Join Room"
                  : "�📞 Start Call"}
            </button>

            {invitationLink && (
              <div className="invitation-link-section">
                <label>Invitation Link:</label>
                <div className="invitation-link-field">
                  <input
                    type="text"
                    readOnly
                    value={invitationLink}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(invitationLink)
                    }
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}
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
        </div>
      </main>
    </div>
  );
}

export default App;
