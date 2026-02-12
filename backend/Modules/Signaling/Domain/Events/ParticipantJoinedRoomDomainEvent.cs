#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Events;

public class ParticipantJoinedRoomDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public string ConnectionId { get; }

    public ParticipantJoinedRoomDomainEvent(RoomId roomId, string connectionId)
    {
        RoomId = roomId;
        ConnectionId = connectionId;
    }
}
