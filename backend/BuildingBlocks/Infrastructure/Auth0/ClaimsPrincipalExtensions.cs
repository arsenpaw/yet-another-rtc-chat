#nullable enable

using System.Security.Claims;

namespace CompanyName.MyMeetings.BuildingBlocks.Infrastructure.Auth0;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserSubject(this ClaimsPrincipal? principal)
    {
        return principal?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value
            ?? string.Empty;
    }
}
