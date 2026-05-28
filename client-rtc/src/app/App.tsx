// import CameraPlace from "./components/CameraPlace";
// import useRtcConnection from "./hooks/useRtcConnection.ts";
// import { useSearchParams } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
import { FeaturesList } from "@/widgets/features-list/components/FeaturesList";
import { Footer } from "@/widgets/footer/components/Footer";
import { Hero } from "@/widgets/hero/components/Hero";
import { Navbar } from "@/widgets/navbar/components";
import { TechStack } from "@/widgets/tech-stack/components/TechStack";

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex flex-col items-center gap-24 mx-auto mt-10">
        <Hero />
        <TechStack />
        <FeaturesList />
        <Footer />
      </main>
    </div>
  );
}

export default App;
