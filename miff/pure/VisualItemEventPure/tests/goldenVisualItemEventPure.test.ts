import path from 'path';
import fs from 'fs';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('golden visual item event flow', () => {
  const root = path.resolve(__dirname, '..');
  const event = path.resolve(root, 'fixtures/sample_event.json');
  const commands = path.resolve(root, 'tests/commands.json');
  const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [event, commands]);
  const got = SafeJSONParser.parse(out);
  
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ 
    op: 'visual.item', 
    status: 'ok', 
    resolved: true, 
    frames: 1,
    debug: expect.objectContaining({
      frameLog: expect.any(Array),
      itemType: 'helmet'
    })
  });
  expect(got.outputs[1]).toMatchObject({ op: 'list', eventTypes: expect.arrayContaining(['helmet.split']) });
  expect(got.outputs[2]).toMatchObject({ op: 'dump', event: expect.objectContaining({ type: 'helmet.split' }) });
});