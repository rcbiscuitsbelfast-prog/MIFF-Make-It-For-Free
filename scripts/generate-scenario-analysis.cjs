#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function main() {
  const date = process.env.DATE || new Date().toISOString().slice(0, 10);
  const scenariosDir = path.resolve('docs/archive/scenarios');
  const outDir = path.resolve('docs/archive/test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${date}-scenario-analysis.txt`);

  const registry = JSON.parse(fs.readFileSync(path.join(scenariosDir, 'scenario_registry.json'), 'utf8'));
  const metadata = JSON.parse(fs.readFileSync(path.join(scenariosDir, 'scenario-metadata.json'), 'utf8'));

  const lines = [];
  lines.push(`# Scenario Analysis ${date}`);
  for (const s of registry.scenarios) {
    lines.push(`\n## ${s.id}`);
    lines.push(`- name: ${s.name || s.id}`);
    lines.push(`- fixture: ${s.fixture}`);
    const meta = metadata.find(m => normalize(m.id) === normalize(s.id));
    if (meta) {
      lines.push(`- subsystems: ${Array.isArray(meta.subsystems) ? meta.subsystems.join(', ') : ''}`);
      lines.push(`- status: ${meta.status}`);
    } else {
      lines.push(`- metadata: not found`);
    }
    // CLI triggers: from fixture path heuristic
    const cli = inferCliFromFixture(s.fixture);
    if (cli) lines.push(`- cli: ${cli}`);
  }

  fs.writeFileSync(out, lines.join('\n'));
  process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
}

function normalize(id) {
  return String(id || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

function inferCliFromFixture(fx) {
  if (!fx) return '';
  if (fx.includes('combat')) return 'miff-simulate.ts fixtures/combat_encounters.json';
  if (fx.includes('quest')) return 'miff-simulate.ts fixtures/quest_pack_echoes.json';
  if (fx.includes('beatmap')) return 'miff-simulate.ts miff/pure/RhythmSystemPure/fixtures/beatmap.json';
  if (fx.includes('sample_world')) return 'miff-simulate.ts miff/pure/WorldManifestPure/fixtures/sample_world.json';
  return 'miff-simulate.ts <fixture>';
}

if (require.main === module) main();

