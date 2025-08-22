import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden miff-simulate run', () => {
	const sim = path.resolve(__dirname, '..', 'miff-simulate.ts');
	const scenario = path.resolve(__dirname, '..', '..', 'TutorialScenarioPure', 'scenario.json');
	const out = execFileSync('node', [sim, scenario], { encoding: 'utf-8' });
	const got = JSON.parse(out);
	expect(got.outputs[0].op).toBe('runScenario');
	expect(got.outputs[0].status).toBe('ok');
});

test('golden miff-diff no diff on self-compare', () => {
	const sim = path.resolve(__dirname, '..', 'miff-simulate.ts');
	const diff = path.resolve(__dirname, '..', 'miff-diff.ts');
	const scenario = path.resolve(__dirname, '..', '..', 'TutorialScenarioPure', 'scenario.json');
	const out1 = execFileSync('node', [sim, scenario], { encoding: 'utf-8' });
	const tmp1 = path.resolve(__dirname, 'out1.json');
	fs.writeFileSync(tmp1, out1);
	const out2 = execFileSync('node', [diff, tmp1, tmp1], { encoding: 'utf-8' });
	const got = JSON.parse(out2);
	expect(got.outputs[0].op).toBe('diff');
	expect(got.outputs[0].events.length).toBe(0);
	expect(got.outputs[0].finalState.length).toBe(0);
});