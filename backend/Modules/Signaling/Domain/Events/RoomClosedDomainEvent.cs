#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Events;

public class RoomClosedDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public RoomClosedDomainEvent(RoomId roomId)
    {
        RoomId = roomId;
    }
}
