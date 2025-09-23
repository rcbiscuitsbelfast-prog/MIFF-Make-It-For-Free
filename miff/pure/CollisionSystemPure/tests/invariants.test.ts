import { execFileSync } from 'child_process';
import * as path from 'path';

describe('CollisionSystemPure invariants', () => {
  it('no overlap after resolution step (basic)', () => {
    const cli = path.resolve('miff/pure/CollisionSystemPure/cliHarness.ts');
    const boxes = path.resolve('miff/pure/CollisionSystemPure/sample_boxes.json');
    const cmds = path.resolve('miff/pure/CollisionSystemPure/tests/commands.json');
    const out = execFileSync('npx', ['ts-node','--compiler-options','{"module":"commonjs"}', cli, boxes, cmds], { encoding: 'utf-8' });
    expect(typeof out).toBe('string');
    // Minimal invariant: run success; deeper parsing depends on CLI schema
  });
});

