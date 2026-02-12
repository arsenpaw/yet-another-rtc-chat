#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain;

public enum SignalType
{
    Offer,
    Answer,
    IceCandidate
}

public class Signal : Entity<SignalId>
{
    public RoomId RoomId { get; private set; } = default!;

    public string FromConnectionId { get; private set; } = default!;

    public string ToConnectionId { get; private set; } = default!;

    public SignalType Type { get; private set; }

    public string Payload { get; private set; } = string.Empty;

    public DateTime CreatedAt { get; private set; }

    public bool IsDelivered { get; private set; }

    public DateTime? DeliveredAt { get; private set; }

    private Signal()
    {
    }

    public static Signal CreateOffer(RoomId roomId, string from, string to, string sdp)
    {
        return Create(roomId, from, to, SignalType.Offer, sdp);
    }

    public static Signal CreateAnswer(RoomId roomId, string from, string to, string sdp)
    {
        return Create(roomId, from, to, SignalType.Answer, sdp);
    }

    public static Signal CreateIceCandidate(RoomId roomId, string from, string to, string candidate)
    {
        return Create(roomId, from, to, SignalType.IceCandidate, candidate);
    }

    public void MarkAsDelivered()
    {
        IsDelivered = true;
        DeliveredAt = DateTime.UtcNow;
    }

    private static Signal Create(RoomId roomId, string from, string to, SignalType type, string payload)
    {
        return new Signal
        {
            Id = SignalId.New(),
            RoomId = roomId,
            FromConnectionId = from,
            ToConnectionId = to,
            Type = type,
            Payload = payload,
            CreatedAt = DateTime.UtcNow,
            IsDelivered = false
        };
    }
}