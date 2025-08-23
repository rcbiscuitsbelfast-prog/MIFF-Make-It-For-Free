#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { generateRenderPayload, GameState, RenderPayload } from '../RenderPayloadPure/GameStateToFrames';

type Flags = { fps: number; debug: boolean; out: string };

function parseArgs(argv: string[]): { scenario: string; flags: Flags }{
  const args = argv.slice(2);
  if(args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h'){
    printUsage();
    process.exit(0);
  }
  const scenario = args[0];
  let fps = 30;
  let debug = false;
  let out = 'demo.html';
  for(let i=1;i<args.length;i++){
    const a = args[i];
    if(a === '--fps'){ fps = parseInt(args[++i] || '30', 10) || 30; }
    else if(a === '--debug'){ debug = true; }
    else if(a === '--out'){ out = args[++i] || 'demo.html'; }
  }
  return { scenario, flags: { fps, debug, out } };
}

function printUsage(){
  console.log(`\nAutoBuilderCLI - Scenario -> RenderPayload -> Web Canvas Demo\n\nUsage:\n  npx ts-node AutoBuilderCLI/cli.ts <ScenarioPackName> [--fps 30] [--debug] [--out demo.html]\n\nExamples:\n  npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html\n  npx ts-node AutoBuilderCLI/cli.ts SpiritTamerDemoPure --out demo.html\n`);
}

function resolveScenarioModule(scenario: string): string{
  // Convention: <Name>/ScenarioPack<Name>.ts
  const rel = `${scenario}/ScenarioPack${scenario}.ts`;
  const p = path.resolve(rel);
  if(!fs.existsSync(p)){
    throw new Error(`Scenario pack not found: ${rel}`);
  }
  return p;
}

function toGameStateFromScenarioOutput(scenarioName: string, output: any): GameState{
  // Attempt to adapt common shapes
  if(output && Array.isArray(output.timeline) && output.timeline.length > 0 && output.timeline[0].position){
    // E.g., TopplerDemoPure
    const frames = output.timeline.map((st: any) => ({
      camera: { x: 0, y: 0, zoom: 1 },
      backgroundColor: '#101820',
      entities: [ { id: 'block', x: st.position.x, y: st.position.y, spriteId: 'block', layer: 0 } ]
    }));
    return { frames };
  }
  // Generic fallback: two static frames
  return {
    frames: [
      { camera: { x: 0, y: 0, zoom: 1 }, backgroundColor: '#000000', entities: [ { id:'e1', x: 0, y: 0, spriteId: 'hero', layer: 0 } ] },
      { camera: { x: 5, y: 0, zoom: 1 }, backgroundColor: '#000000', entities: [ { id:'e1', x: 10, y: 0, spriteId: 'hero', layer: 0 } ] }
    ]
  };
}

function buildHtml(frames: RenderPayload[], flags: Flags): string{
  const framesJson = JSON.stringify(frames);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AutoBuilderCLI Demo</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f1115; color: #e6e6e6; }
    #stage { width: 800px; height: 450px; border: 1px solid #333; background: #000; }
    .controls { margin: 8px 0; display: flex; gap: 8px; align-items: center; }
  </style>
</head>
<body>
  <h1>AutoBuilderCLI Demo</h1>
  <canvas id="stage"></canvas>
  <div class="controls">
    <button id="play">Play</button>
    <button id="pause">Pause</button>
    <button id="stop">Stop</button>
    <label><input type="checkbox" id="debug" ${flags.debug ? 'checked' : ''}/> Debug</label>
  </div>
  <script type="module">
    import { CanvasRenderPlayer } from '../ConvertToWebPure/CanvasPlayer.ts';
    const frames = ${framesJson};
    const canvas = document.getElementById('stage');
    const player = new CanvasRenderPlayer(canvas, frames, { fps: ${flags.fps}, debug: ${flags.debug ? 'true' : 'false'} });
    document.getElementById('play').addEventListener('click', () => player.play());
    document.getElementById('pause').addEventListener('click', () => player.pause());
    document.getElementById('stop').addEventListener('click', () => player.stop());
    document.getElementById('debug').addEventListener('change', (e) => player.setDebug(e.target.checked));
  </script>
</body>
</html>`;
}

function main(){
  const { scenario, flags } = parseArgs(process.argv);
  try{
    const modPath = resolveScenarioModule(scenario);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(modPath);
    let gameState: GameState | null = null;
    if(typeof mod.generateGameState === 'function'){
      gameState = mod.generateGameState();
    } else if(typeof mod.toGameState === 'function'){
      gameState = mod.toGameState();
    } else if(typeof mod.runScenario === 'function'){
      const out = mod.runScenario({});
      gameState = toGameStateFromScenarioOutput(scenario, out);
    }
    if(!gameState){
      throw new Error('Scenario pack does not expose generateGameState/toGameState/runScenario');
    }
    const frames = generateRenderPayload(gameState);
    const html = buildHtml(frames, flags);
    fs.writeFileSync(path.resolve(flags.out), html, 'utf-8');
    console.log(JSON.stringify({ op: 'build', status: 'ok', out: path.resolve(flags.out), frames: frames.length }));
  } catch(err){
    console.error(JSON.stringify({ op: 'build', status: 'error', issues: [ (err as Error).message ] }));
    process.exit(1);
  }
}

if(require.main === module){
  main();
}

