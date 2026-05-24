#nullable enable

namespace CompanyName.MyMeetings.Modules.Signaling.Application.Hubs;

public interface ISignalingHubClient
{
    Task ReceiveOffer(string fromConnectionId, string sdp);

    Task ReceiveAnswer(string fromConnectionId, string sdp);

    Task ReceiveIceCandidate(string fromConnectionId, string candidate);

    Task Error(string message);
}
