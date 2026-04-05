import { useState } from "react";
import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import {
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff,
  MessageSquare, Users, MoreVertical, Send, Hand, SmilePlus,
  ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
}

const mockParticipants = [
  { id: 1, name: "You", initials: "YO", isMuted: false, isHost: true },
  { id: 2, name: "Amara Okafor", initials: "AO", isMuted: true, isHost: false },
  { id: 3, name: "Kwame Asante", initials: "KA", isMuted: false, isHost: false },
  { id: 4, name: "Fatima Diallo", initials: "FD", isMuted: true, isHost: false },
  { id: 5, name: "Tendai Moyo", initials: "TM", isMuted: false, isHost: false },
];

const MeetingRoom = () => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sidePanel, setSidePanel] = useState<"chat" | "people" | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: "Amara Okafor", text: "Hi everyone! Can we start?", time: "10:02" },
    { id: 2, sender: "Kwame Asante", text: "Ready when you are 👍", time: "10:02" },
    { id: 3, sender: "Fatima Diallo", text: "Let me share my screen in a moment", time: "10:03" },
  ]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "You", text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setChatInput("");
  };

  const togglePanel = (panel: "chat" | "people") => {
    setSidePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="h-screen flex flex-col bg-meeting-bg overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-meeting-surface border-b border-meeting-border shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src={logo} alt="Afromeet" className="h-7" />
          </Link>
          <div className="hidden sm:block h-4 w-px bg-meeting-border" />
          <span className="hidden sm:block text-sm font-medium text-meeting-text">Team Standup</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-meeting-muted">
          <span className="hidden sm:inline">Meeting ID: 482-391-205</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>10:04 AM</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Video grid */}
        <div className="flex-1 p-3 flex flex-col min-w-0">
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-2 auto-rows-fr">
            {mockParticipants.map((p) => (
              <div
                key={p.id}
                className="relative bg-meeting-surface rounded-xl overflow-hidden flex items-center justify-center border border-meeting-border"
              >
                {/* Avatar placeholder */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-hero flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-lg sm:text-xl">
                    {p.initials}
                  </span>
                </div>

                {/* Name label */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-meeting-bg/70 backdrop-blur-sm rounded-md px-2 py-1">
                  {p.isMuted && <MicOff className="w-3 h-3 text-destructive" />}
                  <span className="text-xs text-meeting-text font-medium truncate max-w-[80px]">
                    {p.name} {p.isHost && "(Host)"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-3 shrink-0">
            <Button
              size="icon"
              variant={micOn ? "secondary" : "destructive"}
              className="rounded-full w-11 h-11 meeting-control"
              onClick={() => setMicOn(!micOn)}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button
              size="icon"
              variant={camOn ? "secondary" : "destructive"}
              className="rounded-full w-11 h-11 meeting-control"
              onClick={() => setCamOn(!camOn)}
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

            <Link to="/">
              <Button size="icon" variant="destructive" className="rounded-full w-11 h-11">
                <PhoneOff className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Side panel */}
        {sidePanel && (
          <aside className="w-full sm:w-80 shrink-0 bg-meeting-surface border-l border-meeting-border flex flex-col absolute sm:relative right-0 top-0 bottom-0 z-40 sm:z-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-meeting-border">
              <h3 className="font-display font-semibold text-meeting-text text-sm">
                {sidePanel === "chat" ? "In-call Messages" : `People (${mockParticipants.length})`}
              </h3>
              <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setSidePanel(null)}>
                <ChevronLeft className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline text-xs text-meeting-muted">✕</span>
              </Button>
            </div>

            {sidePanel === "chat" ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={m.sender === "You" ? "text-right" : ""}>
                      <div className="flex items-baseline gap-2 mb-0.5" style={{ justifyContent: m.sender === "You" ? "flex-end" : "flex-start" }}>
                        <span className="text-xs font-semibold text-meeting-text">{m.sender}</span>
                        <span className="text-[10px] text-meeting-muted">{m.time}</span>
                      </div>
                      <div
                        className={`inline-block px-3 py-1.5 rounded-xl text-sm max-w-[85%] ${
                          m.sender === "You"
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
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 bg-meeting-bg border border-meeting-border rounded-lg px-3 py-2 text-sm text-meeting-text placeholder:text-meeting-muted focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button size="icon" className="gradient-hero border-0 rounded-lg" onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                {mockParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-meeting-bg transition-colors">
                    <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">{p.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-meeting-text truncate block">
                        {p.name} {p.isHost && <span className="text-[10px] text-meeting-muted">(Host)</span>}
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
