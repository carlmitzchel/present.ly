import { useEffect, useState } from "react";

export const useSpeechElapsed = (textContent: string, isPlaying: boolean, resetKey: number = 0) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
  }, [textContent, resetKey]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const elapsedFormatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return { elapsedFormatted, elapsed };
};