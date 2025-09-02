const { execFileSync } = require('child_process');
const path = require('path');

test('WitcherExplorerDemoPure demo runs', () => {
  const cli = path.resolve('miff/pure/WitcherExplorerDemoPure/cliHarness.ts');
  const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', cli], { encoding: 'utf-8' });
  const j = JSON.parse(out);
  
  // Extract the runScenario output from the outputs array
  expect(j.outputs).toBeDefined();
  expect(j.outputs).toHaveLength(1);
  expect(j.outputs[0].op).toBe('runScenario');
  expect(j.outputs[0].status).toBe('ok');
  
  const finalState = j.outputs[0].finalState;
  expect(finalState.nav.op).toBe('nav.path');
  expect(finalState.dlg.op).toBe('dialogue.next');
  expect(finalState.quest.op).toBe('parse');
});

