import { ArrowRightLeft, DoorOpen, Plus, Share2 } from "lucide-react";
import { HowItWorksItem } from "./HowItWorksItem";

export const HowItWorks = () => {
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col gap-4 items-center justify-center">
                <h1 className="text-5xl font-serif font-semibold">How It Works</h1>
                <p className="text-base text-[#57404C]">From thought to connection in seconds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <HowItWorksItem icon={Plus} title="Create Room" description="Generate a secure meeting link instantly from your dashboard." />
                <HowItWorksItem icon={Share2} title="Share Invite Link" description="Share the link with your peers to join the call." />
                <HowItWorksItem icon={ArrowRightLeft} title="SignalR Negotiation" description="Exchange connection data via our ASP.NET Core Hub." />
                <HowItWorksItem icon={DoorOpen} title="P2P Media Flow" description="Direct connection established for high-quality media." />
            </div>
        </div>
    );
}