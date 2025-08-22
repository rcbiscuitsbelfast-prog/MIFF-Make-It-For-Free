import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden attribution ok output', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const cfg = path.resolve(root, 'sample_config.json');
  const commands = [ { op: 'showAttribution' } ];
  const cmdsPath = path.resolve(root, 'tests', 'commands.json');
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));
  const out = execFileSync('node', [harness, cfg, cmdsPath], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = { outputs: [ { op:'showAttribution', status:'ok', issues:[], resolvedRefs:{}, rendered:{ message:'Powered by MIFF', style:'console:info', durationMs:1500 } } ] };
  expect(got).toEqual(expected);
});

test('golden attribution skipped when disabled', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const cfg = path.resolve(root, 'sample_config.json');
  const disabledCfg = { ...JSON.parse(fs.readFileSync(cfg,'utf-8')), enabled: false };
  const tmp = path.resolve(root, 'tests', 'cfg_disabled.json');
  fs.writeFileSync(tmp, JSON.stringify(disabledCfg, null, 2));
  const commands = [ { op: 'showAttribution' } ];
  const cmdsPath = path.resolve(root, 'tests', 'commands2.json');
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));
  const out = execFileSync('node', [harness, tmp, cmdsPath], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = { outputs: [ { op:'showAttribution', status:'skipped', issues:[], resolvedRefs:{} } ] };
  expect(got).toEqual(expected);
});