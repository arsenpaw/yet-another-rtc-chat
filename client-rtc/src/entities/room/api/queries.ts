import { useQuery } from "@tanstack/react-query";
import { getRooms, getRoom } from "./roomApi";

export const roomKeys = {
    all: () => ['rooms'] as const,
    detail: (id: string) => [...roomKeys.all(), id] as const
}

export const useRooms = () => {
    return useQuery({
        queryKey: roomKeys.all(),
        queryFn: getRooms
    })
}

export const useRoomDetails = (id: string) => {
    return useQuery({
        queryKey: roomKeys.detail(id),
        queryFn: () => getRoom(id),
        enabled: !!id
    })
}