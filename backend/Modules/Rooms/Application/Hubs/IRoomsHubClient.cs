#nullable enable

namespace CompanyName.MyMeetings.Modules.Rooms.Application.Hubs;

public interface IRoomsHubClient
{
    Task JoinedRoom(RoomDetailDto room);

    Task ParticipantsList(IEnumerable<ParticipantDto> participants);

    Task ParticipantJoined(ParticipantDto participant);

    Task ParticipantLeft(Guid userId);

    Task RoomClosed();

    Task Error(string message);
}

public record ParticipantDto(Guid UserId, bool IsConnected);

public record RoomDetailDto(Guid Id, Guid OwnerId, int MaxParticipants, bool IsActive, IEnumerable<ParticipantDto> Participants);

public record RoomSummaryDto(Guid Id, Guid OwnerId, int MaxParticipants, int ParticipantCount, bool IsActive);
