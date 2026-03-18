using CompanyName.MyMeetings.BuildingBlocks.Domain;

namespace Backend.Modules.Users.Domain;

public class User : AuditableEntity<UserId>
{
    public string Username { get; private set; }

    public string Email { get; private set; }

    public string FirstName { get; private set; }

    public string LastName { get; private set; }

    public bool IsEnabled { get; private set; }

    public bool IsEmailVerified { get; private set; }

    private User(UserId id, string username, string email, string firstName, string lastName, bool isEnabled, bool isEmailVerified)
    {
        Id = id;
        Username = username;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        IsEnabled = isEnabled;
        IsEmailVerified = isEmailVerified;
    }

    public static User Create(
        string username,
        string email,
        string firstName,
        string lastName)
    {
        return new User(
            new UserId(Guid.NewGuid()),
            username,
            email,
            firstName,
            lastName,
            true,
            false);
    }

    public void Deactivate() => IsEnabled = false;

    public void VerifyEmail() => IsEmailVerified = true;

    public void UpdateProfile(string firstName, string lastName)
    {
        FirstName = firstName;
        LastName = lastName;
    }
}