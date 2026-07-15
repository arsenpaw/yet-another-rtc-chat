import { Hero } from "@/widgets/hero";
import { LiveNow } from "@/widgets/live-now";
import { FeaturesList } from "@/widgets/features-list";
import { HowItWorks } from "@/widgets/how-it-works";

export const HomePage = () => {
    return (
        <div className="mx-auto w-full max-w-[1440px]">
            <Hero />
            <LiveNow />
            <div className="flex flex-col gap-24 px-6 pb-24 md:px-11">
                <FeaturesList />
                <HowItWorks />
            </div>
        </div>
    );
};
