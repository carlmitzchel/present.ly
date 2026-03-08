import TeleprompterText from "@/components/TeleprompterText";
import { useTeleprompterState } from "@/hooks/useTeleprompterState";
import { useEffect } from "react";
// import { Button } from "./ui/button";
// import { Pause, Play, RotateCcw } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

const PopoutView = () => {
  const {
    isPlaying,
    setIsPlaying,
    fontSize,
    scrollSpeed,
    textContent,
    isFlippedHorizontal,
    isFlippedVertical,
    textAlign,
    isFocusMode,
  } = useTeleprompterState("popout");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        getCurrentWebviewWindow().close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown); // 👈 always clean up
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* <div className="flex items-center justify-end gap-2 w-full  py-2 px-4">
        <Button
          variant={isPlaying ? "destructive" : "outline"}
          onClick={() => (isPlaying ? setIsPlaying(false) : setIsPlaying(true))}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button variant="outline" onClick={() => setIsPlaying(false)}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div> */}
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
