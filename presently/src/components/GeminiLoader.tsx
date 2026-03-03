import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeminiLoaderProps {
  isLoading: boolean;
  onFinish?: () => void;
  loadingText?: string;
}

const GeminiLoader = ({
  isLoading,
  onFinish,
  loadingText = "Analyzing script...",
}: GeminiLoaderProps) => {
  const [show, setShow] = useState(isLoading);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setPop(false);
    } else {
      if (show) {
        setPop(true);
        const timer = setTimeout(() => {
          setShow(false);
          setPop(false);
          if (onFinish) onFinish();
        }, 500); // Wait for pop animation to finish
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, show, onFinish]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        className={cn(
          "flex flex-col items-center justify-center transition-all duration-500",
          pop ? "scale-150 opacity-0" : "scale-100 opacity-100",
          isLoading && "animate-pulse",
        )}
      >
        <div className="relative flex items-center justify-center w-24 h-24">
          <Sparkles
            className={cn(
              "w-16 h-16 text-blue-500",
              isLoading ? "animate-spin" : "",
            )}
            style={{ animationDuration: "3s" }}
          />
          {/* Add a generic gradient gemini-like star behind/above */}
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-tr from-blue-600 to-purple-500 rounded-full mix-blend-multiply blur-xl opacity-50",
              isLoading ? "animate-pulse" : "",
            )}
          />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground tracking-widest uppercase">
          {loadingText}
        </p>
      </div>
    </div>
  );
};

export default GeminiLoader;
