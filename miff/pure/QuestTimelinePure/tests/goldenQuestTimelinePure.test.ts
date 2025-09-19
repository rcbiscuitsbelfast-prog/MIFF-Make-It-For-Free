import path from 'path';
import fs from 'fs';

test('golden quest timeline flow', () => {
  const root = path.resolve(__dirname, '..');
  const timeline = path.resolve(root, 'fixtures/helmet_of_fate.timeline.json');
  const commands = path.resolve(root, 'tests/commands.json');
  const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [timeline, commands]);
  const got = JSON.parse(out);
  
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'quest.timeline', status: 'ok', frames: expect.any(Number) });
  expect(got.outputs[1]).toMatchObject({ op: 'validate', valid: true });
  expect(got.outputs[2]).toMatchObject({ op: 'list', timelines: expect.arrayContaining(['helmet_of_fate']) });
  expect(got.outputs[3]).toMatchObject({ op: 'dump', timeline: expect.objectContaining({ 
    id: 'helmet_of_fate', 
    remixMode: true,
    events: expect.any(Array)
  }) });
});