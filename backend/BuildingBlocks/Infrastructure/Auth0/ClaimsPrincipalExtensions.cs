#nullable enable

using System.Security.Claims;

namespace CompanyName.MyMeetings.BuildingBlocks.Infrastructure.Auth0;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal? principal)
    {
        var value = principal?.FindFirst("sub")?.Value;
        return value is not null ? Guid.Parse(value) : Guid.Empty;
    }
}
