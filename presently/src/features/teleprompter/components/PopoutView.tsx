import TeleprompterText from "@/features/teleprompter/components/TeleprompterText";
import { useTeleprompterStore } from "@/features/teleprompter/store/teleprompterStore";
import { useTeleprompterSync } from "@/features/teleprompter/hooks/useTeleprompterSync";
import { useEffect } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

const PopoutView = () => {
  const isPlaying = useTeleprompterStore((state) => state.isPlaying);
  const setIsPlaying = useTeleprompterStore((state) => state.setIsPlaying);
  const fontSize = useTeleprompterStore((state) => state.fontSize);
  const scrollSpeed = useTeleprompterStore((state) => state.scrollSpeed);
  const textContent = useTeleprompterStore((state) => state.textContent);
  const isFlippedHorizontal = useTeleprompterStore((state) => state.isFlippedHorizontal);
  const isFlippedVertical = useTeleprompterStore((state) => state.isFlippedVertical);
  const textAlign = useTeleprompterStore((state) => state.textAlign);
  const isFocusMode = useTeleprompterStore((state) => state.isFocusMode);
  const isHighContrast = useTeleprompterStore((state) => state.isHighContrast);
  const soundEffects = useTeleprompterStore((state) => state.soundEffects);

  useTeleprompterSync("popout");

  // Sync high-contrast class to this window's DOM
  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [isHighContrast]);

  // Soft chime using Web Audio API
  const playChime = (type: "play" | "stop") => {
    if (!soundEffects) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "play" ? 880 : 660, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Escape closes the popout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        getCurrentWebviewWindow().close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Space toggles playback + chime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        const next = !isPlaying;
        playChime(next ? "play" : "stop");
        setIsPlaying(next);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, soundEffects]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TeleprompterText
        isPlaying={isPlaying}
        fontSize={fontSize[0]}
        scrollSpeed={scrollSpeed[0]}
        textContent={textContent}
        isFlippedHorizontal={isFlippedHorizontal}
        isFlippedVertical={isFlippedVertical}
        textAlign={textAlign}
        isFocusMode={isFocusMode}
        onEnd={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default PopoutView;
