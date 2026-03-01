import { useEffect, useRef, useState } from "react";
import {
  emitState,
  listenState,
  TeleprompterState,
} from "@/lib/teleprompterEvents";

export const useTeleprompterState = (role: "main" | "popout") => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState([32]);
  const [scrollSpeed, setScrollSpeed] = useState([3]);
  const [textContent, setTextContent] = useState("Initial sample text...");
  const isMounted = useRef(true);

  // Main window: emit on every state change
  useEffect(() => {
    if (role !== "main") return;
    emitState({
      isPlaying,
      fontSize: fontSize[0],
      scrollSpeed: scrollSpeed[0],
      textContent,
    });
  }, [isPlaying, fontSize, scrollSpeed, textContent, role]);

  // Popout window: listen and mirror state
  useEffect(() => {
    if (role !== "popout") return;
    const unlisten = listenState((state: TeleprompterState) => {
      if (!isMounted.current) return;
      setIsPlaying(state.isPlaying);
      setFontSize([state.fontSize]);
      setScrollSpeed([state.scrollSpeed]);
      setTextContent(state.textContent);
    });
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
  };
};
