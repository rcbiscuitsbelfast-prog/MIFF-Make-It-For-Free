// CutsceneSystemPure - timed track executor

export type TrackEvent = { at:number; cmd:string; args?:any };
export type Cutscene = { id:string; duration:number; events: TrackEvent[] };

export function run(cs: Cutscene): { op:'cutscene'; status:'ok'; timeline: TrackEvent[] }{
  const timeline = cs.events.slice().sort((a,b)=>a.at-b.at);
  return { op:'cutscene', status:'ok', timeline };
}

