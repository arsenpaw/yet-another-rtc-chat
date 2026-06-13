# Role and Persona

You are an expert frontend engineer working on a React + TypeScript WebRTC chat app. Prioritize simplicity, type safety, and keeping WebRTC/signaling concerns cleanly separated from UI.

# Architecture

Feature-Sliced Design (`app` / `pages` / `widgets` / `features` / `entities` / `shared`).

- **Routing:** `src/app/App.tsx` — `/rooms` (room list) and `/rooms/:roomId` (the call), both under `ProtectedRoute`.
- **Pages:** `src/pages/rooms` (list/create/join/close) and `src/pages/room` (`RoomCallPage` — media capture + call UI).
- **WebRTC logic:** `src/shared/lib/hooks/useRtcConnection.ts` — hook owning the peer connection lifecycle (offer/answer/ICE, polite-peer collision handling). 1:1 only (room cap 2).
- **Signaling abstraction:** `src/shared/api/signaling` — `BaseSignalingClient` abstract class with a SignalR implementation (`SignalRSignalingClient`) and a legacy Agora one. New providers extend `BaseSignalingClient`; the hook never imports a concrete provider directly.
- **REST rooms API:** `src/shared/api/rooms` — create/list/get/close rooms (`/api/rooms`).
- **Components:** thin & presentational; business logic lives in hooks, not components.

# Code Style Rules

- TypeScript strict mode — no `any`, no non-null assertions without a comment explaining why.
- Hooks own state and side effects; components only call hooks and render.
- Keep `useRtcConnection` free of UI concerns (no toasts, no DOM refs to video elements).
- Prefer `useCallback` for handlers passed to event listeners to avoid stale closures.
- Clean up every event listener and media track in `useEffect` return functions.

# Design System

All design tokens live in `src/app/index.css` (Tailwind v4 `@theme`, light + `.dark`). **Never hardcode hex/oklch in components — always use a token utility.** If a value is missing, add a token rather than inlining a color.

- **Brand color:** `--primary` is a near-black **dark blue** (buttons, brand mark, focus rings). `--feature` / `--feature-muted` are the brighter blue accent for icons/highlights. Destructive stays red.
- **Surfaces:** `--surface` (cool off-white panels) and `--surface-accent` (soft blue tint). `bg-surface`, `bg-surface-accent`, `text-feature`, `bg-feature-muted` are exposed as utilities.
- **Fonts** (loaded via `@fontsource-variable/*` in `src/app/main.tsx`):
  - `font-sans` → **Inter Variable** (body / UI).
  - `font-display` → **Space Grotesk Variable** (headings, brand, section titles). Use `font-display` for headings, not `font-serif`.
  - `font-mono` → **JetBrains Mono Variable** (room ids, badges).
- **Motion:** `tw-animate-css` (`animate-in fade-in slide-in-from-*`, etc.) plus custom keyframes `animate-float` / `animate-pulse-glow` / `animate-gradient`. Always honor the global `prefers-reduced-motion` reset already in `index.css`.

# UI / Copy Rules

- **Never expose implementation details in user-facing UI or copy.** No "SignalR", ".NET", "WebRTC", "ICE", "peer-to-peer signaling", tech-stack lists, hub/endpoint names, etc. Marketing copy and error toasts must be product-focused and generic (e.g. "Connection error", not "Signaling error").
- Public landing (`/`) is a simple marketing page; the authenticated app (`/rooms`) is where users actually connect.

# Tech Stack

- React 19, TypeScript, Vite, Tailwind CSS v4 (CSS-first config in `src/app/index.css`)
- `@microsoft/signalr` for the SignalR transport (internal only — never surfaced in UI)
- `react-toastify` for user-facing errors
- `@tanstack/react-query` for room REST state
- `react-router-dom` for URL-based room joining (`/rooms/:roomId`)
- `@fontsource-variable/*` for self-hosted fonts; `tw-animate-css` for animation utilities

# Signaling Protocol

The backend splits room membership and signaling into **two hubs**, plus a REST controller for room lifecycle. Peers are addressed by **`userId`** (Auth0 `sub`), because the two hub connections have distinct connectionIds.

**REST `api/rooms`** (Bearer auth): `POST` create → `{ id }`, `GET` list → `RoomSummaryDto[]`, `GET {id}` → `RoomDetailDto`, `DELETE {id}` close.

**Rooms hub `/hubs/rooms`:**

| Client → Server | Args |
|---|---|
| `JoinRoom` | `roomId: Guid` |
| `LeaveRoom` | — |

Server pushes: `JoinedRoom(RoomDetailDto)`, `ParticipantsList(ParticipantDto[])`, `ParticipantJoined(ParticipantDto)`, `ParticipantLeft(userId)`, `RoomClosed`, `Error`.

**Signaling hub `/hubs/signaling`:**

| Client → Server | Args |
|---|---|
| `SendOffer` | `toUserId, sdp` |
| `SendAnswer` | `toUserId, sdp` |
| `SendIceCandidate` | `toUserId, candidate` |

Server pushes: `ReceiveOffer(fromUserId, sdp)`, `ReceiveAnswer(fromUserId, sdp)`, `ReceiveIceCandidate(fromUserId, candidate)`, `Error`.
