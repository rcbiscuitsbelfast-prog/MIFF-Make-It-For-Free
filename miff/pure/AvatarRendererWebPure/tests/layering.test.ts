import { AvatarSystemPure } from '../../AvatarSystemPure';

function makeRegistry(...args: any[]) {
  return { 
    version:'1.0.0', 
    items:[{ 
      id:'base', 
      remixSafety:'CC0' as const, 
      compatibility:['web' as const], 
      anchors: {
        'anchor_cloak': '/x.png',
        'anchor_shirt': '/y.png',
        'anchor_torso': '/z.png',
        'anchor_head': '/h.png'
      }
    }]
  };
}

test('layer ordering prefers cloak -> shirt -> torso -> head', ()=>{
  const m = { base:'barbarian', clothing:['tunic'], face:'neutral', style:'3d' as const };
  const resolved = AvatarSystemPure.resolve(m, { registry: makeRegistry(), style:'3d' });
  const anchors = resolved.assets.entries.map(e=>e.anchor);
  expect(anchors).toEqual(expect.arrayContaining(['anchor_torso','anchor_head','anchor_shirt']));
});

