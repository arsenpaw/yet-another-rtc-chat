#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Events;

public class ParticipantLeftRoomDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public ParticipantId ParticipantId { get; }

    public ParticipantLeftRoomDomainEvent(RoomId roomId, ParticipantId participantId)
    {
        RoomId = roomId;
        ParticipantId = participantId;
    }
}
