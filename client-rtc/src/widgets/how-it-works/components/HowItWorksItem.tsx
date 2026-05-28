import type { LucideIcon } from "lucide-react";

export const HowItWorksItem = ({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) => {
    return (
        <div className="flex flex-col gap-6 items-center w-48">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F0] flex items-center justify-center shadow-xs">
                <Icon size={32} className="text-primary" />
            </div>
            <div className="flex flex-col gap-2 text-center">
                <h1 className="text-xl lg:text-2xl font-serif font-semibold">{title}</h1>
                <p className="text-base text-[#57404C]">{description}</p>
            </div>
        </div>
    );
}