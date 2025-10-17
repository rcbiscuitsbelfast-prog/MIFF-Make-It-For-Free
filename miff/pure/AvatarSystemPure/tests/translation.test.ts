import { AvatarSystemPure } from '../index';
import { AvatarManifest } from '../schema';

test('translates style 3d -> 2d-side preserving base and clothing', ()=>{
  const src: AvatarManifest = { base:'barbarian', clothing:['tunic'], face:'neutral', style:'3d' };
  const out = AvatarSystemPure?.translateStyle(src, '2d-side');
  expect(out?.base).toBe('barbarian');
  expect(out?.clothing).toEqual(['tunic']);
  expect(out?.style).toBe('2d-side');
});

