import { useEffect, useRef, useState } from "react";

/**
 * Detects whether the given MediaStream has active audio above a noise floor.
 * Returns true while the RMS amplitude exceeds the threshold.
 *
 * @param stream  - The MediaStream to analyse (local or remote).
 * @param enabled - Set to false when the track is muted so we never falsely
 *                  report speaking.
 */
export function useVoiceActivity(
  stream: MediaStream | null | undefined,
  enabled: boolean = true
): boolean {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animFrameRef = useRef<number>(0);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !enabled) {
      setIsSpeaking(false);
      return;
    }

    // AudioContext may not exist in all environments (e.g. SSR / tests).
    type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
    const WebkitAudioCtx = (window as unknown as WebkitWindow).webkitAudioContext;
    if (typeof AudioContext === "undefined" && typeof WebkitAudioCtx === "undefined") {
      return;
    }
    const AudioCtx = AudioContext ?? WebkitAudioCtx!;

    const audioContext = new AudioCtx();
    contextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.fftSize);
    // How many consecutive silent frames before we clear the speaking flag.
    const SILENCE_DEBOUNCE = 15;
    let silenceCount = 0;

    const detect = () => {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      if (rms > 0.01) {
        silenceCount = 0;
        setIsSpeaking(true);
      } else {
        silenceCount += 1;
        if (silenceCount > SILENCE_DEBOUNCE) {
          setIsSpeaking(false);
        }
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    // Resume context if it was suspended (browser autoplay policy).
    if (audioContext.state === "suspended") {
      // Ignore resume errors — audio will retry on the next user interaction.
      audioContext.resume().catch(() => {/* intentionally ignored */});
    }

    animFrameRef.current = requestAnimationFrame(detect);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      source.disconnect();
      // Ignore close errors — the context may already be closed during cleanup.
      audioContext.close().catch(() => {/* intentionally ignored */});
      setIsSpeaking(false);
    };
  }, [stream, enabled]);

  return isSpeaking;
}
