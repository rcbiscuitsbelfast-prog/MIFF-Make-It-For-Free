#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readLines(p) {
  try { return fs.readFileSync(p, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean); } catch { return []; }
}

function moduleHasHarness(modName) {
  const harness = path.resolve(`miff/pure/${modName}/cliHarness.ts`);
  return fs.existsSync(harness) ? harness : null;
}

function discoverHarnessModules() {
  const pureDir = path.resolve('miff/pure');
  const entries = fs.readdirSync(pureDir, { withFileTypes: true });
  const names = entries.filter(e => e.isDirectory()).map(e => e.name);
  return names.filter(n => !!moduleHasHarness(n));
}

function chooseCombo(mod, candidates) {
  const combos = [];
  const addIf = (m) => { if (m && moduleHasHarness(m)) combos.push(m); };
  // Heuristics per module
  if (/CombatPure/i.test(mod)) { addIf('ItemsPure'); addIf('StatusEffectsPure'); addIf('TeamsPure'); }
  if (/QuestsPure/i.test(mod)) { addIf('DialogueSystemPure'); addIf('NPCsPure'); addIf('EventBusPure'); }
  if (/AIPure/i.test(mod)) { addIf('CombatPure'); addIf('StatusEffectsPure'); }
  if (/ExportPipelinePure/i.test(mod)) { addIf('RenderWorldPure'); addIf('WorldManifestPure'); }
  if (/InputSystemPure/i.test(mod)) { addIf('AvatarSystemPure'); addIf('HUDPure'); }
  if (/PartyPure/i.test(mod)) { addIf('SocialDeductionPure'); addIf('HUDPure'); }
  if (/WeatherSystemPure/i.test(mod)) { addIf('ObstacleCoursePure'); addIf('SurvivalSystemPure'); }
  // Fallback: pick up to 2 from candidates that have harness
  if (combos.length === 0) {
    for (const c of candidates) {
      if (c !== mod && moduleHasHarness(c)) combos.push(c);
      if (combos.length >= 2) break;
    }
  }
  return Array.from(new Set(combos)).slice(0, 3);
}

function scenarioForModule(mod, combos) {
  const name = `${mod}-integration`;
  const modules = [mod, ...combos];
  const commands = modules.map(m => {
    const harness = moduleHasHarness(m);
    return harness ? [ 'npx', '--yes', 'tsx', path.relative(process.cwd(), harness) ] : null;
  }).filter(Boolean);
  return { name, modules, commands };
}

function main() {
  const date = process.env.DATE || new Date().toISOString().slice(0,10);
  const base = path.resolve('docs/archive/test-results');
  const real = readLines(path.join(base, 'realModules.txt'));
  const scaff = readLines(path.join(base, 'scaffoldedModules.txt')).map(l => l.split(/[\/]/).pop()).map(s => s && s.endsWith('.json') ? null : s).filter(Boolean);
  const broken = new Set(readLines(path.join(base, 'brokenModules.txt')));

  const discovered = discoverHarnessModules();
  const allCandidates = Array.from(new Set([ ...real, ...scaff, ...discovered ])).filter(Boolean);
  const eligible = allCandidates.filter(m => !broken.has(m));

  const outDir = path.resolve('scenario/generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let generated = 0;
  for (const mod of eligible) {
    const harness = moduleHasHarness(mod);
    if (!harness) continue;
    const combos = chooseCombo(mod, eligible);
    const scenario = scenarioForModule(mod, combos);
    const file = path.join(outDir, `${date}-${mod}-scenario.txt`);
    fs.writeFileSync(file, JSON.stringify(scenario, null, 2));
    generated++;
  }
  process.stdout.write(`Generated ${generated} scenarios in ${path.relative(process.cwd(), outDir)}\n`);
}

if (require.main === module) main();

