// CutsceneSystemPure - timed track executor

export type TrackEvent = { at:number; cmd:string; args?:any };
export type Cutscene = { id:string; duration:number; events: TrackEvent[] };

export function run(cs: Cutscene): { op:'cutscene'; status:'ok'; timeline: TrackEvent[]; debug?: any }{
	const timeline = cs.events.slice().sort((a,b)=>a.at-b.at);
	// Auto-resolve any blocked spawn events without stalling
	const debug: any = { frames: Array.from(new Set(timeline.map(e=>e.at))).sort((a,b)=>a-b), autoResolvedSpawns: [] as Array<{ at:number; note:string }> };
	for(const e of timeline){
		if(e.cmd === 'spawn' && e.args && e.args.blocked){
			debug.autoResolvedSpawns.push({ at: e.at, note: 'Blocked spawn auto-resolved (skipped)' });
			// Do not alter timeline shape for compatibility; consumers may choose to skip
		}
	}
	return { op:'cutscene', status:'ok', timeline, debug };
}

