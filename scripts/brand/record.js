// Render weev-logo-animation.html frame by frame (deterministic) for MP4 export.
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.env.APPDATA, 'npm', 'node_modules', 'playwright'));

const URL = 'file:///C:/Users/fahi/Documents/GitHub/majlis-hub/preview/weev-logo-animation.html?export';
const OUT = path.join(__dirname, 'frames');
const FPS = 60, ANIM_MS = 3900, HOLD_MS = 1600;
const [W, H] = (process.argv[2] || '1920x1080').split('x').map(Number);

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(URL);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  const total = Math.round((ANIM_MS + HOLD_MS) / 1000 * FPS);
  for (let i = 0; i < total; i++) {
    const t = Math.min(i * 1000 / FPS, ANIM_MS + 100);
    await page.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), t);
    await page.screenshot({ path: path.join(OUT, `f_${String(i).padStart(4, '0')}.png`) });
  }
  await browser.close();
  console.log('frames', total);
})();
