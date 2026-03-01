import { emit, listen } from "@tauri-apps/api/event";

export interface TeleprompterState {
  isPlaying: boolean;
  fontSize: number;
  scrollSpeed: number;
  textContent: string;
}

export const emitState = (state: TeleprompterState) =>
  emit("teleprompter:state", state);

export const listenState = (cb: (state: TeleprompterState) => void) =>
  listen<TeleprompterState>("teleprompter:state", (e) => cb(e.payload));
