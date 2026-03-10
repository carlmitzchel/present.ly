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
  syncState: (state: RemoteTeleprompterState) => void;
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

  syncState: (state) => set({
    ...state,
    fontSize: [state.fontSize],
    scrollSpeed: [state.scrollSpeed],
  }),
}));

export const sendStateRequest = () => {
    requestState();
};
