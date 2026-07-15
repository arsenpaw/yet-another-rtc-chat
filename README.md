# yet-another-rtc-chat

A peer-to-peer WebRTC video chat app. One user creates a room and shares the link, the other joins through it. Signaling (offer/answer/ICE exchange) runs over SignalR, with no third-party RTC SDK.

**Status: in development.** This is a learning/side project and is not production ready. Calls work end to end, but rooms live in memory only and are lost on restart. Expect breaking changes.

**Live:** https://internal.arsenhome.win/

## What works today

- Auth0 login and signup, with protected routes on the client.
- Room lifecycle over REST: create a room, list your rooms, close a room you own.
- Join a room by opening its link or pasting its id.
- 1:1 WebRTC audio/video call. Media flows directly peer to peer once ICE negotiation completes.
- Microphone and camera toggles during a call.
- Presence handling: participant joined/left, room closed notification, and detection of the same user already being in the room from another tab.
- Provider-agnostic signaling layer (`BaseSignalingClient`) with a SignalR implementation.
- Dark themed UI across the landing page, rooms browser, and room screen.

Domain rules currently enforced: max 2 participants per room, max 10 active rooms per user.

## Not implemented yet

The room screen ships some parts of the target design as static placeholders. They are visual only and have nothing behind them:

- Text chat (message feed and composer are mocked).
- Members and presence rail (mocked).
- Message reactions and attachments (mocked).
- Screen sharing (control is visible but disabled).

## Roadmap

- [ ] Persist rooms. The repository is in-memory (`InMemoryRoomRepository`), so everything resets when the API restarts. EF Core and Dapper are already referenced but no DbContext exists yet.
- [ ] Real text chat backed by the signaling hub.
- [ ] Real presence and members list.
- [ ] Screen sharing.
- [ ] Group calls. The `Room` aggregate hardcodes `MaxParticipants = 2`, so anything beyond 1:1 needs an SFU rather than plain peer-to-peer mesh.
- [ ] TURN server, so calls survive restrictive NATs.
- [ ] Responsive/mobile layouts. The app is currently desktop-first, though mobile screens exist in the design.
- [ ] Clean up leftovers: the scaffolded `WeatherForecastController`, the unused Agora signaling client, and the Keycloak/Redis services in the root `docker-compose.yml` (auth moved to Auth0 and nothing reads Redis).
- [ ] Tests. There are none.

## Structure

```
yet-another-rtc-chat/
├── client-rtc/          # React + TypeScript + Vite frontend (Feature-Sliced Design)
└── backend/             # ASP.NET Core 8 modular monolith
    ├── API/             # Entry point, DI composition, auth/CORS/Swagger setup
    ├── BuildingBlocks/  # Shared domain/application/infra primitives
    └── Modules/
        ├── Rooms/       # Room lifecycle + membership
        │   ├── Domain/         # Room, Participant, domain events, business rules
        │   ├── Application/    # Hub client interface, repository contract
        │   └── Infrastructure/ # RoomsController (REST), RoomsHub, in-memory repo
        └── Signaling/   # WebRTC signaling relay
            ├── Domain/
            ├── Application/
            └── Infrastructure/ # SignalingHub
```

## How it works

1. The caller creates a room via `POST /api/rooms` and gets back its id, which becomes the invite link.
2. Both peers connect to `/hubs/rooms` and call `JoinRoom`. The hub tracks membership and broadcasts participant events.
3. Both peers exchange offer/answer/ICE candidates through `/hubs/signaling`, which relays messages to the other participant.
4. Once ICE negotiation completes, audio and video flow directly between the browsers.

Peers are addressed by Auth0 `sub` (user id) rather than connection id, because each client holds two separate hub connections with different connection ids.

### API surface

`REST /api/rooms` (bearer auth): `POST` create, `GET` list own rooms, `GET {id}` detail, `DELETE {id}` close.

`/hubs/rooms`: `JoinRoom(roomId)`, `LeaveRoom()`. Server pushes `JoinedRoom`, `ParticipantsList`, `ParticipantJoined`, `ParticipantLeft`, `RoomClosed`, `Error`.

`/hubs/signaling`: `SendOffer(toUserId, sdp)`, `SendAnswer(toUserId, sdp)`, `SendIceCandidate(toUserId, candidate)`. Server pushes the matching `Receive*` events.

Because browsers cannot set headers on the WebSocket handshake, hub connections pass the access token as an `?access_token=` query parameter.

## Key files

| File | Purpose |
|------|---------|
| `client-rtc/src/shared/lib/hooks/useRtcConnection.ts` | Peer connection lifecycle: offer/answer/ICE, polite-peer collision handling |
| `client-rtc/src/shared/api/signaling/` | `BaseSignalingClient` abstraction and the SignalR implementation |
| `client-rtc/src/shared/api/rooms/roomsApi.ts` | REST client for the rooms endpoints |
| `client-rtc/src/shared/ui/` | Shared UI primitives the screens are composed from |
| `backend/Modules/Rooms/Domain/Room.cs` | Room aggregate: participants, rules, domain events |
| `backend/Modules/Rooms/Infrastructure/Hubs/RoomsHub.cs` | Membership hub |
| `backend/Modules/Signaling/Infrastructure/Hubs/SignalingHub.cs` | Relays offers/answers/ICE between participants |

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, `@microsoft/signalr`, TanStack Query, React Router, Auth0, react-toastify.

**Backend:** .NET 8, ASP.NET Core, SignalR, MediatR, Serilog, Auth0 JWT bearer auth.

## Running locally

```bash
# Backend (listens on http://localhost:5000 by default)
cd backend && dotnet run --project API/Backend.API

# Frontend
cd client-rtc && npm install && npm run dev
```

The client reads the API URL from `VITE_API_BASE_URL` and falls back to `http://localhost:5000`. The dev server runs over HTTPS, which browsers require for `getUserMedia`.

Auth0 settings are currently checked in: the backend reads them from `appsettings.json` and the client has them inline in `src/app/providers/AuthProvider.tsx`. Point them at your own tenant if you are running this yourself.
