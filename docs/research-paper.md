# Afromeet Research Paper

## Abstract

Afromeet addresses the need for dependable, low-friction video meetings for distributed African teams and communities. This research paper outlines the problem context, user needs, technical constraints, and a proposed approach that prioritizes fast join times, resilient media delivery, and minimal setup overhead.

## Problem Statement

Remote teams in emerging markets frequently experience high latency, intermittent bandwidth, and inconsistent device capabilities. Existing platforms are often heavy, require multiple steps to join, or do not adapt gracefully to poor network conditions. Afromeet targets a lightweight, browser-first meeting experience that reduces barriers to participation while maintaining core collaboration capabilities.

## Research Questions

1. What are the primary friction points for users joining and participating in video meetings?
2. Which technical constraints most affect call quality in low-bandwidth environments?
3. What minimum feature set delivers a reliable meeting experience without overloading devices?

## Methodology

- Product audit of common meeting platforms to identify onboarding friction and resource usage.
- Interviews and informal feedback from distributed teams to capture pain points.
- Technical feasibility review of browser-based WebRTC plus a lightweight realtime signaling layer.

## Findings

### User Needs

- Fast meeting creation and a single-click join link.
- Confidence checks for microphone and camera before entering the meeting.
- Lightweight UI that performs well on mid-range devices.
- Real-time chat as a fallback when media is degraded.

### Technical Constraints

- Unstable network conditions require graceful reconnection and clear state feedback.
- Heavy client bundles increase join time and reduce reliability on mobile networks.
- Media signaling must be low-latency and resilient to transient disconnects.

## Proposed Approach

- Use WebRTC for peer media delivery with a lightweight signaling channel.
- Provide a meeting lobby for device checks and consent before entering.
- Offer a minimal, focused feature set: scheduling, joining, audio/video controls, participant list, and chat.

## Evaluation Metrics

- Time to first media (seconds).
- Meeting join success rate.
- Average chat message latency (ms).
- Call stability (reconnects per session).
- User satisfaction (qualitative survey feedback).

## Limitations

- Current research is based on a limited sample size.
- Real-world performance requires broader geographic testing.
- Mobile data costs and device variability may require further optimization.

## References

- WebRTC W3C Recommendation
- Web Performance Working Group best practices
