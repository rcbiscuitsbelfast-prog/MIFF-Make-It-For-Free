#!/usr/bin/env node
// CLI scenario: start -> move -> interact -> save -> load -> resume
const { execSync } = require('child_process');

function run(cmd){ return execSync(cmd, { stdio: ['ignore','pipe','pipe'] }).toString('utf-8'); }

try {
  // Reset input
  run('bash -lc "echo \'{\"move\":{\"x\":1,\"y\":0},\"dt\":100}\' > /workspace/session/input.json"');
  // Tick movement
  run('npx --yes tsx /workspace/render/gameLoop.ts');
  // Interact
  run('bash -lc "echo \'{\"interact\":\"chest_01\",\"dt\":16}\' > /workspace/session/input.json"');
  run('npx --yes tsx /workspace/render/gameLoop.ts');
  // Save snapshot
  run('npx --yes tsx /workspace/miff/pure/SavePure/integration/GameSnapshotCLI.ts --mode=save');
  // Load snapshot
  const out = run('npx --yes tsx /workspace/miff/pure/SavePure/integration/GameSnapshotCLI.ts --mode=load');
  console.log(out);
} catch (e) {
  console.error('Scenario failed:', e.message);
  process.exit(1);
}

