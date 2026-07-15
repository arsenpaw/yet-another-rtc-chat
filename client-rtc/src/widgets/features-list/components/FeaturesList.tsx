import { Zap, ShieldCheck, Link2 } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export const FeaturesList = () => {
    return (
        <div className="flex flex-col gap-10 justify-center">
            <div className="flex flex-col items-center justify-center gap-4 w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl font-display font-semibold">Built for clarity</h1>
                <p className="text-base wrap-normal text-center text-muted-foreground">
                    Meetings without the friction. Everything is designed to keep your focus
                    on the conversation, not the setup.
                </p>
            </div>
            <div className="grid grid-cols-3 gap-10 px-20">
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <FeatureCard title="Instant rooms" description="Create a room and start talking in seconds — no scheduling, no waiting, no setup." icon={Zap} />
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:120ms]">
                    <FeatureCard title="Crisp & direct" description="Smooth, high-quality audio and video that connects you straight to the people you're calling." icon={Link2} />
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:240ms]">
                    <FeatureCard title="Private by design" description="Your conversations stay between you and your guests. Share a link and talk with confidence." icon={ShieldCheck} />
                </div>
            </div>
        </div>
    );
};