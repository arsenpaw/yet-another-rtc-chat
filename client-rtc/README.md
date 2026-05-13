# RTC Messenger

A minimal browser-based video chat app built on WebRTC. Start a call, share the link, and connect peer-to-peer — no plugins or accounts required.

## How it works

- **Host** clicks "Start Call" → gets a shareable invite link
- **Guest** opens the link → clicks "Join Room"
- Peers connect directly via WebRTC (audio + video)
- Signaling is handled by a SignalR hub on the backend; ICE negotiation uses Google's STUN servers

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Signaling | ASP.NET SignalR (`/hubs/signaling`) |
| P2P transport | WebRTC (`RTCPeerConnection`) |
| Alt signaling | Agora RTM SDK (swappable) |

## Getting started

```bash
# Install dependencies
npm install

# Start dev server (set backend URL in .env)
VITE_API_BASE_URL=http://localhost:5000 npm run dev
```

## Environment

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000` | SignalR backend base URL |

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```
