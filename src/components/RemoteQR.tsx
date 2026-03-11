/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { invoke } from "@tauri-apps/api/core";
import { Smartphone, QrCode, Monitor, Wifi, Network } from "lucide-react";
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

interface RemoteInterface {
  name: String;
  url: string;
}

export function RemoteQR({  collapsed }: RemoteQRProps) {
  const [interfaces, setInterfaces] = useState<RemoteInterface[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUrls() {
      setIsLoading(true);
      try {
        const result = await invoke<RemoteInterface[]>("get_available_remotes");
        setInterfaces(result);
        if (result.length > 0) {
          setSelectedIndex(0);
        }
      } catch (e) {
        console.error("Failed to get remote URLs", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUrls();
  }, []);

  const currentRemote = interfaces[selectedIndex];

  const getInterfaceIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("wi-fi") || lowerName.includes("wlan"))
      return <Wifi className="w-4 h-4" />;
    if (lowerName.includes("ethernet") || lowerName.includes("lan"))
      return <Network className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

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
          {interfaces.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center px-4">
              {interfaces.map((iface, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${
                      selectedIndex === index
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                >
                  {getInterfaceIcon(iface.name.toString())}
                  {iface.name}
                </button>
              ))}
            </div>
          )}

          {!isLoading ? (
            currentRemote ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <QRCode
                    value={currentRemote.url}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div className="bg-muted px-4 py-2 rounded-lg text-sm font-mono text-center flex items-center justify-center w-full break-all max-w-xs mx-auto">
                  {currentRemote.url}
                </div>
              </>
            ) : (
              <div className="h-[220px] w-[220px] flex flex-col items-center justify-center border border-dashed rounded-xl text-muted-foreground text-center p-4">
                <p>No accessible network interfaces found.</p>
                <p className="text-[10px] mt-2">
                  Check if you're connected to a network.
                </p>
              </div>
            )
          ) : (
            <div className="h-[220px] w-[220px] flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
