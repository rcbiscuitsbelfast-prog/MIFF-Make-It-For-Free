import path from 'path';
import fs from 'fs';

test('QuestModulePure parses branching quest', () => {
  const cli = path.resolve('cli/quest.ts');
  const file = path.resolve('systems/QuestModulePure/fixtures/branching.quest');
  const out = (global as any).testUtils.runCLI(cli, [file]);
  const j = JSON.parse(out);
  expect(j.op).toBe('parse');
  expect(j.status).toBe('ok');
  expect(j.quest.id).toBe('quest_branch');
  expect(Object.keys(j.quest.steps)).toContain('s2');
});

