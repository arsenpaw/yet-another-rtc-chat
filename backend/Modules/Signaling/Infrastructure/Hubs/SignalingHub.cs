#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Infrastructure.Hubs;
using CompanyName.MyMeetings.Modules.Rooms.Application.Repositories;
using CompanyName.MyMeetings.Modules.Signaling.Application.Hubs;
using Serilog;

namespace CompanyName.MyMeetings.Modules.Signaling.Infrastructure.Hubs;

public class SignalingHub : AuthenticatedHub<ISignalingHubClient>
{
    private readonly IRoomRepository _roomRepository;
    private readonly ILogger _logger;

    public SignalingHub(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
        _logger = Log.ForContext<SignalingHub>();
    }

    public async Task SendOffer(string toUserId, string sdp)
    {
        var fromUserId = await ResolveTargetAsync(toUserId);
        if (fromUserId == null)
        {
            return;
        }

        await Clients.User(toUserId).ReceiveOffer(fromUserId, sdp);
        _logger.Debug("Offer sent from {FromUserId} to {ToUserId}", fromUserId, toUserId);
    }

    public async Task SendAnswer(string toUserId, string sdp)
    {
        var fromUserId = await ResolveTargetAsync(toUserId);
        if (fromUserId == null)
        {
            return;
        }

        await Clients.User(toUserId).ReceiveAnswer(fromUserId, sdp);
        _logger.Debug("Answer sent from {FromUserId} to {ToUserId}", fromUserId, toUserId);
    }

    public async Task SendIceCandidate(string toUserId, string candidate)
    {
        var fromUserId = await ResolveTargetAsync(toUserId);
        if (fromUserId == null)
        {
            return;
        }

        await Clients.User(toUserId).ReceiveIceCandidate(fromUserId, candidate);
        _logger.Debug("ICE candidate sent from {FromUserId} to {ToUserId}", fromUserId, toUserId);
    }

    /// <summary>
    /// Validates that the caller and the target user share an active room.
    /// Returns the caller's user id when routing is allowed, otherwise null (and notifies the caller).
    /// </summary>
    private async Task<string?> ResolveTargetAsync(string toUserId)
    {
        var fromUserId = GetUserSubject();
        var room = await _roomRepository.GetByParticipantUserIdAsync(fromUserId);

        if (room == null)
        {
            await Clients.Caller.Error("You are not in a room.");
            return null;
        }

        var toParticipant = room.Participants.FirstOrDefault(p => p.UserId == toUserId);

        if (toParticipant == null || !toParticipant.IsConnected)
        {
            await Clients.Caller.Error("Target participant not found or not connected.");
            return null;
        }

        return fromUserId;
    }
}
