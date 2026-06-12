import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoomSession } from '@/entities/room/hooks/useRoomSession';

/**
 * Окремий компонент для Відео, щоб уникнути зайвих рендерів
 */
const VideoView = ({ stream, label, muted = false, isLocal = false }: { 
  stream: MediaStream | null, 
  label: string, 
  muted?: boolean,
  isLocal?: boolean 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 group">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
           <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800" />
              <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Waiting for stream...</p>
           </div>
        </div>
      )}
      
      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider border border-white/5">
        {label}
      </div>
    </div>
  );
};

export const RoomPage = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth0();

  // Основний хук оркестрації - тепер він сам все дістає з Auth0
  const { localStream, remoteStreams, isConnected } = useRoomSession(roomId || '');

  // 1. Стан завантаження Auth0
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-blue-500 animate-pulse font-bold tracking-tighter text-2xl">LOADING SESSION...</div>
      </div>
    );
  }

  // 2. Стан, якщо користувач не авторизований
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center max-w-sm">
          <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You need to be logged in to access this room.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/10 p-2 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-500 rounded-sm rotate-45" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">ROOM: {roomId}</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Status: {isConnected ? 'Connected' : 'Connecting...'}</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-red-500/20"
        >
          Leave
        </button>
      </header>

      {/* Grid Container */}
      <main className="p-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* My Video */}
          <VideoView 
            stream={localStream} 
            label="You (Local)" 
            muted={true} 
            isLocal={true} 
          />

          {/* Remote Videos */}
          {Object.entries(remoteStreams || {}).map(([peerId, stream]) => (
            <VideoView 
              key={peerId} 
              stream={stream} 
              label={`Participant ${peerId.slice(0, 4)}`} 
            />
          ))}

          {/* Empty State / Invitation */}
          {(!remoteStreams || Object.keys(remoteStreams).length === 0) && (
            <div className="aspect-video border-2 border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Waiting for others</p>
              <p className="text-[10px] text-slate-700 mt-2">Share the URL to invite participants</p>
            </div>
          )}
        </div>
      </main>

      {/* Поточний користувач (Floating tag) */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 pr-4 rounded-full border border-slate-800 shadow-2xl">
        <img src={user?.picture} className="w-8 h-8 rounded-full border border-blue-500" alt="avatar" />
        <span className="text-xs font-bold text-white">{user?.name}</span>
      </div>
    </div>
  );
};
