import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { LucideIcon } from "lucide-react";

export const FeatureCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) => {
    return (
        <Card className="bg-[#FFF8F8] w-full sm:w-80 lg:w-96 gap-2">
            <CardHeader className="gap-4">
                <div className="bg-[#487700]/30 rounded-sm p-1.5 w-fit">
                    <Icon size={32} className="text-[#375C00]" />
                </div>
                <CardTitle className="font-serif font-semibold text-xl lg:text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm lg:text-base text-[#57404C]">{description}</p>
            </CardContent>
        </Card>
    );
}