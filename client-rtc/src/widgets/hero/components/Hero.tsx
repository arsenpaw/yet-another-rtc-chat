import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Mic, Video } from "lucide-react";
import { Avatar, AvatarStack, Button, MonoLabel, PresenceDot } from "@/shared/ui";

export const Hero = () => {
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isAuthenticated) navigate("/rooms");
        else loginWithRedirect({ appState: { returnTo: "/rooms" } });
    };

    return (
        <section className="grid items-center gap-12 px-6 pt-16 pb-10 md:grid-cols-[1.05fr_0.95fr] md:px-11 md:pt-[72px]">
            {/* Left — copy + CTAs */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <MonoLabel className="tracking-[2px] text-eyebrow">Community Rooms</MonoLabel>
                <h1 className="mt-5 max-w-[640px] text-[40px] font-extrabold leading-[1.04] tracking-[-1.5px] md:text-[60px] md:leading-[1.02] md:tracking-[-2px]">
                    Rooms for the conversations that matter.
                </h1>
                <p className="mt-5 max-w-[480px] text-base text-secondary-text md:text-lg md:leading-[1.55]">
                    Start a private room, drop into a call, and talk face to face in
                    seconds. The calm, focused home for your conversations — built for
                    talking, not scrolling.
                </p>
                <div className="mt-9 flex flex-wrap gap-3.5">
                    <Button size="lg" onClick={handleGetStarted}>
                        <Video size={18} /> Create a room
                    </Button>
                    <Button size="lg" variant="ghost" onClick={handleGetStarted}>
                        Browse rooms
                    </Button>
                </div>
                <div className="mt-10 flex items-center gap-3.5">
                    <AvatarStack
                        size={34}
                        max={4}
                        ringBorderClass="border-background"
                        items={[
                            { label: "Jamie Soto" },
                            { label: "Mara Kveld" },
                            { label: "Alex Lund" },
                            { label: "Rhea West" },
                        ]}
                    />
                    <span className="text-sm text-secondary-text">
                        <b className="text-foreground">2,481</b> people online today
                    </span>
                </div>
            </div>

            {/* Right — product preview mock */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center justify-between border-b border-border-subtle px-[18px] py-3.5">
                    <div className="flex items-center gap-2.5">
                        <span className="font-mono text-faint">#</span>
                        <span className="text-sm font-semibold">design-critique</span>
                        <PresenceDot size={7} className="ml-1" />
                    </div>
                    <div className="flex gap-2 text-secondary-text">
                        <span className="flex size-[30px] items-center justify-center rounded-lg bg-white/5">
                            <Mic size={15} />
                        </span>
                        <span className="flex size-[30px] items-center justify-center rounded-lg bg-white/5">
                            <Video size={15} />
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-[18px]">
                    <PreviewMessage name="Jamie Soto" time="11:02" body="pushed the new spacing tokens — way calmer now" />
                    <PreviewMessage name="Mara Kveld" time="11:03" body="jumping into voice to walk through it 👇" />
                    <div className="flex items-center justify-between rounded-xl border border-accent-soft-border bg-accent-soft px-3.5 py-3">
                        <div className="flex items-center gap-2">
                            <PresenceDot size={8} />
                            <span className="text-xs font-semibold text-accent-text">3 in voice</span>
                            <AvatarStack
                                size={24}
                                className="ml-1.5"
                                ringBorderClass="border-card"
                                items={[
                                    { label: "Jamie Soto" },
                                    { label: "Mara Kveld" },
                                    { label: "Alex Lund" },
                                ]}
                            />
                        </div>
                        <Button size="sm" className="h-[30px] px-3.5 text-xs">Join</Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const PreviewMessage = ({ name, time, body }: { name: string; time: string; body: string }) => (
    <div className="flex gap-2.5">
        <Avatar label={name} size={32} />
        <div>
            <div className="text-[13px]">
                <b>{name}</b>
                <span className="ml-1.5 font-mono text-[11px] text-faint">{time}</span>
            </div>
            <div className="mt-1 text-[13px] text-body">{body}</div>
        </div>
    </div>
);
