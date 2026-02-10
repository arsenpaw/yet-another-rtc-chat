namespace CompanyName.MyMeetings.BuildingBlocks.Domain;

public abstract class DomainEventBase : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
