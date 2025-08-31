import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

describe('UnityBridgePure Golden Tests', () => {
  const cliPath = path.resolve('UnityBridgePure/cliHarness.ts');
  const samplePath = path.resolve('UnityBridgePure/sample_bridge.json');

  beforeAll(() => {
    // Ensure test files exist
    expect(fs.existsSync(cliPath)).toBe(true);
    expect(fs.existsSync(samplePath)).toBe(true);
  });

  test('✓ simulate NPCs returns expected Unity render data', () => {
    // Create test data file
    const testData = {
      npcId: 'npc_001',
      duration: 3600
    };
    const testFile = path.resolve('UnityBridgePure/test_npc_sim.json');
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
      expect(result.renderData.entities).toBeDefined();
      expect(result.renderData.prefabs).toBeDefined();
      expect(result.renderData.scripts).toBeDefined();
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ render NPCs returns expected Unity entities', () => {
    // Create test render data
    const testData = {
      zoneId: 'zone_village',
      includeQuests: true
    };
    const testFile = path.resolve('UnityBridgePure/test_npc_render.json');
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
      expect(Array.isArray(result.renderData.entities)).toBe(true);
      expect(Array.isArray(result.renderData.components)).toBe(true);
      expect(Array.isArray(result.renderData.prefabs)).toBe(true);
      expect(Array.isArray(result.renderData.scripts)).toBe(true);
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ interop with Unity NPC data', () => {
    // Create test Unity data
    const testData = {
      id: 'npc_001',
      data: {
        transform: { position: { x: 15, y: 20, z: 0 } },
        stats: [{ key: 'health', base: 95 }],
        questIds: ['quest_tutorial', 'quest_side_quest']
      }
    };
    const testFile = path.resolve('UnityBridgePure/test_unity_npc.json');
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

  test('✓ simulate combat with Unity bridge', () => {
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
    const testFile = path.resolve('UnityBridgePure/test_combat_sim.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'render',
        'combat',
        testFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('render');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(result.renderData.entities).toBeDefined();
      expect(result.renderData.prefabs).toContain('CombatantPrefab');
      expect(result.renderData.scripts).toContain('CombatController');
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ render world with Unity bridge', () => {
    // Create test world data
    const testData = {
      zones: [
        { id: 'zone_village', x: 0, y: 0, type: 'village' },
        { id: 'zone_forest', x: 100, y: 100, type: 'forest' }
      ]
    };
    const testFile = path.resolve('UnityBridgePure/test_world_render.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'render',
        'world',
        testFile
      ], { encoding: 'utf-8' });

      const result = JSON.parse(output);
      expect(result.op).toBe('render');
      expect(result.status).toBe('ok');
      expect(result.renderData).toBeDefined();
      expect(result.renderData.entities).toBeDefined();
      expect(result.renderData.prefabs).toContain('ZonePrefab');
      expect(result.renderData.scripts).toContain('ZoneController');
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });
});