import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import { Copy, PhoneOff } from "lucide-react";
import { CameraPlace } from "@/entities/camera-place";
import useRtcConnection from "@/shared/lib/hooks/useRtcConnection";
import { Button } from "@/shared/components/ui";

export const RoomCallPage = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user, getAccessTokenSilently } = useAuth0();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const joinedRef = useRef(false);

    const onRoomClosed = useCallback(() => {
        toast.info("The room was closed.");
        navigate("/rooms");
    }, [navigate]);

    const onAlreadyInRoom = useCallback(() => {
        toast.warning("You are already in this room in another tab or window.");
        navigate("/rooms");
    }, [navigate]);

    const { joinCall, endCall, remoteStream } = useRtcConnection({
        uid: user?.sub ?? "",
        localStream,
        getAccessToken: getAccessTokenSilently,
        onError: (error) => toast.error(`Signaling error: ${error}`),
        onRoomClosed,
        onAlreadyInRoom,
    });

    // Acquire the local camera/microphone once.
    useEffect(() => {
        let isMounted = true;

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (!isMounted) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = stream;
                setLocalStream(stream);
            })
            .catch((error) => toast.error(`Could not access camera/microphone: ${error}`));

        return () => {
            isMounted = false;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, []);

    // Join the room once the stream is ready and we know the user.
    useEffect(() => {
        if (!roomId || !localStream || !user?.sub || joinedRef.current) return;
        joinedRef.current = true;
        joinCall(roomId).catch((error) => toast.error(`Failed to join room: ${error}`));
    }, [roomId, localStream, user?.sub, joinCall]);

    const handleLeave = async () => {
        await endCall();
        navigate("/rooms");
    };

    const copyRoomId = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            toast.success("Room id copied to clipboard");
        }
    };

    return (
        <div className="w-full max-w-5xl px-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Call</h1>
                    <button
                        type="button"
                        onClick={copyRoomId}
                        className="mt-1 flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                        {roomId}
                        <Copy size={12} />
                    </button>
                </div>
                <Button variant="destructive" onClick={handleLeave}>
                    <PhoneOff />
                    Leave
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <CameraPlace isLocalCamera stream={localStream} />
                <CameraPlace stream={remoteStream} label={remoteStream ? "Remote user" : "Waiting for peer…"} />
            </div>
        </div>
    );
};
