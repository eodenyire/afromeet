# Software System Design Description (SSDD)

## System Overview

Afromeet is a browser-based meeting application that enables users to schedule meetings, perform device checks in a lobby, and join live calls with audio/video and chat.

## Architecture Summary

- **Client:** React + Vite frontend renders the UI and manages meeting state.
- **Media:** WebRTC handles peer-to-peer audio/video streams.
- **Realtime:** Supabase channels provide signaling and chat messaging.
- **Hosting:** Static build artifacts are deployed to a CDN or static host.

## Component Breakdown

### Client UI

- Scheduling flow with invite link generation.
- Lobby with device previews and toggles.
- Meeting room with controls, participant list, and chat.

### Realtime Signaling

- `meet:<meetingId>` channel for WebRTC offers/answers and ICE candidates.
- `chat:<meetingId>` channel for text messages and presence.

## Data Flow

1. Host creates a meeting and shares a unique link.
2. Participant opens link and joins the signaling channel.
3. WebRTC handshake completes and media streams are exchanged.
4. Chat messages flow through the realtime channel.

## Data Models

### Meeting

- `id`: string
- `createdAt`: timestamp
- `hostId`: string
- `agenda`: string (optional)

### Participant

- `id`: string
- `name`: string
- `micOn`: boolean
- `camOn`: boolean
- `joinedAt`: timestamp

### ChatMessage

- `id`: string
- `meetingId`: string
- `sender`: string
- `content`: string
- `sentAt`: timestamp

## Interfaces and APIs

- **Browser APIs:** MediaDevices, WebRTC, Clipboard.
- **Realtime Service:** Supabase client channels for signaling and chat.

## Security and Privacy

- Request explicit mic/camera permissions in the lobby.
- Use non-guessable meeting IDs.
- Avoid storing sensitive data in local storage.

## Error Handling and Recovery

- Surface errors when media devices are unavailable.
- Retry signaling channel subscriptions on transient failures.
- Provide user guidance when connections drop.

## Configuration

- Environment variables for realtime service keys.
- Build-time configuration via Vite.

## Deployment

- Static assets built with `npm run build`.
- Hosted via CDN or static site hosting service.
