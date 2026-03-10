import {
  emitState,
  listenState,
  listenStateRequest,
  requestState,
  TeleprompterState,
} from "@/lib/teleprompterEvents";
import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";

export const useTeleprompterState = (role: "main" | "popout") => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState([32]);
  const [scrollSpeed, setScrollSpeed] = useState([3]);
  const [textContent, setTextContent] = useState("Initial sample text...");
  const [isFlippedHorizontal, setIsFlippedHorizontal] = useState(false);
  const [isFlippedVertical, setIsFlippedVertical] = useState(false);
  const [textAlign, setTextAlign] = useState<"center" | "justify">("center");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const isMounted = useRef(true);

  // Collect latest state in a ref so the request listener always has it
  const stateRef = useRef({ isPlaying, fontSize: fontSize[0], scrollSpeed: scrollSpeed[0], textContent, isFlippedHorizontal, isFlippedVertical, textAlign, isFocusMode });
  useEffect(() => {
    stateRef.current = { isPlaying, fontSize: fontSize[0], scrollSpeed: scrollSpeed[0], textContent, isFlippedHorizontal, isFlippedVertical, textAlign, isFocusMode };
  }, [isPlaying, fontSize, scrollSpeed, textContent, isFlippedHorizontal, isFlippedVertical, textAlign, isFocusMode]);

  // Main: emit on state change
  useEffect(() => {
    if (role !== "main") return;
    emitState(stateRef.current);
  }, [isPlaying, fontSize, scrollSpeed, textContent, isFlippedHorizontal, isFlippedVertical, textAlign, isFocusMode, role]);

  // Main: respond to popout's request by re-emitting current state
  useEffect(() => {
    if (role !== "main") return;
    const unlisten = listenStateRequest(() => {
      emitState(stateRef.current);
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [role]);

  // Main: Listen to Remote App Commands via Tauri Events
  useEffect(() => {
    if (role !== "main") return;
    
    const unlistenPlayPause = listen("remote-play_pause", () => {
      setIsPlaying((prev) => !prev);
    });
    const unlistenSpeedUp = listen("remote-speed_up", () => {
      setScrollSpeed((prev) => [Math.min(prev[0] + 1, 20)]);
    });
    const unlistenSpeedDown = listen("remote-speed_down", () => {
      setScrollSpeed((prev) => [Math.max(prev[0] - 1, 1)]);
    });
    const unlistenFontUp = listen("remote-font_up", () => {
      setFontSize((prev) => [Math.min(prev[0] + 4, 120)]);
    });
    const unlistenFontDown = listen("remote-font_down", () => {
      setFontSize((prev) => [Math.max(prev[0] - 4, 16)]);
    });
    const unlistenScrollUp = listen("remote-scroll_up", () => {
      const container = document.getElementById("teleprompter-scroll-container");
      if (container) {
        container.scrollBy({ top: -100, behavior: "smooth" });
      }
    });
    const unlistenScrollDown = listen("remote-scroll_down", () => {
      const container = document.getElementById("teleprompter-scroll-container");
      if (container) {
        container.scrollBy({ top: 100, behavior: "smooth" });
      }
    });

    return () => {
      unlistenPlayPause.then((f) => f());
      unlistenSpeedUp.then((f) => f());
      unlistenSpeedDown.then((f) => f());
      unlistenFontUp.then((f) => f());
      unlistenFontDown.then((f) => f());
      unlistenScrollUp.then((f) => f());
      unlistenScrollDown.then((f) => f());
    };
  }, [role]);

  // Popout & Main: listen for state updates to keep in sync
  useEffect(() => {
    isMounted.current = true;

    const unlisten = listenState((state: TeleprompterState) => {
      if (!isMounted.current) return;
      setIsPlaying(state.isPlaying);
      setFontSize([state.fontSize]);
      setScrollSpeed([state.scrollSpeed]);
      setTextContent(state.textContent);
      setIsFlippedHorizontal(state.isFlippedHorizontal);
      setIsFlippedVertical(state.isFlippedVertical);
      setTextAlign(state.textAlign || "center");
      setIsFocusMode(state.isFocusMode || false);
    });

    if (role === "popout") {
      requestState();
    }

    return () => {
      isMounted.current = false;
      unlisten.then((fn) => fn());
    };
  }, [role]);

  return { 
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
    setIsFocusMode
  };
};