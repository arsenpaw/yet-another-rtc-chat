#nullable enable

namespace CompanyName.MyMeetings.Modules.Signaling.Application.Hubs;

public interface ISignalingHubClient
{
    Task ReceiveOffer(string fromUserId, string sdp);

    Task ReceiveAnswer(string fromUserId, string sdp);

    Task ReceiveIceCandidate(string fromUserId, string candidate);

    Task Error(string message);
}
