import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { invoke } from "@tauri-apps/api/core";
import { Smartphone, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RemoteQRProps {
  children?: React.ReactNode;
  collapsed?: boolean;
}

export function RemoteQR({ children, collapsed }: RemoteQRProps) {
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUrl() {
      try {
        const url = await invoke<string>("get_remote_url");
        setRemoteUrl(url);
      } catch (e) {
        console.error("Failed to get remote URL", e);
      }
    }
    fetchUrl();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150
      text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
      ${collapsed ? "justify-center" : ""}`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Remote Control</span>}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Mobile Remote Control
          </DialogTitle>
          <DialogDescription className="text-center">
            Scan this QR code with your phone to control presently remotely.
            Both devices must be on the same local network.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-6 py-6 w-full">
          {remoteUrl ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <QRCode
                value={remoteUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          ) : (
            <div className="h-[220px] w-[220px] flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
              Loading...
            </div>
          )}
          {remoteUrl && (
            <div className="bg-muted px-4 py-2 rounded-lg text-sm font-mono text-center flex items-center justify-center w-full break-all">
              {remoteUrl}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
