# yet-another-rtc-chat

A peer-to-peer WebRTC video chat app. One user starts a call and shares an invite link; the other joins via that link. Signaling (offer/answer/ICE exchange) runs over SignalR — no third-party RTC SDK.

**Live:** https://internal.arsenhome.win/

## Structure

```
yet-another-rtc-chat/
├── client-rtc/          # React + TypeScript + Vite frontend
└── backend/             # ASP.NET Core 8 Modular Monolith
    ├── API/             # Entry point, DI composition
    ├── BuildingBlocks/  # Shared domain/application/infra primitives
    └── Modules/
        └── Signaling/   # WebRTC signaling module
            ├── Domain/        # Room, Participant, domain events, rules
            ├── Application/   # Hub interface, repository contract
            └── Infrastructure/# SignalingHub (SignalR), in-memory room repo
```

## How It Works

1. **Caller** hits "Start Call" → backend creates a `Room`, returns its ID → frontend shows a shareable invite link.
2. **Callee** opens the invite link → joins the same room via SignalR.
3. Both peers exchange WebRTC offer/answer/ICE candidates through `SignalingHub`, which relays messages between participants in the same room.
4. Once ICE negotiation completes, audio/video flows directly peer-to-peer.

## Key Files

| File | Purpose |
|------|---------|
| `client-rtc/src/hooks/useRtcConnection.ts` | All WebRTC + signaling logic |
| `client-rtc/src/lib/signaling.ts` | SignalR client wrapped in a provider-agnostic `BaseSignalingClient` |
| `backend/Modules/Signaling/Infrastructure/Hubs/SignalingHub.cs` | SignalR hub — creates rooms, relays offers/answers/ICE |
| `backend/Modules/Signaling/Domain/Room.cs` | Room aggregate with participant lifecycle |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, `@microsoft/signalr`, react-toastify
- **Backend:** .NET 8, ASP.NET Core Minimal APIs, SignalR, MediatR, Serilog, Keycloak auth

## Running Locally

```bash
# Backend
cd backend && dotnet run --project API/Backend.API

# Frontend
cd client-rtc && npm install && npm run dev
```
