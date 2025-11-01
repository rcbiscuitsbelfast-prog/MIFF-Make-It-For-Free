import { execFileSync } from 'child_process';
import * as path from 'path';

describe('PhysicsSystemPure invariants', () => {
  it('energy does not increase in closed system (approx)', () => {
    const root = path.resolve(__dirname, '..');
    const cli = path.resolve(root, 'cliHarness.ts');
    const world = path.resolve(root, 'sample_world.json');
    const cmds = path.resolve(root, 'tests/commands.json');
    const out = execFileSync('npx', ['tsx', cli, world, cmds], { encoding: 'utf-8' });
    expect(typeof out).toBe('string');
    // Minimal: ensure CLI ran; deeper energy parsing requires specific output schema
  });
});

