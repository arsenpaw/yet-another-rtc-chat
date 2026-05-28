import { ArrowRightLeft, Radio, Lock } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export const FeaturesList = () => {
    return (
        <div className="flex flex-col gap-10 justify-center">
            <div className="flex flex-col items-center justify-center gap-4 w-2xl mx-auto">
                <h1 className="text-5xl font-serif font-semibold">Engineered for Clarity</h1>
                <p className="text-base wrap-normal text-center">
                    Experience meetings without the friction. Our modern infrastructure ensures your focus
                    stays on the conversation, not the connection.
                </p>
            </div>
            <div className="grid grid-cols-3 gap-10 px-20">
                <FeatureCard title="SignalR Signaling" description="Exchange WebRTC offers, answers, and ICE candidates through a custom ASP.NET Core SignalingHub." icon={Radio} />
                <FeatureCard title="Direct Peer-to-Peer" description="Once negotiation is complete, audio and video flow directly between participants with no middleman." icon={ArrowRightLeft} />
                <FeatureCard title="Privacy by Design" description="Signaling-only architecture means your actual media streams never touch our servers." icon={Lock} />

            </div>
        </div>
    );
};