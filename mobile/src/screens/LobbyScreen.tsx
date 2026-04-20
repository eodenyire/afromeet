import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { RouteProp } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Lobby">;
  route: RouteProp<RootStackParamList, "Lobby">;
};

const generateMeetingId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${seg(3)}-${seg(4)}-${seg(3)}`;
};

export const LobbyScreen = ({ navigation, route }: Props) => {
  const { user, profile } = useAuth();
  const defaultName = profile?.display_name ?? user?.email ?? "";
  const [name, setName] = useState(defaultName);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const meetingId = useRef(route.params?.meetingId || generateMeetingId()).current;

  const handleJoin = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your name to join.");
      return;
    }
    const userId = user?.id ?? crypto.randomUUID();
    navigation.navigate("MeetingRoom", {
      meetingId,
      userName: name.trim(),
      userId,
      micOn,
      camOn,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready to join?</Text>
      <Text style={styles.subtitle}>Set up your audio and video before entering</Text>
      <Text style={styles.meetingId}>Meeting ID: {meetingId}</Text>

      <Text style={styles.label}>Your name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Microphone</Text>
        <Switch
          value={micOn}
          onValueChange={setMicOn}
          trackColor={{ true: "#6d28d9", false: "#333" }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Camera</Text>
        <Switch
          value={camOn}
          onValueChange={setCamOn}
          trackColor={{ true: "#6d28d9", false: "#333" }}
          thumbColor="#fff"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleJoin}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Join Meeting</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f13", padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#888", textAlign: "center" },
  meetingId: { fontSize: 11, color: "#555", textAlign: "center", fontFamily: "monospace", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#bbb" },
  input: {
    backgroundColor: "#1a1a24",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2a2a3a",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a24",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2a2a3a",
  },
  toggleLabel: { color: "#ccc", fontSize: 15 },
  button: {
    backgroundColor: "#6d28d9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default LobbyScreen;
