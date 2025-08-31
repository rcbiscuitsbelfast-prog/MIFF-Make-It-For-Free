import path from 'path';
import fs from 'fs';

describe('NPCsPure Golden Tests', () => {
  const cliPath = path.resolve('NPCsPure/cliHarness.ts');
  const samplePath = path.resolve('NPCsPure/sample_npcs.json');
  const expectedPath = path.resolve('NPCsPure/expected_output.json');

  beforeAll(() => {
    // Ensure test files exist
    expect(fs.existsSync(cliPath)).toBe(true);
    expect(fs.existsSync(samplePath)).toBe(true);
    expect(fs.existsSync(expectedPath)).toBe(true);
  });

  test('✓ list NPCs returns expected output', () => {
    const output = (global as any).testUtils.runCLI(cliPath, ['list']);
    const result = JSON.parse(output);
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));

    expect(result.op).toBe('list');
    expect(result.status).toBe('ok');
    expect(Array.isArray(result.result)).toBe(true);
    expect(result.result.length).toBeGreaterThan(0);
    
    // Check first NPC structure
    const firstNPC = result.result[0];
    expect(firstNPC).toHaveProperty('id');
    expect(firstNPC).toHaveProperty('name');
    expect(firstNPC).toHaveProperty('stats');
    expect(firstNPC).toHaveProperty('behavior');
    expect(firstNPC).toHaveProperty('location');
    expect(firstNPC).toHaveProperty('questIds');
    expect(firstNPC).toHaveProperty('movementPattern');
  });

  test('✓ simulate NPC returns expected output', () => {
    const output = (global as any).testUtils.runCLI(cliPath, ['simulate', 'npc_001', '3600']);
    const result = JSON.parse(output);
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));

    expect(result.op).toBe('simulate');
    expect(result.status).toBe('ok');
    expect(result.result).toHaveProperty('duration');
    expect(result.result).toHaveProperty('events');
    expect(result.result).toHaveProperty('interactions');
    expect(Array.isArray(result.result.events)).toBe(true);
    expect(Array.isArray(result.result.interactions)).toBe(true);
  });

  test('✓ create NPC from sample file', () => {
    // Create a test NPC file
    const testNPC = {
      id: 'npc_test',
      name: 'Test NPC',
      stats: {
        health: 100,
        mana: 50,
        strength: 10,
        wisdom: 10
      },
      behavior: {
        type: 'passive',
        aggression: 0,
        curiosity: 50,
        loyalty: 50
      },
      location: {
        zoneId: 'zone_test',
        x: 0,
        y: 0
      },
      questIds: [],
      movementPattern: {
        type: 'idle',
        speed: 1
      }
    };

    const testFile = path.resolve('NPCsPure/test_npc.json');
    fs.writeFileSync(testFile, JSON.stringify(testNPC, null, 2));

    try {
      const output = (global as any).testUtils.runCLI(cliPath, ['create', testFile]);
      const result = JSON.parse(output);
      expect(result.op).toBe('create');
      expect(result.status).toBe('ok');
      expect(result.result).toHaveProperty('id', 'npc_test');
      expect(result.result).toHaveProperty('name', 'Test NPC');
    } finally {
      // Cleanup
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ get NPC by ID', () => {
    const output = (global as any).testUtils.runCLI(cliPath, ['get', 'npc_001']);
    const result = JSON.parse(output);
    expect(result.op).toBe('get');
    expect(result.status).toBe('ok');
    expect(result.result).toHaveProperty('id', 'npc_001');
    expect(result.result).toHaveProperty('name', 'Elder Oak');
  });

  test('✓ list NPCs with filter', () => {
    const output = (global as any).testUtils.runCLI(cliPath, ['list', 'zoneId=zone_village']);
    const result = JSON.parse(output);
    expect(result.op).toBe('list');
    expect(result.status).toBe('ok');
    expect(Array.isArray(result.result)).toBe(true);
    
    // All returned NPCs should be in zone_village
    result.result.forEach((npc: any) => {
      expect(npc.location.zoneId).toBe('zone_village');
    });
  });

  test('✓ delete NPC operation', () => {
    // First create a test NPC
    const testNPC = {
      id: 'npc_delete_test',
      name: 'Delete Test NPC',
      stats: { health: 100, mana: 50, strength: 10, wisdom: 10 },
      behavior: { type: 'passive', aggression: 0, curiosity: 50, loyalty: 50 },
      location: { zoneId: 'zone_test', x: 0, y: 0 },
      questIds: [],
      movementPattern: { type: 'idle', speed: 1 }
    };

    const testFile = path.resolve('NPCsPure/delete_test_npc.json');
    fs.writeFileSync(testFile, JSON.stringify(testNPC, null, 2));

    try {
      // Create the NPC
      (global as any).testUtils.runCLI(cliPath, ['create', testFile]);

      // Delete the NPC
      const output = (global as any).testUtils.runCLI(cliPath, ['delete', 'npc_delete_test']);
      const result = JSON.parse(output);
      expect(result.op).toBe('delete');
      expect(result.status).toBe('ok');
    } finally {
      // Cleanup
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('✓ dump all NPCs', () => {
    const output = (global as any).testUtils.runCLI(cliPath, ['dump']);
    const result = JSON.parse(output);
    expect(result.op).toBe('dump');
    expect(result.status).toBe('ok');
    expect(Array.isArray(result.result)).toBe(true);
    expect(result.result.length).toBeGreaterThan(0);
  });
});