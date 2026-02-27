import { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`; // shortened for brevity

const TeleprompterView = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState([32]);
  const [scrollSpeed, setScrollSpeed] = useState([3]);

  return (
    /* h-screen and overflow-hidden ensures the app itself doesn't scroll, only the text area does */
    <div className="h-screen flex flex-col bg-background animate-fade-in overflow-hidden">
      {/* Controls bar (Fixed at top) */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground w-16 flex-shrink-0">
            Font Size
          </label>
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            min={18}
            max={56}
            step={2}
            className="w-36"
          />
          <span className="text-xs text-muted-foreground w-8">
            {fontSize[0]}px
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground w-16 flex-shrink-0">
            Speed
          </label>
          <Slider
            value={scrollSpeed}
            onValueChange={setScrollSpeed}
            min={1}
            max={10}
            step={1}
            className="w-36"
          />
          <span className="text-xs text-muted-foreground w-8">
            {scrollSpeed[0]}x
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-glow"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Text display area 
          'flex-1' takes up remaining space.
          'min-h-0' is the magic CSS that allows overflow-y to work inside a flex container.
      */}
      <div className="flex-1 overflow-y-auto min-h-0 py-20 px-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-foreground leading-relaxed whitespace-pre-line text-center transition-all duration-200"
            style={{
              fontSize: `${fontSize[0]}px`,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {sampleText}
          </p>
        </div>
      </div>

      {/* Status bar (Fixed at bottom) */}
      <div className="px-6 py-5 bg-status-bar border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">142</span> WPM
            </span>
            <span className="text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">00:00</span> elapsed
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Mode: <span className="text-foreground">Automatic Scroll</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeleprompterView;
