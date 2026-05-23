using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace CompanyName.MyMeetings.API.Configuration.Extensions;

internal static class AuthExtensions
{
    internal static IServiceCollection AddAuth0(this IServiceCollection services, Auth0Settings settings)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = $"https://{settings.Domain}/";
                options.Audience = settings.Audience;
                options.TokenValidationParameters = new()
                {
                    RoleClaimType = settings.RoleClaimType,
                };

                // SignalR cannot set headers in the browser WebSocket handshake,
                // so the token is passed as ?access_token= query param instead.
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var token = context.Request.Query["access_token"];
                        if (!string.IsNullOrEmpty(token) &&
                            context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                        {
                            context.Token = token;
                        }

                        return Task.CompletedTask;
                    },
                };
            });

        services.AddAuthorization();
        return services;
    }
}
