#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Rooms.Domain;

public class Participant : Entity
{
    public string ConnectionId { get; private set; } = default!;

    public RoomId RoomId { get; private set; } = default!;

    public Guid UserId { get; private set; }

    public DateTime JoinedAt { get; private set; }

    public DateTime? LeftAt { get; private set; }

    public bool IsConnected { get; private set; }

    private Participant()
    {
    }

    public static Participant Create(RoomId roomId, Guid userId, string connectionId)
    {
        return new Participant
        {
            ConnectionId = connectionId,
            RoomId = roomId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow,
            IsConnected = true
        };
    }

    public void Disconnect()
    {
        IsConnected = false;
        LeftAt = DateTime.UtcNow;
    }

    public void Reconnect()
    {
        IsConnected = true;
        LeftAt = null;
    }
}
