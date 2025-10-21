import { runCLICommand } from '../../cli/integration';

describe('ValidationPure CLI Harness', () => {
  beforeEach(async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'reset');
  });

  test('should configure validation rules', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'configure', '--config={"rules":["missing_refs","stat_bounds","zone_overlap"],"combatExpectedStatKeys":["hp","attack","defense"]}');
    expect(output).toMatch('configure-ok');
  });

  test('should validate all data', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"ref1":{"ok":true},"ref2":{"ok":false}},"stats":[{"id":"entity1","stats":[{"key":"hp","base":100},{"key":"attack","base":50}]}],"zones":[{"id":"zone1","x":0,"y":0,"w":100,"h":100}]}');
    expect(output).toMatch('validate-all-ok');
  });

  test('should validate with missing references', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"missing_ref":{"ok":false}}}');
    expect(output).toMatch('validate-missing-refs-ok');
  });

  test('should validate stat bounds', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"stats":[{"id":"entity1","stats":[{"key":"hp","base":1000},{"key":"attack","base":-10}]}]}');
    expect(output).toMatch('validate-stat-bounds-ok');
  });

  test('should validate zone overlap', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"zones":[{"id":"zone1","x":0,"y":0,"w":100,"h":100},{"id":"zone2","x":50,"y":50,"w":100,"h":100}]}');
    expect(output).toMatch('validate-zone-overlap-ok');
  });

  test('should validate combat stat keys', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"stats":[{"id":"entity1","stats":[{"key":"hp","base":100}]}]}');
    expect(output).toMatch('validate-combat-stats-ok');
  });

  test('should validate naming convention', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"entities":[{"id":"entity1","name":"Test Entity","type":"character","position":{"x":10,"y":20},"properties":{}}]}');
    expect(output).toMatch('validate-naming-ok');
  });

  test('should validate data integrity', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"entities":[{"id":"entity1","name":"","type":"character","position":{"x":10,"y":20},"properties":{}},{"id":"entity1","name":"Duplicate","type":"character","position":{"x":30,"y":40},"properties":{}}]}');
    expect(output).toMatch('validate-data-integrity-ok');
  });

  test('should validate performance', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"assets":[{"id":"large_asset","name":"Large Asset","type":"model","path":"/assets/large.obj","size":10240,"checksum":"large123"}]}');
    expect(output).toMatch('validate-performance-ok');
  });

  test('should validate security', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"scripts":[{"id":"unsafe_script","name":"Unsafe Script","type":"utility","content":"function dangerous() { eval(userInput); }","language":"javascript","dependencies":[]}]}');
    expect(output).toMatch('validate-security-ok');
  });

  test('should report issues', async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"missing_ref":{"ok":false}},"stats":[{"id":"entity1","stats":[{"key":"hp","base":1000}]}]}');
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'report-issues');
    expect(output).toMatch('report-issues-ok');
  });

  test('should get validation statistics', async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"ref1":{"ok":true}}}');
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'stats');
    expect(output).toMatch('stats-ok');
  });

  test('should export validation data in JSON format', async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"ref1":{"ok":true}}}');
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'export', '--format=json');
    expect(output).toMatch('export-json-ok');
  });

  test('should export validation data in manifest format', async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"ref1":{"ok":true}}}');
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'export', '--format=manifest');
    expect(output).toMatch('export-manifest-ok');
  });

  test('should export validation data in summary format', async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"ref1":{"ok":true}}}');
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'export', '--format=summary');
    expect(output).toMatch('export-summary-ok');
  });

  test('should export validation report', async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"missing_ref":{"ok":false}},"stats":[{"id":"entity1","stats":[{"key":"hp","base":1000}]}]}');
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'export', '--format=report');
    expect(output).toMatch('export-report-ok');
  });

  test('should reset validation system', async () => {
    await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'validate-all', '--input={"refs":{"ref1":{"ok":true}}}');
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'reset');
    expect(output).toMatch('reset-validation-ok');
  });

  test('should run demo scenario', async () => {
    const output = await runCLICommand('miff/pure/ValidationPure/cliHarness.ts', 'demo');
    expect(output).toMatch('demo-scenario-ok');
  });
});