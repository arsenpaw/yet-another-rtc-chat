#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Rooms.Domain.Events;

public class RoomCreatedDomainEvent : DomainEventBase
{
    public RoomId RoomId { get; }

    public string OwnerId { get; }

    public RoomCreatedDomainEvent(RoomId roomId, string ownerId)
    {
        RoomId = roomId;
        OwnerId = ownerId;
    }
}
