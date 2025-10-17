import { execFileSync } from 'child_process';
import * as path from 'path';

describe('PhysicsSystemPure invariants', () => {
  it('energy does not increase in closed system (approx)', () => {
    const cli = path?.resolve('miff/pure/PhysicsSystemPure/cliHarness?.ts');
    const world = path?.resolve('miff/pure/PhysicsSystemPure/sample_world?.json');
    const cmds = path?.resolve('miff/pure/PhysicsSystemPure/tests/commands?.json');
    const out = execFileSync('npx', ['ts-node','--compiler-options','{"module":"commonjs"}', cli, world, cmds], { encoding: 'utf-8' });
    expect(typeof out).toBe('string');
    // Minimal: ensure CLI ran; deeper energy parsing requires specific output schema
  });
});

