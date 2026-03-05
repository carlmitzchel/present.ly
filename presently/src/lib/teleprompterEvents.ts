// teleprompterEvents.ts
import { emitTo, listen } from "@tauri-apps/api/event";

export interface TeleprompterState {
  isPlaying: boolean;
  fontSize: number;
  scrollSpeed: number;
  textContent: string;
  isFlippedHorizontal: boolean;
  isFlippedVertical: boolean;
}

export const emitState = (state: TeleprompterState) => {
  console.log("[emit] emitting state:", state);
  return emitTo("*", "teleprompter:state", state);
};

export const requestState = () => {
  console.log("[popout] sending state request");
  return emitTo("*", "teleprompter:request-state");
};


export const listenState = (cb: (state: TeleprompterState) => void) =>
  listen<TeleprompterState>("teleprompter:state", (e) => {
    console.log("[listen] received state:", e.payload);
    cb(e.payload);
  });

export const listenStateRequest = (cb: () => void) =>
  listen("teleprompter:request-state", () => {
    console.log("[main] received state request from popout");
    cb();
  });

  