import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

interface UseWebRTCOptions {
  meetingId: string;
  userName: string;
  userId: string;
  micOn: boolean;
  camOn: boolean;
  onBreakoutAssign?: (roomId: string, roomName: string) => void;
}

export function useWebRTC({ meetingId, userName, userId, micOn, camOn, onBreakoutAssign }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const isSubscribed = useRef(false);

  const onBreakoutAssignRef = useRef(onBreakoutAssign);
  onBreakoutAssignRef.current = onBreakoutAssign;

  // Capture latest userName without re-running the channel effect
  const userNameRef = useRef(userName);
  userNameRef.current = userName;

  // ── Media setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const setup = async () => {
      let acquiredStream: MediaStream | null = null;
      try {
        acquiredStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch {
        try {
          acquiredStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
        } catch {
          if (active) setError("Could not access camera or microphone. Check your browser permissions.");
          return;
        }
      }
      if (!active) {
        acquiredStream?.getTracks().forEach((t) => t.stop());
        return;
      }
      acquiredStream!.getAudioTracks().forEach((t) => (t.enabled = micOn));
      acquiredStream!.getVideoTracks().forEach((t) => (t.enabled = camOn));
      localStreamRef.current = acquiredStream;
      setLocalStream(acquiredStream);
    };

    setup();
    return () => {
      active = false;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once

  // ── Mic toggle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [micOn]);

  // ── Camera toggle ──────────────────────────────────────────────────────────
  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = camOn));
  }, [camOn]);

  // ── Peer connection factory ──────────────────────────────────────────────────
  const getOrCreatePC = useCallback(
    (remoteId: string): RTCPeerConnection => {
      if (peerConnections.current.has(remoteId)) {
        return peerConnections.current.get(remoteId)!;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current.set(remoteId, pc);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
      }

      const remoteStream = new MediaStream();
      remoteStreams.current.set(remoteId, remoteStream);

      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => {
          if (!remoteStream.getTrackById(t.id)) remoteStream.addTrack(t);
        });
        setParticipants((prev) =>
          prev.map((p) => (p.id === remoteId ? { ...p, stream: remoteStream } : p))
        );
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          channelRef.current?.send({
            type: "broadcast",
            event: "webrtc:ice",
            payload: { from: userId, to: remoteId, candidate: e.candidate.toJSON() },
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          closePeer(remoteId);
        }
      };

      return pc;
    },
    [userId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const closePeer = (remoteId: string) => {
    peerConnections.current.get(remoteId)?.close();
    peerConnections.current.delete(remoteId);
    remoteStreams.current.delete(remoteId);
    setParticipants((prev) => prev.filter((p) => p.id !== remoteId));
  };

  // ── Signaling channel setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!meetingId || !userId) return;

    const channel = supabase.channel(`meet:${meetingId}`, {
      config: {
        presence: { key: userId },
        broadcast: { self: false, ack: false },
      },
    });
    channelRef.current = channel;

    // Update participants list from presence state
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<{ name: string; isMuted: boolean; isVideoOff: boolean }>();
      setParticipants((prev) => {
        const next: Participant[] = [];
        for (const [pid, presences] of Object.entries(state)) {
          if (pid === userId) continue;
          const p = presences[0] as { name: string; isMuted: boolean; isVideoOff: boolean };
          const existing = prev.find((x) => x.id === pid);
          next.push({
            id: pid,
            name: p.name ?? "Unknown",
            isMuted: p.isMuted ?? false,
            isVideoOff: p.isVideoOff ?? false,
            stream: existing?.stream ?? remoteStreams.current.get(pid),
          });
        }
        return next;
      });
    });

    // Existing users send an offer to every new joiner
    channel.on("presence", { event: "join" }, async ({ key: joinedId, newPresences }) => {
      if (joinedId === userId || !isSubscribed.current) return;

      const presence = (newPresences as Array<{ name: string; isMuted: boolean; isVideoOff: boolean }>)[0];

      setParticipants((prev) => {
        if (prev.find((p) => p.id === joinedId)) return prev;
        return [
          ...prev,
          {
            id: joinedId,
            name: presence?.name ?? "Unknown",
            isMuted: presence?.isMuted ?? false,
            isVideoOff: presence?.isVideoOff ?? false,
          },
        ];
      });

      // Wait up to 5 s for local stream before creating offer
      await waitForStream();

      const pc = getOrCreatePC(joinedId);
      ensureTracksAdded(pc);

      try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        channel.send({
          type: "broadcast",
          event: "webrtc:offer",
          payload: { from: userId, to: joinedId, offer },
        });
      } catch (err) {
        console.error("[WebRTC] createOffer failed:", err);
      }
    });

    // User left
    channel.on("presence", { event: "leave" }, ({ key: leftId }) => {
      if (leftId !== userId) closePeer(leftId);
    });

    // New joiner receives offers from all existing users and sends answers
    channel.on("broadcast", { event: "webrtc:offer" }, async ({ payload }) => {
      if (payload.to !== userId) return;
      await waitForStream();

      const pc = getOrCreatePC(payload.from);
      ensureTracksAdded(pc);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        await applyPendingCandidates(pc, payload.from);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        channel.send({
          type: "broadcast",
          event: "webrtc:answer",
          payload: { from: userId, to: payload.from, answer },
        });
      } catch (err) {
        console.error("[WebRTC] handleOffer failed:", err);
      }
    });

    // Offerer receives answer
    channel.on("broadcast", { event: "webrtc:answer" }, async ({ payload }) => {
      if (payload.to !== userId) return;
      const pc = peerConnections.current.get(payload.from);
      if (!pc || pc.signalingState === "stable") return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        await applyPendingCandidates(pc, payload.from);
      } catch (err) {
        console.error("[WebRTC] handleAnswer failed:", err);
      }
    });

    // ICE candidates
    channel.on("broadcast", { event: "webrtc:ice" }, async ({ payload }) => {
      if (payload.to !== userId) return;
      const pc = peerConnections.current.get(payload.from);
      if (pc?.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (err) {
          console.warn("[WebRTC] addIceCandidate failed:", err);
        }
      } else {
        if (!pendingCandidates.current.has(payload.from)) {
          pendingCandidates.current.set(payload.from, []);
        }
        pendingCandidates.current.get(payload.from)!.push(payload.candidate);
      }
    });

    // Breakout room assignment
    channel.on("broadcast", { event: "breakout:assign" }, ({ payload }) => {
      if (payload.to !== userId) return;
      onBreakoutAssignRef.current?.(payload.roomId as string, payload.roomName as string);
    });

    // Subscribe and publish our presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        isSubscribed.current = true;
        await channel.track({
          name: userNameRef.current,
          isMuted: !micOn,
          isVideoOff: !camOn,
        });
      }
    });

    return () => {
      isSubscribed.current = false;
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      remoteStreams.current.clear();
      pendingCandidates.current.clear();
      channel.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, userId]); // stable — don't re-run on mic/cam changes

  // ── Update presence when mic/cam state changes ───────────────────────────────
  const updatePresence = useCallback(
    async (newMicOn: boolean, newCamOn: boolean) => {
      if (channelRef.current && isSubscribed.current) {
        await channelRef.current.track({
          name: userNameRef.current,
          isMuted: !newMicOn,
          isVideoOff: !newCamOn,
        });
      }
    },
    [] // userNameRef is a ref so stable
  );

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const waitForStream = (): Promise<void> =>
    new Promise((resolve) => {
      if (localStreamRef.current) return resolve();
      const iv = setInterval(() => {
        if (localStreamRef.current) {
          clearInterval(iv);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(iv);
        resolve();
      }, 5000);
    });

  const ensureTracksAdded = (pc: RTCPeerConnection) => {
    if (!localStreamRef.current) return;
    const senders = pc.getSenders();
    localStreamRef.current.getTracks().forEach((track) => {
      if (!senders.find((s) => s.track?.id === track.id)) {
        pc.addTrack(track, localStreamRef.current!);
      }
    });
  };

  const applyPendingCandidates = async (pc: RTCPeerConnection, remoteId: string) => {
    const pending = pendingCandidates.current.get(remoteId) ?? [];
    for (const c of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        // ignore
      }
    }
    pendingCandidates.current.delete(remoteId);
  };

  // ── Send breakout room assignment ────────────────────────────────────────────
  const sendBreakoutAssign = useCallback(
    (targetUserId: string, roomId: string, roomName: string, mainMeetingId: string) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "breakout:assign",
        payload: { from: userId, to: targetUserId, roomId, roomName, mainMeetingId },
      });
    },
    [userId]
  );

  return { localStream, participants, error, updatePresence, sendBreakoutAssign };
}
