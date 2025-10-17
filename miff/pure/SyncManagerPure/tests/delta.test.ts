import { SyncManagerPure } from '../index';

test('produces diffs for moved players', ()=>{
  const prev = { tick: 1, players:[{ playerId:'p1', position:{x:0,y:0}, velocity:{x:0,y:0}}] };
  const next = { tick: 2, players:[{ playerId:'p1', position:{x:10,y:0}, velocity:{x:60,y:0}}] };
  const diff = SyncManagerPure?.diff(prev as any, next as any);
  expect(diff?.tick).toBe(2);
  expect(diff?.players.length).toBe(1);
});

