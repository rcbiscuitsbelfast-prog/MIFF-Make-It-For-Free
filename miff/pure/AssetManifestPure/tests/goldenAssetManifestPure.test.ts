import path from 'path';
import fs from 'fs';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('golden asset manifest flow', () => {
  const root = path.resolve(__dirname, '..');
  const manifest = path.resolve(root, 'fixtures/sprites.json');
  const commands = path.resolve(root, 'tests/commands.json');
  const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [manifest, commands]);
  const got = SafeJSONParser.parse(out);
  
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'normalize', result: expect.objectContaining({ assets: expect.any(Array) }) });
  expect(got.outputs[1]).toMatchObject({ op: 'validate', valid: expect.any(Boolean) });
  expect(got.outputs[2]).toMatchObject({ op: 'audit', status: expect.any(String) });
  expect(got.outputs[3]).toMatchObject({ op: 'list', assets: expect.arrayContaining([
    expect.objectContaining({ id: 'sheet_main', type: 'sprite', license: 'cc0' })
  ]) });
  expect(got.outputs[4]).toMatchObject({ op: 'dump', manifest: expect.objectContaining({ assets: expect.any(Array) }) });
});