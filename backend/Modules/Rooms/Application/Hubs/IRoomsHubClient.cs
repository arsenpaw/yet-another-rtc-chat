#nullable enable

namespace CompanyName.MyMeetings.Modules.Rooms.Application.Hubs;

public interface IRoomsHubClient
{
    Task JoinedRoom(RoomDetailDto room);

    Task ParticipantsList(IEnumerable<ParticipantDto> participants);

    Task ParticipantJoined(ParticipantDto participant);

    Task ParticipantLeft(string userId);

    Task RoomClosed();

    Task Error(string message);
}

public record ParticipantDto(string UserId, bool IsConnected);

public record RoomDetailDto(Guid Id, string OwnerId, int MaxParticipants, bool IsActive, IEnumerable<ParticipantDto> Participants);

public record RoomSummaryDto(Guid Id, string OwnerId, int MaxParticipants, int ParticipantCount, bool IsActive);
