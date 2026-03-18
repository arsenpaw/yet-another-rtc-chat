using Backend.Modules.Users.Application;
using Backend.Modules.Users.Domain;

namespace Backend.Modules.Users.Infrastructure;

public class KyecloakIdentiyProvider:IIdentityProvider
{
    public Task<string> CreateUserAsync(User user, string password, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task UpdateStatusAsync(UserId userId, bool isEnabled, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task SendVerificationEmailAsync(UserId userId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task ResetPasswordAsync(UserId userId, string newPassword, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task DeleteUserAsync(UserId userId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }
}