export interface RoomInfoDto {
    id: string;
    maxParticipants: number;
    currentParticipants: number;
}

export interface ParticipantDto {
    connectionId: string;
    userId: string;
    isConnected: boolean;
}