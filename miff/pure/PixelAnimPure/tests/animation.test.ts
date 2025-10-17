import { PixelAnimPure } from '../index';

describe('PixelAnimPure', () => {
  test('creates animation with correct structure', () => {
    const frames = ['walk1.png', 'walk2.png', 'walk3.png'];
    const anim = PixelAnimPure.createAnimation('walk', frames, 12, true);
    
    expect(anim).toMatchObject({
      name: 'walk',
      frames: [
        { frame: 0, duration: 1000/12, layer: 'walk1.png' },
        { frame: 1, duration: 1000/12, layer: 'walk2.png' },
        { frame: 2, duration: 1000/12, layer: 'walk3.png' }
      ],
      loop: true,
      speed: 12
    });
  });

  test('creates sprite sheet with correct dimensions', () => {
    const walkAnim = PixelAnimPure.createAnimation('walk', ['w1.png', 'w2.png'], 8);
    const idleAnim = PixelAnimPure.createAnimation('idle', ['i1.png'], 4);
    const spriteSheet = PixelAnimPure.createSpriteSheet([walkAnim, idleAnim], 16, 16);
    
    expect(spriteSheet).toMatchObject({
      width: 16 * 3, // 3 unique layers
      height: 16,
      frameWidth: 16,
      frameHeight: 16,
      layers: ['w1.png', 'w2.png', 'i1.png']
    });
  });

  test('exports animation with correct schema', () => {
    const frames = ['idle1.png'];
    const anim = PixelAnimPure.createAnimation('idle', frames, 4, false);
    const exported = PixelAnimPure.exportAnimation(anim);
    
    expect(exported).toMatchObject({
      schema: 'miff.pixel.animation.v1',
      name: 'idle',
      frames: expect.any(Array),
      loop: false,
      speed: 4
    });
  });

  test('exports sprite sheet with correct schema', () => {
    const anim = PixelAnimPure.createAnimation('test', ['t1.png'], 8);
    const spriteSheet = PixelAnimPure.createSpriteSheet([anim!], 32, 32);
    const exported = PixelAnimPure.exportSpriteSheet(spriteSheet);
    
    expect(exported).toMatchObject({
      schema: 'miff.pixel.spritesheet.v1',
      width: 32,
      height: 32,
      frameWidth: 32,
      frameHeight: 32,
      layers: ['t1.png']
    });
  });
});