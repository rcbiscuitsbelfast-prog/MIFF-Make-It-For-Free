#!/usr/bin/env npx ts-node

import * as fs from 'fs';
import * as path from 'path';
import { generateRenderPayload, GameState, RenderPayload } from '../../miff/pure/GameStateToFrames';
import { ConvertToWebManager } from '../../miff/pure/Manager';
import { ConvertToUnityManager } from '../../miff/pure/Manager';
import { ConvertToGodotManager } from '../../miff/pure/Manager';
import { normalizeManifest, validateManifest } from '../../miff/pure';

type Flags = { 
  fps: number; 
  debug: boolean; 
  out: string;
  genre?: string;
  platform: 'web' | 'unity' | 'godot';
  assets?: string;
};

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
  let genre: string | undefined;
  let platform: 'web' | 'unity' | 'godot' = 'web';
  let assets: string | undefined;
  
  for(let i=1;i<args.length;i++){
    const a = args[i];
    if(a === '--fps'){ fps = parseInt(args[++i] || '30', 10) || 30; }
    else if(a === '--debug'){ debug = true; }
    else if(a === '--out'){ out = args[++i] || 'demo.html'; }
    else if(a === '--genre'){ genre = args[++i]; }
    else if(a === '--platform'){ 
      const p = args[++i];
      if(p === 'web' || p === 'unity' || p === 'godot') {
        platform = p;
      } else {
        throw new Error(`Invalid platform: ${p}. Must be web, unity, or godot`);
      }
    }
    else if(a === '--assets'){ assets = args[++i]; }
  }
  return { scenario, flags: { fps, debug, out, genre, platform, assets } };
}

function printUsage(){
  console.log(`\nAutoBuilderCLI - Multi-Platform Scenario Builder\n\nUsage:\n  npx ts-node AutoBuilderCLI/cli.ts <ScenarioPackName> [options]\n\nOptions:\n  --fps <number>     Playback rate (default: 30)\n  --debug           Enable debug overlay\n  --out <path>      Output path (default: demo.html)\n  --genre <type>    Scenario genre (physics, rhythm, adventure)\n  --platform <type> Target platform: web, unity, godot (default: web)\n  --assets <file>   Asset manifest JSON file\n\nExamples:\n  npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html\n  npx ts-node AutoBuilderCLI/cli.ts SpiritTamerDemoPure --platform unity --out demo.cs\n  npx ts-node AutoBuilderCLI/cli.ts AdventureDemo --genre adventure --platform godot --assets assets.json\n`);
}

function resolveScenarioModule(scenario: string): string{
  // Convention: <Name>/ScenarioPack<Name>.ts
  // Look relative to workspace root (parent of AutoBuilderCLI)
  const rel = path.resolve(__dirname, '..', `${scenario}/ScenarioPack${scenario}.ts`);
  if(!fs.existsSync(rel)){
    throw new Error(`Scenario pack not found: ${rel}`);
  }
  return rel;
}

function loadAssetManifest(assetsPath?: string): any {
  if (!assetsPath) return null;
  
  try {
    const manifestData = fs.readFileSync(assetsPath, 'utf-8');
    const manifest = JSON.parse(manifestData);
    const normalized = normalizeManifest(manifest);
    const issues = validateManifest(normalized);
    
    if (issues.length > 0) {
      console.warn('Asset manifest validation warnings:', issues);
    }
    
    return normalized;
  } catch (error) {
    throw new Error(`Failed to load asset manifest: ${(error as Error).message}`);
  }
}

function getGenreFromScenario(scenario: string): string {
  // Infer genre from scenario name or content
  if (scenario.toLowerCase().includes('toppler') || scenario.toLowerCase().includes('physics')) {
    return 'physics';
  }
  if (scenario.toLowerCase().includes('spirit') || scenario.toLowerCase().includes('rhythm')) {
    return 'rhythm';
  }
  if (scenario.toLowerCase().includes('adventure') || scenario.toLowerCase().includes('witcher')) {
    return 'adventure';
  }
  return 'generic';
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

function convertToPlatform(frames: RenderPayload[], flags: Flags, assetManifest?: any): any {
  const webConverter = new ConvertToWebManager();
  const unityConverter = new ConvertToUnityManager();
  const godotConverter = new ConvertToGodotManager();
  
  // Convert RenderFrame[] to RenderData[] for BridgeSchemaPure compatibility
  const renderData = frames.map((frame, index) => ({
    id: `frame_${index}`,
    type: 'node' as const,
    name: `Frame ${index}`,
    position: { x: 0, y: 0 },
    children: frame.sprites.map(sprite => ({
      id: sprite.id,
      type: 'sprite' as const,
      name: sprite.id,
      position: { x: sprite.x, y: sprite.y },
      scale: { x: 1, y: 1 },
      asset: sprite.id,
      props: { layer: sprite.layer || 0 }
    }))
  }));
  
  const bridgePayload = {
    op: 'convert',
    status: 'ok' as const,
    renderData,
    metadata: {
      schemaVersion: 'v1',
      engine: flags.platform,
      timestamp: new Date().toISOString(),
      module: 'AutoBuilderCLI'
    }
  };
  
  switch (flags.platform) {
    case 'web':
      return webConverter.convert(bridgePayload);
    case 'unity':
      return unityConverter.convert(bridgePayload);
    case 'godot':
      return godotConverter.convert(bridgePayload);
    default:
      throw new Error(`Unsupported platform: ${flags.platform}`);
  }
}

function buildOutput(frames: RenderPayload[], flags: Flags, assetManifest?: any): string {
  if (flags.platform === 'web') {
    return buildHtml(frames, flags);
  }
  
  // For Unity/Godot, return the converted data as a string
  const converted = convertToPlatform(frames, flags, assetManifest);
  return JSON.stringify(converted, null, 2);
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
    import { CanvasRenderPlayer } from '../../miff/pure/CanvasPlayer.ts';
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
    // Load asset manifest if specified
    const assetManifest = loadAssetManifest(flags.assets);
    
    // Determine genre if not specified
    if (!flags.genre) {
      flags.genre = getGenreFromScenario(scenario);
    }
    
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
    const output = buildOutput(frames, flags, assetManifest);
    
    // Ensure output directory exists
    const outputPath = path.resolve(flags.out);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write output to file
    fs.writeFileSync(outputPath, output, 'utf-8');
    
    // Log build result
    const result = {
      op: 'build',
      status: 'ok',
      scenario,
      genre: flags.genre,
      platform: flags.platform,
      out: path.resolve(flags.out),
      frames: frames.length,
      assets: assetManifest ? assetManifest.assets.length : 0
    };
    
    console.log(JSON.stringify(result, null, 2));
  } catch(err){
    console.error(JSON.stringify({ 
      op: 'build', 
      status: 'error', 
      issues: [ (err as Error).message ] 
    }));
    process.exit(1);
  }
}

if(require.main === module){
  main();
}

