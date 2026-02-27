import { Monitor, Type, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const SettingsView = () => {
  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-1">Settings</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Configure your ReadFlow experience
      </p>

      <div className="max-w-xl space-y-6">
        {/* Display */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3 mb-5">
            <Monitor className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Display</h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Mirror text</p>
                <p className="text-xs text-muted-foreground">
                  Flip text horizontally for physical teleprompters
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">High contrast mode</p>
                <p className="text-xs text-muted-foreground">
                  Increase text contrast for readability
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3 mb-5">
            <Type className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Typography
            </h3>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-foreground">Default font size</p>
                <span className="text-xs text-muted-foreground">32px</span>
              </div>
              <Slider defaultValue={[32]} min={16} max={64} step={2} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-foreground">Line height</p>
                <span className="text-xs text-muted-foreground">1.7</span>
              </div>
              <Slider defaultValue={[17]} min={12} max={24} step={1} />
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3 mb-5">
            <Volume2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Audio</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Sound effects</p>
              <p className="text-xs text-muted-foreground">
                Play sounds for start/stop events
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
