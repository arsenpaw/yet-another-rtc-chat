#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Rooms.Domain.Events;

public class RoomCreatedDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public Guid OwnerId { get; }

    public RoomCreatedDomainEvent(RoomId roomId, Guid ownerId)
    {
        RoomId = roomId;
        OwnerId = ownerId;
    }
}
