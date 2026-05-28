import { FeaturesList } from "@/widgets/features-list";
import { Hero } from "@/widgets/hero";
import { HowItWorks } from "@/widgets/how-it-works";
import { TechStack } from "@/widgets/tech-stack";

export const HomePage = () => {
    return (
        <>
            <Hero />
            <TechStack />
            <FeaturesList />
            <HowItWorks />
        </>
    )
}