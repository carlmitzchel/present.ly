/**
 * convertToMp4.ts
 *
 * Post-processes a recorded WebM blob into an MP4 file using an FFmpeg sidecar.
 * The conversion is a lossless remux (no re-encoding), so it's near-instant.
 *
 * Prerequisites
 * ─────────────
 * 1. Add the ffmpeg sidecar binary to `src-tauri/binaries/`:
 *      ffmpeg-x86_64-pc-windows-msvc.exe   (Windows)
 *      ffmpeg-x86_64-apple-darwin           (macOS Intel)
 *      ffmpeg-aarch64-apple-darwin          (macOS Apple Silicon)
 *      ffmpeg-x86_64-unknown-linux-gnu      (Linux)
 *
 * 2. Declare the sidecar in `src-tauri/tauri.conf.json`:
 *      "bundle": { "externalBin": ["binaries/ffmpeg"] }
 *
 * 3. Add the Tauri shell plugin to Cargo.toml:
 *      tauri-plugin-shell = "2"
 *
 * 4. Register it in your Rust main.rs:
 *      .plugin(tauri_plugin_shell::init())
 *
 * 5. Add shell sidecar permissions to `src-tauri/capabilities/default.json`:
 *      "shell:allow-execute", "shell:allow-spawn"
 *
 * 6. Install the JS plugin:
 *      npm install @tauri-apps/plugin-shell
 */

import { Command } from "@tauri-apps/plugin-shell";
import { writeFile, remove } from "@tauri-apps/plugin-fs";
import { join, tempDir } from "@tauri-apps/api/path";

export interface ConvertResult {
  outputPath: string;
  /** Duration of the ffmpeg process in milliseconds */
  durationMs: number;
}

/**
 * Remuxes a WebM Blob to an MP4 file using FFmpeg (no re-encoding).
 *
 * @param blob         - The recorded WebM Blob from MediaRecorder
 * @param outputDir    - Directory to write the final .mp4 file
 * @param baseName     - File name without extension, e.g. "presently_2025-01-01T00-00-00"
 * @param onProgress   - Optional callback with a status string during conversion
 * @returns            - ConvertResult with the final output path
 */
export async function convertWebmToMp4(
  blob: Blob,
  outputDir: string,
  baseName: string,
  onProgress?: (status: string) => void
): Promise<ConvertResult> {
  const start = Date.now();

  // ── 1. Write the WebM blob to a temp file ───────────────────────────────────
  const tmp = await tempDir();
  const tempWebm = await join(tmp, `${baseName}_tmp.webm`);
  const buffer = await blob.arrayBuffer();
  await writeFile(tempWebm, new Uint8Array(buffer));
  onProgress?.("Temp file written, starting conversion…");

  // ── 2. Define the output MP4 path ───────────────────────────────────────────
  const outputMp4 = await join(outputDir, `${baseName}.mp4`);

  // ── 3. Build ffmpeg args ─────────────────────────────────────────────────────
  //   -y              overwrite output without prompting
  //   -i <input>      input file
  //   -c copy         copy streams — NO re-encoding (fast, lossless quality)
  //   -movflags +faststart   move moov atom to front for web streaming
  const args = [
    "-y",
    "-i", tempWebm,
    "-c", "copy",
    "-movflags", "+faststart",
    outputMp4,
  ];

  // ── 4. Run the sidecar ───────────────────────────────────────────────────────
  const command = Command.sidecar("binaries/ffmpeg", args);

  // Collect stderr (ffmpeg logs progress to stderr)
  const stderrLines: string[] = [];
  command.stderr.on("data", (line: string) => {
    stderrLines.push(line);
    // Surface time= progress lines to the caller
    if (line.includes("time=")) {
      const match = line.match(/time=(\S+)/);
      if (match) onProgress?.(`Converting… ${match[1]}`);
    }
  });

  const output = await command.execute();

  // ── 5. Check exit code ───────────────────────────────────────────────────────
  if (output.code !== 0) {
    // Clean up temp file before throwing
    await remove(tempWebm).catch(() => {});
    throw new Error(
      `FFmpeg exited with code ${output.code}.\n${stderrLines.slice(-10).join("\n")}`
    );
  }

  // ── 6. Clean up temp WebM ────────────────────────────────────────────────────
  await remove(tempWebm).catch(() => {
    console.warn("Could not remove temp WebM file:", tempWebm);
  });

  onProgress?.("Done!");

  return {
    outputPath: outputMp4,
    durationMs: Date.now() - start,
  };
}