import { useRooms } from "../../api/queries";
import { RoomCard } from "../RoomCard";

export const RoomList = () => {
    const { data: rooms, isLoading } = useRooms();

    if (isLoading) {
        return <div>Loading rooms...</div>
    }

    if (!rooms || rooms.length === 0) {
        return <div>No rooms yet</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {rooms?.map(room => (
                <RoomCard key={room.id} room={room} />
            ))}
        </div>
    )
}