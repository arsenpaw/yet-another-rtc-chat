#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;
using CompanyName.MyMeetings.Modules.Administration.Domain.Events;
using CompanyName.MyMeetings.Modules.Administration.Domain.Rules;

namespace CompanyName.MyMeetings.Modules.Administration.Domain;

public class Room : AuditableEntity<RoomId>, IAggregateRoot
{
    private readonly List<Participant> _participants = [];

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public int MaxParticipants { get; private set; }

    public bool IsActive { get; private set; }

    public IReadOnlyCollection<Participant> Participants => _participants.AsReadOnly();

    private Room()
    {
    }

    public static Room Create(string name, string? description = null, int maxParticipants = 10)
    {
        var room = new Room
        {
            Id = RoomId.New(),
            Name = name,
            Description = description,
            MaxParticipants = maxParticipants,
            IsActive = true
        };

        room.SetCreated(DateTime.UtcNow);
        room.AddDomainEvent(new RoomCreatedDomainEvent(room.Id));

        return room;
    }

    public void UpdateDetails(string name, string? description, int maxParticipants)
    {
        Name = name;
        Description = description;
        MaxParticipants = maxParticipants;
        SetModified(DateTime.UtcNow);
    }

    public Participant AddParticipant(string userId, string displayName)
    {
        CheckRule(new RoomMustBeActiveRule(IsActive));
        CheckRule(new RoomCannotExceedMaxParticipantsRule(_participants.Count, MaxParticipants));

        var participant = Participant.Create(Id, userId, displayName);
        _participants.Add(participant);

        AddDomainEvent(new ParticipantJoinedRoomDomainEvent(Id, participant.Id));

        return participant;
    }

    public void RemoveParticipant(ParticipantId participantId)
    {
        var participant = _participants.FirstOrDefault(p => p.Id == participantId);
        if (participant != null)
        {
            _participants.Remove(participant);
            AddDomainEvent(new ParticipantLeftRoomDomainEvent(Id, participantId));
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
