#nullable enable
namespace CompanyName.MyMeetings.BuildingBlocks.Domain;

public abstract class AuditableSoftDeletableEntity<TId> : AuditableEntity<TId>, ISoftDeletable
    where TId : TypedIdValueBase
{
    public bool IsDeleted { get; private set; }

    public DateTime? DeletedAt { get; private set; }

    public string? DeletedBy { get; private set; }

    protected AuditableSoftDeletableEntity()
    {
    }

    protected AuditableSoftDeletableEntity(TId id)
        : base(id)
    {
    }

    public virtual void Delete(string? deletedBy = null)
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        DeletedBy = deletedBy;
    }

    public virtual void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
        DeletedBy = null;
    }
}
