import { useEffect, useRef } from "react";
import { useTeleprompterStore } from "@/features/teleprompter/store/teleprompterStore";

const LINE_HEIGHT = 1;
const LINES_PER_SECOND_AT_1X = 1;
const MAX_DELTA_MS = 80;

interface Props {
  isPlaying: boolean;
  fontSize: number;
  scrollSpeed: number;
  textContent: string;
  isFlippedHorizontal: boolean;
  isFlippedVertical: boolean;
  textAlign: "center" | "justify";
  isFocusMode: boolean;
  onEnd: () => void;
}

const TeleprompterText = ({
  isPlaying,
  fontSize,
  scrollSpeed,
  textContent,
  isFlippedHorizontal,
  isFlippedVertical,
  textAlign,
  isFocusMode,
  onEnd,
}: Props) => {
  const lineHeight = useTeleprompterStore((s) => s.lineHeight[0]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimestampRef = useRef<number | null>(null);
  const animateRef = useRef<(timestamp: number) => void>(() => {});

  animateRef.current = (timestamp: number) => {
    if (lastTimestampRef.current !== null) {
      let delta = timestamp - lastTimestampRef.current;
      if (delta <= 0) {
        requestRef.current = requestAnimationFrame((ts) =>
          animateRef.current(ts),
        );
        return;
      }
      delta = Math.min(delta, MAX_DELTA_MS);

      const lineHeightPx = fontSize * LINE_HEIGHT;
      const pixelsPerSecond =
        scrollSpeed * lineHeightPx * LINES_PER_SECOND_AT_1X;
      const pixelsPerMs = pixelsPerSecond / 1000;

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += pixelsPerMs * delta;

        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          onEnd();
          lastTimestampRef.current = null;
          return;
        }
      }
    }

    lastTimestampRef.current = timestamp;
    requestRef.current = requestAnimationFrame((ts) => animateRef.current(ts));
  };

  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = null;
      requestRef.current = requestAnimationFrame((ts) =>
        animateRef.current(ts),
      );
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

  return (
    <div className="flex-1 min-h-0 relative overflow-hidden">
      <div
        id="teleprompter-scroll-container"
        ref={scrollContainerRef}
        className="h-full overflow-y-auto py-[40vh] px-6 custom-scrollbar"
      >
        <div className="max-w-4xl mx-auto relative">
          <p
            className={`text-foreground leading-relaxed whitespace-pre-line transition-all duration-200 ${textAlign === "center" ? "text-center" : "text-justify"}`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontWeight: 500,
              transform:
                `${isFlippedHorizontal ? "scaleX(-1)" : ""} ${isFlippedVertical ? "scaleY(-1)" : ""}`.trim() ||
                "none",
            }}
          >
            {textContent}
          </p>
        </div>
      </div>

      {isFocusMode && (
        <div
          className="absolute inset-x-0 bottom-0 h-[50vh] pointer-events-none z-20"
          style={{
            background:
              "linear-gradient(to bottom, transparent, hsl(var(--background) / 0.8) 50%, hsl(var(--background)) 90%)",
            backdropFilter: "blur(8px)",
            maskImage: "linear-gradient(to bottom, transparent, black 60%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 60%)",
          }}
        />
      )}
    </div>
  );
};

export default TeleprompterText;
