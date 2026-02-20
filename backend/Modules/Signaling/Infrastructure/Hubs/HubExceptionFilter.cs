#nullable enable

using Microsoft.AspNetCore.SignalR;
using Serilog;

namespace CompanyName.MyMeetings.Modules.Signaling.Infrastructure.Hubs;

public class HubExceptionFilter : IHubFilter
{
    private readonly ILogger _logger = Log.ForContext<HubExceptionFilter>();

    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next)
    {
        try
        {
            return await next(invocationContext);
        }
        catch (HubException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.Error(
                ex,
                "Error invoking hub method {HubMethod} on {Hub}",
                invocationContext.HubMethodName,
                invocationContext.Hub.GetType().Name);

            throw new HubException("An error occurred while processing your request.");
        }
    }

    public Task OnConnectedAsync(
        HubLifetimeContext context,
        Func<HubLifetimeContext, Task> next)
    {
        _logger.Debug(
            "Client {ConnectionId} connecting to {Hub}",
            context.Context.ConnectionId,
            context.Hub.GetType().Name);

        return next(context);
    }

    public Task OnDisconnectedAsync(
        HubLifetimeContext context,
        Exception? exception,
        Func<HubLifetimeContext, Exception?, Task> next)
    {
        if (exception != null)
        {
            _logger.Warning(
                exception,
                "Client {ConnectionId} disconnected from {Hub} with error",
                context.Context.ConnectionId,
                context.Hub.GetType().Name);
        }
        else
        {
            _logger.Debug(
                "Client {ConnectionId} disconnected from {Hub}",
                context.Context.ConnectionId,
                context.Hub.GetType().Name);
        }

        return next(context, exception);
    }
}
