import path from 'path';
import fs from 'fs';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('golden quest flow', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const npc = path.resolve(root, 'sample_quest_npc.json');
  const out = (global as any).testUtils.runCLI(harness, [npc, '1234']);
  const got = SafeJSONParser.parse(out);
  // Deterministic assertions
  expect(got.seed).toBe(1234);
  expect(got.quests).toEqual([
    { id: 'fetch_item', step: 1, status: 'Completed' }
  ]);
  expect(got.log).toEqual([
    'NPC: Hello, can you help me?',
    'NPC: Find the lost item.',
    'QUEST: fetch_item -> step=0 status=Active',
    'NPC: Have you found it?',
    'QUEST: fetch_item -> step=1 status=Active',
    'NPC: Thank you!',
    'QUEST: fetch_item -> step=1 status=Completed'
  ]);
});