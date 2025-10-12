// Capture screenshots of UI modules via demo page
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.CANVAS_AUDIT_BASE_URL || 'http://127.0.0.1:8080';
const shots = [
  { id: 'main', btn: '#showMain', out: 'tests/ui_main_menu.png' },
  { id: 'quest', btn: '#showQuest', out: 'tests/ui_quest_log.png' },
  { id: 'inv', btn: '#showInv', out: 'tests/ui_inventory_grid.png' },
  { id: 'dial', btn: '#showDial', out: 'tests/ui_dialogue_box.png' },
  { id: 'pause', btn: '#showPause', out: 'tests/ui_pause_menu.png' },
];
const styleVariants = [
  { key: 'fantasy', out: 'tests/ui_style_selector_fantasy.png' },
  { key: 'terminal', out: 'tests/ui_style_selector_terminal.png' },
  { key: 'minimal', out: 'tests/ui_style_selector_minimal.png' },
  { key: 'live', out: 'tests/ui_style_selector_live_switch.png' }
];

async function ensureDir(d){ await fs.promises.mkdir(d, { recursive: true }); }

async function run(){
  await ensureDir(path.join(process.cwd(), 'tests'));
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 800 }, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(BASE_URL + '/ui_modules/demo.html', { waitUntil: 'domcontentloaded' });
  for (const s of shots){
    await page.click(s.btn);
    await new Promise(r=>setTimeout(r, 400));
    await page.screenshot({ path: s.out });
  }
  // Style preset captures using Main Menu as sample
  for (const v of styleVariants){
    if (v.key === 'live'){
      await page.select('#styleSel', 'fantasy');
      await page.click('#showMain');
      await new Promise(r=>setTimeout(r, 200));
      await page.select('#styleSel', 'terminal');
      await new Promise(r=>setTimeout(r, 200));
      await page.select('#styleSel', 'minimal');
      await new Promise(r=>setTimeout(r, 200));
      await page.screenshot({ path: v.out });
    } else {
      await page.select('#styleSel', v.key);
      await page.click('#showMain');
      await new Promise(r=>setTimeout(r, 300));
      await page.screenshot({ path: v.out });
    }
  }
  await browser.close();
  console.log('UI screenshots saved');
}

run().catch(e=>{ console.error('UI screenshot runner failed:', e && e.message ? e.message : e); process.exit(1); });

