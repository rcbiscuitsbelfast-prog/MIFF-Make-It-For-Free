import path from 'path';
import fs from 'fs';

test('golden resolveRefs output', () => {
	const root = path.resolve(__dirname, '..');
	const links = path.resolve(root, 'sample_links.json');
	const extern = path.resolve(root, 'sample_extern.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [links, extern, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  // Expect a single resolveRefs result with structured data
  expect(got.outputs[0].op).toBe('resolveRefs');
  expect(got.outputs[0].status).toBe('error');
  expect(got.outputs[0].resolvedRefs).toMatchObject({
    'equip:sword:item': { ok: false },
    'npc:bob:quest': { ok: true, target: 'q1' },
    'place:townGate:zone': { ok: true, target: 'z_town' }
  });
  expect(got.outputs[0].issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: 'missing_item', ref: 'itm_sword' })
    ])
  );
});