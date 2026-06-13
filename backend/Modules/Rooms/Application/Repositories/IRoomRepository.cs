#nullable enable

using CompanyName.MyMeetings.Modules.Rooms.Domain;

namespace CompanyName.MyMeetings.Modules.Rooms.Application.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(RoomId id, CancellationToken cancellationToken = default);

    Task<Room?> GetByParticipantConnectionIdAsync(string connectionId, CancellationToken cancellationToken = default);

    Task<Room?> GetByParticipantUserIdAsync(string userId, CancellationToken cancellationToken = default);

    Task AddAsync(Room room, CancellationToken cancellationToken = default);

    Task UpdateAsync(Room room, CancellationToken cancellationToken = default);

    Task DeleteAsync(Room room, CancellationToken cancellationToken = default);

    Task<int> CountActiveRoomsByOwnerAsync(string ownerId, CancellationToken cancellationToken = default);

    Task<IEnumerable<Room>> GetRoomsByOwnerAsync(string ownerId, CancellationToken cancellationToken = default);
}
