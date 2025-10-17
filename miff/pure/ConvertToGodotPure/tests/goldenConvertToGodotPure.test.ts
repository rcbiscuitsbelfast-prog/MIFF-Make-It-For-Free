import path from 'path';
import { ConvertToGodotManager } from '../Manager';
import { RenderPayload } from '../../BridgeSchemaPure/schema';

test('manager converts sample payload to godot items', () => {
  const sample:RenderPayload = require('../../BridgeSchemaPure/sample_render.json').examples.npc_rendering.unified;
  const mgr = new ConvertToGodotManager();
  const out = mgr.convert(sample);
  expect(out.engine).toBe('godot');
  expect(out.items.length).toBeGreaterThan(0);
  expect(out.status).toBe('ok');
});

test('CLI converts file', () => {
  const file = path.resolve('miff/pure/BridgeSchemaPure/sample_render.json');
  const out = (global as any).testUtils.runCLI(path.resolve('miff/pure/ConvertToGodotPure/cliHarness.ts'), [file]);
  const j = JSON.parse(out);
  expect(j.engine).toBe('godot');
  expect(Array.isArray(j.items)).toBe(true);
});

