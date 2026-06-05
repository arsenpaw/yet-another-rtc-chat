import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom } from "@/entities/room/api/roomApi";
import { roomKeys } from "@/entities/room/api/queries";

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.all() });
        }
    });
}