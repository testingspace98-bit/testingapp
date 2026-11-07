// node branding/render.mjs  -> branding/profile.png (800x800) + branding/banner.png (2560x1440)
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
for (const [layout, w, h] of [["profile", 800, 800], ["banner", 2560, 1440]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(resolve(here, "profile.html")).href + `?layout=${layout}&w=${w}&h=${h}`);
  await p.evaluate(() => window.ready);
  await p.screenshot({ path: resolve(here, `${layout}.png`) });
  await p.close();
}
await b.close();
