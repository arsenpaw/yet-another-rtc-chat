#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace CompanyName.MyMeetings.Modules.Administration.Domain;

public class ParticipantId : TypedIdValueBase
{
    public ParticipantId(Guid value)
        : base(value)
    {
    }

    public static ParticipantId New() => new(Guid.NewGuid());
}
