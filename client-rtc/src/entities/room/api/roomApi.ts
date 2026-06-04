import { api } from "@/shared/api";
import type { RoomSummary, RoomDetails } from "../models";

export const getRooms = async (): Promise<RoomSummary[]> => {
    const response = await api.get<RoomSummary[]>('/rooms');
    return response.data;
};

export const getRoom = async (id: string): Promise<RoomDetails> => {
    const response = await api.get<RoomDetails>(`api/rooms/${id}`);
    return response.data;
};