/*
 * Canvas Audit Runner
 * - Serves pages via an external static server (run separately)
 * - Visits Grove, Toppler, Spirit pages
 * - Verifies canvas presence and size
 * - Checks that overlays/footer are initialized
 * - Captures console errors/warnings and failed requests
 * - Saves screenshots in tests/
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.CANVAS_AUDIT_BASE_URL || 'http://127.0.0.1:8080';

const pages = [
  { name: 'grove', url: '/grove.html', screenshot: 'tests/audit_grove_canvas_loaded.png' },
  { name: 'toppler', url: '/toppler.html', screenshot: 'tests/audit_toppler_canvas_loaded.png' },
  { name: 'spirit', url: '/spirit.html', screenshot: 'tests/audit_spirit_canvas_loaded.png' },
];

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function run() {
  await ensureDir(path.join(process.cwd(), 'tests'));

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];
  let hadError = false;

  for (const spec of pages) {
    const page = await browser.newPage();
    const logs = [];
    const errors = [];
    const requestsFailed = [];

    page.on('console', (msg) => {
      try {
        const text = msg.text();
        logs.push({ type: msg.type(), text });
      } catch {}
    });
    page.on('pageerror', (err) => {
      errors.push({ type: 'pageerror', text: String(err && err.message ? err.message : err) });
    });
    page.on('requestfailed', (req) => {
      requestsFailed.push({ url: req.url(), failure: req.failure() && req.failure().errorText });
    });

    const url = BASE_URL + spec.url;
    const detail = [];
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      detail.push(`Navigated: ${url}`);

      // Wait for canvas
      await page.waitForSelector('#gameCanvas', { visible: true, timeout: 15000 });
      detail.push('Canvas element found and visible');

      // Check canvas dimensions
      const dims = await page.evaluate(() => {
        const cvs = document.getElementById('gameCanvas');
        const rect = cvs.getBoundingClientRect();
        return { width: cvs.width || 0, height: cvs.height || 0, cssW: rect.width, cssH: rect.height };
      });
      if ((dims.width || dims.cssW) > 0 && (dims.height || dims.cssH) > 0) {
        detail.push(`Canvas size: buffer=${dims.width}x${dims.height}, css=${Math.round(dims.cssW)}x${Math.round(dims.cssH)}`);
      } else {
        detail.push('ERROR: Canvas has zero size');
        hadError = true;
      }

      // Verify footer/dispatcher presence as a proxy for UI init
      // Allow some time for initialization (use setTimeout to avoid API differences)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const uiInited = await page.evaluate(() => {
        const footer = document.getElementById('miff-attribution-footer');
        const hud = document.getElementById('miffHUD');
        return { footer: !!footer, hud: !!hud };
      });
      detail.push(`UI init: footer=${uiInited.footer}, hud=${uiInited.hud}`);

      // Take screenshot
      await page.screenshot({ path: spec.screenshot, fullPage: false });
      detail.push(`Screenshot saved: ${spec.screenshot}`);

      // Aggregate
      const pageResult = {
        name: spec.name,
        url,
        ok: errors.length === 0 && requestsFailed.length === 0,
        details: detail,
        console: logs,
        errors,
        requestsFailed,
        canvas: dims,
        ui: uiInited,
        screenshot: spec.screenshot,
      };
      results.push(pageResult);
      if (!pageResult.ok) hadError = true;
    } catch (e) {
      hadError = true;
      results.push({ name: spec.name, url, ok: false, fatal: String(e && e.message ? e.message : e), console: logs, errors, requestsFailed });
    } finally {
      await page.close().catch(() => {});
    }
  }

  await browser.close().catch(() => {});

  const outPath = path.join(process.cwd(), 'tests', 'canvas_audit_results.json');
  await fs.promises.writeFile(outPath, JSON.stringify({ baseUrl: BASE_URL, hadError, results }, null, 2));

  if (hadError) {
    console.error('Canvas audit completed with issues. See tests/canvas_audit_results.json');
    process.exit(1);
  } else {
    console.log('Canvas audit passed. See tests/canvas_audit_results.json');
  }
}

run().catch((e) => {
  console.error('Audit runner crashed:', e && e.message ? e.message : e);
  process.exit(1);
});

