export interface RoomBase {
    id: string;
    ownerId: string;
    maxParticipants: number;
    isActive: boolean;
}

export interface RoomSummary extends RoomBase {
    participantCount: number;
}

export interface RoomDetails extends RoomBase {
    participants?: Participant[];
}

export interface Participant {
    userId: string;
    displayName: string;
}