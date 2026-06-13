import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Plus, Users, Video } from "lucide-react";
import {
    closeRoom,
    createRoom,
    getMyRooms,
    type RoomSummaryDto,
} from "@/shared/api";
import {
    Badge,
    Button,
    Card,
    Input,
} from "@/shared/components/ui";

export const RoomsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, getAccessTokenSilently } = useAuth0();
    const [joinId, setJoinId] = useState("");

    const roomsQuery = useQuery({
        queryKey: ["rooms"],
        queryFn: () => getMyRooms(getAccessTokenSilently),
    });

    const createMutation = useMutation({
        mutationFn: () => createRoom(getAccessTokenSilently),
        onSuccess: ({ id }) => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            navigate(`/rooms/${id}`);
        },
        onError: (error) => toast.error(`Failed to create room: ${error}`),
    });

    const closeMutation = useMutation({
        mutationFn: (id: string) => closeRoom(id, getAccessTokenSilently),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
        onError: (error) => toast.error(`Failed to close room: ${error}`),
    });

    const handleJoinById = () => {
        const id = joinId.trim();
        if (id) navigate(`/rooms/${id}`);
    };

    return (
        <div className="w-full max-w-3xl px-6">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">Rooms</h1>
                    <p className="text-sm text-muted-foreground">Create a room or join an existing one.</p>
                </div>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                    <Plus />
                    {createMutation.isPending ? "Creating…" : "Create room"}
                </Button>
            </div>

            <div className="mb-8 flex gap-2">
                <Input
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinById()}
                    placeholder="Join by room id…"
                />
                <Button variant="outline" onClick={handleJoinById} disabled={!joinId.trim()}>
                    Join
                </Button>
            </div>

            {roomsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading rooms…</p>
            )}

            {roomsQuery.isError && (
                <p className="text-sm text-destructive">Failed to load rooms.</p>
            )}

            {roomsQuery.data?.length === 0 && (
                <p className="text-sm text-muted-foreground">You have no rooms yet.</p>
            )}

            <div className="flex flex-col gap-3">
                {roomsQuery.data?.map((room) => (
                    <RoomRow
                        key={room.id}
                        room={room}
                        isOwner={room.ownerId === user?.sub}
                        onJoin={() => navigate(`/rooms/${room.id}`)}
                        onClose={() => closeMutation.mutate(room.id)}
                        closing={closeMutation.isPending && closeMutation.variables === room.id}
                    />
                ))}
            </div>
        </div>
    );
};

interface RoomRowProps {
    room: RoomSummaryDto;
    isOwner: boolean;
    onJoin: () => void;
    onClose: () => void;
    closing: boolean;
}

const RoomRow = ({ room, isOwner, onJoin, onClose, closing }: RoomRowProps) => (
    <Card className="flex flex-row items-center justify-between gap-4 px-4">
        <div className="min-w-0">
            <p className="truncate font-mono text-sm text-foreground">{room.id}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Users size={14} />
                    {room.participantCount}/{room.maxParticipants}
                </span>
                <Badge variant={room.isActive ? "default" : "secondary"}>
                    {room.isActive ? "Active" : "Closed"}
                </Badge>
            </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" onClick={onJoin} disabled={!room.isActive}>
                <Video />
                Join
            </Button>
            {isOwner && room.isActive && (
                <Button size="sm" variant="destructive" onClick={onClose} disabled={closing}>
                    {closing ? "Closing…" : "Close"}
                </Button>
            )}
        </div>
    </Card>
);
