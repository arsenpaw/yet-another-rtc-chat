#nullable enable

using CompanyName.MyMeetings.Modules.Signaling.Domain;

namespace CompanyName.MyMeetings.Modules.Signaling.Application.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(RoomId id, CancellationToken cancellationToken = default);

    Task<Room?> GetByParticipantConnectionIdAsync(string connectionId, CancellationToken cancellationToken = default);

    Task AddAsync(Room room, CancellationToken cancellationToken = default);

    Task UpdateAsync(Room room, CancellationToken cancellationToken = default);

    Task DeleteAsync(Room room, CancellationToken cancellationToken = default);

    Task<IEnumerable<Room>> GetActiveRoomsAsync(CancellationToken cancellationToken = default);
}
