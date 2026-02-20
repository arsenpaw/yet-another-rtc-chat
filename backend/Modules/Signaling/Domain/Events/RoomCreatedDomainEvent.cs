#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Events;

public class RoomCreatedDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public RoomCreatedDomainEvent(RoomId roomId)
    {
        RoomId = roomId;
    }
}
