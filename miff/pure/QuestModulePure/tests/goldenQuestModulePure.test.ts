import path from 'path';
import fs from 'fs';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('golden quest module flow', () => {
  const root = path.resolve(__dirname, '..');
  const quest = path.resolve(root, 'fixtures/branching.quest');
  const commands = path.resolve(root, 'tests/commands.json');
  const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [quest, commands]);
  const got = SafeJSONParser.parse(out);
  
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'parse', status: 'ok', quest: expect.objectContaining({ id: 'quest_branch' }) });
  expect(got.outputs[1]).toMatchObject({ op: 'validate', valid: true });
  expect(got.outputs[2]).toMatchObject({ op: 'list', quests: expect.arrayContaining(['quest_branch']) });
  expect(got.outputs[3]).toMatchObject({ op: 'steps', steps: expect.arrayContaining(['s1', 's2', 's3', 's4']) });
  expect(got.outputs[4]).toMatchObject({ op: 'dump', quest: expect.objectContaining({ 
    id: 'quest_branch', 
    title: 'The Forking Path',
    start: 's1'
  }) });
});