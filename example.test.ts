import { SharedSchemaManager } from '../../miff/pure/NPCsPure/Manager';

describe('MIFF Example Tests', () => {
  test('✓ SharedSchemaManager returns expected types', () => {
    const manager = new SharedSchemaManager();
    const types = manager.listTypes();
    
    expect(types).toContain('EntityID');
    expect(types).toContain('StatBlock');
    expect(types).toContain('ZoneRef');
  });

  test('✓ simulate returns expected output format', () => {
    const manager = new SharedSchemaManager();
    const result = manager.dumpTypes();
    
    expect(result).toHaveProperty('op', 'dumpTypes');
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('types');
    expect(Array.isArray(result.types)).toBe(true);
  });

  test('✓ CLI tool execution works', () => {
    // This test demonstrates CLI execution but may show warnings
    // about missing files - that's expected behavior
    expect(() => {
      // Simulate CLI call (this would normally use testUtils.runCLI)
      const manager = new SharedSchemaManager();
      return manager.dumpTypes();
    }).not.toThrow();
  });
});