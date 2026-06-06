import { Badge, Button } from "@/shared/components";
import type { RoomSummary } from "../../models";
import { Card, CardTitle } from "@/shared/components/ui";
import { Trash, Users } from "lucide-react";
import { JoinRoomButton } from "@/features/rooms/join-room/components";

interface RoomCardProps {
    room?: RoomSummary;
}

export const RoomCard = ({ room }: RoomCardProps) => {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between">
                <CardTitle className="font-bold font-serif text-2xl">Video Room</CardTitle>
                <Badge className="font-mono font-semibold bg-green-300/30 text-green-700 p-3">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                </Badge>
            </div>
            <div className="flex items-center justify-between gap-6">
                <Badge variant="secondary" className="font-mono font-bold" title={room?.id}>{room?.id?.slice(0, 26)}...</Badge>
                <p className="flex items-center justify-end gap-2 px-2"><Users size={14} /> {room?.participantCount} / {room?.maxParticipants}</p>
            </div>
            <hr />
            <div className="flex items-center gap-2">
                <JoinRoomButton roomId={room?.id} />
                <Button variant="destructive" size="icon"><Trash /></Button>
            </div>
        </Card>
    )
}