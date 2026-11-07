// Render build/<id>/timeline.json to an MP4 with the mixed audio.
// Usage: node pipeline/render.mjs build/<id> output/<id>.mp4 [--preview t1,t2,...]
import { spawn } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));

const [buildDir, outFile, flag, list] = process.argv.slice(2);
const tl = JSON.parse(readFileSync(resolve(buildDir, "timeline.json"), "utf8"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(here, "scene.html")).href);
await page.evaluate((t) => window.setup(t), tl);

if (flag === "--preview") {
  // still frames for a quick visual check
  mkdirSync(outFile, { recursive: true });
  for (const t of list.split(",").map(Number)) {
    await page.evaluate((x) => window.draw(x), t);
    await page.screenshot({ path: `${outFile}/t${t.toFixed(1)}.png` });
  }
  await browser.close();
  process.exit(0);
}

mkdirSync(dirname(resolve(outFile)), { recursive: true });
const ff = spawn("ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-f", "image2pipe", "-framerate", String(tl.fps), "-c:v", "mjpeg", "-i", "-",
  "-i", resolve(buildDir, "mix.wav"),
  "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(tl.fps),
  "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
  "-shortest", "-movflags", "+faststart", resolve(outFile),
], { stdio: ["pipe", "inherit", "inherit"] });

const frames = Math.round(tl.duration * tl.fps);
const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  await page.evaluate((x) => window.draw(x), f / tl.fps);
  const buf = await page.screenshot({ type: "jpeg", quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 150 === 0) process.stdout.write(`  frame ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}
ff.stdin.end();
await new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error("ffmpeg exit " + c)))));
await browser.close();
console.log(`  wrote ${outFile} (${frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
