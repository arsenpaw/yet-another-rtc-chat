import { Button } from "@/shared/components"
import { useNavigate } from "react-router-dom";

export const JoinRoomButton = ({ roomId }: { roomId?: string }) => {
    const navigate = useNavigate();

    const handleJoin = async (): Promise<void> => {
        if (!roomId) {
            console.log("roomId is required");
            return;
        }
        console.log("roomId", roomId);
        navigate(`/room/${roomId}`)
    }

    return <Button className="flex-1" onClick={handleJoin}>Join</Button>
}