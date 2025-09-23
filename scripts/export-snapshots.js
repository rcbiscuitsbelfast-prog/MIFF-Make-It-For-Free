#!/usr/bin/env node
// Snapshot exporter: renders minimal PPM images from RenderReplayPure frames
const fs = require('fs');
const path = require('path');
const fs = require('fs');

function ensureDir(dir){ fs.mkdirSync(dir, { recursive: true }); }

function makePPM(width, height, pixels /* Uint8 RGB flat */){
  const header = `P6\n${width} ${height}\n255\n`;
  return Buffer.concat([Buffer.from(header,'ascii'), Buffer.from(pixels)]);
}

function drawFrameToPPM(frame, width=128, height=72){
  // Simple renderer: clear, draw entities as colored pixels (hash id→color)
  const pix = new Uint8Array(width*height*3);
  function colorFromId(id){
    let h = 2166136261; for (let i=0;i<id.length;i++){ h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
    const r = (h>>>16)&255, g=(h>>>8)&255, b=(h)&255; return [r,g,b];
  }
  const ents = frame?.entities || [];
  for (const e of ents){
    const x = Math.max(0, Math.min(width-1, Math.floor((e.x||0) % width)));
    const y = Math.max(0, Math.min(height-1, Math.floor((e.y||0) % height)));
    const idx = (y*width + x)*3; const [r,g,b]=colorFromId(String(e.id||'e'));
    pix[idx]=r; pix[idx+1]=g; pix[idx+2]=b;
  }
  return makePPM(width, height, pix);
}

function main(){
  const outDir = process.argv[2] || 'build/snapshots';
  ensureDir(outDir);
  // Load a sample RenderReplayPure payload if available, otherwise fallback
  let frames = [];
  try {
    const samplePath = path.resolve('miff/pure/RenderReplayPure/sample_replay.json');
    if (fs.existsSync(samplePath)){
      const data = JSON.parse(fs.readFileSync(samplePath,'utf-8'));
      const steps = data?.examples?.basic?.session?.steps || [];
      frames = steps.slice(0,2).map((s, i) => ({ name: `replay_${i+1}`, frame: { entities: (s.renderData||[]).map((rd)=>({ id: rd.id||'ent', x: (rd.position?.x)||0, y: (rd.position?.y)||0 })) } }));
    }
  } catch {}
  if (frames.length === 0){
    frames = [
      { name: 'witcher_grove', frame: { entities: [{ id:'npc_a', x:10, y:20 },{ id:'tree', x:40, y:10 }] } },
      { name: 'spirit_tamer', frame: { entities: [{ id:'spirit', x:60, y:30 },{ id:'note', x:80, y:40 }] } }
    ];
  }
  const engines = ['web','unity','godot'];
  for (const f of frames){
    for (const eng of engines){
      const ppm = drawFrameToPPM(f.frame);
      fs.writeFileSync(path.join(outDir, `${f.name}.${eng}.ppm`), ppm);
    }
  }
  console.log(`Exported ${frames.length * engines.length} PPM snapshots to ${outDir}`);
}

main();

