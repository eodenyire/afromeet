import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MeetingLobby = () => {
  const [name, setName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!name.trim()) return;
    navigate("/meeting");
  };

  return (
    <div className="min-h-screen bg-meeting-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-meeting-border">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-meeting-muted" />
          <img src={logo} alt="Afromeet" className="h-7" />
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-display font-bold text-meeting-text">
              Ready to join?
            </h1>
            <p className="text-sm text-meeting-muted">
              Set up your audio and video before entering the meeting
            </p>
          </div>

          {/* Camera preview */}
          <Card className="bg-meeting-surface border-meeting-border overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-meeting-bg flex items-center justify-center relative">
                {camOn ? (
                  <div className="w-24 h-24 rounded-full gradient-hero flex items-center justify-center">
                    <span className="text-primary-foreground font-display font-bold text-3xl">
                      {name.trim() ? name.trim().charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <VideoOff className="w-10 h-10 text-meeting-muted" />
                    <span className="text-xs text-meeting-muted">Camera is off</span>
                  </div>
                )}

                {/* Mic/Cam toggles overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button
                    size="icon"
                    variant={micOn ? "secondary" : "destructive"}
                    className="rounded-full w-10 h-10"
                    onClick={() => setMicOn(!micOn)}
                  >
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant={camOn ? "secondary" : "destructive"}
                    className="rounded-full w-10 h-10"
                    onClick={() => setCamOn(!camOn)}
                  >
                    {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device settings */}
          <Card className="bg-meeting-surface border-meeting-border">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-meeting-muted mb-1.5 block">
                  Your name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="bg-meeting-bg border-meeting-border text-meeting-text placeholder:text-meeting-muted"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {micOn ? <Mic className="w-4 h-4 text-meeting-text" /> : <MicOff className="w-4 h-4 text-destructive" />}
                  <span className="text-sm text-meeting-text">Microphone</span>
                </div>
                <Switch checked={micOn} onCheckedChange={setMicOn} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {camOn ? <Video className="w-4 h-4 text-meeting-text" /> : <VideoOff className="w-4 h-4 text-destructive" />}
                  <span className="text-sm text-meeting-text">Camera</span>
                </div>
                <Switch checked={camOn} onCheckedChange={setCamOn} />
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full gradient-hero border-0 text-primary-foreground font-semibold h-11"
            disabled={!name.trim()}
            onClick={handleJoin}
          >
            Join Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingLobby;
