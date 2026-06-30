import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import {
    closeRoom,
    createRoom,
    getMyRooms,
    type RoomSummaryDto,
} from "@/shared/api";
import {
    AvatarStack,
    Button,
    Chip,
    IconRail,
    MonoLabel,
    PresenceDot,
} from "@/shared/ui";

type RoomFilter = "all" | "active" | "closed";

const FILTERS: { id: RoomFilter; label: string }[] = [
    { id: "all", label: "All rooms" },
    { id: "active", label: "Active" },
    { id: "closed", label: "Closed" },
];

/** Shorten a GUID for display while keeping the mono "#" channel look. */
const shortId = (id: string) => id.slice(0, 8);

export const RoomsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, getAccessTokenSilently } = useAuth0();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<RoomFilter>("all");

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

    // Pressing Enter with a value jumps straight into that room (join by id).
    const handleSearchEnter = () => {
        const id = search.trim();
        if (id) navigate(`/rooms/${id}`);
    };

    const rooms = roomsQuery.data ?? [];
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rooms.filter((room) => {
            if (filter === "active" && !room.isActive) return false;
            if (filter === "closed" && room.isActive) return false;
            if (q && !room.id.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [rooms, filter, search]);

    const onlineCount = rooms.reduce((n, r) => n + r.participantCount, 0);
    const featured = filtered.find((r) => r.isActive) ?? filtered[0];
    const rest = filtered.filter((r) => r !== featured);

    return (
        <div className="grid h-full grid-cols-[76px_1fr]">
            <IconRail onAdd={() => createMutation.mutate()} />

            <div className="flex min-w-0 flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-9 py-5">
                    <div className="min-w-0">
                        <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Rooms</h1>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                            {rooms.length} rooms · {onlineCount} online
                        </p>
                    </div>
                    <div className="flex items-center gap-3.5">
                        <div className="hidden w-60 items-center gap-2.5 rounded-[10px] border border-border bg-card px-3.5 py-2.5 sm:flex">
                            <Search size={15} className="text-faint" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchEnter()}
                                placeholder="Search or paste room id…"
                                className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-faint"
                            />
                        </div>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Plus size={16} />
                            )}
                            New room
                        </Button>
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex gap-2.5 px-9 pb-2 pt-[18px]">
                    {FILTERS.map((f) => (
                        <Chip
                            key={f.id}
                            active={filter === f.id}
                            onClick={() => setFilter(f.id)}
                        >
                            {f.label}
                        </Chip>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto px-9 py-[18px]">
                    {roomsQuery.isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 size={16} className="animate-spin" /> Loading rooms…
                        </div>
                    )}
                    {roomsQuery.isError && (
                        <p className="text-sm text-destructive">Failed to load rooms.</p>
                    )}
                    {!roomsQuery.isLoading && !roomsQuery.isError && filtered.length === 0 && (
                        <EmptyState
                            onCreate={() => createMutation.mutate()}
                            creating={createMutation.isPending}
                        />
                    )}

                    {featured && (
                        <>
                            <MonoLabel className="mb-3.5 ml-0.5">Featured</MonoLabel>
                            <div className="mb-7 grid gap-4 md:grid-cols-3">
                                <FeaturedRoomCard
                                    room={featured}
                                    onEnter={() => navigate(`/rooms/${featured.id}`)}
                                />
                            </div>
                        </>
                    )}

                    {rest.length > 0 && (
                        <>
                            <MonoLabel className="mb-3.5 ml-0.5">All rooms</MonoLabel>
                            <div className="grid gap-3.5 md:grid-cols-3">
                                {rest.map((room) => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        isOwner={room.ownerId === user?.sub}
                                        onEnter={() => navigate(`/rooms/${room.id}`)}
                                        onClose={() => closeMutation.mutate(room.id)}
                                        closing={
                                            closeMutation.isPending &&
                                            closeMutation.variables === room.id
                                        }
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const FeaturedRoomCard = ({
    room,
    onEnter,
}: {
    room: RoomSummaryDto;
    onEnter: () => void;
}) => (
    <div className="featured-gradient flex min-h-[170px] flex-col justify-between rounded-2xl border border-accent-soft-border p-[22px] md:col-span-2">
        <div>
            <div className="mb-2.5 flex items-center gap-2.5">
                <span className="font-mono text-faint">#</span>
                <span className="text-lg font-bold">{shortId(room.id)}</span>
                {room.isActive && (
                    <span className="flex items-center gap-1.5 rounded-full bg-online/15 px-2.5 py-1 text-[11px] font-semibold text-online">
                        <PresenceDot size={6} /> LIVE
                    </span>
                )}
            </div>
            <p className="max-w-[440px] text-sm leading-[1.5] text-secondary-text">
                Your private room. Share the link and talk face to face — no setup,
                no downloads.
            </p>
        </div>
        <div className="mt-[18px] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <AvatarStack
                    size={28}
                    ringBorderClass="border-card"
                    items={[{ label: "You" }, { label: "Guest" }]}
                />
                <span className="text-[13px] text-muted-foreground">
                    {room.participantCount}/{room.maxParticipants} in room
                </span>
            </div>
            <Button size="sm" onClick={onEnter} disabled={!room.isActive}>
                Enter
            </Button>
        </div>
    </div>
);

interface RoomCardProps {
    room: RoomSummaryDto;
    isOwner: boolean;
    onEnter: () => void;
    onClose: () => void;
    closing: boolean;
}

const RoomCard = ({ room, isOwner, onEnter, onClose, closing }: RoomCardProps) => (
    <div className="flex flex-col justify-between gap-4 rounded-[14px] border border-border bg-card p-[18px] transition-colors hover:border-accent-soft-border">
        <div className="flex items-start justify-between">
            <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="text-white/30">#</span>
                    <span className="truncate font-mono">{shortId(room.id)}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={12} />
                    {room.participantCount}/{room.maxParticipants}
                </div>
            </div>
            <PresenceDot status={room.isActive ? "online" : "offline"} />
        </div>
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={onEnter}
                disabled={!room.isActive}
            >
                Enter
            </Button>
            {isOwner && room.isActive && (
                <Button size="sm" variant="danger" onClick={onClose} disabled={closing}>
                    {closing ? "Closing…" : "Close"}
                </Button>
            )}
        </div>
    </div>
);

const EmptyState = ({
    onCreate,
    creating,
}: {
    onCreate: () => void;
    creating: boolean;
}) => (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
        <div className="brand-gradient size-12 rounded-[14px]" />
        <div>
            <p className="text-base font-semibold">No rooms yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Create your first room and share the link to start talking.
            </p>
        </div>
        <Button onClick={onCreate} disabled={creating}>
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            New room
        </Button>
    </div>
);
