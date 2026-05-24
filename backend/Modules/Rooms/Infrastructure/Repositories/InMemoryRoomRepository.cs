#nullable enable

using System.Collections.Concurrent;
using CompanyName.MyMeetings.Modules.Rooms.Application.Repositories;
using CompanyName.MyMeetings.Modules.Rooms.Domain;

namespace CompanyName.MyMeetings.Modules.Rooms.Infrastructure.Repositories;

public class InMemoryRoomRepository : IRoomRepository
{
    private readonly ConcurrentDictionary<Guid, Room> _rooms = new();

    public Task<Room?> GetByIdAsync(RoomId id, CancellationToken cancellationToken = default)
    {
        _rooms.TryGetValue(id.Value, out var room);
        return Task.FromResult(room);
    }

    public Task<Room?> GetByParticipantConnectionIdAsync(string connectionId, CancellationToken cancellationToken = default)
    {
        var room = _rooms.Values.FirstOrDefault(r =>
            r.Participants.Any(p => p.ConnectionId == connectionId));
        return Task.FromResult(room);
    }

    public Task AddAsync(Room room, CancellationToken cancellationToken = default)
    {
        _rooms.TryAdd(room.Id.Value, room);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Room room, CancellationToken cancellationToken = default)
    {
        _rooms[room.Id.Value] = room;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Room room, CancellationToken cancellationToken = default)
    {
        _rooms.TryRemove(room.Id.Value, out _);
        return Task.CompletedTask;
    }

    public Task<Room?> GetActiveRoomByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        var room = _rooms.Values.FirstOrDefault(r => r.OwnerId == ownerId && r.IsActive);
        return Task.FromResult(room);
    }

    public Task<IEnumerable<Room>> GetRoomsByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        var rooms = _rooms.Values.Where(r => r.OwnerId == ownerId);
        return Task.FromResult(rooms);
    }
}
