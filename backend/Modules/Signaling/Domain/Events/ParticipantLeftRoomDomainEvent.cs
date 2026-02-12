#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Events;

public class ParticipantLeftRoomDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public string ConnectionId { get; }

    public ParticipantLeftRoomDomainEvent(RoomId roomId, string connectionId)
    {
        RoomId = roomId;
        ConnectionId = connectionId;
    }
}
