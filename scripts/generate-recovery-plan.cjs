#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function main() {
  const date = process.env.DATE || new Date().toISOString().slice(0, 10);
  const outDir = path.resolve('docs/archive/test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${date}-recovery-plan.txt`);

  const categorization = safeRead(path.resolve(outDir, `${date}-module-categorization.txt`));

  const body = [];
  body.push(`# Recovery Roadmap ${date}`);
  body.push('');
  body.push('Phase 4: Optimization & Completion');
  body.push('- Implement profiling recommendations');
  body.push('- Complete partial/minimal modules');
  body.push('- Refactor for performance and clarity');
  body.push('');
  body.push('Phase 5: UI & Community');
  body.push('- Build visual management tools');
  body.push('- Add sharing and collaboration features');
  body.push('- Launch contributor dashboard and onboarding flow');
  body.push('');
  body.push('Phase 6: Platform Integration');
  body.push('- Finalize Godot, Unity, Unreal bridges');
  body.push('- Validate export pipelines across engines');
  body.push('');
  body.push('Context:');
  body.push(categorization || '(module categorization not found)');

  fs.writeFileSync(out, body.join('\n'));
  process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
}

function safeRead(p) {
  try { return require('fs').readFileSync(p, 'utf8'); } catch { return ''; }
}

if (require.main === module) main();

