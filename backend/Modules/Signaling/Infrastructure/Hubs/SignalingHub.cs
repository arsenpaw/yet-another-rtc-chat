#nullable enable

using CompanyName.MyMeetings.Modules.Administration.Domain;
using CompanyName.MyMeetings.Modules.Signaling.Application.Hubs;
using CompanyName.MyMeetings.Modules.Signaling.Application.Repositories;
using Microsoft.AspNetCore.SignalR;
using Serilog;

namespace CompanyName.MyMeetings.Modules.Signaling.Infrastructure.Hubs;

public class SignalingHub : Hub<ISignalingHubClient>
{
    private readonly IRoomRepository _roomRepository;
    private readonly ILogger _logger;

    public SignalingHub(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
        _logger = Log.ForContext<SignalingHub>();
    }

    public async Task JoinRoom(Guid roomId)
    {
        var userId = GetUserId();

        var room = await _roomRepository.GetByIdAsync(new RoomId(roomId));

        if (room == null)
        {
            await Clients.Caller.Error("Room not found.");
            return;
        }

        if (!room.IsActive)
        {
            await Clients.Caller.Error("Room is closed.");
            return;
        }

        var existingParticipant = room.Participants.FirstOrDefault(p => p.UserId == userId);

        if (existingParticipant is not null)
        {
            existingParticipant.Reconnect();
        }

        var participant = room.AddParticipant(userId, Context.ConnectionId);

        await _roomRepository.UpdateAsync(room);

        await Groups.AddToGroupAsync(Context.ConnectionId, GetRoomGroupName(roomId));

        var roomInfo = new RoomInfoDto(
            room.Id.Value,
            room.MaxParticipants,
            room.Participants.Count);

        await Clients.Caller.JoinedRoom(roomInfo);

        var participants = room.Participants.Select(p => new ParticipantDto(
            p.Id,
            p.UserId,
            p.IsConnected));

        await Clients.Caller.ParticipantsList(participants);

        var participantDto = new ParticipantDto(
            participant.Id,
            participant.UserId,
            participant.IsConnected);

        await Clients.OthersInGroup(GetRoomGroupName(roomId)).ParticipantJoined(participantDto);

        _logger.Information(
            "Participant {ConnectionId} (User: {UserId}) joined room {RoomId}",
            Context.ConnectionId,
            userId,
            roomId);
    }

    public async Task LeaveRoom()
    {
        var room = await _roomRepository.GetByParticipantConnectionIdAsync(Context.ConnectionId);

        if (room == null)
        {
            return;
        }

        var participant = room.Participants.FirstOrDefault(p => p.Id == Context.ConnectionId);

        if (participant == null)
        {
            return;
        }

        participant.Disconnect();
        room.RemoveParticipant(participant.Id);
        await _roomRepository.UpdateAsync(room);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetRoomGroupName(room.Id.Value));

        await Clients.OthersInGroup(GetRoomGroupName(room.Id.Value)).ParticipantLeft(participant.Id);

        _logger.Information(
            "Participant {ConnectionId} left room {RoomId}",
            participant.Id,
            room.Id.Value);
    }

    public async Task SendOffer(string toConnectionId, string sdp)
    {
        var room = await _roomRepository.GetByParticipantConnectionIdAsync(Context.ConnectionId);

        if (room == null)
        {
            await Clients.Caller.Error("You are not in a room.");
            return;
        }

        var toParticipant = room.Participants.FirstOrDefault(p => p.Id == toConnectionId);

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

        var toParticipant = room.Participants.FirstOrDefault(p => p.Id == toConnectionId);

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

        var toParticipant = room.Participants.FirstOrDefault(p => p.Id == toConnectionId);

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

    public async Task<Guid> CreateRoom(int maxParticipants = 10)
    {
        var room = Room.Create(maxParticipants);
        await _roomRepository.AddAsync(room);

        _logger.Information("Room {RoomId} created", room.Id.Value);

        return room.Id.Value;
    }

    public async Task CloseRoom(Guid roomId)
    {
        var room = await _roomRepository.GetByIdAsync(new RoomId(roomId));

        if (room == null)
        {
            await Clients.Caller.Error("Room not found.");
            return;
        }

        room.Close();
        await _roomRepository.UpdateAsync(room);

        await Clients.Group(GetRoomGroupName(roomId)).RoomClosed();

        _logger.Information("Room {RoomId} closed", roomId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await LeaveRoom();
        await base.OnDisconnectedAsync(exception);
    }

    private static string GetRoomGroupName(Guid roomId) => $"room_{roomId}";

    private Guid GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst("sub")?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty;
    }
}
