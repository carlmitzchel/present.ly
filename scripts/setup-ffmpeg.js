/**
 * setup-ffmpeg.js
 * 
 * Copies the correct FFmpeg binary from the ffmpeg-static npm package
 * into src-tauri/binaries/ with the correct Tauri sidecar naming convention.
 * 
 * Run once before `npm run tauri dev`:
 *   node scripts/setup-ffmpeg.js
 * 
 * Requires: npm install --save-dev ffmpeg-static
 */

const fs = require("fs");
const path = require("path");

const binDir = path.join(__dirname, "../src-tauri/binaries");
fs.mkdirSync(binDir, { recursive: true });

const ffmpegPath = require("ffmpeg-static");
const platform = process.platform;
const arch = process.arch;

const targetMap = {
  "darwin-arm64": "ffmpeg-aarch64-apple-darwin",
  "darwin-x64":   "ffmpeg-x86_64-apple-darwin",
  "win32-x64":    "ffmpeg-x86_64-pc-windows-msvc.exe",
  "linux-x64":    "ffmpeg-x86_64-unknown-linux-gnu",
};

const target = targetMap[`${platform}-${arch}`];
if (!target) {
  console.error(`Unsupported platform: ${platform}-${arch}`);
  process.exit(1);
}

const dest = path.join(binDir, target);
fs.copyFileSync(ffmpegPath, dest);
fs.chmodSync(dest, 0o755);
console.log(`✓ FFmpeg copied to src-tauri/binaries/${target}`);