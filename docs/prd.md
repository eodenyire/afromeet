# Product Requirements Document (PRD)

## Problem & Goals

Afromeet must deliver a meeting experience that is quick to join, stable under variable network conditions, and easy to use for first-time participants. The initial release focuses on core meeting functionality without advanced enterprise features.

## Personas

- **Host:** Schedules and shares meeting links, starts calls.
- **Participant:** Joins meetings quickly with minimal setup.
- **Facilitator:** Leads community sessions and needs stable audio.

## User Journeys

1. Host schedules a meeting and shares the link.
2. Participant opens the link and completes pre-join checks.
3. Meeting begins with audio/video and chat for collaboration.

## Functional Requirements

- **FR-1:** Generate a unique meeting link for each meeting.
- **FR-2:** Provide a pre-join lobby with name entry and device toggles.
- **FR-3:** Enable audio/video streams for all participants.
- **FR-4:** Provide a real-time chat panel within the meeting.
- **FR-5:** Display a participant list with presence state.
- **FR-6:** Allow users to mute/unmute and toggle camera.
- **FR-7:** Provide copy/share controls for meeting links.

## Non-Functional Requirements

- **NFR-1:** Initial join time under 10 seconds on average connections.
- **NFR-2:** Chat message latency under 500 ms in normal conditions.
- **NFR-3:** UI responsive across common mobile and desktop sizes.
- **NFR-4:** No critical client errors during a 30-minute meeting.
- **NFR-5:** Secure handling of media permissions and meeting IDs.

## Analytics & Telemetry

- Track meeting creation and join success rates.
- Capture time-to-first-media and reconnect counts.
- Collect user feedback after meetings.

## Dependencies

- WebRTC support in modern browsers.
- Realtime signaling and presence via managed service.
- Static hosting for the client application.

## Release Criteria

- All core flows pass functional testing.
- Baseline performance metrics meet NFR targets.
- Documentation and onboarding copy are complete.

## Open Questions

- How will host controls evolve (e.g., removing participants)?
- What premium features are needed for monetization?
- What bandwidth adaptation strategies are required?
