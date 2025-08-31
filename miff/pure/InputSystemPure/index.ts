// InputSystemPure - map raw events to actions deterministically

export type InputEvent = { t: number; type: 'key'|'tap'; key?: string };
export type Action = 'jump'|'attack'|'interact'|'pause';
export type Binding = { type:'key'|'tap'; code: string; action: Action };

export function mapInputs(events: InputEvent[], bindings: Binding[]): { op:'input.map'; status:'ok'; actions: Array<{ t:number; action: Action }>; debug?: any }{
	const out: Array<{t:number; action: Action}> = [];
	for(const e of events){
		const b = bindings.find(b=> b.type===e.type && b.code=== (e.key||''));
		if(b) out.push({ t: e.t, action: b.action });
	}
	return { op:'input.map', status:'ok', actions: out, debug: { mapped: out.length } };
}

export function resetAfterVisualEvent(): { op:'input.reset'; status:'ok'; cursor: 'idle' }{
	return { op: 'input.reset', status: 'ok', cursor: 'idle' };
}

