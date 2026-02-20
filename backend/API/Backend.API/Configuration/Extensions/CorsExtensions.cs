using Microsoft.Extensions.Options;

namespace CompanyName.MyMeetings.API.Configuration.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddApplicationSettings(
        this WebApplicationBuilder builder,
        out ApplicationSettings applicationSettings)
    {
        applicationSettings = builder.Configuration.Get<ApplicationSettings>()
                              ?? throw new InvalidOperationException("Could not bind ApplicationSettings.");

        builder.Services.AddOptions<ApplicationSettings>()
            .Bind(builder.Configuration)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return builder.Services;
    }
}