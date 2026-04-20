import { useEffect, useRef } from "react";
import { MicOff, VideoOff } from "lucide-react";

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream]);

  const showVideo = stream && !isVideoOff;

  return (
    <div className="relative bg-meeting-surface rounded-xl overflow-hidden flex items-center justify-center border border-meeting-border">
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-hero flex items-center justify-center">
          <span className="text-primary-foreground font-display font-bold text-lg sm:text-xl">
            {initials}
          </span>
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
