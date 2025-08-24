export function runGolden(testId: string): { op:'test.golden'; status:'ok'; id:string; summary:string }{
	return { op:'test.golden', status:'ok', id:testId, summary:`Golden ${testId} executed (simulated)` };
}

export function replayFixture(fixturePath: string): { op:'test.replay'; status:'ok'; fixture:string }{
	return { op:'test.replay', status:'ok', fixture: fixturePath };
}