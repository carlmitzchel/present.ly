import { useMemo } from 'react';

export const useSpeechEstimation = (text: string, wpm: number = 183) => {
  return useMemo(() => {
    if (!text || text.trim() === '') {
      return { estimateFormatted: "00:00", estimateSeconds: 0, wordCount: 0 };
    }
    const wordCount = text.trim().split(/\s+/).length;
    const estimateSeconds = Math.ceil((wordCount / wpm) * 60);

    const minutes = Math.floor(estimateSeconds / 60);
    const seconds = estimateSeconds % 60;
    const estimateFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return { estimateFormatted, estimateSeconds, wordCount };
  }, [text, wpm]);
};
