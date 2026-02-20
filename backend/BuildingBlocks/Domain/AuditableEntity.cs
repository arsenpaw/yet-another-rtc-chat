#nullable enable

namespace CompanyName.MyMeetings.BuildingBlocks.Domain;

public abstract class AuditableEntity<TId> : Entity<TId>, IAuditableEntity
    where TId : TypedIdValueBase
{
    public DateTime CreatedAt { get; private set; }

    public string? CreatedBy { get; private set; }

    public DateTime? ModifiedAt { get; private set; }

    public string? ModifiedBy { get; private set; }

    protected AuditableEntity()
    {
    }

    protected AuditableEntity(TId id)
        : base(id)
    {
    }

    public void SetCreated(DateTime createdAt, string? createdBy = null)
    {
        CreatedAt = createdAt;
        CreatedBy = createdBy;
    }

    public void SetModified(DateTime modifiedAt, string? modifiedBy = null)
    {
        ModifiedAt = modifiedAt;
        ModifiedBy = modifiedBy;
    }
}
