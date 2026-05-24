#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;
using CompanyName.MyMeetings.Modules.Rooms.Domain.Events;
using CompanyName.MyMeetings.Modules.Rooms.Domain.Rules;

namespace CompanyName.MyMeetings.Modules.Rooms.Domain;

public class Room : AuditableEntity<RoomId>, IAggregateRoot
{
    private readonly List<Participant> _participants = [];

    public Guid OwnerId { get; private set; }

    public int MaxParticipants { get; private set; } = 2;

    public bool IsActive { get; private set; }

    public IReadOnlyCollection<Participant> Participants => _participants.AsReadOnly();

    private Room()
    {
    }

    public static Room Create(Guid ownerId)
    {
        var room = new Room
        {
            Id = RoomId.New(),
            OwnerId = ownerId,
            IsActive = true
        };

        room.SetCreated(DateTime.UtcNow);
        room.AddDomainEvent(new RoomCreatedDomainEvent(room.Id, ownerId));

        return room;
    }

    public bool IsOwnedBy(Guid userId) => OwnerId == userId;

    public Participant AddParticipant(Guid userId, string connectionId)
    {
        CheckRule(new RoomMustBeActiveRule(IsActive));
        CheckRule(new RoomCannotExceedMaxParticipantsRule(_participants.Count, MaxParticipants));

        var participant = Participant.Create(Id, userId, connectionId);
        _participants.Add(participant);

        AddDomainEvent(new ParticipantJoinedRoomDomainEvent(Id, connectionId));

        return participant;
    }

    public void RemoveParticipant(string connectionId)
    {
        var participant = _participants.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (participant != null)
        {
            _participants.Remove(participant);
            AddDomainEvent(new ParticipantLeftRoomDomainEvent(Id, connectionId));
        }
    }

    public void Close()
    {
        IsActive = false;
        SetModified(DateTime.UtcNow);
        AddDomainEvent(new RoomClosedDomainEvent(Id));
    }
}
