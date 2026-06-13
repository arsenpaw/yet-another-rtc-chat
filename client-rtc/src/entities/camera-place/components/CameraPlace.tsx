import { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CameraPlaceProps {
  isLocalCamera?: boolean;
  stream?: MediaStream | null;
  muted?: boolean;
  label?: string;
}

const CameraPlace: React.FC<CameraPlaceProps> = ({
  isLocalCamera = false,
  stream,
  muted = false,
  label,
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
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const isLive = Boolean(stream) && isVideoEnabled;

  return (
    <div
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all duration-300 animate-in fade-in zoom-in-95',
        isLive ? 'border-primary/40 shadow-md' : 'border-border'
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted || isLocalCamera}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-500',
          (!isVideoEnabled || !stream) && 'invisible opacity-0'
        )}
      />

      {(!isVideoEnabled || !stream) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <VideoOff size={28} />
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
        <span
          className={cn(
            'size-1.5 rounded-full',
            isLive ? 'bg-primary animate-pulse' : 'bg-muted-foreground/50'
          )}
        />
        {label ?? (isLocalCamera ? 'You' : 'Remote user')}
      </div>

      {isLocalCamera && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            className={cn(
              'flex size-9 items-center justify-center rounded-full backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95',
              isVideoEnabled
                ? 'bg-background/70 text-foreground hover:bg-background'
                : 'bg-destructive/90 text-destructive-foreground'
            )}
          >
            {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
          <button
            type="button"
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            className={cn(
              'flex size-9 items-center justify-center rounded-full backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95',
              isAudioEnabled
                ? 'bg-background/70 text-foreground hover:bg-background'
                : 'bg-destructive/90 text-destructive-foreground'
            )}
          >
            {isAudioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPlace;
