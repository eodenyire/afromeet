import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import {
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff,
  MessageSquare, Users, MoreVertical, Send, Hand, SmilePlus,
  ChevronLeft,
} from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useMeetingChat } from "@/hooks/useMeetingChat";
import { useVoiceActivity } from "@/hooks/useVoiceActivity";
import VideoTile from "@/components/VideoTile";
import { toast } from "sonner";

interface LocationState {
  userName: string;
  userId: string;
  meetingId: string;
  micOn: boolean;
  camOn: boolean;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

const MeetingRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  // Redirect to lobby if we landed here without state
  useEffect(() => {
    if (!state?.userId) {
      navigate("/lobby", { replace: true });
    }
  }, [state, navigate]);

  const { userName = "You", userId = "", meetingId = "", micOn: initMic = true, camOn: initCam = true } =
    state ?? {};

  const [micOn, setMicOn] = useState(initMic);
  const [camOn, setCamOn] = useState(initCam);
  const [sidePanel, setSidePanel] = useState<"chat" | "people" | null>(null);
  const [chatInput, setChatInput] = useState("");

  const { localStream, participants, error, updatePresence } = useWebRTC({
    meetingId,
    userName,
    userId,
    micOn,
    camOn,
  });

  // Detect local speaking so the mic button pulses when the user is talking.
  const localIsSpeaking = useVoiceActivity(localStream, micOn);

  const { messages, sendMessage } = useMeetingChat(meetingId, userName);

  // Show error toast if media fails
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleMicToggle = () => {
    const next = !micOn;
    setMicOn(next);
    updatePresence(next, camOn);
  };

  const handleCamToggle = () => {
    const next = !camOn;
    setCamOn(next);
    updatePresence(micOn, next);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput("");
  };

  const togglePanel = (panel: "chat" | "people") => {
    setSidePanel((prev) => (prev === panel ? null : panel));
  };

  const handleLeave = () => {
    navigate("/");
  };

  // All tiles = local user first, then remote participants
  const allTiles = [
    { id: userId, name: `${userName} (You)`, initials: getInitials(userName), isMuted: !micOn, isVideoOff: !camOn, isLocal: true, stream: localStream },
    ...participants.map((p) => ({
      id: p.id,
      name: p.name,
      initials: getInitials(p.name),
      isMuted: p.isMuted,
      isVideoOff: p.isVideoOff,
      isLocal: false,
      stream: p.stream,
    })),
  ];

  if (!state?.userId) return null;

  return (
    <div className="h-screen flex flex-col bg-meeting-bg overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-meeting-surface border-b border-meeting-border shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src={logo} alt="Afromeet" className="h-7" />
          </Link>
          <div className="hidden sm:block h-4 w-px bg-meeting-border" />
          <span className="hidden sm:block text-sm font-medium text-meeting-text truncate max-w-[160px]">
            {meetingId}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-meeting-muted">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>{allTiles.length} participant{allTiles.length !== 1 ? "s" : ""}</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Video grid */}
        <div className="flex-1 p-3 flex flex-col min-w-0">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 auto-rows-fr">
            {allTiles.map((tile) => (
              <VideoTile
                key={tile.id}
                stream={tile.stream}
                name={tile.name}
                initials={tile.initials}
                isMuted={tile.isMuted}
                isVideoOff={tile.isVideoOff}
                isLocal={tile.isLocal}
              />
            ))}
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-3 shrink-0">
            <div className="relative">
              <Button
                size="icon"
                variant={micOn ? "secondary" : "destructive"}
                className={`rounded-full w-11 h-11 meeting-control transition-shadow duration-150 ${
                  localIsSpeaking ? "shadow-[0_0_0_3px_hsl(var(--primary)/0.5)]" : ""
                }`}
                onClick={handleMicToggle}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              {localIsSpeaking && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-meeting-surface animate-pulse pointer-events-none" />
              )}
            </div>
            <Button
              size="icon"
              variant={camOn ? "secondary" : "destructive"}
              className="rounded-full w-11 h-11 meeting-control"
              onClick={handleCamToggle}
            >
              {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full w-11 h-11 meeting-control">
              <Monitor className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full w-11 h-11 meeting-control">
              <Hand className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full w-11 h-11 meeting-control hidden sm:inline-flex">
              <SmilePlus className="w-5 h-5" />
            </Button>

            <div className="h-8 w-px bg-meeting-border mx-1" />

            <Button
              size="icon"
              variant={sidePanel === "chat" ? "default" : "secondary"}
              className="rounded-full w-11 h-11 meeting-control"
              onClick={() => togglePanel("chat")}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant={sidePanel === "people" ? "default" : "secondary"}
              className="rounded-full w-11 h-11 meeting-control"
              onClick={() => togglePanel("people")}
            >
              <Users className="w-5 h-5" />
            </Button>

            <div className="h-8 w-px bg-meeting-border mx-1" />

            <Button size="icon" variant="destructive" className="rounded-full w-11 h-11" onClick={handleLeave}>
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Side panel */}
        {sidePanel && (
          <aside className="w-full sm:w-80 shrink-0 bg-meeting-surface border-l border-meeting-border flex flex-col absolute sm:relative right-0 top-0 bottom-0 z-40 sm:z-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-meeting-border">
              <h3 className="font-display font-semibold text-meeting-text text-sm">
                {sidePanel === "chat" ? "In-call Messages" : `People (${allTiles.length})`}
              </h3>
              <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setSidePanel(null)}>
                <ChevronLeft className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline text-xs text-meeting-muted">✕</span>
              </Button>
            </div>

            {sidePanel === "chat" ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-xs text-meeting-muted text-center mt-4">No messages yet. Say hello! 👋</p>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={m.isOwn ? "text-right" : ""}>
                      <div
                        className="flex items-baseline gap-2 mb-0.5"
                        style={{ justifyContent: m.isOwn ? "flex-end" : "flex-start" }}
                      >
                        <span className="text-xs font-semibold text-meeting-text">{m.isOwn ? "You" : m.sender}</span>
                        <span className="text-[10px] text-meeting-muted">{m.time}</span>
                      </div>
                      <div
                        className={`inline-block px-3 py-1.5 rounded-xl text-sm max-w-[85%] ${
                          m.isOwn
                            ? "gradient-hero text-primary-foreground rounded-br-sm"
                            : "bg-meeting-bg text-meeting-text rounded-bl-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-meeting-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Send a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-meeting-bg border border-meeting-border rounded-lg px-3 py-2 text-sm text-meeting-text placeholder:text-meeting-muted focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button size="icon" className="gradient-hero border-0 rounded-lg" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                {allTiles.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-meeting-bg transition-colors">
                    <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">{p.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-meeting-text truncate block">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {p.isMuted ? (
                        <MicOff className="w-4 h-4 text-destructive" />
                      ) : (
                        <Mic className="w-4 h-4 text-meeting-muted" />
                      )}
                      <Button size="icon" variant="ghost" className="w-7 h-7">
                        <MoreVertical className="w-3.5 h-3.5 text-meeting-muted" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;
