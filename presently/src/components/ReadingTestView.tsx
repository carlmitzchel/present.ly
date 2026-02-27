import { Camera, Play } from "lucide-react";

const essayText = `In the age of information overload, the ability to read quickly and comprehend deeply has become an essential skill. Speed reading is not merely about moving your eyes faster across a page—it's about training your brain to process information more efficiently.

Research has shown that the average adult reads at approximately 200-250 words per minute, with a comprehension rate of around 60%. However, with practice and proper technique, it's possible to double or even triple your reading speed while maintaining or improving comprehension.

Key techniques include minimizing subvocalization (the habit of silently pronouncing words as you read), expanding your peripheral vision to take in more words at a glance, and using a pointer or guide to maintain a steady pace. These methods work by reducing the number of fixation points your eyes make per line of text.

Perhaps most importantly, effective reading requires active engagement with the material. This means asking questions, making predictions, and connecting new information to existing knowledge. Passive reading, no matter how fast, rarely leads to deep understanding or long-term retention.`;

const ReadingTestView = () => {
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div className="flex-1 flex gap-4 p-6">
        {/* Essay panel */}
        <div className="flex-1 rounded-xl bg-card border border-border p-6 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Reading Passage
            </h3>
            <p className="text-xs text-muted-foreground">
              Read the following text at your natural pace
            </p>
          </div>
          <div className="text-sm text-secondary-foreground leading-7 whitespace-pre-line">
            {essayText}
          </div>
        </div>

        {/* Camera panel */}
        <div className="w-80 rounded-xl bg-card border border-border flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Camera className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Camera Preview
          </p>
          <p className="text-xs text-muted-foreground text-center px-6">
            Your webcam feed will appear here during the reading test
          </p>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <div className="max-w-md">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This test will analyze your{" "}
            <span className="text-foreground">reading speed</span>,{" "}
            <span className="text-foreground">eye movement patterns</span>, and{" "}
            <span className="text-foreground">comprehension level</span> using
            your camera.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-glow">
          <Play className="w-4 h-4" />
          Start Test
        </button>
      </div>
    </div>
  );
};

export default ReadingTestView;
