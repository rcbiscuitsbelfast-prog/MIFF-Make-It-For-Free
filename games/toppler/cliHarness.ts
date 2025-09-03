/**
 * CLI harness for Toppler game
 * Deterministic headless loop with seed/speed and simple input injection.
 */

import { createGameLauncher, IGameScene } from './src/bootstrap/GameBootstrap';

type Args = { command: string; args: string[]; options: Record<string, any> };

function parseArgs(argv: string[]): Args {
  const [, , ...rest] = argv;
  const command = rest[0] || 'play';
  const args: string[] = [];
  const options: Record<string, any> = {};
  for (let i = 1; i < rest.length; i++) {
    const token = rest[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const val = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : 'true';
      options[key] = val;
    } else {
      args.push(token);
    }
  }
  return { command, args, options };
}

function createHeadlessCanvas(width: number, height: number): HTMLCanvasElement {
  // Minimal fake canvas for headless execution
  const canvas = {
    width,
    height,
    getContext: () => ({ clearRect: () => {}, fillRect: () => {} })
  } as unknown as HTMLCanvasElement;
  return canvas;
}

function buildStubScene(seed: number): IGameScene {
  let tick = 0;
  const size = { width: 800, height: 600 };
  return {
    mount: (canvas) => {
      void canvas; // no-op
    },
    update: (delta) => {
      // Deterministic increment based on seed
      tick += Math.max(1, Math.floor(delta / 16)) + (seed % 3);
    },
    render: () => {
      // no-op headless
    },
    getSize: () => size,
    handleInput: (evt) => {
      if (evt.type === 'keypress' && evt.payload === 'space') {
        tick += 5;
      }
    },
    destroy: () => {
      // no-op
    }
  };
}

function main() {
  const { command, options } = parseArgs(process.argv);
  const seed = Number(options.seed ?? 42);
  const steps = Number(options.steps ?? 60);
  const speed = Number(options.speed ?? 1.0);

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log('Toppler CLI');
    console.log('Usage: games/toppler/cliHarness.ts play [--seed N] [--steps N] [--speed X]');
    process.exit(0);
  }

  if (command !== 'play') {
    console.error('Error: Unknown command');
    process.exit(1);
  }

  // Headless mount and loop
  const scene = buildStubScene(seed);
  const launcher = createGameLauncher({
    scene,
    containerId: 'toppler-root',
    autostart: false
  } as any);

  // Fake DOM container and canvas for bootstrap
  (global as any).document = {
    getElementById: () => ({
      id: 'toppler-root',
      appendChild: () => {},
      querySelector: (sel: string) => (sel === 'canvas' ? null : null)
    }),
    querySelectorAll: () => [],
    head: { appendChild: () => {} },
    createElement: (tag: string) => (tag === 'canvas' ? (createHeadlessCanvas(800, 600) as any) : ({}) )
  } as any;

  // Shim RAF for deterministic stepping
  let rafCb: ((ts: number) => void) | null = null;
  let ts = 0;
  ;(global as any).requestAnimationFrame = (cb: (t: number) => void) => { rafCb = cb; return 1; };
  ;(global as any).cancelAnimationFrame = () => {};

  launcher.start();

  for (let i = 0; i < steps; i++) {
    ts += 16 * speed;
    if (typeof rafCb === 'function') {
      (rafCb as (t: number) => void)(ts);
    }
  }

  // Emit a minimal structured result
  const result = {
    op: 'play',
    status: 'ok',
    summary: { seed, steps, speed }
  };
  console.log(JSON.stringify(result));
}

if (require.main === module) {
  main();
}

