import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import logo from "@/assets/afromeet-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  Copy,
  Check,
  Link as LinkIcon,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";

const generateMeetingId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${seg(3)}-${seg(4)}-${seg(3)}`;
};

const hours = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return { value: String(i).padStart(2, "0"), label: `${h}:00 ${ampm}` };
});

const durations = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const ScheduleMeeting = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [created, setCreated] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [createdMeetingId, setCreatedMeetingId] = useState("");
  const [copied, setCopied] = useState(false);

  const canCreate = title.trim() && date && time;

  const handleCreate = () => {
    if (!canCreate) return;
    const id = generateMeetingId();
    const link = `${window.location.origin}/lobby?meeting=${id}`;
    setMeetingLink(link);
    setCreatedMeetingId(id);
    setCreated(true);
    toast.success("Meeting scheduled successfully!");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDetails = async () => {
    const selectedHour = hours.find((h) => h.value === time);
    const selectedDuration = durations.find((d) => d.value === duration);
    const details = [
      `📅 ${title}`,
      `Date: ${date ? format(date, "PPPP") : ""}`,
      `Time: ${selectedHour?.label || ""}`,
      `Duration: ${selectedDuration?.label || ""}`,
      description ? `\nDescription: ${description}` : "",
      `\nJoin: ${meetingLink}`,
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(details);
    toast.success("Meeting details copied!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <img src={logo} alt="Afromeet" className="h-7" />
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-start justify-center p-4 pt-8 md:pt-16">
        <div className="w-full max-w-lg space-y-6">
          {!created ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Schedule a Meeting
                </h1>
                <p className="text-sm text-muted-foreground">
                  Set up a meeting and share the invite link with participants
                </p>
              </div>

              <Card className="border-border">
                <CardContent className="p-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Meeting title
                    </label>
                    <Input
                      placeholder="e.g. Weekly team standup"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time & Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Time
                      </label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {hours.map((h) => (
                            <SelectItem key={h.value} value={h.value}>
                              {h.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Duration
                      </label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Description (optional)
                    </label>
                    <Textarea
                      placeholder="Add meeting agenda or notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full gradient-hero border-0 text-primary-foreground font-semibold h-11"
                disabled={!canCreate}
                onClick={handleCreate}
              >
                <Video className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Meeting Scheduled!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Share the link below to invite participants
                </p>
              </div>

              <Card className="border-border">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Video className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        {description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-sm text-foreground">
                        {date && format(date, "PPPP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-sm text-foreground">
                        {hours.find((h) => h.value === time)?.label} ·{" "}
                        {durations.find((d) => d.value === duration)?.label}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Invite link
                    </label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={meetingLink}
                        className="text-xs font-mono"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopy}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyDetails}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy Meeting Details
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/lobby?meeting=${createdMeetingId}`}>
                    <Button className="w-full gradient-hero border-0 text-primary-foreground">
                      Join Now
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCreated(false);
                      setTitle("");
                      setDate(undefined);
                      setTime("");
                      setDuration("60");
                      setDescription("");
                      setMeetingLink("");
                      setCreatedMeetingId("");
                    }}
                  >
                    Schedule Another
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeeting;
