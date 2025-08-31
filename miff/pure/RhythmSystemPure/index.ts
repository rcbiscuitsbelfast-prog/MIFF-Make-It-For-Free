// RhythmSystemPure - beat generator and scoring

export function beats(bpm: number, count: number): number[] { const iv=60/bpm; return Array.from({length:count},(_,i)=> round((i+1)*iv)); }
export function judge(tap: number, beat: number, window=0.1): 'hit'|'miss' { return Math.abs(tap-beat)<=window? 'hit':'miss'; }
function round(n:number){ return Math.round(n*100)/100; }

