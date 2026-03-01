import TeleprompterText from "@/components/TeleprompterText";
import { useTeleprompterState } from "@/hooks/useTeleprompterState";

const PopoutView = () => {
  const { isPlaying, setIsPlaying, fontSize, scrollSpeed, textContent } =
    useTeleprompterState("popout");

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
