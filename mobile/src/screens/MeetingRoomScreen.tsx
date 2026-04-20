import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { supabase } from "../lib/supabase";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  RTCView,
  MediaStream,
} from "react-native-webrtc";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MeetingRoom">;
  route: RouteProp<RootStackParamList, "MeetingRoom">;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const MeetingRoomScreen = ({ navigation, route }: Props) => {
  const { meetingId, userName, userId, micOn: initMic, camOn: initCam, isBreakout, mainMeetingId } = route.params;

  const [micOn, setMicOn] = useState(initMic);
  const [camOn, setCamOn] = useState(initCam);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Array<{ id: string; stream: MediaStream }>>([]);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isSubscribed = useRef(false);

  useEffect(() => {
    let active = true;
    const setup = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: camOn,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.getAudioTracks().forEach((t) => { t.enabled = micOn; });
        stream.getVideoTracks().forEach((t) => { t.enabled = camOn; });
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        Alert.alert("Media Error", "Could not access camera or microphone.");
      }
    };
    setup();
    return () => {
      active = false;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = micOn; });
  }, [micOn]);

  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = camOn; });
  }, [camOn]);

  const getOrCreatePC = (remoteId: string): RTCPeerConnection => {
    if (peerConnectionsRef.current.has(remoteId)) {
      return peerConnectionsRef.current.get(remoteId)!;
    }
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(remoteId, pc);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        pc.addTrack(t, localStreamRef.current!);
      });
    }

    const remoteStream = new MediaStream([]);
    pc.ontrack = (e: RTCTrackEvent) => {
      e.streams[0].getTracks().forEach((t) => {
        if (!remoteStream.getTrackById(t.id)) remoteStream.addTrack(t);
      });
      setRemoteStreams((prev) => {
        const exists = prev.find((s) => s.id === remoteId);
        if (exists) return prev.map((s) => s.id === remoteId ? { ...s, stream: remoteStream } : s);
        return [...prev, { id: remoteId, stream: remoteStream }];
      });
    };

    pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
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
        pc.close();
        peerConnectionsRef.current.delete(remoteId);
        setRemoteStreams((prev) => prev.filter((s) => s.id !== remoteId));
      }
    };

    return pc;
  };

  useEffect(() => {
    if (!meetingId || !userId) return;

    const channel = supabase.channel(`meet:${meetingId}`, {
      config: {
        presence: { key: userId },
        broadcast: { self: false, ack: false },
      },
    });
    channelRef.current = channel;

    channel.on("presence", { event: "join" }, async ({ key: joinedId }) => {
      if (joinedId === userId || !isSubscribed.current) return;
      const pc = getOrCreatePC(joinedId);
      try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        channel.send({
          type: "broadcast",
          event: "webrtc:offer",
          payload: { from: userId, to: joinedId, offer },
        });
      } catch (err) {
        console.error("[WebRTC mobile] createOffer failed:", err);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key: leftId }) => {
      if (leftId === userId) return;
      peerConnectionsRef.current.get(leftId)?.close();
      peerConnectionsRef.current.delete(leftId);
      setRemoteStreams((prev) => prev.filter((s) => s.id !== leftId));
    });

    channel.on("broadcast", { event: "webrtc:offer" }, async ({ payload }) => {
      if (payload.to !== userId) return;
      const pc = getOrCreatePC(payload.from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        channel.send({
          type: "broadcast",
          event: "webrtc:answer",
          payload: { from: userId, to: payload.from, answer },
        });
      } catch (err) {
        console.error("[WebRTC mobile] handleOffer failed:", err);
      }
    });

    channel.on("broadcast", { event: "webrtc:answer" }, async ({ payload }) => {
      if (payload.to !== userId) return;
      const pc = peerConnectionsRef.current.get(payload.from);
      if (!pc || pc.signalingState === "stable") return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } catch (err) {
        console.error("[WebRTC mobile] handleAnswer failed:", err);
      }
    });

    channel.on("broadcast", { event: "webrtc:ice" }, async ({ payload }) => {
      if (payload.to !== userId) return;
      const pc = peerConnectionsRef.current.get(payload.from);
      if (pc?.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (err) {
          console.warn("[WebRTC mobile] addIceCandidate failed:", err);
        }
      }
    });

    channel.on("broadcast", { event: "breakout:assign" }, ({ payload }) => {
      if (payload.to !== userId) return;
      Alert.alert(
        "Breakout Room",
        `You've been assigned to "${payload.roomName}". Join now?`,
        [
          { text: "Later", style: "cancel" },
          {
            text: "Join",
            onPress: () => {
              navigation.replace("MeetingRoom", {
                meetingId: payload.roomId,
                userName,
                userId,
                micOn,
                camOn,
                isBreakout: true,
                mainMeetingId: isBreakout ? mainMeetingId ?? meetingId : meetingId,
              });
            },
          },
        ]
      );
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        isSubscribed.current = true;
        await channel.track({ name: userName, isMuted: !micOn, isVideoOff: !camOn });
      }
    });

    return () => {
      isSubscribed.current = false;
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, userId]);

  const handleLeave = () => {
    if (isBreakout && mainMeetingId) {
      navigation.replace("MeetingRoom", {
        meetingId: mainMeetingId,
        userName,
        userId,
        micOn,
        camOn,
        isBreakout: false,
      });
    } else {
      navigation.navigate("Lobby", {});
    }
  };

  return (
    <View style={styles.container}>
      {/* Video grid */}
      <View style={styles.videoGrid}>
        {localStream && (
          <View style={styles.videoTile}>
            <RTCView
              streamURL={(localStream as unknown as { toURL: () => string }).toURL()}
              style={styles.video}
              mirror
              objectFit="cover"
            />
            <Text style={styles.nameLabel}>You</Text>
          </View>
        )}
        {remoteStreams.map(({ id, stream }) => (
          <View key={id} style={styles.videoTile}>
            <RTCView
              streamURL={(stream as unknown as { toURL: () => string }).toURL()}
              style={styles.video}
              objectFit="cover"
            />
            <Text style={styles.nameLabel}>{id.slice(0, 6)}</Text>
          </View>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, !micOn && styles.controlBtnOff]}
          onPress={() => setMicOn(!micOn)}
        >
          <Text style={styles.controlIcon}>{micOn ? "🎙️" : "🔇"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, !camOn && styles.controlBtnOff]}
          onPress={() => setCamOn(!camOn)}
        >
          <Text style={styles.controlIcon}>{camOn ? "📹" : "📷"}</Text>
        </TouchableOpacity>
        {isBreakout && mainMeetingId && (
          <TouchableOpacity style={styles.returnBtn} onPress={handleLeave}>
            <Text style={styles.returnText}>↩ Main Room</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  videoGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
  },
  videoTile: {
    width: "50%",
    aspectRatio: 1,
    padding: 4,
    position: "relative",
  },
  video: { flex: 1, backgroundColor: "#1a1a24", borderRadius: 10 },
  nameLabel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#fff",
    fontSize: 11,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 12,
    backgroundColor: "#0f0f18",
    borderTopWidth: 1,
    borderTopColor: "#1e1e2e",
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1e1e2e",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnOff: { backgroundColor: "#7f1d1d" },
  controlIcon: { fontSize: 20 },
  leaveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#dc2626",
  },
  leaveText: { color: "#fff", fontWeight: "700" },
  returnBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#374151",
  },
  returnText: { color: "#fff", fontSize: 13 },
});

export default MeetingRoomScreen;
