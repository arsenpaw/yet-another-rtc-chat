import { config } from "@/shared/config";

export interface ParticipantDto {
    userId: string;
    isConnected: boolean;
}

export interface RoomSummaryDto {
    id: string;
    ownerId: string;
    maxParticipants: number;
    participantCount: number;
    isActive: boolean;
}

export interface RoomDetailDto {
    id: string;
    ownerId: string;
    maxParticipants: number;
    isActive: boolean;
    participants: ParticipantDto[];
}

export type AccessTokenProvider = () => string | Promise<string>;

async function request<T>(
    path: string,
    accessToken: AccessTokenProvider,
    init: RequestInit = {}
): Promise<T> {
    const token = await accessToken();
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
        ...init,
        headers: {
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            Authorization: `Bearer ${token}`,
            ...init.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Request to ${path} failed with status ${response.status}`);
    }

    // 204 No Content (e.g. closeRoom) has no body to parse.
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export function createRoom(accessToken: AccessTokenProvider): Promise<{ id: string }> {
    return request<{ id: string }>("/api/rooms", accessToken, { method: "POST" });
}

export function getMyRooms(accessToken: AccessTokenProvider): Promise<RoomSummaryDto[]> {
    return request<RoomSummaryDto[]>("/api/rooms", accessToken);
}

export function getRoom(id: string, accessToken: AccessTokenProvider): Promise<RoomDetailDto> {
    return request<RoomDetailDto>(`/api/rooms/${id}`, accessToken);
}

export function closeRoom(id: string, accessToken: AccessTokenProvider): Promise<void> {
    return request<void>(`/api/rooms/${id}`, accessToken, { method: "DELETE" });
}
