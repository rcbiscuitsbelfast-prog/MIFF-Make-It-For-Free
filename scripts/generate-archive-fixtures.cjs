#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function main() {
  const baseDir = path.resolve('docs/archive/scenarios');
  const fixturesDir = path.join(baseDir, 'fixtures-generated');
  if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });

  const registryPath = path.join(baseDir, 'scenario_registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const existingIds = new Set(registry.scenarios.map(s => s.id));

  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  const ignore = new Set([
    'README.md',
    'reload-hooks.md',
    'scenario_registry.json',
    'scenario-metadata.json',
    'tags-and-lore.json',
    'ScenarioLoader.ts',
    'ScenarioPreview.tsx',
    'ScenarioRegistry.ts',
    'ScenarioRunnerPure.ts',
    'ScenarioWatcher.ts',
  ]);

  const added = [];

  for (const ent of items) {
    const name = ent.name;
    if (ignore.has(name)) continue;

    // Identify scenario items by excluding known non-scenario patterns
    const isScenarioCandidate = ent.isDirectory() || /\.(ts|json)$/i.test(name) || /^[A-Za-z0-9 _\-\.]+$/.test(name);
    if (!isScenarioCandidate) continue;

    // Derive id and title
    const title = toTitle(stripExt(name));
    let id = slugify(stripExt(name));

    // Normalize some known typos
    if (id === 'alter_forgotten_ames' || id === 'alter-forgotten-ames') id = 'altar-forgotten-names';

    if (existingIds.has(id)) continue; // skip if already present

    // Create minimal fixture JSON
    const fixturePath = path.join(fixturesDir, `${id}.json`);
    const scenarioJson = {
      name: title,
      id,
      description: `Archived scenario placeholder for ${title}.`,
      objectives: [],
      triggers: [],
      rewards: [],
      metadata: { source: `docs/archive/scenarios/${name}` }
    };
    fs.writeFileSync(fixturePath, JSON.stringify(scenarioJson, null, 2));

    // Append to registry
    registry.scenarios.push({
      id,
      name: title,
      fixture: path.relative(process.cwd(), fixturePath).replace(/\\/g, '/'),
      sitePath: '/sampler/index.html'
    });
    existingIds.add(id);
    added.push(id);
  }

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  process.stdout.write(`Added ${added.length} scenarios to registry.\n`);
}

function stripExt(n) {
  return n.replace(/\.[^.]+$/, '');
}

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTitle(s) {
  return String(s)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

if (require.main === module) main();

