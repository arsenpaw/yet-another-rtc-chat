#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain;

public class SignalId : TypedIdValueBase
{
    public SignalId(Guid value)
        : base(value)
    {
    }

    public static SignalId New() => new(Guid.NewGuid());
}
