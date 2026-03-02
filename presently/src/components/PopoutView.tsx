import TeleprompterText from "@/components/TeleprompterText";
import { useTeleprompterState } from "@/hooks/useTeleprompterState";
import { useEffect } from "react";

const PopoutView = () => {
  const { isPlaying, setIsPlaying, fontSize, scrollSpeed, textContent } =
    useTeleprompterState("popout");

  useEffect(() => {
    // This opens devtools via keyboard shortcut simulation - just use F12 or:
    document.addEventListener("keydown", (e) => {
      if (e.key === "F12") {
        // Tauri in dev mode should respond to F12
      }
    });
  }, []);
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TeleprompterText
        isPlaying={isPlaying}
        fontSize={fontSize[0]}
        scrollSpeed={scrollSpeed[0]}
        textContent={textContent}
        onEnd={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default PopoutView;
