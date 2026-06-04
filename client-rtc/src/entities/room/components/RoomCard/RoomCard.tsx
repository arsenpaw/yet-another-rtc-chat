import type { RoomSummary } from "../../models";

interface RoomCardProps {
    room?: RoomSummary;
}

export const RoomCard = ({ room }: RoomCardProps) => {
    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <h1>{room?.id}</h1>
        </div>
    )
}