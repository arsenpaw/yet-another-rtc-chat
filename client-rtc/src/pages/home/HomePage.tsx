import { FeaturesList } from "@/widgets/features-list";
import { Hero } from "@/widgets/hero";
import { HowItWorks } from "@/widgets/how-it-works";
import { TechStack } from "@/widgets/tech-stack";

export const HomePage = () => {
    return (
        <div className="flex flex-col items-center gap-24 pb-24 mt-12">
            <Hero />
            <TechStack />
            <FeaturesList />
            <HowItWorks />
        </div>
    )
}