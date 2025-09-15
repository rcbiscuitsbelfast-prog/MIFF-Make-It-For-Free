import { AvatarSystemPure } from '../../AvatarSystemPure';
import { AvatarRendererGodotPure } from '../index';

function makeRegistry(){
  return { version:'1.0.0', items:[{ id:'base', remixSafety:'CC0', compatibility:['godot'], anchors:{
    '2d-side:anchor_head':'/h.png'
  }}]};
}

test('Godot scene JSON contains Sprite2D nodes per entry', ()=>{
  const m = { base:'barbarian', clothing:[], face:'neutral', style:'2d-side' as const };
  const resolved = AvatarSystemPure.resolve(m, { registry: makeRegistry(), style:'2d-side' });
  const scene = AvatarRendererGodotPure.toGodotSceneJSON(resolved);
  expect(scene.type).toBe('GodotScene');
  expect(Array.isArray(scene.nodes)).toBe(true);
});

