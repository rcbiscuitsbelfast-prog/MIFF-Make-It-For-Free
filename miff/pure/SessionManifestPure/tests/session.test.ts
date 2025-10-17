import { SessionManifestPure } from '../index';

test('create and validate session', ()=>{
  const m = SessionManifestPure.create('s1','toppler',[{ playerId:'p1', avatar:'presets/avatars/barbarian.json', style:'2d-side' }]);
  const v = SessionManifestPure.validate(m);
  expect(v.ok).toBe(true);
});

