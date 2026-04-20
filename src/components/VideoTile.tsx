import { useEffect, useRef } from "react";
import { MicOff, VideoOff } from "lucide-react";
import { useVoiceActivity } from "@/hooks/useVoiceActivity";

interface VideoTileProps {
  stream?: MediaStream | null;
  name: string;
  initials: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isLocal?: boolean;
  isHost?: boolean;
}

const VideoTile = ({
  stream,
  name,
  initials,
  isMuted,
  isVideoOff,
  isLocal = false,
  isHost = false,
}: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect voice activity so we can show a visual speaking indicator.
  // For local users we still detect (so they can see their own mic is active)
  // but we never play audio locally to avoid echo.
  const isSpeaking = useVoiceActivity(stream, !isMuted);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream]);

  const showVideo = stream && !isVideoOff;

  return (
    <div
      className={`relative bg-meeting-surface rounded-xl overflow-hidden flex items-center justify-center border-2 transition-colors duration-150 ${
        isSpeaking
          ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.35)]"
          : "border-meeting-border"
      }`}
    >
      {/*
        Always render the <video> element so that remote audio tracks are
        attached to the DOM and play even when the participant's camera is off.
        We hide it visually when video is off but keep it mounted.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />

      {/* Avatar shown when camera is off */}
      {!showVideo && (
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-hero flex items-center justify-center transition-shadow duration-150 ${
            isSpeaking ? "ring-4 ring-primary ring-offset-2 ring-offset-meeting-surface" : ""
          }`}
        >
          <span className="text-primary-foreground font-display font-bold text-lg sm:text-xl">
            {initials}
          </span>
        </div>
      )}

      {/* Speaking label */}
      {isSpeaking && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/90 text-primary-foreground rounded-md px-1.5 py-0.5 text-[10px] font-semibold animate-pulse pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground inline-block" />
          speaking
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-meeting-bg/70 backdrop-blur-sm rounded-md px-2 py-1">
        {isMuted && <MicOff className="w-3 h-3 text-destructive" />}
        {isVideoOff && <VideoOff className="w-3 h-3 text-meeting-muted" />}
        <span className="text-xs text-meeting-text font-medium truncate max-w-[80px]">
          {name}
          {isHost && <span className="text-meeting-muted ml-1">(Host)</span>}
        </span>
      </div>
    </div>
  );
};

export default VideoTile;
