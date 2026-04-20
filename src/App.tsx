import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import AuthRequired from "@/components/AuthRequired";
import Index from "./pages/Index.tsx";
import MeetingLobby from "./pages/MeetingLobby.tsx";
import MeetingRoom from "./pages/MeetingRoom.tsx";
import ScheduleMeeting from "./pages/ScheduleMeeting.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Profile, { ProfileSetup } from "./pages/Profile.tsx";

const queryClient = new QueryClient();

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/lobby" element={<AuthRequired><MeetingLobby /></AuthRequired>} />
            <Route path="/meeting" element={<AuthRequired><MeetingRoom /></AuthRequired>} />
            <Route path="/profile" element={<AuthRequired><Profile /></AuthRequired>} />
            <Route path="/profile/setup" element={<AuthRequired><ProfileSetup /></AuthRequired>} />
            <Route path="/schedule" element={<ScheduleMeeting />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
