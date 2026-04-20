import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DoorOpen, X, LogOut } from "lucide-react";
import { toast } from "sonner";

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[]; // userIds
}

interface BreakoutRoomsPanelProps {
  meetingId: string;
  userId: string;
  isHost: boolean;
  participants: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSendAssign: (targetUserId: string, roomId: string, roomName: string) => void;
  onJoinRoom: (roomId: string, roomName: string) => void;
  mainMeetingId?: string;
}

const BreakoutRoomsPanel = ({
  meetingId,
  userId,
  isHost,
  participants,
  onClose,
  onSendAssign,
  onJoinRoom,
  mainMeetingId,
}: BreakoutRoomsPanelProps) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // userId -> roomId

  const handleCreateRoom = () => {
    const name = newRoomName.trim() || `Room ${rooms.length + 1}`;
    const id = `${meetingId}-breakout-${crypto.randomUUID().slice(0, 8)}`;
    setRooms((prev) => [...prev, { id, name, participants: [] }]);
    setNewRoomName("");
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    // Remove any assignments for this room
    setAssignments((prev) => {
      const next = { ...prev };
      for (const [uid, rid] of Object.entries(next)) {
        if (rid === roomId) delete next[uid];
      }
      return next;
    });
  };

  const handleAssign = (participantId: string, roomId: string) => {
    setAssignments((prev) => ({ ...prev, [participantId]: roomId }));
  };

  const handleBroadcastAssignments = () => {
    let sent = 0;
    for (const [targetUserId, roomId] of Object.entries(assignments)) {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        onSendAssign(targetUserId, roomId, room.name);
        sent++;
      }
    }
    if (sent > 0) {
      toast.success(`Assignments sent to ${sent} participant${sent !== 1 ? "s" : ""}`);
    } else {
      toast.info("No assignments to send. Assign participants to rooms first.");
    }
  };

  const handleJoinAsHost = (room: BreakoutRoom) => {
    onJoinRoom(room.id, room.name);
  };

  const handleReturnToMain = () => {
    if (mainMeetingId) {
      navigate("/meeting", {
        state: {
          userName: participants.find((p) => p.id === userId)?.name ?? "You",
          userId,
          meetingId: mainMeetingId,
          micOn: true,
          camOn: true,
          isBreakout: false,
        },
      });
    }
  };

  return (
    <aside className="w-full sm:w-80 shrink-0 bg-meeting-surface border-l border-meeting-border flex flex-col absolute sm:relative right-0 top-0 bottom-0 z-40 sm:z-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-meeting-border shrink-0">
        <div className="flex items-center gap-2">
          <DoorOpen className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-meeting-text text-sm">Breakout Rooms</h3>
        </div>
        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={onClose}>
          <span className="text-xs text-meeting-muted">✕</span>
        </Button>
      </div>

      {/* Main content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Return to main room button (shown when inside a breakout) */}
          {mainMeetingId && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={handleReturnToMain}
            >
              <LogOut className="w-4 h-4" />
              Return to Main Room
            </Button>
          )}

          {/* Host controls */}
          {isHost && (
            <>
              {/* Create room */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-meeting-muted uppercase tracking-wider">
                  Create Room
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder={`Room ${rooms.length + 1}`}
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                    className="flex-1 bg-meeting-bg border-meeting-border text-meeting-text placeholder:text-meeting-muted text-sm h-8"
                  />
                  <Button size="icon" className="gradient-hero border-0 h-8 w-8 shrink-0" onClick={handleCreateRoom}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Room list */}
              {rooms.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-meeting-muted uppercase tracking-wider">Rooms</p>
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-lg bg-meeting-bg border border-meeting-border p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-meeting-text">{room.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => handleJoinAsHost(room)}
                            title="Join as host"
                          >
                            <DoorOpen className="w-3.5 h-3.5 text-primary" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => handleDeleteRoom(room.id)}
                            title="Delete room"
                          >
                            <X className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {Object.values(assignments).filter((rid) => rid === room.id).length} assigned
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Assign participants */}
              {rooms.length > 0 && participants.filter((p) => p.id !== userId).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-meeting-muted uppercase tracking-wider">Assign Participants</p>
                  {participants
                    .filter((p) => p.id !== userId)
                    .map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className="text-sm text-meeting-text flex-1 truncate">{p.name}</span>
                        <Select
                          value={assignments[p.id] ?? ""}
                          onValueChange={(val) => handleAssign(p.id, val)}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs bg-meeting-bg border-meeting-border text-meeting-text">
                            <SelectValue placeholder="Room…" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((r) => (
                              <SelectItem key={r.id} value={r.id} className="text-xs">
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                  <Button
                    size="sm"
                    className="w-full gradient-hero border-0 text-primary-foreground mt-1"
                    onClick={handleBroadcastAssignments}
                  >
                    Send Assignments
                  </Button>
                </div>
              )}

              {rooms.length === 0 && (
                <p className="text-xs text-meeting-muted text-center py-4">
                  Create a room to get started
                </p>
              )}
            </>
          )}

          {/* Non-host view */}
          {!isHost && (
            <p className="text-xs text-meeting-muted text-center py-4">
              Waiting for the host to open breakout rooms…
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default BreakoutRoomsPanel;
