#nullable enable
namespace CompanyName.MyMeetings.BuildingBlocks.Domain;

public interface ISoftDeletable
{
    bool IsDeleted { get; }

    DateTime? DeletedAt { get; }

    string? DeletedBy { get; }
}
