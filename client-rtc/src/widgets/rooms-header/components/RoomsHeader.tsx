import { CreateRoomButton } from "@/features/rooms/create-room/components/CreateRoomButton"

export const RoomsHeader = () => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-bold font-serif text-3xl">Active Rooms</h1>
                <p className="text-gray-500">Manage your real-time communication channels and active sessions</p>
            </div>
            <CreateRoomButton className="p-6 font-bold" />
        </div>
    )
}