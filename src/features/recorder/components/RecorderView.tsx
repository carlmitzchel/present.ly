import { useEffect, useRef, useState, useCallback } from "react";
import { useTeleprompterStore } from "@/features/teleprompter/store/teleprompterStore";
import TeleprompterText from "@/features/teleprompter/components/TeleprompterText";
import RecorderSettingsSheet from "@/features/recorder/components/RecorderSettingsSheet";
import NavBar from "@/features/ui/components/NavBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  Circle,
  Pause,
  Square,
  Play,
  RotateCcw,
  Settings2,
  Mic,
  MicOff,
} from "lucide-react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { writeFile, readTextFile } from "@tauri-apps/plugin-fs";
import { join, desktopDir } from "@tauri-apps/api/path";
import { addRecentFile, getRecentFiles, RecentFile, getSetting, setSetting } from "@/lib/db";
import { convertWebmToMp4 } from "@/lib/convertToMp4";

type RecordingState = "idle" | "recording" | "paused";

const RecorderView = () => {
  const isPlaying = useTeleprompterStore((s) => s.isPlaying);
  const setIsPlaying = useTeleprompterStore((s) => s.setIsPlaying);
  const fontSize = useTeleprompterStore((s) => s.fontSize);
  const setFontSize = useTeleprompterStore((s) => s.setFontSize);
  const scrollSpeed = useTeleprompterStore((s) => s.scrollSpeed);
  const setScrollSpeed = useTeleprompterStore((s) => s.setScrollSpeed);
  const textContent = useTeleprompterStore((s) => s.textContent);
  const setTextContent = useTeleprompterStore((s) => s.setTextContent);
  const isFlippedHorizontal = useTeleprompterStore((s) => s.isFlippedHorizontal);
  const setIsFlippedHorizontal = useTeleprompterStore((s) => s.setIsFlippedHorizontal);
  const isFlippedVertical = useTeleprompterStore((s) => s.isFlippedVertical);
  const setIsFlippedVertical = useTeleprompterStore((s) => s.setIsFlippedVertical);
  const textAlign = useTeleprompterStore((s) => s.textAlign);
  const setTextAlign = useTeleprompterStore((s) => s.setTextAlign);
  const isFocusMode = useTeleprompterStore((s) => s.isFocusMode);
  const setIsFocusMode = useTeleprompterStore((s) => s.setIsFocusMode);
  const soundEffects = useTeleprompterStore((s) => s.soundEffects);
  const cameraDeviceId = useTeleprompterStore((s) => s.cameraDeviceId);
  const cameraFlipped = useTeleprompterStore((s) => s.cameraFlipped);
  const recordingSavePath = useTeleprompterStore((s) => s.recordingSavePath);
  const recorderMimeType = useTeleprompterStore((s) => s.recorderMimeType);
  const setRecordingSavePath = useTeleprompterStore((s) => s.setRecordingSavePath);
  const setCameraDeviceId = useTeleprompterStore((s) => s.setCameraDeviceId);
  const setCameraFlipped = useTeleprompterStore((s) => s.setCameraFlipped);
  const setRecorderMimeType = useTeleprompterStore((s) => s.setRecorderMimeType);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [hasMic, setHasMic] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [actualResolution, setActualResolution] = useState("");
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  const elapsedRef = useRef(elapsed);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number>(0);

  // ── Load persisted recorder settings ────────────────────────────────────────
  const loadRecentFiles = async () => {
    try {
      const files = await getRecentFiles(5);
      setRecentFiles(files);
    } catch {}
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadRecentFiles();
        const devId = await getSetting<string>("recorder_device_id");
        const flipped = await getSetting<boolean>("recorder_flipped");
        const savePath = await getSetting<string>("recorder_save_path");
        if (devId) setCameraDeviceId(devId);
        if (flipped !== null) setCameraFlipped(flipped);
        if (savePath) setRecordingSavePath(savePath);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => { setSetting("recorder_device_id", JSON.stringify(cameraDeviceId)); }, [cameraDeviceId]);
  useEffect(() => { setSetting("recorder_flipped", JSON.stringify(cameraFlipped)); }, [cameraFlipped]);
  useEffect(() => { setSetting("recorder_save_path", JSON.stringify(recordingSavePath)); }, [recordingSavePath]);

  // ── Start camera ─────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: cameraDeviceId ? { exact: cameraDeviceId } : undefined,
          width: { ideal: 4096 }, // Target 4K if available
          height: { ideal: 2160 },
        },
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const vTrack = stream.getVideoTracks()[0];
      if (vTrack) {
        const settings = vTrack.getSettings();
        setActualResolution(`${settings.width}x${settings.height}`);
      }

      const audioTracks = stream.getAudioTracks();
      setHasMic(audioTracks.length > 0);

      // Audio level meter
      if (audioTracks.length > 0) {
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setAudioLevel(Math.min(avg / 80, 1));
          animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      setCameraError(err?.message ?? "Camera access denied");
    }
  }, [cameraDeviceId]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [startCamera]);

  // ── Recording timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingState === "idle") {
        elapsedRef.current = 0;
        setElapsed(0);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recordingState]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  // ── Recording controls ───────────────────────────────────────────────────────
  const handleStartRecord = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    
    // Determine the best mime type
    let mimeType = "video/webm;codecs=vp9,opus";
    const typesToTry = [
      "video/mp4;codecs=avc1,aac",
      "video/mp4;codecs=h264",
      "video/mp4",
      "video/webm;codecs=h264",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
    ];

    for (const t of typesToTry) {
      if (MediaRecorder.isTypeSupported(t)) {
        mimeType = t;
        break;
      }
    }
    
    setRecorderMimeType(mimeType);

    const mr = new MediaRecorder(streamRef.current, { mimeType });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = handleSaveRecording;
    mediaRecorderRef.current = mr;
    mr.start(100);
    setRecordingState("recording");
    toast.info("Recording started");
  };

  const handlePauseResume = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (recordingState === "recording") {
      mr.pause();
      setRecordingState("paused");
    } else if (recordingState === "paused") {
      mr.resume();
      setRecordingState("recording");
    }
  };

  const handleStopRecord = () => {
    mediaRecorderRef.current?.stop();
    setRecordingState("idle");
  };

const handleSaveRecording = async () => {
  const blob = new Blob(chunksRef.current, { type: recorderMimeType });
  const now = new Date();
  const baseName = `presently_${now.toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;
  let dir = recordingSavePath || (await desktopDir());

  const isMp4Native = recorderMimeType.includes("mp4");

  if (isMp4Native) {
    // Platform natively recorded MP4 — save directly
    const buffer = await blob.arrayBuffer();
    const fullPath = await join(dir, `${baseName}.mp4`);
    await writeFile(fullPath, new Uint8Array(buffer));
    toast.success("Video saved!", {
      description: `${baseName}.mp4 in ${dir}`,
      action: { label: "Show in folder", onClick: () => revealItemInDir(fullPath) },
    });
  } else {
    // WebM — remux to MP4 via FFmpeg sidecar
    const toastId = toast.loading("Converting to MP4…");
    try {
      const { outputPath, durationMs } = await convertWebmToMp4(
        blob,
        dir,
        baseName,
        (status) => toast.loading(status, { id: toastId })
      );
      toast.success("Video saved!", {
        id: toastId,
        description: `${baseName}.mp4 — converted in ${(durationMs / 1000).toFixed(1)}s`,
        action: { label: "Show in folder", onClick: () => revealItemInDir(outputPath) },
      });
    } catch (err) {
      console.error("FFmpeg conversion failed:", err);
      toast.error("MP4 conversion failed — saving as WebM instead.", { id: toastId });
      // Fallback: save the raw WebM
      const buffer = await blob.arrayBuffer();
      const fullPath = await join(dir, `${baseName}.webm`);
      await writeFile(fullPath, new Uint8Array(buffer));
    }
  }
};

  const handlePickSaveDir = async () => {
    try {
      const selected = await openDialog({ directory: true, multiple: false });
      if (selected && typeof selected === "string") {
        setRecordingSavePath(selected);
        setSetting("recorder_save_path", JSON.stringify(selected));
      }
    } catch {}
  };

  const handleLoadFile = async () => {
    try {
      const selected = await openDialog({
        multiple: false,
        filters: [{ name: "Text", extensions: ["txt", "md"] }],
      });
      if (selected) {
        const path = selected as string;
        const filename = path.split("/").pop() || path;
        const content = await readTextFile(path);
        setTextContent(content);
        setIsPlaying(false);
        await addRecentFile(path, filename);
        await loadRecentFiles();
      }
    } catch {}
  };

  const handleLoadRecent = async (path: string, filename: string) => {
    try {
      const content = await readTextFile(path);
      setTextContent(content);
      setIsPlaying(false);
      await addRecentFile(path, filename);
      await loadRecentFiles();
    } catch {}
  };

  const handleReset = () => {
    setIsPlaying(false);
    setResetKey((prev) => prev + 1);
  };

  // ── Spacebar: toggle teleprompter ────────────────────────────────────────────
  const playChime = (type: "play" | "stop") => {
    if (!soundEffects) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "play" ? 880 : 660, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent spacebar tracking if a button is focused, because spacebar activates buttons which causes double triggers
      if (e.key === " ") {
        const target = e.target as HTMLElement;
        if (target.closest("textarea, input")) return;
        if (target.closest("button") && target !== document.body) {
          // If they space on a button, blur it so they aren't confused, or let it fire. 
          // Best to let the button handle it and NOT toggle the teleprompter natively unless it IS the teleprompter play button.
          // To be safe, ignore global hotkey if a button has focus.
          return;
        }

        e.preventDefault();
        const next = !isPlaying;
        playChime(next ? "play" : "stop");
        setIsPlaying(next);
      }
      if (e.key === "r") {
        const target = e.target as HTMLElement;
        if (target.closest("textarea, input")) return;
        e.preventDefault();
        handleReset();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, soundEffects]);

  // ── Indicator dot color ──────────────────────────────────────────────────────
  const recDotClass =
    recordingState === "recording"
      ? "bg-red-500 animate-pulse"
      : recordingState === "paused"
      ? "bg-amber-400"
      : "bg-muted-foreground/30";

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      <div className="relative z-40 bg-background/80 backdrop-blur-md">
        <NavBar
          fontSize={fontSize}
          setFontSize={setFontSize}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isFlippedHorizontal={isFlippedHorizontal}
          setIsFlippedHorizontal={setIsFlippedHorizontal}
          isFlippedVertical={isFlippedVertical}
          setIsFlippedVertical={setIsFlippedVertical}
          textAlign={textAlign}
          setTextAlign={setTextAlign}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          recentFiles={recentFiles}
          onLoadFile={handleLoadFile}
          onLoadRecent={handleLoadRecent}
          onReset={handleReset}
          onPopout={() => {}} 
          hidePopout={true}
        />
      </div>

      <div className="relative flex-1 w-full bg-black overflow-hidden">
        {/* ── Camera feed ─────────────────────────────────────────────── */}
      {cameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70 z-10">
          <Circle className="w-12 h-12 opacity-30" />
          <p className="text-sm font-medium">{cameraError}</p>
          <Button variant="outline" size="sm" onClick={startCamera} className="border-white/20 text-white/70 hover:text-white">
            Retry
          </Button>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: cameraFlipped ? "scaleX(-1)" : "none" }}
        />
      )}

      {/* ── Recording state badge ────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${recDotClass}`} />
        {recordingState !== "idle" && (
          <span className="text-white text-xs font-mono font-semibold bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {formatTime(elapsed)}
          </span>
        )}
        {recordingState === "paused" && (
          <span className="text-amber-300 text-xs font-semibold bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
            PAUSED
          </span>
        )}
        {actualResolution && (
          <span className="text-white/40 text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm ring-1 ring-white/10 uppercase tracking-widest">
            {actualResolution}
          </span>
        )}
      </div>

      {/* ── Mic level indicator ─────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {hasMic ? (
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1.5 rounded-lg">
            <Mic className="w-3 h-3 text-white/60 shrink-0" />
            <div className="flex gap-[2px] items-end h-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(20, audioLevel * 100 > (i / 8) * 100 ? 100 : 20)}%`,
                    background: audioLevel * 8 > i ? "#22c55e" : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-lg">
            <MicOff className="w-3 h-3 text-white/40" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 bg-black/50 backdrop-blur-sm hover:bg-white/20 text-white/70 hover:text-white rounded-lg"
          onClick={() => setSettingsOpen(true)}
          title="Camera settings"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* ── Teleprompter overlay ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-20 flex flex-col"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.15) 100%)" }}
      >
        <TeleprompterText
          key={resetKey}
          isPlaying={isPlaying}
          fontSize={fontSize[0]}
          scrollSpeed={scrollSpeed[0]}
          textContent={textContent}
          isFlippedHorizontal={isFlippedHorizontal}
          isFlippedVertical={isFlippedVertical}
          textAlign={textAlign}
          isFocusMode={isFocusMode}
          onEnd={() => setIsPlaying(false)}
        />
      </div>

      {/* ── Bottom control bar ───────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 z-30 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-t from-black/70 to-transparent">
        {/* Teleprompter play/pause */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const next = !isPlaying;
            playChime(next ? "play" : "stop");
            setIsPlaying(next);
          }}
          className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
          title="Toggle teleprompter (Space)"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause Script" : "Play Script"}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => { setIsPlaying(false); setResetKey((k) => k + 1); }}
          title="Reset teleprompter (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Recording controls */}
        {recordingState === "idle" ? (
          <Button
            onClick={handleStartRecord}
            className="bg-red-600 hover:bg-red-500 text-white gap-2 px-5 shadow-lg"
          >
            <Circle className="w-3.5 h-3.5 fill-white" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              onClick={handlePauseResume}
              variant="outline"
              className="border-white/30 text-white bg-white/10 hover:bg-white/20 gap-2"
            >
              {recordingState === "recording" ? (
                <><Pause className="w-3.5 h-3.5" /> Pause</>
              ) : (
                <><Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" /> Resume</>
              )}
            </Button>
            <Button
              onClick={handleStopRecord}
              variant="outline"
              className="border-white/30 text-white bg-black/30 hover:bg-white/10 gap-2"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              Stop & Save
            </Button>
          </>
        )}
      </div></div>

      {/* ── Settings sheet ───────────────────────────────────────────── */}
      <RecorderSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onPickSaveDir={handlePickSaveDir}
      />
    </div>
  );
};

export default RecorderView;
