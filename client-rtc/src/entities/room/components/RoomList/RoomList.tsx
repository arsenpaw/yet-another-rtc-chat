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
        <div>
            {rooms?.map(room => (
                <RoomCard key={room.id} room={room} />
            ))}
        </div>
    )
}