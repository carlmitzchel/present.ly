import {
  emitState,
  listenState,
  listenStateRequest,
  requestState,
  TeleprompterState,
} from "@/lib/teleprompterEvents";
import { useEffect, useRef, useState } from "react";

export const useTeleprompterState = (role: "main" | "popout") => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState([32]);
  const [scrollSpeed, setScrollSpeed] = useState([3]);
  const [textContent, setTextContent] = useState("Initial sample text...");
  const [isFlipped, setIsFlipped] = useState(false);
  const isMounted = useRef(true);

  // Collect latest state in a ref so the request listener always has it
  const stateRef = useRef({ isPlaying, fontSize: fontSize[0], scrollSpeed: scrollSpeed[0], textContent, isFlipped });
  useEffect(() => {
    stateRef.current = { isPlaying, fontSize: fontSize[0], scrollSpeed: scrollSpeed[0], textContent, isFlipped };
  }, [isPlaying, fontSize, scrollSpeed, textContent, isFlipped]);

  // Main: emit on state change
  useEffect(() => {
    if (role !== "main") return;
    emitState(stateRef.current);
  }, [isPlaying, fontSize, scrollSpeed, textContent, isFlipped, role]);

  // Main: respond to popout's request by re-emitting current state
  useEffect(() => {
    if (role !== "main") return;
    const unlisten = listenStateRequest(() => {
      emitState(stateRef.current);
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [role]);

  // Popout: listen for state updates
  useEffect(() => {
    if (role !== "popout") return;
    
    isMounted.current = true; // 👈 reset on each effect run

    const unlisten = listenState((state: TeleprompterState) => {
      if (!isMounted.current) return;
      setIsPlaying(state.isPlaying);
      setFontSize([state.fontSize]);
      setScrollSpeed([state.scrollSpeed]);
      setTextContent(state.textContent);
      setIsFlipped(state.isFlipped);
    });

    requestState();

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
    isFlipped,
    setIsFlipped
  };
};