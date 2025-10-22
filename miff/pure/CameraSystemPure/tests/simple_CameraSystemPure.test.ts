import { describe, it, expect, beforeEach } from '@jest/globals';
import { CameraSystemPure } from '../index';
import { EventBus } from '../../EventsPure/index';
import { InputMapper, InputProfile } from '../../InputPure/index';
import { RNGProvider } from '../../RNGPure/index';

describe('CameraSystemPure Simple Tests', () => {
  let cameraSystem: CameraSystemPure;
  let eventBus: EventBus;
  let inputMapper: InputMapper;
  let rng: RNGProvider;

  beforeEach(() => {
    eventBus = new EventBus();
    const profile = new InputProfile();
    inputMapper = new InputMapper(profile);
    rng = new RNGProvider(12345);
    cameraSystem = new CameraSystemPure(eventBus, inputMapper, rng);
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(cameraSystem).toBeDefined();
      expect(cameraSystem.getConfig).toBeDefined();
    });

    it('should have default configuration', () => {
      const config = cameraSystem.getConfig();
      expect(config).toBeDefined();
      expect(config.defaultMode).toBe('chase');
      expect(config.maxActiveCameras).toBe(8);
    });
  });

  describe('Camera Management', () => {
    it('should create cameras', () => {
      const camera = cameraSystem.createCamera('chase-camera', 'target-1');
      expect(camera).toBeDefined();
      expect(camera?.id).toBeDefined();
    });

    it('should handle invalid camera creation', () => {
      const camera = cameraSystem.createCamera('non-existent-camera');
      expect(camera).toBeNull();
    });
  });

  describe('Configuration', () => {
    it('should get configuration', () => {
      const config = cameraSystem.getConfig();
      expect(config).toBeDefined();
      expect(typeof config.maxActiveCameras).toBe('number');
      expect(typeof config.updateRate).toBe('number');
    });
  });

  describe('Statistics', () => {
    it('should provide statistics', () => {
      const stats = cameraSystem.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalCameras).toBe('number');
      expect(typeof stats.activeCameras).toBe('number');
    });
  });
});