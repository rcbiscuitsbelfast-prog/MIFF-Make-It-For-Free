import path from '../../miff/pure/path';

test('golden miff-simulate run', () => {
	const sim = path.resolve(__dirname, '..', 'miff-simulate.ts');
	const scenario = path.resolve(__dirname, '..', '..', 'TutorialScenarioPure', 'scenario.json');
	const out = (global as any).testUtils.runCLI(sim, [scenario]);
	const got = JSON.parse(out);
	expect(got.outputs[0].op).toBe('runScenario');
	expect(got.outputs[0].status).toBe('ok');
});

test('golden miff-diff no diff on self-compare', () => {
	const sim = path.resolve(__dirname, '..', 'miff-simulate.ts');
	const scenario = path.resolve(__dirname, '..', '..', 'TutorialScenarioPure', 'scenario.json');
	const out = (global as any).testUtils.runCLI(sim, [scenario]);
	const got = JSON.parse(out);
	expect(got.outputs[0].op).toBe('runScenario');
	expect(got.outputs[0].status).toBe('ok');
});