#nullable enable

using CompanyName.MyMeetings.Modules.Signaling.Application.Repositories;
using CompanyName.MyMeetings.Modules.Signaling.Infrastructure.Hubs;
using CompanyName.MyMeetings.Modules.Signaling.Infrastructure.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace CompanyName.MyMeetings.Modules.Signaling.Infrastructure;

public static class SignalingModuleServiceCollectionExtensions
{
    public static IServiceCollection AddSignalingModule(this IServiceCollection services)
    {
        services.AddSingleton<IRoomRepository, InMemoryRoomRepository>();

        services.AddSignalR();
        services.AddSingleton<HubExceptionFilter>();
        services.AddSingleton<IHubFilter, HubExceptionFilter>(sp => sp.GetRequiredService<HubExceptionFilter>());

        return services;
    }
}
