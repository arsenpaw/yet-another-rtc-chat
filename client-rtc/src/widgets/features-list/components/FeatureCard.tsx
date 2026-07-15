import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { LucideIcon } from "lucide-react";

export const FeatureCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) => {
    return (
        <Card className="group w-full gap-2 border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-soft-border hover:shadow-lg sm:w-80 lg:w-96">
            <CardHeader className="gap-4">
                <div className="w-fit rounded-[10px] border border-accent-soft-border bg-accent-soft p-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <Icon size={28} className="text-primary" />
                </div>
                <CardTitle className="font-display font-semibold text-xl lg:text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm lg:text-base text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}