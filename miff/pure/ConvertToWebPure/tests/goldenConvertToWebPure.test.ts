import path from 'path';
import { ConvertToWebManager } from '../Manager';
import { RenderPayload } from '../../miff/pure/schema';

test('manager converts sample payload to web items', () => {
  const sample:RenderPayload = require('../../miff/pure/sample_render.json').examples.ui_rendering.unified;
  const mgr = new ConvertToWebManager();
  const out = mgr.convert(sample);
  expect(out.engine).toBe('web');
  expect(out.items.length).toBeGreaterThan(0);
  expect(out.status).toBe('ok');
});

test('CLI converts file', () => {
  const file = path.resolve('BridgeSchemaPure/sample_render.json');
  const out = (global as any).testUtils.runCLI(path.resolve('ConvertToWebPure/cliHarness.ts'), [file]);
  const j = JSON.parse(out);
  expect(j.engine).toBe('web');
  expect(Array.isArray(j.items)).toBe(true);
});

