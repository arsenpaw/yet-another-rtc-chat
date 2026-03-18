#nullable enable
namespace CompanyName.MyMeetings.BuildingBlocks.Domain;

public interface IAuditable
{
    DateTime CreatedAt { get; }

    string? CreatedBy { get; }

    DateTime? ModifiedAt { get; }

    string? ModifiedBy { get; }
}
