import { Monitor, Type, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/ModeToggle";
import { useTeleprompterStore } from "@/features/teleprompter/store/teleprompterStore";
import { useEffect } from "react";
import { getSetting, setSetting } from "@/lib/db";

const SettingsView = () => {
  const isHighContrast = useTeleprompterStore((s) => s.isHighContrast);
  const setIsHighContrast = useTeleprompterStore((s) => s.setIsHighContrast);
  const fontSize = useTeleprompterStore((s) => s.fontSize);
  const setFontSize = useTeleprompterStore((s) => s.setFontSize);
  const lineHeight = useTeleprompterStore((s) => s.lineHeight);
  const setLineHeight = useTeleprompterStore((s) => s.setLineHeight);
  const soundEffects = useTeleprompterStore((s) => s.soundEffects);
  const setSoundEffects = useTeleprompterStore((s) => s.setSoundEffects);

  // Load persisted settings
  useEffect(() => {
    const load = async () => {
      const hc = await getSetting<boolean>("setting_high_contrast");
      if (hc !== null) setIsHighContrast(hc);
      const lh = await getSetting<number[]>("setting_line_height");
      if (lh) setLineHeight(lh);
      const sfx = await getSetting<boolean>("setting_sound_effects");
      if (sfx !== null) setSoundEffects(sfx);
    };
    load();
  }, []);

  // Apply / remove high-contrast class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    setSetting("setting_high_contrast", JSON.stringify(isHighContrast));
  }, [isHighContrast]);

  // Persist line height
  useEffect(() => {
    setSetting("setting_line_height", JSON.stringify(lineHeight));
  }, [lineHeight]);

  // Persist sound effects preference
  useEffect(() => {
    setSetting("setting_sound_effects", JSON.stringify(soundEffects));
  }, [soundEffects]);

  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-1">Settings</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Configure your presently. experience
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
                <p className="text-sm text-foreground">Dark / Light mode</p>
                <p className="text-xs text-muted-foreground">
                  Switch between dark and light theme
                </p>
              </div>
              <ModeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">High contrast</p>
                <p className="text-xs text-muted-foreground">
                  Increase text contrast for readability
                </p>
              </div>
              <Switch
                id="high-contrast-switch"
                checked={isHighContrast}
                onCheckedChange={setIsHighContrast}
              />
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
                <span className="text-xs text-muted-foreground font-medium">
                  {fontSize[0]}px
                </span>
              </div>
              <Slider
                id="font-size-slider"
                value={fontSize}
                onValueChange={setFontSize}
                min={18}
                max={128}
                step={2}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-foreground">Line height</p>
                <span className="text-xs text-muted-foreground font-medium">
                  {lineHeight[0].toFixed(1)}
                </span>
              </div>
              <Slider
                id="line-height-slider"
                value={lineHeight}
                onValueChange={setLineHeight}
                min={1.0}
                max={3.0}
                step={0.1}
              />
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
                Play a soft chime on play and stop
              </p>
            </div>
            <Switch
              id="sound-effects-switch"
              checked={soundEffects}
              onCheckedChange={setSoundEffects}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
