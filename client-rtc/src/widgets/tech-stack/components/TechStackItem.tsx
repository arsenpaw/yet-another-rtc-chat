import { type ComponentType } from "react";
import { cn } from "@/shared/lib/utils";

export type TechStackItemProps = {
    name: string;
    logo: ComponentType<any>;
}

export const TechStackItem = ({
    name,
    logo: Icon,
}: TechStackItemProps) => {
    return (
        <div className="flex items-center gap-2">
            <Icon className={cn("size-6")} />
            <span className="text-lg font-semibold">{name}</span>
        </div>
    );
};