import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { listenState, listenStateRequest, requestState, emitState, TeleprompterState } from "@/lib/teleprompterEvents";
import { useTeleprompterStore } from "../store/teleprompterStore";

export const useTeleprompterSync = (role: "main" | "popout") => {
  const isMounted = useRef(true);
  const syncState = useTeleprompterStore(state => state.syncState);
  const setIsPlaying = useTeleprompterStore(state => state.setIsPlaying);
  const setScrollSpeed = useTeleprompterStore(state => state.setScrollSpeed);
  const setFontSize = useTeleprompterStore(state => state.setFontSize);

  useEffect(() => {
    isMounted.current = true;

    const unlisten = listenState((state: TeleprompterState) => {
      if (!isMounted.current) return;
      syncState(state);
    });

    if (role === "popout") {
      requestState();
    }

    return () => {
      isMounted.current = false;
      unlisten.then((fn) => fn());
    };
  }, [role, syncState]);

  // Main: respond to popout's request by re-emitting current state
  useEffect(() => {
    if (role !== "main") return;
    const unlisten = listenStateRequest(() => {
        const storeState = useTeleprompterStore.getState();
        emitState({
          isPlaying: storeState.isPlaying,
          fontSize: storeState.fontSize[0],
          scrollSpeed: storeState.scrollSpeed[0],
          textContent: storeState.textContent,
          isFlippedHorizontal: storeState.isFlippedHorizontal,
          isFlippedVertical: storeState.isFlippedVertical,
          textAlign: storeState.textAlign,
          isFocusMode: storeState.isFocusMode,
          isHighContrast: storeState.isHighContrast,
          lineHeight: storeState.lineHeight[0],
          soundEffects: storeState.soundEffects,
        });
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [role]);

  // Main: Listen to Remote App Commands via Tauri Events
  useEffect(() => {
    if (role !== "main") return;
    
    const unlistenPlayPause = listen("remote-play_pause", () => {
      const isPlaying = useTeleprompterStore.getState().isPlaying;
      setIsPlaying(!isPlaying);
    });
    const unlistenSpeedUp = listen("remote-speed_up", () => {
      const speed = useTeleprompterStore.getState().scrollSpeed[0];
      setScrollSpeed([Math.min(speed + 1, 20)]);
    });
    const unlistenSpeedDown = listen("remote-speed_down", () => {
      const speed = useTeleprompterStore.getState().scrollSpeed[0];
      setScrollSpeed([Math.max(speed - 1, 1)]);
    });
    const unlistenFontUp = listen("remote-font_up", () => {
      const font = useTeleprompterStore.getState().fontSize[0];
      setFontSize([Math.min(font + 4, 120)]);
    });
    const unlistenFontDown = listen("remote-font_down", () => {
      const font = useTeleprompterStore.getState().fontSize[0];
      setFontSize([Math.max(font - 4, 16)]);
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
  }, [role, setIsPlaying, setScrollSpeed, setFontSize]);
};
