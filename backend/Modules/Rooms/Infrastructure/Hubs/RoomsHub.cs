#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Infrastructure.Hubs;
using CompanyName.MyMeetings.Modules.Rooms.Application.Hubs;
using CompanyName.MyMeetings.Modules.Rooms.Application.Repositories;
using CompanyName.MyMeetings.Modules.Rooms.Domain;
using Serilog;

namespace CompanyName.MyMeetings.Modules.Rooms.Infrastructure.Hubs;

public class RoomsHub : AuthenticatedHub<IRoomsHubClient>
{
    private readonly IRoomRepository _roomRepository;
    private readonly ILogger _logger;

    public RoomsHub(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
        _logger = Log.ForContext<RoomsHub>();
    }

    public async Task JoinRoom(Guid roomId)
    {
        var userId = GetUserSubject();
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
            await Clients.Caller.AlreadyInRoom();

            _logger.Information(
                "User {UserId} attempted to join room {RoomId} they are already in",
                userId,
                roomId);

            return;
        }

        var participant = room.AddParticipant(userId, Context.ConnectionId);
        await _roomRepository.UpdateAsync(room);

        await Groups.AddToGroupAsync(Context.ConnectionId, GetRoomGroupName(roomId));

        await Clients.Caller.JoinedRoom(ToDetailDto(room));

        var participants = room.Participants.Select(p => new ParticipantDto(p.UserId, p.IsConnected));
        await Clients.Caller.ParticipantsList(participants);

        await Clients.OthersInGroup(GetRoomGroupName(roomId))
            .ParticipantJoined(new ParticipantDto(participant.UserId, participant.IsConnected));

        _logger.Information(
            "User {UserId} joined room {RoomId} via connection {ConnectionId}",
            userId,
            roomId,
            Context.ConnectionId);
    }

    public async Task LeaveRoom()
    {
        await HandleLeaveRoomAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await HandleLeaveRoomAsync();
        await base.OnDisconnectedAsync(exception);
    }

    private async Task HandleLeaveRoomAsync()
    {
        var room = await _roomRepository.GetByParticipantConnectionIdAsync(Context.ConnectionId);
        if (room == null)
        {
            return;
        }

        var participant = room.Participants.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
        if (participant == null)
        {
            return;
        }

        var userId = participant.UserId;
        participant.Disconnect();
        room.RemoveParticipant(participant.ConnectionId);
        await _roomRepository.UpdateAsync(room);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetRoomGroupName(room.Id.Value));
        await Clients.OthersInGroup(GetRoomGroupName(room.Id.Value)).ParticipantLeft(userId);

        _logger.Information(
            "User {UserId} left room {RoomId}",
            userId,
            room.Id.Value);
    }

    private static RoomDetailDto ToDetailDto(Room room)
    {
        var participants = room.Participants.Select(p => new ParticipantDto(p.UserId, p.IsConnected));
        return new RoomDetailDto(room.Id.Value, room.OwnerId, room.MaxParticipants, room.IsActive, participants);
    }

    private static string GetRoomGroupName(Guid roomId) => $"room_{roomId}";
}
