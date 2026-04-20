import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../hooks/useAuth";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export const HomeScreen = ({ navigation }: Props) => {
  const { session, profile, user, signOut } = useAuth();
  const displayName = profile?.display_name ?? user?.email ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Afromeet</Text>
      <Text style={styles.tagline}>Video meetings for everyone</Text>

      {session ? (
        <>
          <Text style={styles.welcome}>Welcome, {displayName} 👋</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Lobby", {})}
          >
            <Text style={styles.primaryButtonText}>Start a Meeting</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f13",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  logo: { fontSize: 36, fontWeight: "800", color: "#a78bfa", letterSpacing: -1 },
  tagline: { fontSize: 16, color: "#888", marginBottom: 16 },
  welcome: { fontSize: 16, color: "#ccc", marginBottom: 8 },
  primaryButton: {
    width: "100%",
    backgroundColor: "#6d28d9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#ccc", fontWeight: "600", fontSize: 16 },
  signOutText: { color: "#888", marginTop: 8 },
});

export default HomeScreen;
