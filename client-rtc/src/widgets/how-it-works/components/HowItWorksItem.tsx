import type { LucideIcon } from "lucide-react";

export const HowItWorksItem = ({
    icon: Icon,
    title,
    description,
    index = 0,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    index?: number;
}) => {
    return (
        <div
            className="group flex flex-col gap-6 items-center w-48 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
            style={{ animationDelay: `${index * 120}ms` }}
        >
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-accent-soft-border bg-accent-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                <Icon size={28} className="text-primary transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm">
                    {index + 1}
                </span>
            </div>
            <div className="flex flex-col gap-2 text-center">
                <h1 className="text-xl lg:text-2xl font-display font-semibold">{title}</h1>
                <p className="text-base text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
