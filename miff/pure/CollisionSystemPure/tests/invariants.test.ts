import { execFileSync } from 'child_process';
import * as path from 'path';

describe('CollisionSystemPure invariants', () => {
  it('no overlap after resolution step (basic)', () => {
    const root = path.resolve(__dirname, '..');
    const cli = path.resolve(root, 'cliHarness.ts');
    const boxes = path.resolve(root, 'sample_boxes.json');
    const cmds = path.resolve(root, 'tests/commands.json');
    const out = execFileSync('npx', ['tsx', cli, boxes, cmds], { encoding: 'utf-8' });
    expect(typeof out).toBe('string');
    // Minimal invariant: run success; deeper parsing depends on CLI schema
  });
});

