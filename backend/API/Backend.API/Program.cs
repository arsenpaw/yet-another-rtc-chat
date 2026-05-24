using CompanyName.MyMeetings.API.Configuration;
using CompanyName.MyMeetings.API.Configuration.Extensions;
using CompanyName.MyMeetings.Modules.Rooms.Infrastructure;
using CompanyName.MyMeetings.Modules.Rooms.Infrastructure.Hubs;
using CompanyName.MyMeetings.Modules.Signaling.Infrastructure;
using CompanyName.MyMeetings.Modules.Signaling.Infrastructure.Hubs;
using Hellang.Middleware.ProblemDetails;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();
var corsPolicyName = "DefaultPolicy";
try
{
    Log.Information("Starting up");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console());

    builder.AddApplicationSettings(out var applicationSettings);
    builder.Services.AddExceptionHandling();
    builder.Services.AddAuth0(applicationSettings.Auth0);
    builder.Services.AddControllers(options => options.SuppressAsyncSuffixInActionNames = false);
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerDocumentation();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(corsPolicyName, policy =>
        {
            policy.WithOrigins(applicationSettings.Cors.AllowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });
    builder.Services.AddSignalingModule();
    builder.Services.AddRoomsModule();

    var app = builder.Build();

    app.UseProblemDetails();
    app.UseSwaggerDocumentation();

    app.UseCors(corsPolicyName);

    app.UseAuthentication();
    app.UseAuthorization();

    app.UseSerilogRequestLogging();

    app.MapControllers();

    app.MapHub<SignalingHub>("/hubs/signaling");
    app.MapHub<RoomsHub>("/hubs/rooms");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}

return 0;