using Backend.Modules.Users.Domain;

namespace Backend.Modules.Users.Application;

public interface IIdentityProvider
{
    Task<string> CreateUserAsync(User user, string password, CancellationToken ct = default);

    Task UpdateStatusAsync(UserId userId, bool isEnabled, CancellationToken ct = default);

    Task SendVerificationEmailAsync(UserId userId, CancellationToken ct = default);

    Task ResetPasswordAsync(UserId userId, string newPassword, CancellationToken ct = default);

    Task DeleteUserAsync(UserId userId, CancellationToken ct = default);
}