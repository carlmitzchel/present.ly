import {
  Play,
  Pause,
  RotateCcw,
  File,
  ExternalLink,
  FlipHorizontal,
  ChevronDown,
  History,
  FlipVertical,
  AlignCenter,
  AlignJustify,
  Eye,
  EyeOff,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecentFile } from "@/lib/db";

interface NavBarProps {
  fontSize: number[];
  setFontSize: (v: number[]) => void;
  scrollSpeed: number[];
  setScrollSpeed: (v: number[]) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  isFlippedHorizontal: boolean;
  setIsFlippedHorizontal: (v: boolean) => void;
  isFlippedVertical: boolean;
  setIsFlippedVertical: (v: boolean) => void;
  textAlign: "center" | "justify";
  setTextAlign: (v: "center" | "justify") => void;
  recentFiles: RecentFile[];
  onLoadFile: () => void;
  onLoadRecent: (path: string, filename: string) => void;
  onReset: () => void;
  onPopout: () => void;
  isFocusMode: boolean;
  setIsFocusMode: (v: boolean) => void;
  hidePopout?: boolean;
}

const NavBar = ({
  fontSize,
  setFontSize,
  scrollSpeed,
  setScrollSpeed,
  isPlaying,
  setIsPlaying,
  isFlippedHorizontal,
  setIsFlippedHorizontal,
  isFlippedVertical,
  setIsFlippedVertical,
  textAlign,
  setTextAlign,
  recentFiles,
  onLoadFile,
  onLoadRecent,
  onReset,
  onPopout,
  isFocusMode,
  setIsFocusMode,
  hidePopout,
}: NavBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 border-b border-border justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground w-fit shrink-0">
            Font Size
          </label>
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            min={18}
            max={128}
            step={2}
            className="w-32"
          />
          <span className="text-xs text-muted-foreground w-8">
            {fontSize[0]}px
          </span>
        </div>

        <div className="border-l border-border h-4" />

        <div className="flex items-center gap-4 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground w-fit shrink-0">
            Speed
          </label>
          <Slider
            value={scrollSpeed}
            onValueChange={setScrollSpeed}
            min={1}
            max={10}
            step={1}
            disabled={isPlaying}
            className="w-32"
          />
          <span className="text-xs text-muted-foreground w-8">
            {scrollSpeed[0]}x
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          variant={isPlaying ? "destructive" : "outline"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <File className="w-4 h-4" />
              Load File
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onSelect={onLoadFile} className="gap-2">
              <File className="w-4 h-4" />
              Open File...
            </DropdownMenuItem>

            {recentFiles.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <History className="w-3 h-3" />
                  Recent Files
                </div>
                {recentFiles.map((file) => (
                  <DropdownMenuItem
                    key={file.path}
                    onSelect={() => onLoadRecent(file.path, file.filename)}
                    className="text-xs truncate max-w-[180px]"
                  >
                    {file.filename.split(/[\\/]/).pop()}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={isFlippedHorizontal ? "default" : "outline"}
          onClick={() => setIsFlippedHorizontal(!isFlippedHorizontal)}
        >
          <FlipHorizontal className="w-4 h-4" />
        </Button>
        <Button
          variant={isFlippedVertical ? "default" : "outline"}
          onClick={() => setIsFlippedVertical(!isFlippedVertical)}
        >
          <FlipVertical className="w-4 h-4" />
        </Button>
        <Button
          variant={textAlign === "justify" ? "default" : "outline"}
          onClick={() =>
            setTextAlign(textAlign === "center" ? "justify" : "center")
          }
          title={
            textAlign === "center"
              ? "Switch to Justified text"
              : "Switch to Centered text"
          }
        >
          {textAlign === "center" ? (
            <AlignJustify className="w-4 h-4" />
          ) : (
            <AlignCenter className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant={isFocusMode ? "default" : "outline"}
          onClick={() => setIsFocusMode(!isFocusMode)}
          title={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
        >
          {isFocusMode ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </Button>

        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        {!hidePopout && (
          <Button variant="outline" onClick={onPopout}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
