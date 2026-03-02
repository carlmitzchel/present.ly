import { useEffect, useRef } from "react";

const LINE_HEIGHT = 1;
const LINES_PER_SECOND_AT_1X = 1;
const MAX_DELTA_MS = 80;

interface Props {
  isPlaying: boolean;
  fontSize: number;
  scrollSpeed: number;
  textContent: string;
  onEnd: () => void;
}

const TeleprompterText = ({
  isPlaying,
  fontSize,
  scrollSpeed,
  textContent,
  onEnd,
}: Props) => {
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
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto min-h-0 py-[40vh] px-6 custom-scrollbar"
    >
      <div className="max-w-4xl mx-auto">
        <p
          className="text-foreground leading-relaxed whitespace-pre-line text-center transition-all duration-200"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {textContent}
        </p>
      </div>
    </div>
  );
};

export default TeleprompterText;
