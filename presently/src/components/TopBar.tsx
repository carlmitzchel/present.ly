import { Minus, Square, X } from "lucide-react";

const TopBar = () => {
  return (
    <div
      className="h-11 flex items-center justify-between px-4 bg-topbar border-b border-border select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          ReadFlow
        </span>
        <span className="text-[10px] font-medium text-muted-foreground ml-1 px-1.5 py-0.5 rounded bg-muted">
          BETA
        </span>
      </div>

      <div
        className="flex items-center gap-0.5"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Square className="w-3 h-3" />
        </button>
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
