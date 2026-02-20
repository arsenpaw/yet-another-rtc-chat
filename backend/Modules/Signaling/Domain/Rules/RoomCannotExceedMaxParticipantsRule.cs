#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Rules;

public class RoomCannotExceedMaxParticipantsRule : IBusinessRule
{
    private readonly int _currentCount;
    private readonly int _maxParticipants;

    public RoomCannotExceedMaxParticipantsRule(int currentCount, int maxParticipants)
    {
        _currentCount = currentCount;
        _maxParticipants = maxParticipants;
    }

    public string Message => $"Room cannot exceed {_maxParticipants} participants.";

    public bool IsBroken() => _currentCount >= _maxParticipants;
}
