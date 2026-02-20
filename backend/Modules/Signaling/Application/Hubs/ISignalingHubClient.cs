#nullable enable

namespace CompanyName.MyMeetings.Modules.Signaling.Application.Hubs;

public interface ISignalingHubClient
{
    Task ParticipantJoined(ParticipantDto participant);

    Task ParticipantLeft(string connectionId);

    Task ReceiveOffer(string fromConnectionId, string sdp);

    Task ReceiveAnswer(string fromConnectionId, string sdp);

    Task ReceiveIceCandidate(string fromConnectionId, string candidate);

    Task RoomClosed();

    Task Error(string message);

    Task JoinedRoom(RoomInfoDto roomInfo);

    Task ParticipantsList(IEnumerable<ParticipantDto> participants);
}

public record ParticipantDto(
    string ConnectionId,
    Guid UserId,
    bool IsConnected);

public record RoomInfoDto(
    Guid Id,
    int MaxParticipants,
    int CurrentParticipantCount);
