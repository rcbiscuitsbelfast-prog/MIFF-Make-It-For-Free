#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main() {
  const date = process.env.DATE || new Date().toISOString().slice(0, 10);
  const registryPath = path.resolve('docs/archive/scenarios/scenario_registry.json');
  const outDir = path.resolve('docs/archive/test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const raw = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(raw);
  for (const sc of registry.scenarios) {
    const id = sc.id;
    const fx = sc.fixture;
    const fxPath = path.resolve(fx);
    const out = path.join(outDir, `${date}-${id}.txt`);

    try {
      if (!fs.existsSync(fxPath)) {
        // Some registry paths may be wrong; attempt known corrections
        let alt = fxPath
          .replace('miff/miff/pure/', 'miff/pure/')
          .replace('/./', '/');
        if (alt !== fxPath && fs.existsSync(alt)) {
          runScenario(alt, out, id);
        } else {
          fs.writeFileSync(out, `Missing fixture: ${fx}\nResolved Path Tried: ${fxPath}${alt !== fxPath ? `\nAlt Path Tried: ${alt}` : ''}\n`);
        }
      } else {
        runScenario(fxPath, out, id);
      }
      process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
    } catch (err) {
      fs.writeFileSync(out, `Scenario run failed: ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }
}

function runScenario(fxPath, out, id) {
  const res = spawnSync('npx', ['--yes', 'tsx', 'cli/miff-simulate.ts', fxPath], {
    encoding: 'utf8'
  });
  const header = `Scenario: ${id}\nFixture: ${path.relative(process.cwd(), fxPath)}\nStatus: ${res.status === 0 ? 'ok' : 'error'}\n`; 
  const body = res.stdout || res.stderr || '';
  fs.writeFileSync(out, `${header}\n${body}`);
}

if (require.main === module) main();

