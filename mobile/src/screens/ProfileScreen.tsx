import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ProfileSetup">;
  isSetup?: boolean;
};

export const ProfileScreen = ({ navigation, isSetup = false }: Props) => {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", "Failed to save profile: " + error.message);
      return;
    }
    await refreshProfile();
    if (isSetup) {
      navigation.replace("Lobby", {});
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isSetup ? "Set up your profile" : "Edit Profile"}</Text>
      <Text style={styles.subtitle}>
        {isSetup ? "Complete your profile to get started" : "Update your Afromeet profile"}
      </Text>

      <Text style={styles.label}>Display name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor="#888"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <Text style={styles.label}>Bio (optional)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Tell others about yourself..."
        placeholderTextColor="#888"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isSetup ? "Continue" : "Save Changes"}</Text>
        )}
      </TouchableOpacity>

      {!isSetup && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f13" },
  inner: { padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 12 },
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
  textarea: { height: 90, textAlignVertical: "top" },
  button: {
    backgroundColor: "#6d28d9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: { color: "#888", fontSize: 15 },
});

export default ProfileScreen;
