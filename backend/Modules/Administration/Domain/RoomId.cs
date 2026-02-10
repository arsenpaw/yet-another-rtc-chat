#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain;

public class RoomId : TypedIdValueBase
{
    public RoomId(Guid value)
        : base(value)
    {
    }

    public static RoomId New() => new(Guid.NewGuid());
}
