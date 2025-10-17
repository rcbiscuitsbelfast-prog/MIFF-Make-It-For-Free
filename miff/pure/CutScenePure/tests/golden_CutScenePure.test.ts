/**
 * CutScenePure Golden Tests
 *
 * Comprehensive testing suite for the CutScenePure module including:
 * - Core functionality tests
 * - Engine and bridge tests
 * - CLI integration tests
 * - Performance tests
 * - Cross-platform compatibility tests
 * - Integration scenarios
 *
 * @module CutScenePure/tests
 * @version 1.0.0
 * @license MIT
 */

import {
  CutScenePure,
  CutSceneEngine,
  CutSceneWebBridge,
  CutSceneUnityBridge,
  CutSceneGodotBridge,
  CutSceneUnrealBridge,
  ICutSceneDefinition,
  ICutSceneTrack,
  ICutSceneAction
} from '../index';

describe('CutScenePure Golden Tests', () => {
  describe('Core Module Functionality', () => {
    test('should create valid cut scene definition', () => {
      const definition = CutScenePure.createSampleDefinition();

      expect(definition).toBeDefined();
      expect(definition.config).toBeDefined();
      expect(definition.config.id).toBeDefined();
      expect(definition.config.name).toBeDefined();
      expect(definition.config.duration).toBeGreaterThan(0);
      expect(definition.tracks).toBeDefined();
      expect(definition.actions).toBeDefined();
    });

    test('should parse and validate cut scene JSON', () => {
      const definition = CutScenePure.createSampleDefinition();
      const jsonString = CutScenePure.serializeToJSON(definition);
      const parsedDefinition = CutScenePure.parseFromJSON(jsonString);

      expect(parsedDefinition).toBeDefined();
      expect(parsedDefinition.config.id).toBe(definition.config.id);
      expect(parsedDefinition.config.name).toBe(definition.config.name);
      expect(parsedDefinition.config.duration).toBe(definition.config.duration);
      expect(parsedDefinition.tracks.length).toBe(definition.tracks.length);
      expect(parsedDefinition.actions.length).toBe(definition.actions.length);
    });

    test('should create cut scene engine from definition', () => {
      const definition = CutScenePure.createSampleDefinition();
      const engine = new CutSceneEngine(definition);

      expect(engine).toBeDefined();
      expect(engine.getDuration()).toBe(definition.config.duration);
      expect(engine.getTracks().length).toBe(definition.tracks.length);
      expect(engine.getActions().length).toBe(definition.actions.length);
    });

    test('should handle engine playback operations', () => {
      const definition = CutScenePure.createSampleDefinition();
      const engine = new CutSceneEngine(definition);

      // Test play/pause/stop operations
      engine.play();
      expect(engine.isPlaying()).toBe(true);

      engine.pause();
      expect(engine.isPlaying()).toBe(false);

      engine.stop();
      expect(engine.isPlaying()).toBe(false);
      expect(engine.getCurrentTime()).toBe(0);
    });

    test('should handle track and action management', () => {
      const definition = CutScenePure.createSampleDefinition();
      const engine = new CutSceneEngine(definition);

      // Test track access
      const tracks = engine.getTracks();
      expect(tracks.length).toBeGreaterThan(0);

      const firstTrack = engine.getTrack(tracks[0!].id);
      expect(firstTrack).toBeDefined();
      expect(firstTrack?.id).toBe(tracks[0!].id);

      // Test action access
      const actions = engine.getActions();
      if (actions.length > 0) {
        const firstAction = engine.getAction(actions[0!].id);
        expect(firstAction).toBeDefined();
        expect(firstAction?.id).toBe(actions[0!].id);
      }
    });
  });

  describe('Bridge Implementations', () => {
    test('should create WebBridge for web platform', () => {
      const definition = CutScenePure.createSampleDefinition();
      const webBridge = new CutSceneWebBridge();

      expect(webBridge).toBeDefined();

      const script = webBridge.generateCutSceneScript(definition);
      expect(script).toContain('CutSceneWebBridge');
      expect(script).toContain('playCutScene');
      expect(script).toContain('pauseCutScene');
    });

    test('should create UnityBridge for Unity platform', () => {
      const definition = CutScenePure.createSampleDefinition();
      const unityBridge = new CutSceneUnityBridge();

      expect(unityBridge).toBeDefined();

      const script = unityBridge.generateCutSceneScript(definition);
      expect(script).toContain('CutScenePlayer');
      expect(script).toContain('using UnityEngine');
      expect(script).toContain('PlayableDirector');
    });

    test('should create GodotBridge for Godot platform', () => {
      const definition = CutScenePure.createSampleDefinition();
      const godotBridge = new CutSceneGodotBridge();

      expect(godotBridge).toBeDefined();

      const script = godotBridge.generateCutSceneScript(definition);
      expect(script).toContain('extends Node');
      expect(script).toContain('CutSceneGodotPlayer');
      expect(script).toContain('func _ready');
    });

    test('should create UnrealBridge for Unreal platform', () => {
      const definition = CutScenePure.createSampleDefinition();
      const unrealBridge = new CutSceneUnrealBridge();

      expect(unrealBridge).toBeDefined();

      const header = unrealBridge.generateCutSceneHeader(definition);
      const source = unrealBridge.generateCutSceneSource(definition);

      expect(header).toContain('CutScenePlayer.generated.h');
      expect(header).toContain('UCLASS()');
      expect(source).toContain('CutScenePlayer.h');
      expect(source).toContain('PlayCutScene');
    });
  });

  describe('Advanced Features', () => {
    test('should handle branching logic', () => {
      const definition = CutScenePure.createSampleDefinition();
      definition.config.name = 'Branching Cut Scene';

      // Add conditional actions - need to add the main track first
      definition.tracks.push({
        id: 'main',
        name: 'Main Track',
        type: 'camera',
        enabled: true,
        startTime: 0,
        endTime: 5000,
        data: {}
      });

      definition.actions.push({
        id: 'branch_point',
        trackId: 'main',
        type: 'branch',
        timestamp: 1000,
        properties: {
          condition: 'player_health < 50',
          trueBranch: 'low_health_path',
          falseBranch: 'normal_path'
        }
      });

      const engine = new CutSceneEngine(definition);

      // Test branch evaluation
      const branchAction = engine.getAction('branch_point');
      expect(branchAction).toBeDefined();
      expect(branchAction?.type).toBe('branch');
    });

    test('should handle complex timing', () => {
      const definition = CutScenePure.createSampleDefinition();
      definition.config.duration = 5000;

      // Add overlapping tracks with complex timing
      definition.tracks.push(
        {
          id: 'track1',
          type: 'camera',
          name: 'Track 1',
          startTime: 0,
          endTime: 2000,
          properties: {}
        },
        {
          id: 'track2',
          type: 'dialogue',
          name: 'Track 2',
          startTime: 500,
          endTime: 1500,
          properties: {}
        },
        {
          id: 'track3',
          type: 'audio',
          name: 'Track 3',
          startTime: 1000,
          endTime: 4000,
          properties: {}
        }
      );

      const engine = new CutSceneEngine(definition);

      expect(engine.getTracks().length).toBeGreaterThan(3);

      // Test timing calculations
      const track1 = engine.getTrack('track1');
      const track2 = engine.getTrack('track2');
      const track3 = engine.getTrack('track3');

      expect(track1?.startTime).toBe(0);
      expect(track1?.endTime).toBe(2000);
      expect(track2?.startTime).toBe(500);
      expect(track2?.endTime).toBe(1500);
      expect(track3?.startTime).toBe(1000);
      expect(track3?.endTime).toBe(4000);
    });

    test('should handle track properties and inheritance', () => {
      const definition = CutScenePure.createSampleDefinition();

      // Add track with complex properties
      definition.tracks.push({
        id: 'camera_track',
        type: 'camera',
        name: 'Camera Track',
        startTime: 0,
        endTime: 2000,
        properties: {
          position: { x: 10, y: 5, z: 15 },
          rotation: { x: -10, y: 45, z: 0 },
          fov: 60,
          easing: 'ease-in-out'
        }
      });

      const engine = new CutSceneEngine(definition);
      const cameraTrack = engine.getTrack('camera_track');

      expect(cameraTrack?.properties).toBeDefined();
      expect(cameraTrack?.properties.position).toEqual({ x: 10, y: 5, z: 15 });
      expect(cameraTrack?.properties.rotation).toEqual({ x: -10, y: 45, z: 0 });
      expect(cameraTrack?.properties.fov).toBe(60);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large number of tracks efficiently', () => {
      const definition = CutScenePure.createSampleDefinition();

      // Add many tracks
      for (let i = 0; i < 100; i++) {
        definition.tracks.push({
          id: `track_${i}`,
          type: 'camera',
          name: `Track ${i}`,
          startTime: i * 100,
          endTime: (i + 1) * 100,
          properties: {
            position: { x: i * 2, y: 5, z: 10 },
            rotation: { x: 0, y: i * 3.6, z: 0 }
          }
        });
      }

      const startTime = performance.now();
      const engine = new CutSceneEngine(definition);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should initialize in < 200ms
      expect(engine.getTracks().length).toBeGreaterThan(100); // Should have original + new tracks
    });

    test('should handle many actions efficiently', () => {
      const definition = CutScenePure.createSampleDefinition();

      // Add the required main track
      definition.tracks.push({
        id: 'main',
        name: 'Main Track',
        type: 'camera',
        enabled: true,
        startTime: 0,
        endTime: 5000,
        data: {}
      });

      // Add many actions
      for (let i = 0; i < 500; i++) {
        definition.actions.push({
          id: `action_${i}`,
          trackId: 'main',
          type: 'camera_move',
          timestamp: i * 10,
          duration: 10,
          properties: {
            targetPosition: { x: i * 0.5, y: 5, z: 10 },
            easing: 'linear'
          }
        });
      }

      const startTime = performance.now();
      const engine = new CutSceneEngine(definition);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should initialize in < 100ms
      expect(engine.getActions().length).toBeGreaterThan(500);
    });

    test('should handle rapid playback operations', () => {
      const definition = CutScenePure.createSampleDefinition();
      const engine = new CutSceneEngine(definition);

      const startTime = performance.now();

      // Perform rapid operations
      for (let i = 0; i < 1000; i++) {
        engine.play();
        engine.pause();
        engine.stop();
        engine.setCurrentTime(i % definition.config.duration);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Should handle 1000 operations in < 500ms
      expect(engine.getCurrentTime()).toBeLessThan(definition.config.duration);
    });
  });

  describe('Error Handling and Validation', () => {
    test('should handle invalid definitions gracefully', () => {
      const invalidDefinitions = [
        null,
        undefined,
        {},
        { config: null },
        { config: {}, tracks: null },
        { config: {}, tracks: [], actions: null },
        { config: { duration: -100 } },
        { config: { duration: 0 } }
      ];

      invalidDefinitions.forEach((def, index) => {
        expect(() => {
          new CutSceneEngine(def as any);
        }).toThrow();
      });
    });

    test('should validate track timing', () => {
      const definition = CutScenePure.createSampleDefinition();

      // Add invalid track
      definition.tracks.push({
        id: 'invalid_track',
        type: 'camera',
        name: 'Invalid Track',
        startTime: 1000,
        endTime: 500, // End before start
        properties: {}
      });

      expect(() => {
        new CutSceneEngine(definition);
      }).toThrow('Invalid track timing');
    });

    test('should handle missing track references', () => {
      const definition = CutScenePure.createSampleDefinition();

      // Add action with invalid track reference
      definition.actions.push({
        id: 'invalid_action',
        trackId: 'nonexistent_track',
        type: 'camera_move',
        timestamp: 1000,
        properties: {}
      });

      const engine = new CutSceneEngine(definition);

      expect(() => {
        engine.getTrack('nonexistent_track');
      }).toThrow('Track not found');
    });
  });

  describe('Integration with MIFF Modules', () => {
    test('should integrate with SceneBuilderPure', () => {
      const definition = CutScenePure.createSampleDefinition();
      definition.config.name = 'Scene Integration Test';

      // Add scene-specific tracks
      definition.tracks.push(
        {
          id: 'scene_camera',
          type: 'camera',
          name: 'Scene Camera',
          startTime: 0,
          endTime: 2000,
          properties: {
            sceneId: 'warehouse_hub',
            cameraPreset: 'dramatic'
          }
        },
        {
          id: 'environment_setup',
          type: 'environment',
          name: 'Environment Setup',
          startTime: 0,
          endTime: 5000,
          properties: {
            lighting: 'dramatic',
            weather: 'clear',
            timeOfDay: 'dawn'
          }
        }
      );

      const engine = new CutSceneEngine(definition);

      expect(engine.getTracks().length).toBeGreaterThan(2);
      expect(engine.getTrack('scene_camera')).toBeDefined();
      expect(engine.getTrack('environment_setup')).toBeDefined();
    });

    test('should integrate with DialogueSystemPure', () => {
      const definition = CutScenePure.createSampleDefinition();
      definition.config.name = 'Dialogue Integration Test';

      // Add dialogue-specific tracks
      definition.tracks.push(
        {
          id: 'dialogue_track',
          type: 'dialogue',
          name: 'Main Dialogue',
          startTime: 500,
          endTime: 3000,
          properties: {
            speaker: 'Ancient Spirit',
            text: 'Welcome to RenderWorld, young tamer.',
            voice: 'wise_elder',
            emotion: 'welcoming'
          }
        },
        {
          id: 'character_animation',
          type: 'animation',
          name: 'Character Animation',
          startTime: 500,
          endTime: 3000,
          properties: {
            characterId: 'ancient_spirit',
            animation: 'talk_gesture',
            intensity: 0.7
          }
        }
      );

      const engine = new CutSceneEngine(definition);

      expect(engine.getTracks().length).toBeGreaterThan(2);
      expect(engine.getTrack('dialogue_track')).toBeDefined();
      expect(engine.getTrack('character_animation')).toBeDefined();
    });

    test('should integrate with AudioPure', () => {
      const definition = CutScenePure.createSampleDefinition();
      definition.config.name = 'Audio Integration Test';

      // Add audio-specific tracks
      definition.tracks.push(
        {
          id: 'background_music',
          type: 'audio',
          name: 'Background Music',
          startTime: 0,
          endTime: 10000,
          properties: {
            audioId: 'mystical_ambient',
            volume: 0.3,
            loop: true,
            fadeIn: 2000
          }
        },
        {
          id: 'sound_effects',
          type: 'audio',
          name: 'Sound Effects',
          startTime: 1000,
          endTime: 2000,
          properties: {
            audioId: 'portal_open',
            volume: 0.8,
            position: { x: 0, y: 0, z: 5 }
          }
        }
      );

      const engine = new CutSceneEngine(definition);

      expect(engine.getTracks().length).toBeGreaterThan(2);
      expect(engine.getTrack('background_music')).toBeDefined();
      expect(engine.getTrack('sound_effects')).toBeDefined();
    });
  });

  describe('Export and Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const definition = CutScenePure.createSampleDefinition();
      const jsonString = CutScenePure.serializeToJSON(definition);

      expect(jsonString).toBeDefined();
      expect(jsonString).toContain(definition.config.id);
      expect(jsonString).toContain(definition.config.name);

      // Verify it's valid JSON
      const parsed = JSON.parse(jsonString);
      expect(parsed.config).toBeDefined();
      expect(parsed.tracks).toBeDefined();
      expect(parsed.actions).toBeDefined();
    });

    test('should export to different formats', () => {
      const definition = CutScenePure.createSampleDefinition();

      const webBridge = new CutSceneWebBridge();
      const unityBridge = new CutSceneUnityBridge();
      const godotBridge = new CutSceneGodotBridge();
      const unrealBridge = new CutSceneUnrealBridge();

      // Test all export formats
      const webScript = webBridge.generateCutSceneScript(definition);
      const unityScript = unityBridge.generateCutSceneScript(definition);
      const godotScript = godotBridge.generateCutSceneScript(definition);
      const unrealHeader = unrealBridge.generateCutSceneHeader(definition);
      const unrealSource = unrealBridge.generateCutSceneSource(definition);

      expect(webScript).toBeDefined();
      expect(unityScript).toBeDefined();
      expect(godotScript).toBeDefined();
      expect(unrealHeader).toBeDefined();
      expect(unrealSource).toBeDefined();

      // Verify platform-specific content
      expect(webScript).toContain('CutSceneWebBridge');
      expect(unityScript).toContain('using UnityEngine');
      expect(godotScript).toContain('extends Node');
      expect(unrealHeader).toContain('UCLASS()');
      expect(unrealSource).toContain('PlayCutScene');
    });
  });
});