import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { LucideIcon } from "lucide-react";

export const FeatureCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) => {
    return (
        <Card className="group bg-surface w-full sm:w-80 lg:w-96 gap-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <CardHeader className="gap-4">
                <div className="bg-feature-muted/25 rounded-md p-1.5 w-fit transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <Icon size={32} className="text-feature" />
                </div>
                <CardTitle className="font-display font-semibold text-xl lg:text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm lg:text-base text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}