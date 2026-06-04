// import CameraPlace from "./components/CameraPlace";
// import useRtcConnection from "./hooks/useRtcConnection.ts";
// import { useSearchParams } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "@/pages/home";
import { RoomsPage } from "@/pages/rooms";
import { ProtectedRoute } from "@/features/auth";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

// const UID = String(Math.floor(Math.random() * 10000));

function App() {
  // const [searchParams] = useSearchParams();
  // const [isCallActive, setIsCallActive] = useState(false);
  // const [invitationLink, setInvitationLink] = useState<string | null>(null);
  // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  // const streamRef = useRef<MediaStream | null>(null);

  // const roomId = searchParams.get("room");

  // const userId = searchParams.get("uid") || UID;

  // useEffect(() => {
  //   let isMounted = true;

  //   const initializeStream = async () => {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     });
  //     if (isMounted) {
  //       streamRef.current = stream;
  //       setLocalStream(stream);
  //     } else {
  //       stream.getTracks().forEach((track) => track.stop());
  //     }
  //   };

  //   initializeStream();

  //   return () => {
  //     isMounted = false;
  //     streamRef.current?.getTracks().forEach((track) => track.stop());
  //     streamRef.current = null;
  //   };
  // }, []);

  // const { remoteStream, startCall, joinCall, endCall } = useRtcConnection({
  //   uid: userId,
  //   localStream: localStream,
  //   onError: (error) => toast.error(`Signaling error: ${error}`),
  // });
  // const handleStartCall = async () => {
  //   if (!localStream) return;
  //   try {
  //     if (roomId) {
  //       await joinCall(roomId);
  //     } else {
  //       const newRoomId = await startCall();
  //       if (newRoomId) {
  //         const link = `${window.location.origin}${window.location.pathname}?room=${newRoomId}`;
  //         setInvitationLink(link);
  //       }
  //     }
  //     setIsCallActive(true);
  //   } catch (error) {
  //     toast.error(`Call failed: ${error}`);
  //   }
  // };

  // const handleEndCall = async () => {
  //   try {
  //     await endCall();
  //     setIsCallActive(false);
  //     setInvitationLink(null);
  //   } catch (error) {
  //     toast.error(`End call failed: ${error}`);
  //   }
  // };

  // const connectionState = localStream ? "connected" : "connecting";

  const { isLoading, error } = useAuth0();

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const syncToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem('access_token', token);
        } catch (error) {
          console.error("Failed to sync token", error);
        }
      } else if (!isLoading) {
        localStorage.removeItem('access_token');
      }
    };

    syncToken();
  }, [isAuthenticated, getAccessTokenSilently, isLoading]);

  if (isLoading) return <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>

  if (error) return <div className="flex items-center justify-center h-screen">
    <div className="text-2xl text-destructive">Error: {error.message}</div>
  </div>

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/rooms" element={<RoomsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
