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

    public async Task SendOffer(string toConnectionId, string sdp)
    {
        var room = await _roomRepository.GetByParticipantConnectionIdAsync(Context.ConnectionId);

        if (room == null)
        {
            await Clients.Caller.Error("You are not in a room.");
            return;
        }

        var toParticipant = room.Participants.FirstOrDefault(p => p.ConnectionId == toConnectionId);

        if (toParticipant == null || !toParticipant.IsConnected)
        {
            await Clients.Caller.Error("Target participant not found or not connected.");
            return;
        }

        await Clients.Client(toConnectionId).ReceiveOffer(Context.ConnectionId, sdp);

        _logger.Debug(
            "Offer sent from {FromConnectionId} to {ToConnectionId} in room {RoomId}",
            Context.ConnectionId,
            toConnectionId,
            room.Id.Value);
    }

    public async Task SendAnswer(string toConnectionId, string sdp)
    {
        var room = await _roomRepository.GetByParticipantConnectionIdAsync(Context.ConnectionId);

        if (room == null)
        {
            await Clients.Caller.Error("You are not in a room.");
            return;
        }

        var toParticipant = room.Participants.FirstOrDefault(p => p.ConnectionId == toConnectionId);

        if (toParticipant == null || !toParticipant.IsConnected)
        {
            await Clients.Caller.Error("Target participant not found or not connected.");
            return;
        }

        await Clients.Client(toConnectionId).ReceiveAnswer(Context.ConnectionId, sdp);

        _logger.Debug(
            "Answer sent from {FromConnectionId} to {ToConnectionId} in room {RoomId}",
            Context.ConnectionId,
            toConnectionId,
            room.Id.Value);
    }

    public async Task SendIceCandidate(string toConnectionId, string candidate)
    {
        var room = await _roomRepository.GetByParticipantConnectionIdAsync(Context.ConnectionId);

        if (room == null)
        {
            await Clients.Caller.Error("You are not in a room.");
            return;
        }

        var toParticipant = room.Participants.FirstOrDefault(p => p.ConnectionId == toConnectionId);

        if (toParticipant == null || !toParticipant.IsConnected)
        {
            await Clients.Caller.Error("Target participant not found or not connected.");
            return;
        }

        await Clients.Client(toConnectionId).ReceiveIceCandidate(Context.ConnectionId, candidate);

        _logger.Debug(
            "ICE candidate sent from {FromConnectionId} to {ToConnectionId} in room {RoomId}",
            Context.ConnectionId,
            toConnectionId,
            room.Id.Value);
    }
}
