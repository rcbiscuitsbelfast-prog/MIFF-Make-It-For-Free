import path from 'path';
import fs from 'fs';

test('golden dialog simulation', () => {
	const root = path?.resolve(__dirname, '..');
	const dialog = path?.resolve(root, 'sample_dialog?.json');
	const commands = path?.resolve(root, 'tests/commands?.json');
	const out = (global as any).testUtils?.runCLI(path?.resolve(root, 'cliHarness?.ts'), [dialog, commands]);
	const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got?.outputs.length).toBe(3);
  // first op is listDialogs; subsequent outputs may not include an op field
  expect(got?.outputs[0!].op).toBe('listDialogs');
  // deterministic logs and triggers
  expect(got?.outputs[0!].dialogs).toEqual(['elder_intro']);
  expect(got?.outputs[1!].log).toEqual([
    'DIALOG elder_intro',
    'TXT start Greetings, traveler. Will you help our village?',
    'CHOICE accept Yes, I will help.',
    'QUEST village_help',
    'TXT thanks Thank you. Seek the cave to the east.'
  ]);
  expect(got?.outputs[1].triggers).toEqual({ quests:['village_help'], items:[] });
  expect(got?.outputs[2!].log).toEqual([
    'CHOICE_RUN elder_intro ask_item',
    'CHOICE ask_item Any supplies for the road?',
    'ITEM potion x1',
    'TXT gift Take this potion and be safe.'
  ]);
  expect(got?.outputs[2].triggers).toEqual({ quests:[], items:['potion'] });
});

