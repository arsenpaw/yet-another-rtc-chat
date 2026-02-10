namespace CompanyName.MyMeetings.BuildingBlocks.Domain;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
