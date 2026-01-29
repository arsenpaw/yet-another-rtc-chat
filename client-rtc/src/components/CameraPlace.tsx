import { useRef, useEffect, useState } from 'react';
import './CameraPlace.css';

interface CameraPlaceProps {
  isLocalCamera?: boolean;
  stream?: MediaStream | null;
  muted?: boolean;
}

const CameraPlace: React.FC<CameraPlaceProps> = ({
  isLocalCamera = false,
  stream,
  muted = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className={`camera-place ${isLocalCamera ? 'local-camera' : 'remote-camera'}`}>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted || isLocalCamera}
          className={`video-stream ${!isVideoEnabled ? 'video-disabled' : ''}`}
        />
        {!isVideoEnabled && (
          <div className="video-placeholder">
            <div className="avatar-placeholder">
              📷
            </div>
          </div>
        )}
      </div>

      {isLocalCamera && (
        <div className="camera-controls">
          <button
            className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? '📹' : '📷'}
          </button>
          <button
            className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? '🎤' : '🔇'}
          </button>
        </div>
      )}

      <div className="camera-label">
        {isLocalCamera ? 'You' : 'Remote User'}
      </div>
    </div>
  );
};

export default CameraPlace;
