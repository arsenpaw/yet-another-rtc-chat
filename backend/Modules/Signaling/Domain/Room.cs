#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;
using CompanyName.MyMeetings.Modules.Administration.Domain.Events;
using CompanyName.MyMeetings.Modules.Administration.Domain.Rules;

namespace CompanyName.MyMeetings.Modules.Administration.Domain;

public class Room : AuditableEntity<RoomId>, IAggregateRoot
{
    private readonly List<Participant> _participants = [];

    public int MaxParticipants { get; private set; } = 2;

    public bool IsActive { get; private set; }

    public IReadOnlyCollection<Participant> Participants => _participants.AsReadOnly();

    private Room()
    {
    }

    public static Room Create()
    {
        var room = new Room
        {
            Id = RoomId.New(),
            IsActive = true
        };

        room.SetCreated(DateTime.UtcNow);
        room.AddDomainEvent(new RoomCreatedDomainEvent(room.Id));

        return room;
    }

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
        var participant = _participants.FirstOrDefault(p => p.Id == connectionId);
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

    public void Reopen()
    {
        IsActive = true;
        SetModified(DateTime.UtcNow);
    }
}
