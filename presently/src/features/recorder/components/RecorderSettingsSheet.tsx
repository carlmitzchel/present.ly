import { useEffect, useState } from "react";
import { useTeleprompterStore } from "@/features/teleprompter/store/teleprompterStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FolderOpen, Camera, RefreshCw } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPickSaveDir: () => void;
}

const RecorderSettingsSheet = ({ open, onOpenChange, onPickSaveDir }: Props) => {
  const cameraDeviceId = useTeleprompterStore((s) => s.cameraDeviceId);
  const setCameraDeviceId = useTeleprompterStore((s) => s.setCameraDeviceId);
  const cameraFlipped = useTeleprompterStore((s) => s.cameraFlipped);
  const setCameraFlipped = useTeleprompterStore((s) => s.setCameraFlipped);
  const recordingSavePath = useTeleprompterStore((s) => s.recordingSavePath);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  const loadCameras = async () => {
    try {
      // Request permission first so labels are populated
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
    } catch {}
  };

  useEffect(() => {
    if (open) loadCameras();
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 bg-card border-border">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <Camera className="w-4 h-4 text-primary" />
            Camera Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Camera device */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground">Camera</p>
              <button
                onClick={loadCameras}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh cameras"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <select
              value={cameraDeviceId}
              onChange={(e) => setCameraDeviceId(e.target.value)}
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Default camera</option>
              {cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1.5">
              Changing camera reloads the feed
            </p>
          </div>

          {/* Camera flip */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Mirror camera</p>
              <p className="text-xs text-muted-foreground">Flip image horizontally</p>
            </div>
            <Switch
              checked={cameraFlipped}
              onCheckedChange={setCameraFlipped}
            />
          </div>

          {/* Save path */}
          <div>
            <p className="text-sm text-foreground mb-2">Save recordings to</p>
            <div className="flex gap-2">
              <div className="flex-1 text-xs text-muted-foreground bg-background border border-border rounded-md px-3 py-2 truncate">
                {recordingSavePath || "Desktop (default)"}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onPickSaveDir}
                title="Choose folder"
                className="shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Recordings are saved as <code className="text-primary">.mp4</code> files where supported (defaults to highest quality webm).
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecorderSettingsSheet;
