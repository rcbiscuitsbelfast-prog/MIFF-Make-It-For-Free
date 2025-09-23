#!/usr/bin/env node
// Simple placeholder snapshot exporter: emits JSON summaries as artifacts
// Future: render replay frames to PNG/GIF from RenderReplayPure outputs
const fs = require('fs');
const path = require('path');

function ensureDir(dir){ fs.mkdirSync(dir, { recursive: true }); }

function main(){
  const outDir = process.argv[2] || 'build/snapshots';
  ensureDir(outDir);
  const stamp = Date.now();
  const samples = [
    { name: 'witcher_grove', info: 'Replay snapshot placeholder', ts: stamp },
    { name: 'spirit_tamer', info: 'Replay snapshot placeholder', ts: stamp }
  ];
  for (const s of samples){
    fs.writeFileSync(path.join(outDir, `${s.name}.json`), JSON.stringify(s, null, 2));
  }
  console.log(`Exported ${samples.length} snapshots to ${outDir}`);
}

main();

