import { MonoLabel, PresenceDot } from "@/shared/ui";

interface LiveRoom {
    name: string;
    meta: string;
}

const ROOMS: LiveRoom[] = [
    { name: "Indie Hackers", meta: "128 online · 6 in voice" },
    { name: "Type & Layout", meta: "74 online · 2 in voice" },
    { name: "Late Night Synths", meta: "203 online · 11 in voice" },
];

export const LiveNow = () => {
    return (
        <section className="px-6 pb-16 md:px-11">
            <div className="mb-4 flex items-center gap-2.5">
                <PresenceDot size={7} />
                <MonoLabel className="text-secondary-text">Live now</MonoLabel>
            </div>
            <div className="grid gap-3.5 md:grid-cols-3">
                {ROOMS.map((room) => (
                    <div
                        key={room.name}
                        className="flex items-center justify-between rounded-[13px] border border-border bg-card px-[18px] py-4"
                    >
                        <div>
                            <div className="text-sm font-semibold">{room.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{room.meta}</div>
                        </div>
                        <PresenceDot size={9} />
                    </div>
                ))}
            </div>
        </section>
    );
};
