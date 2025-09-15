import { AvatarRendererGodotPure } from '../index';

test('manifestToGodotNodes maps body, clothing, face with anchors', ()=>{
  const manifest:any = {
    base: 'barbarian', style: '2d-side',
    layers: { body: 'body.png', clothing: ['tunic.png'], face: 'face.png' },
    anchor: { head: {x:16,y:4}, torso:{x:16,y:16} }
  };
  const nodes = AvatarRendererGodotPure.manifestToGodotNodes(manifest);
  expect(nodes.find(n=>n.name==='anchor_torso')?.texture).toBe('body.png');
  expect(nodes.find(n=>n.name==='anchor_head')?.texture).toBe('face.png');
});

