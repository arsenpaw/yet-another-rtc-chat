import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import ConferencePhoto from "@/shared/assets/conference.png"
import { Button } from "@/shared/components";
import { Video } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate("/rooms");
        } else {
            loginWithRedirect({
                appState: { returnTo: "/rooms" }
            });
        }
    };
    return (
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 px-4">
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Badge className="font-mono text-primary gap-2 bg-surface-accent">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Yet Another RTC Chat
                </Badge>
                <h1 className="text-5xl font-display font-semibold flex flex-col items-start gap-1">
                    <span>Simple, secure</span>
                    <span className="relative inline-block text-primary pb-2">
                        <span className="relative z-10">video calls.</span>
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
                <p className="mt-2 text-lg text-muted-foreground">
                    Start a private room and talk face to face in seconds.
                    <br className="hidden md:block" />
                    No downloads, no clutter — just share a link and connect.
                </p>
                <Button
                    variant="default"
                    size="lg"
                    className="font-mono transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={handleGetStarted}
                >
                    <Video size={24} />Get Started
                </Button>
            </div>
            <Card className="bg-surface-accent py-5 shadow-xl animate-float animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <CardContent>
                    <img src={ConferencePhoto} alt="Conference Call" className="w-full h-full object-cover rounded-lg" loading="lazy" />
                </CardContent>
            </Card>
        </div>
    );
};