#nullable enable

using MediatR;

namespace CompanyName.MyMeetings.Modules.Signaling.Application.Contracts;

public interface ISignalingModule
{
    Task<TResult> ExecuteCommandAsync<TResult>(IRequest<TResult> command);

    Task ExecuteCommandAsync(IRequest command);

    Task<TResult> ExecuteQueryAsync<TResult>(IRequest<TResult> query);
}
