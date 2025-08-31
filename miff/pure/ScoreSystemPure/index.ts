// ScoreSystemPure - simple deterministic score accumulator

export type ScoreEvent = { type: 'add' | 'mult'; value: number };
export type ScoreState = { score: number };

export function apply(state: ScoreState, events: ScoreEvent[]): { op:'score'; status:'ok'; result: ScoreState }{
  let s = state.score;
  for(const e of events){
    if(e.type==='add') s += e.value;
    else if(e.type==='mult') s = Math.round(s * e.value);
  }
  return { op:'score', status:'ok', result: { score: s } };
}

