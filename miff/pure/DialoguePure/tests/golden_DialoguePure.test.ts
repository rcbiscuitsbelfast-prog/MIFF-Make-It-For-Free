import * as path from 'path';

describe('DialoguePure CLI golden', () => {
  const root = path.resolve(__dirname, '..');
  const cliPath = path.resolve(root, 'cliHarness.ts');
  const fixture = path.resolve(root, 'fixtures/dialogue_cli_input.json');

  test('structured replay with context injection', () => {
    const out = (global as any).testUtils.runCLI(cliPath, [fixture]);
    const result = JSON.parse(out);

    expect(result.op).toBe('dialogue_replay');
    expect(result.status).toBe('ok');
    expect(Array.isArray(result.steps)).toBe(true);
    expect(result.steps[0].node).toBe('start');
    expect(result.steps[result.steps.length - 1].node).toBe('end');
    expect(Array.isArray(result.history)).toBe(true);
  });
});

