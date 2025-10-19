import { describe, it, expect } from '@jest/globals';
import { ZoneServerPure } from './index';

describe('ZoneServerPure', () => {
  describe('Zone Server Creation', () => {
    it('should create zone server with zone config', () => {
      const server = new ZoneServerPure({ zone: 'test-zone' });

      expect(server).toBeDefined();
    });

    it('should initialize with default settings', () => {
      const server = new ZoneServerPure({ zone: 'default' });

      expect(server).toBeDefined();
    });
  });

  describe('Player Management', () => {
    it('should add player to zone', () => {
      const server = new ZoneServerPure({ zone: 'test' });
      const player = {
        playerId: 'player1',
        name: 'Test Player',
        position: { x: 0, y: 0 }
      };

      server.addPlayer(player);
      expect(server).toBeDefined();
    });

    it('should remove player from zone', () => {
      const server = new ZoneServerPure({ zone: 'test' });
      const player = { playerId: 'player1', name: 'Player', position: { x: 0, y: 0 } };

      server.addPlayer(player);
      server.removePlayer('player1');

      expect(server).toBeDefined();
    });

    it('should get player count', () => {
      const server = new ZoneServerPure({ zone: 'test' });
      
      server.addPlayer({ playerId: 'p1', name: 'P1', position: { x: 0, y: 0 } });
      server.addPlayer({ playerId: 'p2', name: 'P2', position: { x: 10, y: 10 } });

      const count = server.getPlayerCount();
      expect(count).toBe(2);
    });
  });

  describe('Zone State', () => {
    it('should tick server and update state', () => {
      const server = new ZoneServerPure({ zone: 'test' });
      
      server.tick();
      expect(server).toBeDefined();
    });

    it('should get zone snapshot', () => {
      const server = new ZoneServerPure({ zone: 'test' });
      server.addPlayer({ playerId: 'p1', name: 'P1', position: { x: 0, y: 0 } });

      const snapshot = server.getSnapshot();
      expect(Array.isArray(snapshot)).toBe(true);
    });
  });
});
