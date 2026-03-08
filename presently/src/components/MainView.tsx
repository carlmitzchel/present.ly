import NavBar from "@/components/NavBar";
import TeleprompterText from "@/components/TeleprompterText";
import { useTeleprompterState } from "@/hooks/useTeleprompterState";
import { useSpeechEstimation } from "@/hooks/useSpeechEstimation";
import { useSpeechElapsed } from "@/hooks/useSpeechElapsed";
import GeminiLoader from "@/components/GeminiLoader";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";
import {
  addRecentFile,
  getRecentFiles,
  RecentFile,
  setSetting,
  getSetting,
} from "@/lib/db";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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
    isFlippedHorizontal,
    setIsFlippedHorizontal,
    isFlippedVertical,
    setIsFlippedVertical,
    textAlign,
    setTextAlign,
    isFocusMode,
    setIsFocusMode,
  } = useTeleprompterState("main");

  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
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

  useEffect(() => {
    const initialize = async () => {
      await loadRecentFiles();
      await loadLastUsedState();
      setIsInitialLoad(false);
    };
    initialize();
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

      if (lastText) setTextContent(lastText);
      if (lastFontSize) setFontSize(lastFontSize);
      if (lastSpeed) setScrollSpeed(lastSpeed);
      if (lastFlippedHorizontal !== null)
        setIsFlippedHorizontal(lastFlippedHorizontal);
      if (lastFlippedVertical !== null)
        setIsFlippedVertical(lastFlippedVertical);
      if (lastFocusMode !== null) setIsFocusMode(lastFocusMode);
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
    const existing = await WebviewWindow.getByLabel("popout");
    if (existing) {
      await existing.show();
      await existing.setFocus();
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
  };

  const handleReset = () => {
    setIsPlaying(false);
    setResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === "r") {
        e.preventDefault();
        handleReset();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="h-screen flex flex-col bg-background animate-fade-in overflow-hidden">
      <GeminiLoader isLoading={isLoadingFile} />
      {/* Controls bar */}
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

      <TeleprompterText
        key={resetKey}
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

      {/* Status bar */}
      <div className="px-6 py-5 bg-status-bar border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* <span className="text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">142 </span>WPM
            </span> */}
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
          {/* <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Mode: <span className="text-foreground">Automatic Scroll</span>
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default MainView;
