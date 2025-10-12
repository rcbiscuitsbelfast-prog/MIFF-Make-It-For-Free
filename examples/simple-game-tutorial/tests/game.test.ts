/**
 * Simple Game Tutorial - Tests
 * 
 * Comprehensive test suite for the simple game tutorial.
 * This demonstrates testing patterns for MIFF Framework games.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GameManager } from '../src/GameManager';
import { Player } from '../src/Player';
import { Item } from '../src/Item';
import { Physics } from '../src/Physics';
import { EventBus } from '../../../miff/pure/EventBusPure/index';

describe('Simple Game Tutorial', () => {
  let game: GameManager;
  let eventBus: EventBus;

  beforeEach(async () => {
    eventBus = new EventBus();
    game = new GameManager({
      width: 800,
      height: 600,
      gravity: 0.5,
      playerSpeed: 5,
      maxItems: 10,
      debugMode: false
    });
    
    await game.initialize();
  });

  afterEach(async () => {
    if (game) {
      await game.destroy();
    }
  });

  describe('GameManager', () => {
    it('should initialize successfully', () => {
      expect(game).toBeDefined();
      expect(game.getState).toBeDefined();
      expect(game.getConfig).toBeDefined();
    });

    it('should start and stop the game', () => {
      expect(game.getState().isRunning).toBe(false);
      
      game.start();
      expect(game.getState().isRunning).toBe(true);
      
      game.stop();
      expect(game.getState().isRunning).toBe(false);
    });

    it('should reset the game', () => {
      game.start();
      game.handleInput('ArrowRight', true);
      
      // Let the game run for a bit
      const state1 = game.getState();
      
      game.reset();
      const state2 = game.getState();
      
      expect(state2.score).toBe(0);
      expect(state2.level).toBe(1);
      expect(state2.timeElapsed).toBe(0);
      expect(state2.items.length).toBe(5); // Initial items
    });

    it('should handle input correctly', () => {
      game.start();
      
      const initialState = game.getState();
      game.handleInput('ArrowRight', true);
      
      // Player should be moving
      expect(game.getState().player.direction).toBe('right');
    });

    it('should track game statistics', () => {
      const stats = game.getStats();
      
      expect(stats).toHaveProperty('score');
      expect(stats).toHaveProperty('level');
      expect(stats).toHaveProperty('timeElapsed');
      expect(stats).toHaveProperty('itemCount');
      expect(stats).toHaveProperty('isRunning');
    });
  });

  describe('Player', () => {
    let player: Player;

    beforeEach(() => {
      player = new Player(100, 100, eventBus);
    });

    afterEach(async () => {
      if (player) {
        await player.destroy();
      }
    });

    it('should initialize successfully', async () => {
      await player.initialize();
      expect(player).toBeDefined();
    });

    it('should handle movement input', () => {
      player.handleInput('ArrowLeft', true);
      expect(player.direction).toBe('left');
      expect(player.isMoving).toBe(true);
      
      player.handleInput('ArrowLeft', false);
      expect(player.isMoving).toBe(false);
    });

    it('should jump when on ground', () => {
      player.isOnGround = true;
      player.handleInput(' ', true);
      
      expect(player.velocityY).toBeLessThan(0);
      expect(player.isJumping).toBe(true);
    });

    it('should not jump when not on ground', () => {
      player.isOnGround = false;
      const initialVelocity = player.velocityY;
      
      player.handleInput(' ', true);
      
      expect(player.velocityY).toBe(initialVelocity);
    });

    it('should update position correctly', () => {
      const initialX = player.x;
      const initialY = player.y;
      
      player.velocityX = 5;
      player.velocityY = 3;
      player.update(16); // 16ms delta time
      
      expect(player.x).toBeGreaterThan(initialX);
      expect(player.y).toBeGreaterThan(initialY);
    });

    it('should reset to initial state', () => {
      player.x = 200;
      player.y = 200;
      player.velocityX = 10;
      player.velocityY = 10;
      
      player.reset();
      
      expect(player.x).toBe(100);
      expect(player.y).toBe(100);
      expect(player.velocityX).toBe(0);
      expect(player.velocityY).toBe(0);
    });
  });

  describe('Item', () => {
    let item: Item;

    beforeEach(() => {
      item = new Item(100, 100, 'coin', 10, eventBus);
    });

    afterEach(async () => {
      if (item) {
        await item.destroy();
      }
    });

    it('should initialize successfully', async () => {
      await item.initialize();
      expect(item).toBeDefined();
    });

    it('should fall down over time', () => {
      const initialY = item.y;
      item.update(16);
      expect(item.y).toBeGreaterThan(initialY);
    });

    it('should rotate over time', () => {
      const initialRotation = item.rotation;
      item.update(16);
      expect(item.rotation).toBeGreaterThan(initialRotation);
    });

    it('should bounce up and down', () => {
      const initialBounce = item.bounceOffset;
      item.update(16);
      expect(item.bounceOffset).not.toBe(initialBounce);
    });

    it('should be collectible', () => {
      expect(item.isCollected).toBe(false);
      expect(item.isVisible).toBe(true);
      
      item.collect();
      
      expect(item.isCollected).toBe(true);
      expect(item.isVisible).toBe(false);
    });

    it('should return correct color for type', () => {
      const coin = new Item(0, 0, 'coin', 10, eventBus);
      const gem = new Item(0, 0, 'gem', 25, eventBus);
      
      expect(coin.getColor()).toBe('#FFD700');
      expect(gem.getColor()).toBe('#FF69B4');
    });

    it('should return correct display name', () => {
      const coin = new Item(0, 0, 'coin', 10, eventBus);
      const gem = new Item(0, 0, 'gem', 25, eventBus);
      
      expect(coin.getDisplayName()).toBe('Coin');
      expect(gem.getDisplayName()).toBe('Gem');
    });
  });

  describe('Physics', () => {
    let physics: Physics;

    beforeEach(() => {
      physics = new Physics();
    });

    afterEach(async () => {
      if (physics) {
        await physics.destroy();
      }
    });

    it('should initialize successfully', async () => {
      await physics.initialize();
      expect(physics).toBeDefined();
    });

    it('should add and remove entities', () => {
      const entity = {
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        mass: 1,
        isStatic: false,
        isOnGround: false
      };
      
      physics.addEntity('test-entity', entity);
      expect(physics.getEntity('test-entity')).toBeDefined();
      
      physics.removeEntity('test-entity');
      expect(physics.getEntity('test-entity')).toBeUndefined();
    });

    it('should apply gravity to entities', () => {
      const entity = {
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        mass: 1,
        isStatic: false,
        isOnGround: false
      };
      
      physics.addEntity('test-entity', entity);
      physics.update(16);
      
      expect(entity.velocityY).toBeGreaterThan(0);
      expect(entity.y).toBeGreaterThan(100);
    });

    it('should detect collisions', () => {
      const entity1 = {
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        mass: 1,
        isStatic: false,
        isOnGround: false
      };
      
      const entity2 = {
        x: 120,
        y: 100,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        mass: 1,
        isStatic: false,
        isOnGround: false
      };
      
      physics.addEntity('entity1', entity1);
      physics.addEntity('entity2', entity2);
      
      // They should collide
      expect(entity1.x).toBeLessThan(entity2.x + entity2.width);
      expect(entity1.x + entity1.width).toBeGreaterThan(entity2.x);
    });

    it('should apply forces to entities', () => {
      const entity = {
        x: 100,
        y: 100,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        mass: 1,
        isStatic: false,
        isOnGround: false
      };
      
      physics.addEntity('test-entity', entity);
      physics.applyForce('test-entity', 10, 0);
      
      expect(entity.velocityX).toBe(10);
    });

    it('should track statistics', () => {
      const stats = physics.getStats();
      
      expect(stats).toHaveProperty('entityCount');
      expect(stats).toHaveProperty('staticCount');
      expect(stats).toHaveProperty('dynamicCount');
      expect(stats).toHaveProperty('groundLevel');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow', async () => {
      // Start game
      game.start();
      expect(game.getState().isRunning).toBe(true);
      
      // Move player
      game.handleInput('ArrowRight', true);
      expect(game.getState().player.direction).toBe('right');
      
      // Stop game
      game.stop();
      expect(game.getState().isRunning).toBe(false);
    });

    it('should handle item collection', () => {
      const initialState = game.getState();
      const initialScore = initialState.score;
      const initialItemCount = initialState.items.length;
      
      // Simulate item collection
      if (initialState.items.length > 0) {
        const item = initialState.items[0];
        item.collect();
        
        // Score should increase
        expect(game.getState().score).toBeGreaterThan(initialScore);
      }
    });

    it('should handle level progression', () => {
      const initialState = game.getState();
      const initialLevel = initialState.level;
      
      // Simulate score increase
      game.getState().score = 150; // Should trigger level up
      
      // Level should increase
      expect(game.getState().level).toBeGreaterThan(initialLevel);
    });
  });
});