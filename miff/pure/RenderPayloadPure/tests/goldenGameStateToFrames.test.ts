import { generateRenderPayload, GameState } from '../GameStateToFrames';

test('generateRenderPayload produces deterministic frames', () => {
  const gameState: GameState = {
    frames: [
      {
        camera: { x: 0, y: 0, zoom: 1 },
        backgroundColor: '#101820',
        entities: [
          { id: 'e1', x: 10, y: 5, spriteId: 'hero', layer: 1 },
          { id: 'e2', x: -3.456, y: 2.2222, spriteId: 'npc', layer: 0 },
          { id: 'e3', x: 0, y: 0, spriteId: 'tree' }
        ]
      },
      {
        camera: { x: 5.1, y: -2 },
        entities: [
          { id: 'e1', x: 12.49, y: 5.01, spriteId: 'hero', layer: 1 },
          { id: 'e2', x: -2.99, y: 2.88, spriteId: 'npc', layer: 0 },
          { id: 'e4', x: 20, y: -1, spriteId: 'rock', layer: 2 }
        ]
      }
    ]
  };

  const frames = generateRenderPayload(gameState);

  expect(frames).toEqual([
    {
      frameIndex: 0,
      sprites: [
        { id: 'npc', x: -3.46, y: 2.22, layer: 0 },
        { id: 'tree', x: 0, y: 0 },
        { id: 'hero', x: 10, y: 5, layer: 1 }
      ],
      camera: { x: 0, y: 0, zoom: 1 },
      backgroundColor: '#101820'
    },
    {
      frameIndex: 1,
      sprites: [
        { id: 'npc', x: -2.99, y: 2.88, layer: 0 },
        { id: 'hero', x: 12.49, y: 5.01, layer: 1 },
        { id: 'rock', x: 20, y: -1, layer: 2 }
      ],
      camera: { x: 5.1, y: -2 }
    }
  ]);
});

