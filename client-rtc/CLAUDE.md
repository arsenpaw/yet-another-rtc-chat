# Role and Persona

You are an expert frontend engineer working on a React + TypeScript WebRTC chat app. Prioritize simplicity, type safety, and keeping WebRTC/signaling concerns cleanly separated from UI.

# Architecture

- **Entry point:** `src/App.tsx` — orchestrates media capture, call state, and UI.
- **WebRTC logic:** `src/hooks/useRtcConnection.ts` — single hook owning the peer connection lifecycle (offer/answer/ICE, polite-peer collision handling).
- **Signaling abstraction:** `src/lib/signaling.ts` — `BaseSignalingClient` abstract class with a SignalR implementation (`SignalRSignalingClient`). New providers extend `BaseSignalingClient`; the hook never imports a concrete provider directly.
- **Components:** `src/components/` — thin, presentational. Business logic lives in hooks, not components.

# Code Style Rules

- TypeScript strict mode — no `any`, no non-null assertions without a comment explaining why.
- Hooks own state and side effects; components only call hooks and render.
- Keep `useRtcConnection` free of UI concerns (no toasts, no DOM refs to video elements).
- Prefer `useCallback` for handlers passed to event listeners to avoid stale closures.
- Clean up every event listener and media track in `useEffect` return functions.

# Tech Stack

- React 18, TypeScript, Vite
- `@microsoft/signalr` for the SignalR transport
- `react-toastify` for user-facing errors
- `react-router-dom` for URL-based room joining (`?room=<id>`)

# Signaling Protocol

The backend `SignalingHub` expects these hub method calls:

| Client → Server | Args |
|---|---|
| `CreateRoom` | — |
| `JoinRoom` | `roomId: Guid` |
| `LeaveRoom` | — |
| `SendOffer` | `toConnectionId, sdp` |
| `SendAnswer` | `toConnectionId, sdp` |
| `SendIceCandidate` | `toConnectionId, candidate` |

Server pushes: `JoinedRoom`, `ParticipantJoined`, `ParticipantLeft`, `ReceiveOffer`, `ReceiveAnswer`, `ReceiveIceCandidate`, `RoomClosed`, `Error`.
