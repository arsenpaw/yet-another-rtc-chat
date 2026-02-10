#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain;

public class Participant : Entity<ParticipantId>
{
    public RoomId RoomId { get; private set; } = default!;

    public string UserId { get; private set; } = string.Empty;

    public string DisplayName { get; private set; } = string.Empty;

    public DateTime JoinedAt { get; private set; }

    public DateTime? LeftAt { get; private set; }

    public bool IsConnected { get; private set; }

    public string? ConnectionId { get; private set; }

    private Participant()
    {
    }

    public static Participant Create(RoomId roomId, string userId, string displayName)
    {
        return new Participant
        {
            Id = ParticipantId.New(),
            RoomId = roomId,
            UserId = userId,
            DisplayName = displayName,
            JoinedAt = DateTime.UtcNow,
            IsConnected = true
        };
    }

    public void Connect(string connectionId)
    {
        ConnectionId = connectionId;
        IsConnected = true;
    }

    public void Disconnect()
    {
        ConnectionId = null;
        IsConnected = false;
        LeftAt = DateTime.UtcNow;
    }

    public void UpdateDisplayName(string displayName)
    {
        DisplayName = displayName;
    }
}