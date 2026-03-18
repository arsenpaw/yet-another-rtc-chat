#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace Backend.Modules.Users.Domain;

public class UserId : TypedIdValueBase
{
    public UserId(Guid value)
        : base(value)
    {
    }

    public static UserId New() => new(Guid.NewGuid());
}