#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Events;

public class ParticipantJoinedRoomDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public ParticipantId ParticipantId { get; }

    public ParticipantJoinedRoomDomainEvent(RoomId roomId, ParticipantId participantId)
    {
        RoomId = roomId;
        ParticipantId = participantId;
    }
}
