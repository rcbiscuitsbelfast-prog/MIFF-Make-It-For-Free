import path from 'path';
import { ConvertToUnityManager } from '../Manager';
import { RenderPayload } from '../../miff/pure/schema';

test('manager converts sample payload to unity items', () => {
  const sample:RenderPayload = require('../../miff/pure/sample_render.json').examples.npc_rendering.unified;
  const mgr = new ConvertToUnityManager();
  const out = mgr.convert(sample);
  expect(out.engine).toBe('unity');
  expect(out.items.length).toBeGreaterThan(0);
  expect(out.status).toBe('ok');
});

test('CLI converts file', () => {
  const file = path.resolve('BridgeSchemaPure/sample_render.json');
  const out = (global as any).testUtils.runCLI(path.resolve('ConvertToUnityPure/cliHarness.ts'), [file]);
  const j = JSON.parse(out);
  expect(j.engine).toBe('unity');
  expect(Array.isArray(j.items)).toBe(true);
});

