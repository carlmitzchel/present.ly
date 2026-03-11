import { create } from "zustand";
import { emitState, requestState, TeleprompterState as RemoteTeleprompterState } from "@/lib/teleprompterEvents";

export interface TeleprompterState {
  isPlaying: boolean;
  fontSize: number[];
  scrollSpeed: number[];
  textContent: string;
  isFlippedHorizontal: boolean;
  isFlippedVertical: boolean;
  textAlign: "center" | "justify";
  isFocusMode: boolean;
  isHighContrast: boolean;
  lineHeight: number[];
  soundEffects: boolean;
  // Recorder settings
  cameraDeviceId: string;
  cameraFlipped: boolean;
  recordingSavePath: string;
  recorderMimeType: string;
}

interface TeleprompterStore extends TeleprompterState {
  setIsPlaying: (playing: boolean) => void;
  setFontSize: (size: number[]) => void;
  setScrollSpeed: (speed: number[]) => void;
  setTextContent: (content: string) => void;
  setIsFlippedHorizontal: (flipped: boolean) => void;
  setIsFlippedVertical: (flipped: boolean) => void;
  setTextAlign: (align: "center" | "justify") => void;
  setIsFocusMode: (focus: boolean) => void;
  setIsHighContrast: (highContrast: boolean) => void;
  setLineHeight: (height: number[]) => void;
  setSoundEffects: (enabled: boolean) => void;
  syncState: (state: RemoteTeleprompterState) => void;
  // Recorder actions
  setCameraDeviceId: (id: string) => void;
  setCameraFlipped: (flipped: boolean) => void;
  setRecordingSavePath: (path: string) => void;
  setRecorderMimeType: (mime: string) => void;
}

const initialState: TeleprompterState = {
  isPlaying: false,
  fontSize: [32],
  scrollSpeed: [3],
  textContent: "Initial sample text...",
  isFlippedHorizontal: false,
  isFlippedVertical: false,
  textAlign: "center",
  isFocusMode: false,
  isHighContrast: false,
  lineHeight: [1.5],
  soundEffects: true,
  // Recorder defaults
  cameraDeviceId: "",
  cameraFlipped: false,
  recordingSavePath: "",
  recorderMimeType: "video/webm;codecs=vp9,opus",
};

const mapToRemote = (state: TeleprompterState): RemoteTeleprompterState => ({
  isPlaying: state.isPlaying,
  fontSize: state.fontSize[0],
  scrollSpeed: state.scrollSpeed[0],
  textContent: state.textContent,
  isFlippedHorizontal: state.isFlippedHorizontal,
  isFlippedVertical: state.isFlippedVertical,
  textAlign: state.textAlign,
  isFocusMode: state.isFocusMode,
  isHighContrast: state.isHighContrast,
  lineHeight: state.lineHeight[0],
  soundEffects: state.soundEffects,
});

export const useTeleprompterStore = create<TeleprompterStore>((set, get) => ({
  ...initialState,

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
    emitState(mapToRemote(get()));
  },
  setFontSize: (size) => {
    set({ fontSize: size });
    emitState(mapToRemote(get()));
  },
  setScrollSpeed: (speed) => {
    set({ scrollSpeed: speed });
    emitState(mapToRemote(get()));
  },
  setTextContent: (content) => {
    set({ textContent: content });
    emitState(mapToRemote(get()));
  },
  setIsFlippedHorizontal: (flipped) => {
    set({ isFlippedHorizontal: flipped });
    emitState(mapToRemote(get()));
  },
  setIsFlippedVertical: (flipped) => {
    set({ isFlippedVertical: flipped });
    emitState(mapToRemote(get()));
  },
  setTextAlign: (align) => {
    set({ textAlign: align });
    emitState(mapToRemote(get()));
  },
  setIsFocusMode: (focus) => {
    set({ isFocusMode: focus });
    emitState(mapToRemote(get()));
  },
  setIsHighContrast: (highContrast) => {
    set({ isHighContrast: highContrast });
    emitState(mapToRemote(get()));
  },
  setLineHeight: (height) => {
    set({ lineHeight: height });
    emitState(mapToRemote(get()));
  },
  setSoundEffects: (enabled) => {
    set({ soundEffects: enabled });
    emitState(mapToRemote(get()));
  },

  // Recorder setters (no remote emit needed)
  setCameraDeviceId: (id) => set({ cameraDeviceId: id }),
  setCameraFlipped: (flipped) => set({ cameraFlipped: flipped }),
  setRecordingSavePath: (path) => set({ recordingSavePath: path }),
  setRecorderMimeType: (mime) => set({ recorderMimeType: mime }),

  syncState: (state) => set({
    ...state,
    fontSize: [state.fontSize],
    scrollSpeed: [state.scrollSpeed],
    lineHeight: [state.lineHeight],
  }),
}));

export const sendStateRequest = () => {
    requestState();
};
