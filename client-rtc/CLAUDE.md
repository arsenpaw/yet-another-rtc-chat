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

# Design System — "Atrium" (single dark theme)

All design tokens live in `src/app/index.css` (Tailwind v4 `@theme inline`, single near-black dark theme). **Never hardcode hex/rgba in components — always use a token utility.** If a value is missing, add a token rather than inlining a color.

- **Reusable primitives live in `src/shared/ui/`** (barrel `@/shared/ui`): `Button`, `Avatar`/`AvatarStack` (initials + tonal fill), `PresenceDot`, `MonoLabel`, `IconTile`, `Chip`, `Logo`, `IconRail`. Compose screens from these; don't re-roll one-off avatars/tiles. (The older shadcn primitives in `src/shared/components/ui` remain for auth/dropdown bits.)
- **Brand accent:** `--primary` is **`#6d5cff` (violet)** — buttons, active room, links, focus rings, brand mark (`brand-gradient` = `--primary`→`--accent-2`). Destructive is `#e5484d`; online/live is `--online` `#2dd47f`.
- **Surfaces (dark):** `bg-background` `#09090b`, `bg-base-alt` (chat column), `bg-rail` (side rails), `bg-card`/`bg-panel` `#101013`, `bg-panel-raised` (composer), `bg-control` (idle voice/video tiles). Accent-soft helpers: `bg-accent-soft` / `border-accent-soft-border` / `text-accent-text(-strong)`, plus `--eyebrow`.
- **Text tones:** `text-foreground`, `text-body`, `text-secondary-text`, `text-muted-foreground`, `text-faint`.
- **Fonts** (loaded via Google Fonts `<link>` in `index.html`):
  - `font-sans` / `font-display` → **Hanken Grotesk** (body, UI, headings, brand).
  - `font-mono` → **JetBrains Mono** (room ids, section labels/eyebrows, timestamps).
- **Layouts:** `/` uses `MainLayout` (marketing nav + footer); `/rooms` + `/rooms/:roomId` use the full-screen `AppLayout` with each page rendering its own `IconRail` grid.
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
- Hanken Grotesk + JetBrains Mono via Google Fonts (`index.html`); `tw-animate-css` for animation utilities

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
