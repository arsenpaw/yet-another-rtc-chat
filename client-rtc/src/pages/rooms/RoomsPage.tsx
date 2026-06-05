import { RoomList } from "@/entities/room/components";
import { RoomsHeader } from "@/widgets/rooms-header/components/RoomsHeader";

export const RoomsPage = () => {
    return (
        <div className="container mx-auto py-8 flex flex-col gap-6">
            <RoomsHeader />
            <RoomList />
        </div>
    );
}