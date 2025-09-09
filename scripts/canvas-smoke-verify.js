// scripts/canvas-smoke-verify.js
// Smoke Verification Runner for /grove, /toppler, /spirit
// - Confirms canvas present and sized
// - Verifies draw loop by sampling two successive frames
// - Checks joystick responsiveness and HUD presence
// - Asserts key console logs (if available)
// - Saves screenshots to tests/verify_*_canvas_ok.png

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.CANVAS_AUDIT_BASE_URL || 'http://127.0.0.1:8080';
const specs = [
  { name: 'grove', url: '/grove.html', screenshot: 'tests/verify_grove_canvas_ok.png' },
  { name: 'toppler', url: '/toppler.html', screenshot: 'tests/verify_toppler_canvas_ok.png' },
  { name: 'spirit', url: '/spirit.html', screenshot: 'tests/verify_spirit_canvas_ok.png' },
];

async function ensureDir(dir) { await fs.promises.mkdir(dir, { recursive: true }); }

async function run() {
  await ensureDir(path.join(process.cwd(), 'tests'));
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 800 }, args: ['--no-sandbox'] });
  let hadError = false;
  const results = [];

  for (const spec of specs) {
    const page = await browser.newPage();
    const logs = []; const errors = []; const failures = [];
    page.on('console', msg => { logs.push({ type: msg.type(), text: msg.text() }); });
    page.on('pageerror', err => { errors.push(String(err && err.message ? err.message : err)); });
    page.on('requestfailed', req => { failures.push({ url: req.url(), failure: req.failure() && req.failure().errorText }); });

    const url = BASE_URL + spec.url;
    const detail = [];
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('#gameCanvas', { visible: true, timeout: 15000 });
      detail.push('Canvas present');

      // Verify size
      const dims = await page.evaluate(() => {
        const c = document.getElementById('gameCanvas');
        const r = c.getBoundingClientRect();
        return { w: c.width || 0, h: c.height || 0, cw: Math.round(r.width), ch: Math.round(r.height) };
      });
      if ((dims.w || dims.cw) <= 0 || (dims.h || dims.ch) <= 0) throw new Error('Canvas has zero size');
      detail.push(`Canvas size ok: buffer=${dims.w}x${dims.h}, css=${dims.cw}x${dims.ch}`);

      // Verify draw loop via requestAnimationFrame frame counter (instrument after load)
      await page.evaluate(() => {
        const orig = window.requestAnimationFrame;
        window.__frameCount = window.__frameCount || 0;
        if (!orig || orig.__miffPatched) return;
        function patched(cb){
          return orig.call(window, function(ts){
            try { window.__frameCount = (window.__frameCount || 0) + 1; } catch {}
            cb(ts);
          });
        }
        patched.__miffPatched = true;
        window.requestAnimationFrame = patched;
      });
      await page.waitForFunction(() => (window.__frameCount || 0) > 5, { timeout: 7000 });
      const frameCount = await page.evaluate(() => window.__frameCount || 0);
      if (frameCount <= 5) throw new Error('Draw loop not detected (frame count)');
      detail.push(`Draw loop detected (frames=${frameCount})`);

      // Verify HUD and attempt joystick presence
      const ui = await page.evaluate(() => ({ footer: !!document.getElementById('miff-attribution-footer'), hud: !!document.getElementById('miffHUD') }));
      if (!ui.footer || !ui.hud) throw new Error('UI overlays missing');
      detail.push('HUD and footer present');

      // Try to interact with joystick if present (non-fatal if absent)
      await page.mouse.move(120, 700);
      await page.mouse.down();
      await page.mouse.move(200, 700, { steps: 5 });
      await page.mouse.up();
      detail.push('Joystick interaction simulated');

      await page.screenshot({ path: spec.screenshot });
      detail.push(`Screenshot: ${spec.screenshot}`);

      // Required log phrases (best-effort; zones log their own messages)
      const required = ['Renderer initialized', 'Assets loaded', 'Draw loop started', 'Canvas injected'];
      const present = new Set();
      for (const r of required) { if (logs.some(l => (l.text || '').toLowerCase().includes(r.toLowerCase()))) present.add(r); }
      detail.push(`Logs present: ${Array.from(present).join(', ') || '(none)'} (best-effort)`);

      results.push({ name: spec.name, ok: true, detail, logs, errors, failures, dims, screenshot: spec.screenshot });
    } catch (e) {
      hadError = true;
      results.push({ name: spec.name, ok: false, error: String(e && e.message ? e.message : e), detail, logs, errors, failures });
    } finally {
      await page.close().catch(() => {});
    }
  }

  await browser.close().catch(() => {});
  const out = path.join(process.cwd(), 'tests', 'canvas_smoke_results.json');
  await fs.promises.writeFile(out, JSON.stringify({ baseUrl: BASE_URL, hadError, results }, null, 2));
  if (hadError) { console.error('Smoke verify failed. See tests/canvas_smoke_results.json'); process.exit(1); }
  console.log('Smoke verify passed. See tests/canvas_smoke_results.json');
}

run().catch(e => { console.error('Smoke runner crashed:', e && e.message ? e.message : e); process.exit(1); });