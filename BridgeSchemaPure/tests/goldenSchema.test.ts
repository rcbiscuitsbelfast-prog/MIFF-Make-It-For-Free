import { BridgeSchemaValidator, RenderData, RenderPayload, RenderDataType } from '../schema';
import fs from 'fs';
import path from 'path';

describe('BridgeSchemaPure Golden Tests', () => {
  const samplePath = path.resolve('BridgeSchemaPure/sample_render.json');

  beforeAll(() => {
    expect(fs.existsSync(samplePath)).toBe(true);
  });

  describe('Schema Validation', () => {
    test('✓ validates correct RenderData', () => {
      const validData: RenderData = {
        id: 'test_sprite',
        type: 'sprite',
        position: { x: 100, y: 200 },
        asset: 'test.png',
        props: { texture: 'test.png' }
      };

      const issues = BridgeSchemaValidator.validateRenderData(validData);
      expect(issues).toHaveLength(0);
    });

    test('✓ validates correct RenderPayload', () => {
      const validPayload: RenderPayload = {
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'test_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'test.png'
          }
        ]
      };

      const issues = BridgeSchemaValidator.validateRenderPayload(validPayload);
      expect(issues).toHaveLength(0);
    });

    test('✓ catches invalid render type', () => {
      const invalidData: any = {
        id: 'test_sprite',
        type: 'invalid_type',
        position: { x: 100, y: 200 }
      };

      const issues = BridgeSchemaValidator.validateRenderData(invalidData);
      expect(issues).toContain('Invalid render type: invalid_type'); // message comes raw from validateRenderData
    });

    test('✓ catches missing required fields', () => {
      const invalidData: any = {
        type: 'sprite',
        position: { x: 100, y: 200 }
      };

      const issues = BridgeSchemaValidator.validateRenderData(invalidData);
      expect(issues).toContain('RenderData must have an id');
    });

    test('✓ catches invalid position data', () => {
      const invalidData: any = {
        id: 'test_sprite',
        type: 'sprite',
        position: { x: 'not_a_number', y: 200 }
      };

      const issues = BridgeSchemaValidator.validateRenderData(invalidData);
      expect(issues).toContain('Position x and y must be numbers');
    });

    test('✓ validates nested children', () => {
      const dataWithChildren: RenderData = {
        id: 'parent',
        type: 'node',
        children: [
          {
            id: 'child',
            type: 'sprite',
            position: { x: 0, y: 0 }
          }
        ]
      };

      const issues = BridgeSchemaValidator.validateRenderData(dataWithChildren);
      expect(issues).toHaveLength(0);
    });

    test('✓ catches invalid children', () => {
      const dataWithInvalidChildren: any = {
        id: 'parent',
        type: 'node',
        children: 'not_an_array'
      };

      const issues = BridgeSchemaValidator.validateRenderData(dataWithInvalidChildren);
      expect(issues).toContain('Children must be an array');
    });

    test('✓ validates signals', () => {
      const dataWithSignals: RenderData = {
        id: 'test_sprite',
        type: 'sprite',
        signals: [
          {
            name: 'click',
            parameters: ['event'],
            connectedTo: ['handler']
          }
        ]
      };

      const issues = BridgeSchemaValidator.validateRenderData(dataWithSignals);
      expect(issues).toHaveLength(0);
    });

    test('✓ catches invalid signals', () => {
      const dataWithInvalidSignals: any = {
        id: 'test_sprite',
        type: 'sprite',
        signals: 'not_an_array'
      };

      const issues = BridgeSchemaValidator.validateRenderData(dataWithInvalidSignals);
      expect(issues).toContain('Signals must be an array');
    });
  });

  describe('Engine Conversions', () => {
    test('✓ converts Unity data to RenderData', () => {
      const unityData = {
        id: 'npc_001',
        gameObject: 'GameObject_npc_001',
        transform: {
          position: { x: 640, y: 960, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rotation: { x: 0, y: 0, z: 0 }
        },
        componentType: 'NPCController',
        prefab: 'NPCPrefab',
        components: {
          npc_id: 'npc_001',
          behavior_type: 'quest_giver'
        }
      };

      const renderData = BridgeSchemaValidator.convertFromUnity(unityData);
      
      expect(renderData.id).toBe('npc_001');
      expect(renderData.type).toBe('component');
      expect(renderData.position).toEqual({ x: 640, y: 960, z: 0 });
      expect(renderData.engineHints?.unity?.gameObject).toBe('GameObject_npc_001');
      expect(renderData.engineHints?.unity?.component).toBe('NPCController');
    });

    test('✓ converts Web data to RenderData', () => {
      const webData = {
        id: 'npc_001',
        type: 'sprite',
        x: 640,
        y: 960,
        width: 32,
        height: 32,
        texture: 'npc_sprite.png',
        properties: {
          npc_id: 'npc_001',
          behavior_type: 'quest_giver'
        }
      };

      const renderData = BridgeSchemaValidator.convertFromWeb(webData);
      
      expect(renderData.id).toBe('npc_001');
      expect(renderData.type).toBe('sprite');
      expect(renderData.position).toEqual({ x: 640, y: 960 });
      expect(renderData.scale).toEqual({ x: 32, y: 32 });
      expect(renderData.asset).toBe('npc_sprite.png');
    });

    test('✓ converts Godot data to RenderData', () => {
      const godotData = {
        id: 'npc_001',
        type: 'Node2D',
        name: 'Guard Captain Marcus',
        position: { x: 640, y: 960 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        texture: 'npc_sprite.png',
        properties: {
          npc_id: 'npc_001',
          behavior_type: 'quest_giver'
        }
      };

      const renderData = BridgeSchemaValidator.convertFromGodot(godotData);
      
      expect(renderData.id).toBe('npc_001');
      expect(renderData.type).toBe('node');
      expect(renderData.name).toBe('Guard Captain Marcus');
      expect(renderData.position).toEqual({ x: 640, y: 960 });
      expect(renderData.asset).toBe('npc_sprite.png');
      expect(renderData.engineHints?.godot?.node).toBe('Node2D');
    });

    test('✓ converts RenderData to Unity format', () => {
      const renderData: RenderData = {
        id: 'npc_001',
        type: 'sprite',
        name: 'Test NPC',
        position: { x: 640, y: 960, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        asset: 'npc_sprite.png',
        props: { npc_id: 'npc_001' },
        signals: [
          {
            name: 'npc_interacted',
            parameters: ['player_id'],
            connectedTo: ['QuestSystem'],
            engine: 'unity'
          }
        ]
      };

      const unityData = BridgeSchemaValidator.convertToUnity(renderData);
      
      expect(unityData.id).toBe('npc_001');
      expect(unityData.gameObject).toBe('Test NPC');
      expect(unityData.componentType).toBe('SpriteRenderer');
      expect(unityData.transform.position).toEqual({ x: 640, y: 960, z: 0 });
      expect(unityData.signals).toHaveLength(1);
      expect(unityData.signals[0].name).toBe('npc_interacted');
    });

    test('✓ converts RenderData to Web format', () => {
      const renderData: RenderData = {
        id: 'npc_001',
        type: 'sprite',
        name: 'Test NPC',
        position: { x: 640, y: 960 },
        scale: { x: 32, y: 32 },
        asset: 'npc_sprite.png',
        props: { npc_id: 'npc_001' },
        signals: [
          {
            name: 'click',
            parameters: ['event'],
            connectedTo: ['handler'],
            engine: 'web'
          }
        ]
      };

      const webData = BridgeSchemaValidator.convertToWeb(renderData);
      
      expect(webData.id).toBe('npc_001');
      expect(webData.type).toBe('sprite');
      expect(webData.x).toBe(640);
      expect(webData.y).toBe(960);
      expect(webData.width).toBe(32);
      expect(webData.height).toBe(32);
      expect(webData.events).toHaveLength(1);
      expect(webData.events[0].name).toBe('click');
    });

    test('✓ converts RenderData to Godot format', () => {
      const renderData: RenderData = {
        id: 'npc_001',
        type: 'sprite',
        name: 'Test NPC',
        position: { x: 640, y: 960 },
        scale: { x: 1, y: 1 },
        rotation: { x: 0, y: 0, z: 45 },
        asset: 'npc_sprite.png',
        props: { npc_id: 'npc_001' },
        signals: [
          {
            name: 'npc_interacted',
            parameters: ['player_id'],
            connectedTo: ['QuestSystem'],
            engine: 'godot'
          }
        ]
      };

      const godotData = BridgeSchemaValidator.convertToGodot(renderData);
      
      expect(godotData.id).toBe('npc_001');
      expect(godotData.type).toBe('Sprite');
      expect(godotData.name).toBe('Test NPC');
      expect(godotData.position).toEqual({ x: 640, y: 960 });
      expect(godotData.rotation).toBe(45);
      expect(godotData.signals).toHaveLength(1);
      expect(godotData.signals[0].name).toBe('npc_interacted');
    });
  });

  describe('Sample Data Validation', () => {
    test('✓ validates sample render data from file', () => {
      const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
      
      // Test NPC rendering example
      const npcPayload = sampleData.examples.npc_rendering.unified;
      const npcIssues = BridgeSchemaValidator.validateRenderPayload(npcPayload);
      expect(npcIssues).toHaveLength(0);

      // Test combat rendering example
      const combatPayload = sampleData.examples.combat_rendering.unified;
      const combatIssues = BridgeSchemaValidator.validateRenderPayload(combatPayload);
      expect(combatIssues).toHaveLength(0);

      // Test UI rendering example
      const uiPayload = sampleData.examples.ui_rendering.unified;
      const uiIssues = BridgeSchemaValidator.validateRenderPayload(uiPayload);
      expect(uiIssues).toHaveLength(0);
    });

    test('✓ validates engine conversion examples', () => {
      const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
      
      // Test Unity conversion
      const unityExample = sampleData.engine_conversions.unity_example;
      const unityRenderData = BridgeSchemaValidator.convertFromUnity(unityExample.unity_data);
      const unityIssues = BridgeSchemaValidator.validateRenderData(unityRenderData);
      expect(unityIssues).toHaveLength(0);

      // Test Web conversion
      const webExample = sampleData.engine_conversions.web_example;
      const webRenderData = BridgeSchemaValidator.convertFromWeb(webExample.web_data);
      const webIssues = BridgeSchemaValidator.validateRenderData(webRenderData);
      expect(webIssues).toHaveLength(0);

      // Test Godot conversion
      const godotExample = sampleData.engine_conversions.godot_example;
      const godotRenderData = BridgeSchemaValidator.convertFromGodot(godotExample.godot_data);
      const godotIssues = BridgeSchemaValidator.validateRenderData(godotRenderData);
      expect(godotIssues).toHaveLength(0);
    });

    test('✓ validates validation examples', () => {
      const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
      
      // Test valid payload
      const validPayload = sampleData.validation_examples.valid_payload;
      const validIssues = BridgeSchemaValidator.validateRenderPayload(validPayload);
      expect(validIssues).toHaveLength(0);

      // Test invalid payload
      const invalidPayload = sampleData.validation_examples.invalid_payload;
      const invalidIssues = BridgeSchemaValidator.validateRenderPayload(invalidPayload);
      expect(invalidIssues.length).toBeGreaterThan(0);
      expect(invalidIssues).toContain('RenderData 0: Invalid render type: invalid_type');
      expect(invalidIssues).toContain('RenderData 0: Position x and y must be numbers');
    });
  });

  describe('Type Mapping', () => {
    test('✓ maps all render types correctly', () => {
      const testCases: Array<{ input: any; expected: RenderDataType; engine: string }> = [
        // Unity mappings
        { input: { componentType: 'Transform' }, expected: 'node', engine: 'unity' },
        { input: { componentType: 'SpriteRenderer' }, expected: 'sprite', engine: 'unity' },
        { input: { componentType: 'TextMesh' }, expected: 'text', engine: 'unity' },
        { input: { componentType: 'AudioSource' }, expected: 'sound', engine: 'unity' },
        { input: { componentType: 'Animator' }, expected: 'animation', engine: 'unity' },
        
        // Web mappings
        { input: { type: 'sprite' }, expected: 'sprite', engine: 'web' },
        { input: { type: 'text' }, expected: 'text', engine: 'web' },
        { input: { type: 'audio' }, expected: 'sound', engine: 'web' },
        { input: { type: 'animation' }, expected: 'animation', engine: 'web' },
        { input: { type: 'container' }, expected: 'node', engine: 'web' },
        
        // Godot mappings
        { input: { type: 'Sprite' }, expected: 'sprite', engine: 'godot' },
        { input: { type: 'Label' }, expected: 'text', engine: 'godot' },
        { input: { type: 'AudioStreamPlayer' }, expected: 'sound', engine: 'godot' },
        { input: { type: 'AnimationPlayer' }, expected: 'animation', engine: 'godot' },
        { input: { type: 'Node2D' }, expected: 'node', engine: 'godot' }
      ];

      testCases.forEach(({ input, expected, engine }) => {
        let renderData: RenderData;
        
        switch (engine) {
          case 'unity':
            renderData = BridgeSchemaValidator.convertFromUnity(input);
            break;
          case 'web':
            renderData = BridgeSchemaValidator.convertFromWeb(input);
            break;
          case 'godot':
            renderData = BridgeSchemaValidator.convertFromGodot(input);
            break;
          default:
            throw new Error(`Unknown engine: ${engine}`);
        }
        
        expect(renderData.type).toBe(expected);
      });
    });
  });

  describe('Signal Filtering', () => {
    test('✓ filters signals by engine when converting', () => {
      const renderData: RenderData = {
        id: 'test',
        type: 'sprite',
        signals: [
          { name: 'unity_signal', engine: 'unity' },
          { name: 'web_signal', engine: 'web' },
          { name: 'godot_signal', engine: 'godot' },
          { name: 'universal_signal' } // No engine specified
        ]
      };

      const unityData = BridgeSchemaValidator.convertToUnity(renderData);
      expect(unityData.signals).toHaveLength(1); // Only unity_signal
      expect(unityData.signals?.map(s => s.name)).toContain('unity_signal');

      const webData = BridgeSchemaValidator.convertToWeb(renderData);
      expect(webData.events).toHaveLength(1); // Only web_signal
      expect(webData.events?.map(s => s.name)).toContain('web_signal');

      const godotData = BridgeSchemaValidator.convertToGodot(renderData);
      expect(godotData.signals).toHaveLength(1); // Only godot_signal
      expect(godotData.signals?.map(s => s.name)).toContain('godot_signal');
    });
  });
});