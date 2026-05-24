#nullable enable

using CompanyName.MyMeetings.Modules.Rooms.Application.Repositories;
using CompanyName.MyMeetings.Modules.Rooms.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace CompanyName.MyMeetings.Modules.Rooms.Infrastructure;

public static class RoomsModuleServiceCollectionExtensions
{
    public static IServiceCollection AddRoomsModule(this IServiceCollection services)
    {
        services.AddSingleton<IRoomRepository, InMemoryRoomRepository>();

        return services;
    }
}
