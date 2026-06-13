import { FeaturesList } from "@/widgets/features-list";
import { Hero } from "@/widgets/hero";
import { HowItWorks } from "@/widgets/how-it-works";

export const HomePage = () => {
    return (
        <>
            <Hero />
            <FeaturesList />
            <HowItWorks />
        </>
    )
}