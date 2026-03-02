import {
  Play,
  Pause,
  RotateCcw,
  File,
  ExternalLink,
  FlipHorizontal,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import TeleprompterText from "@/components/TeleprompterText";
import { useTeleprompterState } from "@/hooks/useTeleprompterState";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect } from "react";

const MainView = () => {
  const {
    isPlaying,
    setIsPlaying,
    fontSize,
    setFontSize,
    scrollSpeed,
    setScrollSpeed,
    textContent,
    setTextContent,
    isFlipped,
    setIsFlipped,
  } = useTeleprompterState("main");

  const handleLoadFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Text", extensions: ["txt", "md"] }],
      });
      if (selected) {
        const content = await readTextFile(selected as string);
        setTextContent(content);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  };

  const handlePopout = async () => {
    const existing = await WebviewWindow.getByLabel("popout");
    if (existing) {
      await existing.show();
      await existing.setFocus();
      return;
    }
    new WebviewWindow("popout", {
      url: "/popout",
      title: "presently",
      width: 800,
      height: 600,
      alwaysOnTop: true,
      skipTaskbar: false,
      decorations: false,
      resizable: true,
      focus: true,
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
  };

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
    <div className="h-screen flex flex-col bg-background animate-fade-in overflow-hidden">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 border-b border-border justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-muted-foreground w-16 shrink-0">
              Font Size
            </label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={18}
              max={128}
              step={2}
              className="w-36"
            />
            <span className="text-xs text-muted-foreground w-8">
              {fontSize[0]}px
            </span>
          </div>

          <div className="border-l border-border h-4" />

          <div className="flex items-center gap-3 flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-muted-foreground w-16 shrink-0">
              Speed
            </label>
            <Slider
              value={scrollSpeed}
              onValueChange={setScrollSpeed}
              min={1}
              max={10}
              step={1}
              disabled={isPlaying}
              className="w-36"
            />
            <span className="text-xs text-muted-foreground w-8">
              {scrollSpeed[0]}x
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            variant={isFlipped ? "default" : "outline"}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <FlipHorizontal className="w-4 h-4" />
            Flip
          </Button>
          <Button variant="outline" onClick={handleLoadFile}>
            <File className="w-4 h-4" />
            Load File
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handlePopout}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <TeleprompterText
        isPlaying={isPlaying}
        fontSize={fontSize[0]}
        scrollSpeed={scrollSpeed[0]}
        textContent={textContent}
        isFlipped={isFlipped}
        onEnd={() => setIsPlaying(false)}
      />

      {/* Status bar */}
      <div className="px-6 py-5 bg-status-bar border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">142</span> WPM
            </span>
            <span className="text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">00:00</span> elapsed
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Mode: <span className="text-foreground">Automatic Scroll</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MainView;
