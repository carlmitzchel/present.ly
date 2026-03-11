import NavBar from "@/features/ui/components/NavBar";
import TeleprompterText from "@/features/teleprompter/components/TeleprompterText";
import { useTeleprompterStore } from "@/features/teleprompter/store/teleprompterStore";
import { useTeleprompterSync } from "@/features/teleprompter/hooks/useTeleprompterSync";
import { useSpeechEstimation } from "@/hooks/useSpeechEstimation";
import { useSpeechElapsed } from "@/hooks/useSpeechElapsed";
import GeminiLoader from "@/components/GeminiLoader";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import {
  addRecentFile,
  getRecentFiles,
  RecentFile,
  setSetting,
  getSetting,
} from "@/lib/db";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MainView = () => {
  const isPlaying = useTeleprompterStore((state) => state.isPlaying);
  const setIsPlaying = useTeleprompterStore((state) => state.setIsPlaying);
  const fontSize = useTeleprompterStore((state) => state.fontSize);
  const setFontSize = useTeleprompterStore((state) => state.setFontSize);
  const scrollSpeed = useTeleprompterStore((state) => state.scrollSpeed);
  const setScrollSpeed = useTeleprompterStore((state) => state.setScrollSpeed);
  const textContent = useTeleprompterStore((state) => state.textContent);
  const setTextContent = useTeleprompterStore((state) => state.setTextContent);
  const isFlippedHorizontal = useTeleprompterStore((state) => state.isFlippedHorizontal);
  const setIsFlippedHorizontal = useTeleprompterStore((state) => state.setIsFlippedHorizontal);
  const isFlippedVertical = useTeleprompterStore((state) => state.isFlippedVertical);
  const setIsFlippedVertical = useTeleprompterStore((state) => state.setIsFlippedVertical);
  const textAlign = useTeleprompterStore((state) => state.textAlign);
  const setTextAlign = useTeleprompterStore((state) => state.setTextAlign);
  const isFocusMode = useTeleprompterStore((state) => state.isFocusMode);
  const setIsFocusMode = useTeleprompterStore((state) => state.setIsFocusMode);
  const soundEffects = useTeleprompterStore((state) => state.soundEffects);
  const setIsHighContrast = useTeleprompterStore((state) => state.setIsHighContrast);
  const setLineHeight = useTeleprompterStore((state) => state.setLineHeight);
  const setSoundEffects = useTeleprompterStore((state) => state.setSoundEffects);

  useTeleprompterSync("main");

  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isPopoutActive, setIsPopoutActive] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const { estimateFormatted } = useSpeechEstimation(textContent);
  const { elapsedFormatted } = useSpeechElapsed(
    textContent,
    isPlaying,
    resetKey,
  );

  const startLoadingAnimation = () => {
    setIsLoadingFile(true);
    setTimeout(() => {
      setIsLoadingFile(false);
    }, 3000);
  };

  // Soft chime using Web Audio API — no asset files needed
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

  useEffect(() => {
    const initialize = async () => {
      await loadRecentFiles();
      await loadLastUsedState();
      setIsInitialLoad(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    const setupPopoutListener = async () => {
      const handleVisibility = (visible: boolean) => {
        setIsPopoutActive(visible);
      };

      const unlisten = await listen("popout-visibility", (event) => {
        handleVisibility(event.payload as boolean);
      });

      // Check initial state
      const popout = await WebviewWindow.getByLabel("popout");
      if (popout) {
        const visible = await popout.isVisible();
        handleVisibility(visible);
      }

      return unlisten;
    };

    let unlistenFn: (() => void) | undefined;
    setupPopoutListener().then((unlisten) => {
      unlistenFn = unlisten;
    });

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, []);

  const loadLastUsedState = async () => {
    try {
      const lastText = await getSetting<string>("last_text");
      const lastFontSize = await getSetting<number[]>("last_font_size");
      const lastSpeed = await getSetting<number[]>("last_speed");
      const lastFlippedHorizontal = await getSetting<boolean>(
        "last_flipped_horizontal",
      );
      const lastFlippedVertical = await getSetting<boolean>(
        "last_flipped_vertical",
      );
      const lastFocusMode = await getSetting<boolean>("last_focus_mode");
      const lastHighContrast = await getSetting<boolean>("setting_high_contrast");
      const lastLineHeight = await getSetting<number[]>("setting_line_height");
      const lastSoundEffects = await getSetting<boolean>("setting_sound_effects");

      if (lastText) setTextContent(lastText);
      if (lastFontSize) setFontSize(lastFontSize);
      if (lastSpeed) setScrollSpeed(lastSpeed);
      if (lastFlippedHorizontal !== null) setIsFlippedHorizontal(lastFlippedHorizontal);
      if (lastFlippedVertical !== null) setIsFlippedVertical(lastFlippedVertical);
      if (lastFocusMode !== null) setIsFocusMode(lastFocusMode);
      if (lastHighContrast !== null) {
        setIsHighContrast(lastHighContrast);
        if (lastHighContrast) document.documentElement.classList.add("high-contrast");
      }
      if (lastLineHeight) setLineHeight(lastLineHeight);
      if (lastSoundEffects !== null) setSoundEffects(lastSoundEffects);
    } catch (error) {}
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
    setSetting("last_flipped_horizontal", JSON.stringify(isFlippedHorizontal));
  }, [isFlippedHorizontal, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    setSetting("last_flipped_vertical", JSON.stringify(isFlippedVertical));
  }, [isFlippedVertical, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    setSetting("last_text_align", textAlign);
  }, [textAlign, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    setSetting("last_focus_mode", JSON.stringify(isFocusMode));
  }, [isFocusMode, isInitialLoad]);

  const loadRecentFiles = async () => {
    try {
      const files = await getRecentFiles(5);
      setRecentFiles(files);
    } catch (error) {}
  };

  const handleLoadFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Text", extensions: ["txt", "md"] }],
      });
      if (selected) {
        startLoadingAnimation();
        const path = selected as string;
        const filename = path.split("/").pop() || path;
        const content = await readTextFile(path);

        setTextContent(content);
        setIsPlaying(false);

        await addRecentFile(path, filename);
        await loadRecentFiles();
      }
    } catch (error) {}
  };

  const handleLoadRecent = async (path: string, filename: string) => {
    try {
      startLoadingAnimation();
      const content = await readTextFile(path);
      setTextContent(content);
      setIsPlaying(false);

      await addRecentFile(path, filename);
      await loadRecentFiles();
    } catch (error) {}
  };

  const handlePopout = async () => {
    setIsPlaying(false);
    const existing = await WebviewWindow.getByLabel("popout");
    if (existing) {
      await existing.show();
      await existing.setFocus();
      setIsPopoutActive(true);
      return;
    }
    new WebviewWindow("popout", {
      url: "/popout",
      title: "presently.",
      width: 800,
      height: 600,
      alwaysOnTop: true,
      skipTaskbar: false,
      decorations: false,
      resizable: true,
      focus: true,
    });
    setIsPopoutActive(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        const next = !isPlaying;
        playChime(next ? "play" : "stop");
        setIsPlaying(next);
      }
      if (e.key === "r") {
        e.preventDefault();
        handleReset();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, soundEffects]);

  return (
    <div className="h-screen flex flex-col bg-background animate-fade-in overflow-hidden relative">
      <GeminiLoader isLoading={isLoadingFile} />
      <NavBar
        fontSize={fontSize}
        setFontSize={setFontSize}
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        isFlippedHorizontal={isFlippedHorizontal}
        setIsFlippedHorizontal={setIsFlippedHorizontal}
        isFlippedVertical={isFlippedVertical}
        setIsFlippedVertical={setIsFlippedVertical}
        textAlign={textAlign}
        setTextAlign={setTextAlign}
        isFocusMode={isFocusMode}
        setIsFocusMode={setIsFocusMode}
        recentFiles={recentFiles}
        onLoadFile={handleLoadFile}
        onLoadRecent={handleLoadRecent}
        onReset={handleReset}
        onPopout={handlePopout}
      />

      <main className="flex-1 relative min-h-0 flex flex-col">
        <div
          className={`flex-1 flex flex-col min-h-0 transition-opacity duration-500 ${
            isPopoutActive ? "opacity-10" : "opacity-100"
          }`}
        >
          <TeleprompterText
            key={resetKey}
            isPlaying={isPlaying && !isPopoutActive}
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

        {isPopoutActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-accent/10 backdrop-blur-sm border border-accent/20 px-8 py-6 rounded-3xl shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                  Popout View Active
                </h2>
                <p className="text-muted-foreground font-medium">
                  Navbar controls and shortcuts remain functional
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer
        className={`px-6 py-5 bg-status-bar border-t border-border transition-opacity duration-500 shrink-0 ${
          isPopoutActive ? "opacity-20" : "opacity-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[11px]">
              <span className=" font-medium">{elapsedFormatted} </span>
              elapsed
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[11px] cursor-default">
                  <span className="font-medium">{estimateFormatted} </span>
                  estimate
                </span>
              </TooltipTrigger>
              <TooltipContent
                className="bg-background text-foreground border-border text-xs max-w-[260px]"
                side="right"
              >
                Averaged oral reading rate (183 wpm) — Brysbaert,{" "}
                <a
                  href="https://doi.org/10.1016/j.jml.2019.104047"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  JML 2019
                </a>
                .
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainView;
