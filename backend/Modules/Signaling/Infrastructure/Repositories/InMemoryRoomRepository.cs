#nullable enable

using System.Collections.Concurrent;
using CompanyName.MyMeetings.Modules.Administration.Domain;
using CompanyName.MyMeetings.Modules.Signaling.Application.Repositories;

namespace CompanyName.MyMeetings.Modules.Signaling.Infrastructure.Repositories;

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
            r.Participants.Any(p => p.Id == connectionId));
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

    public Task<IEnumerable<Room>> GetActiveRoomsAsync(CancellationToken cancellationToken = default)
    {
        var activeRooms = _rooms.Values.Where(r => r.IsActive);
        return Task.FromResult(activeRooms);
    }
}
