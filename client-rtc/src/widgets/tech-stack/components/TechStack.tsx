import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Code, Server, Terminal, Zap } from "lucide-react";
import { TechStackItem } from "./TechStackItem";

export const TechStack = () => {
    return (
        <Card className="rounded-none w-full font-mono text-[#8A707D] bg-transparent border-b-2 border-t-2 border-stone-100">
            <CardHeader className="justify-center">
                <CardTitle className="font-medium uppercase">Built with modern web technologies</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-10 items-center justify-center">
                <TechStackItem name="React 18" logo={Code} />
                <TechStackItem name="TypeScript" logo={Terminal} />
                <TechStackItem name="Vite" logo={Zap} />
                <TechStackItem name=".NET 8" logo={Server} />
            </CardContent>
        </Card>
    );
}