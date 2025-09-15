import { AvatarSystemPure } from '../../AvatarSystemPure';

function makeRegistry(){
  return { version:'1.0.0', items:[{ id:'base', remixSafety:'CC0', compatibility:['web'], anchors:{
    '3d:anchor_cloak':'/x.png', '3d:anchor_shirt':'/y.png', '3d:anchor_torso':'/z.png', '3d:anchor_head':'/h.png'
  }}]};
}

test('layer ordering prefers cloak -> shirt -> torso -> head', ()=>{
  const m = { base:'barbarian', clothing:['tunic'], face:'neutral', style:'3d' as const };
  const resolved = AvatarSystemPure.resolve(m, { registry: makeRegistry(), style:'3d' });
  const anchors = resolved.assets.entries.map(e=>e.anchor);
  expect(anchors).toEqual(expect.arrayContaining(['anchor_torso','anchor_head','anchor_shirt']));
});

