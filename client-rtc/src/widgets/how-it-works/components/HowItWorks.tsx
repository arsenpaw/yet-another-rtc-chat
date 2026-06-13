import { MessageSquare, Plus, Share2, Video } from "lucide-react";
import { HowItWorksItem } from "./HowItWorksItem";

export const HowItWorks = () => {
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col gap-4 items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl font-display font-semibold">How It Works</h1>
                <p className="text-base text-muted-foreground">From thought to connection in seconds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <HowItWorksItem index={0} icon={Plus} title="Create a room" description="Spin up a private room instantly — no setup required." />
                <HowItWorksItem index={1} icon={Share2} title="Share the link" description="Send the invite link to anyone you want on the call." />
                <HowItWorksItem index={2} icon={Video} title="They join" description="Guests open the link and step straight into the room." />
                <HowItWorksItem index={3} icon={MessageSquare} title="Start talking" description="Connect face to face with crisp audio and video." />
            </div>
        </div>
    );
}