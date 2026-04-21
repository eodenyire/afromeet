# Proof of Concept (POC)

## Goal

Validate that a browser-only Afromeet experience can deliver a reliable meeting flow using WebRTC for media and a lightweight realtime channel for signaling and chat.

## Hypotheses

- Users can create and join meetings quickly with a shareable link.
- A pre-join lobby reduces failed joins due to device issues.
- WebRTC combined with realtime signaling provides acceptable call stability for small groups.

## POC Scope

- Meeting scheduling page with invite link generation.
- Lobby for name entry and microphone/camera toggles.
- Meeting room with audio/video, participant list, and chat.
- Realtime signaling and messaging via a managed service.

## Implementation Summary

- Frontend: React + Vite + Tailwind UI.
- Media: WebRTC for peer connections.
- Realtime: Supabase channels for signaling and chat.
- State: Client-side meeting state with basic persistence across navigation.

## Demo Flow

1. Host generates a meeting link and shares it.
2. Participant opens the link and configures audio/video in the lobby.
3. Participant joins the meeting room and sees other participants.
4. Participants exchange chat messages and toggle mic/camera.

## Validation Results (Initial)

- Join flow works end-to-end in modern browsers.
- Realtime messaging maintains low latency in local testing.
- Media sessions establish reliably for small groups.

## Gaps and Limitations

- No server-side recording or moderation features.
- Limited resilience testing under poor network conditions.
- Lacks advanced security controls such as waiting rooms or host approvals.

## Next Steps

- Add reconnection handling and network quality indicators.
- Expand testing across bandwidth profiles and regions.
- Define a scalability strategy for larger meetings.
