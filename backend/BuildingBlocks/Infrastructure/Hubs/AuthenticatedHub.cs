#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Infrastructure.Auth0;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CompanyName.MyMeetings.BuildingBlocks.Infrastructure.Hubs;

[Authorize]
public abstract class AuthenticatedHub<T> : Hub<T>
    where T : class
{
    protected Guid GetUserId() => Context.User.GetUserId();
}
