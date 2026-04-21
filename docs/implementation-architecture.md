# Implementation Architecture

## Architecture Summary

Afromeet is implemented as a single-page web application that leverages WebRTC for media and a realtime service for signaling and chat. The frontend is statically built and deployed, keeping the operational footprint lightweight.

## Component Map

- **UI Layer:** React components for scheduling, lobby, meeting room, and shared layout.
- **State & Hooks:** Custom hooks manage WebRTC sessions, chat, and participant state.
- **Realtime Layer:** Supabase channels handle signaling messages and chat events.
- **Media Layer:** WebRTC peer connections handle audio/video streams.

## Runtime Flow

1. User schedules a meeting and gets a shareable link.
2. Participant opens the link and completes device checks in the lobby.
3. The app connects to realtime channels for signaling and chat.
4. WebRTC sessions are negotiated and media streams begin.

## Infrastructure

- **Hosting:** Static file hosting for the Vite build output.
- **Realtime:** Supabase for signaling and messaging.
- **Storage:** Minimal client-side state; no persistent server storage required for MVP.

## Build & Release

- `npm run build` generates production assets.
- Deploy build artifacts to a CDN or static host.
- Environment configuration is managed via `.env` and Vite variables.

## Scalability Considerations

- For larger meetings, consider switching to an SFU architecture.
- Add server-side presence tracking for consistent participant lists.
- Introduce monitoring for connection quality and error rates.

## Future Enhancements

- Recording and transcription support.
- Host controls and moderation features.
- Adaptive bitrate and network quality indicators.
