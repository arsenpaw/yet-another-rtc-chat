import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import {
    AtSign,
    Bell,
    Copy,
    Hash,
    Mic,
    MicOff,
    MonitorUp,
    PhoneOff,
    Pin,
    Plus,
    Send,
    Settings,
    Smile,
    Video as VideoIcon,
    VideoOff,
    Volume2,
} from "lucide-react";
import CameraPlace from "@/entities/camera-place/components/CameraPlace";
import useRtcConnection from "@/shared/lib/hooks/useRtcConnection";
import {
    Avatar,
    AvatarStack,
    Button,
    IconRail,
    IconTile,
    MonoLabel,
} from "@/shared/ui";

const shortId = (id: string) => id.slice(0, 8);

// ---- Presentational mock content (mirrors the Atrium room design) ----------
const TEXT_CHANNELS = ["general", "show-and-tell", "tools"];
const ONLINE_MEMBERS = [
    { name: "Rhea", offline: false },
    { name: "Theo", offline: false },
    { name: "Sage", offline: false },
    { name: "Niko", offline: true },
    { name: "Eve", offline: true },
];
const MOCK_MESSAGES = [
    { name: "Jamie Soto", time: "11:02", body: "just shipped the spacing rework — the whole thing breathes now. would love eyes before I push." },
    { name: "Alex Lund", time: "11:05", body: "the rhythm on the cards is so much better. one nit — the CTA could sit a touch lower." },
];

export const RoomCallPage = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user, getAccessTokenSilently } = useAuth0();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
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
        onError: (error) => toast.error(`Connection error: ${error}`),
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

    const toggleMic = () => {
        const track = localStream?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setMicOn(track.enabled);
        }
    };

    const toggleCam = () => {
        const track = localStream?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setCamOn(track.enabled);
        }
    };

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

    const channelName = roomId ? shortId(roomId) : "room";
    const inCall = 1 + (remoteStream ? 1 : 0);
    const displayName = user?.name ?? "You";

    return (
        <div className="grid h-full grid-cols-[76px_248px_1fr_244px]">
            <IconRail onAdd={() => navigate("/rooms")} />

            {/* ----- Room list ----- */}
            <aside className="flex flex-col border-r border-border-subtle bg-rail">
                <div className="border-b border-border-subtle px-[18px] pb-3.5 pt-5">
                    <div className="text-base font-extrabold tracking-[-0.3px]">Your room</div>
                    <div className="mt-0.5 text-xs text-faint">{inCall} in call</div>
                </div>
                <div className="flex-1 overflow-auto px-3 py-4">
                    <MonoLabel className="px-2 pb-2">Text</MonoLabel>
                    <ChannelRow name={channelName} active />
                    {TEXT_CHANNELS.map((c) => (
                        <ChannelRow key={c} name={c} />
                    ))}
                    <MonoLabel className="px-2 pb-2 pt-[18px]">Voice</MonoLabel>
                    <div className="flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-sm font-semibold text-online">
                        <Volume2 size={15} /> Critique Stage
                        <span className="ml-auto text-[11px] font-normal text-faint">{inCall}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-sm text-secondary-text">
                        <Volume2 size={15} /> Co-working
                    </div>
                </div>
                {/* Self user bar */}
                <div className="flex items-center gap-2.5 border-t border-border-subtle p-3">
                    <Avatar
                        label={displayName}
                        src={user?.picture}
                        tone="bg-primary"
                        size={32}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">{displayName}</div>
                        <div className="text-[11px] text-online">Online</div>
                    </div>
                    <Settings size={15} className="text-faint" />
                </div>
            </aside>

            {/* ----- Chat / stage column ----- */}
            <section className="flex min-w-0 flex-col bg-base-alt">
                {/* Room header */}
                <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Hash size={16} className="text-white/30" />
                        <button
                            type="button"
                            onClick={copyRoomId}
                            className="group flex items-center gap-1.5 font-mono text-base font-bold transition-colors hover:text-accent-text"
                            title="Copy room id"
                        >
                            {channelName}
                            <Copy size={13} className="text-faint transition-transform group-hover:scale-110" />
                        </button>
                        <span className="mx-1.5 h-[18px] w-px bg-white/10" />
                        <span className="truncate text-[13px] text-muted-foreground">
                            Private call · share the link to invite
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconTile variant="panel" size="md" disabled>
                            <Bell size={15} />
                        </IconTile>
                        <IconTile variant="panel" size="md" disabled>
                            <Pin size={15} />
                        </IconTile>
                    </div>
                </div>

                {/* Voice stage banner + controls */}
                <div className="voice-gradient mx-6 mt-4 flex items-center justify-between rounded-[14px] border border-accent-soft-border px-[18px] py-3.5">
                    <div className="flex items-center gap-3.5">
                        <AvatarStack
                            size={34}
                            ringBorderClass="border-[#11101a]"
                            items={[
                                { label: displayName, ring: "online" },
                                ...(remoteStream ? [{ label: "Guest" }] : []),
                            ]}
                        />
                        <div>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-accent-text-strong">
                                <Volume2 size={15} /> Critique Stage
                            </div>
                            <div className="mt-px text-xs text-secondary-text">
                                {remoteStream ? "Connected — you're live" : "Waiting for someone to join…"}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconTile
                            variant="control"
                            onClick={toggleMic}
                            className={micOn ? "" : "text-destructive"}
                            title={micOn ? "Mute microphone" : "Unmute microphone"}
                        >
                            {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                        </IconTile>
                        <IconTile
                            variant="control"
                            onClick={toggleCam}
                            className={camOn ? "" : "text-destructive"}
                            title={camOn ? "Turn off camera" : "Turn on camera"}
                        >
                            {camOn ? <VideoIcon size={16} /> : <VideoOff size={16} />}
                        </IconTile>
                        <IconTile variant="control" active disabled title="Screen share">
                            <MonitorUp size={16} />
                        </IconTile>
                        <Button variant="danger" size="md" onClick={handleLeave}>
                            <PhoneOff size={15} /> Leave
                        </Button>
                    </div>
                </div>

                {/* Real video stage */}
                <div className="grid grid-cols-2 gap-3 px-6 pt-4">
                    <CameraPlace
                        isLocalCamera
                        stream={localStream}
                        videoEnabled={camOn}
                        audioEnabled={micOn}
                        showControls={false}
                        label={displayName}
                    />
                    <CameraPlace
                        stream={remoteStream}
                        label={remoteStream ? "Guest" : "Waiting for peer…"}
                    />
                </div>

                {/* Decorative chat feed */}
                <div className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-5">
                    <MonoLabel className="text-center text-white/30">— Today —</MonoLabel>
                    {MOCK_MESSAGES.map((m, i) => (
                        <ChatMessage key={i} {...m} withAttachment={i === 0} />
                    ))}
                    <div className="flex items-center gap-2.5 text-[13px] text-faint">
                        <Avatar label="Rhea West" size={36} />
                        <span>
                            <b className="text-secondary-text">Rhea</b> is typing
                            <span className="tracking-[2px]">…</span>
                        </span>
                    </div>
                </div>

                {/* Decorative composer */}
                <div className="px-6 pb-5 pt-3.5">
                    <div className="flex items-center gap-3 rounded-[13px] border border-input bg-panel-raised px-4 py-3">
                        <Plus size={18} className="text-faint" />
                        <input
                            disabled
                            placeholder={`Message #${channelName}`}
                            className="flex-1 cursor-not-allowed bg-transparent text-sm text-foreground outline-none placeholder:text-faint"
                        />
                        <Smile size={16} className="text-faint" />
                        <AtSign size={16} className="text-faint" />
                        <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
                            <Send size={14} />
                        </span>
                    </div>
                </div>
            </section>

            {/* ----- Members rail ----- */}
            <aside className="flex flex-col overflow-auto border-l border-border-subtle bg-rail px-3.5 py-[18px]">
                <MonoLabel className="px-1.5 pb-2.5">In call — {inCall}</MonoLabel>
                <MemberRow name={displayName} src={user?.picture} ring stateIcon={micOn ? "mic" : "muted"} />
                {remoteStream && <MemberRow name="Guest" ring stateIcon="mic" />}

                <MonoLabel className="px-1.5 pb-2.5 pt-[18px]">Online — {ONLINE_MEMBERS.length}</MonoLabel>
                {ONLINE_MEMBERS.map((m) => (
                    <MemberRow key={m.name} name={m.name} presence offline={m.offline} />
                ))}
            </aside>
        </div>
    );
};

// ----------------------------------------------------------------------------
const ChannelRow = ({ name, active }: { name: string; active?: boolean }) => (
    <div
        className={
            active
                ? "flex items-center gap-2 rounded-[9px] bg-accent-soft-strong px-2.5 py-2 text-sm font-semibold text-foreground"
                : "flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-sm text-secondary-text"
        }
    >
        <span className={active ? "text-eyebrow" : "text-white/30"}>#</span>
        <span className="truncate font-mono">{name}</span>
    </div>
);

const ChatMessage = ({
    name,
    time,
    body,
    withAttachment,
}: {
    name: string;
    time: string;
    body: string;
    withAttachment?: boolean;
}) => (
    <div className="flex gap-3">
        <Avatar label={name} size={40} />
        <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
                <b className="text-sm">{name}</b>
                <span className="font-mono text-[11px] text-faint">{time}</span>
            </div>
            <div className="mt-1 text-sm leading-[1.55] text-body">{body}</div>
            {withAttachment && (
                <>
                    <div className="striped-placeholder mt-2.5 flex h-[180px] w-[340px] max-w-full items-center justify-center rounded-xl border border-border">
                        <span className="font-mono text-xs text-faint">screen-share-preview.png</span>
                    </div>
                    <div className="mt-2.5 flex gap-2">
                        <span className="rounded-full border border-accent-soft-border bg-accent-soft px-2.5 py-1 text-xs text-accent-text">🔥 4</span>
                        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-text">👏 7</span>
                    </div>
                </>
            )}
        </div>
    </div>
);

const MemberRow = ({
    name,
    src,
    ring,
    presence,
    offline,
    stateIcon,
}: {
    name: string;
    src?: string | null;
    ring?: boolean;
    presence?: boolean;
    offline?: boolean;
    stateIcon?: "mic" | "muted";
}) => (
    <div className={`flex items-center gap-2.5 px-1.5 py-1.5 ${offline ? "opacity-45" : ""}`}>
        <Avatar
            label={name}
            src={src}
            size={30}
            ring={ring ? "online" : null}
            presence={presence && !offline}
        />
        <span className={`flex-1 truncate text-[13px] ${ring ? "font-semibold" : "text-body"}`}>
            {name}
        </span>
        {stateIcon === "mic" && <Mic size={14} className="text-secondary-text" />}
        {stateIcon === "muted" && <MicOff size={14} className="text-faint" />}
    </div>
);
