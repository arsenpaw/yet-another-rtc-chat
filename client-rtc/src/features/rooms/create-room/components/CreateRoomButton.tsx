import { Button } from "@/shared/components"
import { Plus } from "lucide-react"
import { useCreateRoom } from "../api/queries";

export const CreateRoomButton = ({ className }: { className?: string }) => {
    const { mutate: createRoom, isPending } = useCreateRoom();

    return (
        <Button onClick={() => createRoom()} className={className}><Plus className={isPending ? "animate-spin" : ""} />
            {isPending ? "Creating..." : "New Room"}
        </Button>
    )
}