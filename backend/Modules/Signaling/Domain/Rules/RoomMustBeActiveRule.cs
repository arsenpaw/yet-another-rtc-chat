#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain.Rules;

public class RoomMustBeActiveRule : IBusinessRule
{
    private readonly bool _isActive;

    public RoomMustBeActiveRule(bool isActive)
    {
        _isActive = isActive;
    }

    public string Message => "Room must be active to perform this action.";

    public bool IsBroken() => !_isActive;
}
