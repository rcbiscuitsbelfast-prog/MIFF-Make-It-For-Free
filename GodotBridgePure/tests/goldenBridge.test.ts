import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

describe('GodotBridgePure Golden Tests', () => {
  const cliPath = path.resolve('GodotBridgePure/cliHarness.ts');
  const samplePath = path.resolve('GodotBridgePure/sample_bridge.json');

  beforeAll(() => {
    // Ensure test files exist
    expect(fs.existsSync(cliPath)).toBe(true);
    expect(fs.existsSync(samplePath)).toBe(true);
  });

  test('✓ simulate NPCs returns expected Godot render data', () => {
    // Create test data file
    const testData = {
      npcId: 'npc_001',
      duration: 3600
    };
    const testFile = path.resolve('GodotBridgePure/test_npc_sim.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'simulate',
        'npcs',
        testFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('simulate');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(result.renderData.nodes).toBeDefined();
      expect(result.renderData.scripts).toBeDefined();
      expect(result.renderData.scenes).toBeDefined();
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ render NPCs returns expected Godot nodes', () => {
    // Create test render data
    const testData = {
      zoneId: 'zone_village',
      includeQuests: true
    };
    const testFile = path.resolve('GodotBridgePure/test_npc_render.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'render',
        'npcs',
        testFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('render');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(Array.isArray(result.renderData.nodes)).toBe(true);
      expect(Array.isArray(result.renderData.resources)).toBe(true);
      expect(Array.isArray(result.renderData.scripts)).toBe(true);
      expect(Array.isArray(result.renderData.scenes)).toBe(true);
      expect(Array.isArray(result.renderData.animations)).toBe(true);
      expect(Array.isArray(result.renderData.inputs)).toBe(true);
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ interop with Godot NPC data', () => {
    // Create test Godot data
    const testData = {
      id: 'npc_001',
      data: {
        position: { x: 15, y: 20 },
        stats: [{ key: 'health', base: 95 }],
        questIds: ['quest_tutorial', 'quest_side_quest']
      }
    };
    const testFile = path.resolve('GodotBridgePure/test_godot_npc.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'interop',
        'npcs',
        testFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('interop');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ dump module bridge info', () => {
    const output = execFileSync('npx', [
      'ts-node',
      '--compiler-options', '{"module":"commonjs"}',
      cliPath,
      'dump',
      'npcs'
    ], { encoding: 'utf-8' });

    const result = JSON.parse(output);
    expect(result.op).toBe('dump');
    expect(result.status).toBe('ok');
    expect(result.renderData).toBeDefined();
  });

  test('✓ simulate combat with Godot bridge', () => {
    // Create test combat data
    const testData = {
      attacker: {
        id: 'player_001',
        stats: [{ key: 'strength', base: 20 }]
      },
      defender: {
        id: 'enemy_001',
        stats: [{ key: 'health', base: 100 }]
      }
    };
    const testFile = path.resolve('GodotBridgePure/test_combat_sim.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'simulate',
        'combat',
        testFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('simulate');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(result.renderData.nodes).toBeDefined();
      expect(result.renderData.scenes).toContain('CombatScene.tscn');
      expect(result.renderData.scripts).toContain('res://scripts/CombatController.gd');
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ render UI with Godot bridge', () => {
    // Create test UI data
    const testData = {
      uiType: 'inventory',
      items: [
        { id: 'item_sword', quantity: 1 },
        { id: 'item_potion', quantity: 3 }
      ]
    };
    const testFile = path.resolve('GodotBridgePure/test_ui_render.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'render',
        'ui',
        testFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('render');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(result.renderData.nodes).toBeDefined();
      expect(result.renderData.scenes).toContain('InventoryScene.tscn');
      expect(result.renderData.scripts).toContain('res://scripts/UIController.gd');
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ render with GDScript configuration', () => {
    // Create test data with GDScript config
    const testData = {
      zoneId: 'zone_village',
      includeQuests: true
    };
    const testFile = path.resolve('GodotBridgePure/test_npc_render.json');
    const configFile = path.resolve('GodotBridgePure/test_gdscript_config.json');
    
    const config = {
      language: 'gdscript',
      targetVersion: '4.0',
      useSignals: true,
      useAnimations: true
    };
    
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'render',
        'npcs',
        testFile,
        configFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('render');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(result.renderData.scripts).toContain('res://scripts/NPCController.gd');
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      if (fs.existsSync(configFile)) {
        fs.unlinkSync(configFile);
      }
    }
  });

  test('✓ render with C# configuration', () => {
    // Create test data with C# config
    const testData = {
      zoneId: 'zone_village',
      includeQuests: true
    };
    const testFile = path.resolve('GodotBridgePure/test_npc_render.json');
    const configFile = path.resolve('GodotBridgePure/test_csharp_config.json');
    
    const config = {
      language: 'csharp',
      targetVersion: '4.0',
      useSignals: true,
      useAnimations: true
    };
    
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'render',
        'npcs',
        testFile,
        configFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('render');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(result.renderData.scripts).toContain('res://scripts/NPCController.cs');
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      if (fs.existsSync(configFile)) {
        fs.unlinkSync(configFile);
      }
    }
  });
});