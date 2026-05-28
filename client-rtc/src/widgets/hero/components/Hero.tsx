import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import ConferencePhoto from "@/shared/assets/conference.png"
import { Button } from "@/shared/components";
import { Video } from "lucide-react";

export const Hero = () => {
    return (
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 px-4">
            <div className="flex flex-col gap-4">
                <Badge className="font-mono text-primary gap-2 bg-[#FFF0F0]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Yet Another RTC Chat
                </Badge>
                <h1 className="text-5xl font-serif font-semibold flex flex-col items-start gap-1">
                    <span>Simple, Peer-to-Peer</span>
                    <span className="relative inline-block text-primary pb-2">
                        <span className="relative z-10">WebRTC Video Chat.</span>
                        <svg
                            className="absolute left-[-1%] bottom-0.5 w-[102%] h-5.5 text-primary/30 z-0"
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M 0,2 Q 50,10 100,2"
                                stroke="currentColor"
                                strokeWidth="7"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                    </span>
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    A lightweight RTC application built with React, .NET 8, and SignalR.
                    <br className="hidden md:block" />
                    No third-party SDKs—just pure WebRTC signaling for direct peer
                    <br className="hidden md:block" />
                    connections.
                </p>
                <Button variant="default" size="lg" className="font-mono">
                    <Video size={24} />Get Started</Button>
            </div>
            <Card className="bg-[#FFF0F0] py-5">
                <CardContent>
                    <img src={ConferencePhoto} alt="Conference Call" className="w-full h-full object-cover rounded-lg" loading="lazy" />
                </CardContent>
            </Card>
        </div>
    );
};