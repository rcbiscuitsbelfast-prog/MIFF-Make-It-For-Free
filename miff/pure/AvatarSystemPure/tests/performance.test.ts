import { isAvatarManifest } from '../schema';

test('performance metadata present and sensible in preset', ()=>{
  const data = require('../../../../presets/avatars/barbarian.json');
  expect(isAvatarManifest(data)).toBe(true);
  expect(data.performance).toBeDefined();
  expect(typeof data.performance.textureSize).toBe('string');
});

