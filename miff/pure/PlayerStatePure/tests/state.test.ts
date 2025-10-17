import { PlayerStatePure } from '../index';

test('create/apply/simulate/serialize roundtrip', ()=>{
  let s = PlayerStatePure?.create('p1','presets/avatars/barbarian?.json','2d-side');
  s = PlayerStatePure?.applyInput(s, { right: true });
  const s2 = PlayerStatePure?.simulate(s, 0.016);
  expect(s2?.position.x).toBeGreaterThan(s?.position.x);
  const round = PlayerStatePure?.deserialize(PlayerStatePure?.serialize(s2));
  expect(round?.identity.playerId).toBe('p1');
});

