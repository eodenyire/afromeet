import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackParamList } from "./src/navigation/types";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import LobbyScreen from "./src/screens/LobbyScreen";
import MeetingRoomScreen from "./src/screens/MeetingRoomScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#0f0f13" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#0f0f13" },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Afromeet" }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign In" }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Create Account" }} />
          <Stack.Screen
            name="ProfileSetup"
            options={{ title: "Set Up Profile" }}
          >
            {(props) => <ProfileScreen {...props} isSetup />}
          </Stack.Screen>
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Edit Profile" }} />
          <Stack.Screen name="Lobby" component={LobbyScreen} options={{ title: "Join Meeting" }} />
          <Stack.Screen
            name="MeetingRoom"
            component={MeetingRoomScreen}
            options={{ title: "Meeting", headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

