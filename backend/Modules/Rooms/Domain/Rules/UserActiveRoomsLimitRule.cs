#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Rooms.Domain.Rules;

public class UserActiveRoomsLimitRule : IBusinessRule
{
    private const int MaxActiveRooms = 10;

    private readonly int _currentActiveRoomsCount;

    public UserActiveRoomsLimitRule(int currentActiveRoomsCount)
    {
        _currentActiveRoomsCount = currentActiveRoomsCount;
    }

    public string Message => $"Cannot have more than {MaxActiveRooms} active rooms.";

    public bool IsBroken() => _currentActiveRoomsCount >= MaxActiveRooms;
}
