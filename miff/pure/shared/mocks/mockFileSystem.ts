/**
 * Mock File System
 * 
 * Provides mock implementations for file system functionality
 * in MIFF tests.
 */

export const mockFileSystem = {
  readFileSync: jest.fn().mockImplementation((path: string) => {
    if (path.includes('npc.sample.json')) {
      return JSON.stringify({
        op: 'create',
        npcId: 'test_npc',
        name: 'Test NPC',
        position: { x: 100, y: 200 },
        stats: { health: 100, mana: 50 }
      });
    }
    if (path.includes('npc.expected.json')) {
      return JSON.stringify({
        op: 'list',
        status: 'ok',
        npcs: [{
          npcId: 'test_npc',
          name: 'Test NPC',
          position: { x: 100, y: 200 },
          stats: { health: 100, mana: 50 }
        }]
      });
    }
    return '{}';
  }),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true)
};