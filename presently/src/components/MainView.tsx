import {
  Play,
  Pause,
  RotateCcw,
  File,
  ExternalLink,
  FlipHorizontal,
  ChevronDown,
  History,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import TeleprompterText from "@/components/TeleprompterText";
import { useTeleprompterState } from "@/hooks/useTeleprompterState";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addRecentFile,
  getRecentFiles,
  RecentFile,
  setSetting,
  getSetting,
} from "@/lib/db";
import { ModeToggle } from "@/components/ModeToggle";

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

  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      console.log("[MainView] Starting initialization...");
      await loadRecentFiles();
      await loadLastUsedState();
      setIsInitialLoad(false);
      console.log("[MainView] Initialization complete.");
    };
    initialize();
  }, []);

  const loadLastUsedState = async () => {
    try {
      console.log("[MainView] Loading last used state...");
      const lastText = await getSetting<string>("last_text");
      const lastFontSize = await getSetting<number[]>("last_font_size");
      const lastSpeed = await getSetting<number[]>("last_speed");
      const lastFlipped = await getSetting<boolean>("last_flipped");

      console.log("[MainView] Loaded values:", {
        hasText: !!lastText,
        fontSize: lastFontSize,
        speed: lastSpeed,
        flipped: lastFlipped,
      });

      if (lastText) setTextContent(lastText);
      if (lastFontSize) setFontSize(lastFontSize);
      if (lastSpeed) setScrollSpeed(lastSpeed);
      if (lastFlipped !== null) setIsFlipped(lastFlipped);
    } catch (error) {
      console.error("[MainView] Failed to load last used state:", error);
    }
  };

  // Persist state changes
  useEffect(() => {
    if (isInitialLoad) return;
    setSetting("last_text", textContent);
  }, [textContent, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    setSetting("last_font_size", JSON.stringify(fontSize));
  }, [fontSize, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    setSetting("last_speed", JSON.stringify(scrollSpeed));
  }, [scrollSpeed, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    setSetting("last_flipped", JSON.stringify(isFlipped));
  }, [isFlipped, isInitialLoad]);

  const loadRecentFiles = async () => {
    try {
      const files = await getRecentFiles(5);
      setRecentFiles(files);
    } catch (error) {
      console.error("Failed to load recent files:", error);
    }
  };

  const handleLoadFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Text", extensions: ["txt", "md"] }],
      });
      if (selected) {
        const path = selected as string;
        const filename = path.split("/").pop() || path;
        const content = await readTextFile(path);

        setTextContent(content);
        setIsPlaying(false);

        await addRecentFile(path, filename);
        await loadRecentFiles();
      }
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  };

  const handleLoadRecent = async (path: string, filename: string) => {
    try {
      console.log(`[MainView] Attempting to load recent file: ${path}`);
      const content = await readTextFile(path);
      console.log("[MainView] File content loaded successfully");
      setTextContent(content);
      setIsPlaying(false);

      await addRecentFile(path, filename);
      await loadRecentFiles();
    } catch (error) {
      console.error("[MainView] Failed to load recent file:", error);
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
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant={isPlaying ? "destructive" : "outline"}
          >
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <File className="w-4 h-4" />
                Load File
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onSelect={handleLoadFile} className="gap-2">
                <File className="w-4 h-4" />
                Open File...
              </DropdownMenuItem>

              {recentFiles.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Recent Files
                  </div>
                  {recentFiles.map((file) => (
                    <DropdownMenuItem
                      key={file.path}
                      onSelect={() =>
                        handleLoadRecent(file.path, file.filename)
                      }
                      className="text-xs truncate max-w-[180px]"
                    >
                      {file.filename}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handlePopout}>
            <ExternalLink className="w-4 h-4" />
          </Button>
          <ModeToggle />
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
          {/* <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Mode: <span className="text-foreground">Automatic Scroll</span>
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default MainView;
