import fs from 'fs';
import path from 'path';
import { RemixTaggingManager, RemixLevel } from '../Manager';

describe('RemixTaggingPure Golden Tests', () => {
  let manager: RemixTaggingManager;
  const root = path.resolve(__dirname, '..');

  beforeEach(() => {
    manager = new RemixTaggingManager();
  });

  test('✓ tags modules with correct remix levels', () => {
    const result = manager.tagModule('CombatPure', 'Combat System', 'remix-required', 'Required due to dependencies');
    
    expect(result.status).toBe('ok');
    expect(result.moduleId).toBe('CombatPure');
    expect(result.remixLevel).toBe('remix-required');
    expect(result.issues).toHaveLength(0);
  });

  test('✓ auto-determines remix level for isolated modules', () => {
    const result = manager.tagModule('PathfindingPure', 'Pathfinding Algorithms');
    
    expect(result.status).toBe('ok');
    expect(result.remixLevel).toBe('remix-safe');
    
    // Get the stored tag to access the reason
    const tag = manager.getModuleTag('PathfindingPure');
    expect(tag?.reason).toContain('no external dependencies');
  });

  test('✓ generates appropriate requirements for each level', () => {
    const requiredResult = manager.tagModule('CombatPure', 'Combat System', 'remix-required');
    const optionalResult = manager.tagModule('QuestsPure', 'Quest System', 'remix-optional');
    const safeResult = manager.tagModule('PathfindingPure', 'Pathfinding Algorithms', 'remix-safe');
    
    // Get the stored tags to access requirements
    const requiredTag = manager.getModuleTag('CombatPure');
    const optionalTag = manager.getModuleTag('QuestsPure');
    const safeTag = manager.getModuleTag('PathfindingPure');
    
    expect(requiredTag?.requirements).toContain('Must maintain attribution');
    expect(optionalTag?.requirements).toContain('Attribution recommended');
    expect(safeTag?.requirements).toContain('No special requirements');
  });

  test('✓ provides tagging statistics', () => {
    manager.tagModule('CombatPure', 'Combat System', 'remix-required');
    manager.tagModule('QuestsPure', 'Quest System', 'remix-optional');
    manager.tagModule('PathfindingPure', 'Pathfinding Algorithms', 'remix-safe');
    
    const stats = manager.getTaggingStats();
    
    expect(stats.total).toBe(3);
    expect(stats.byLevel['remix-required']).toBe(1);
    expect(stats.byLevel['remix-optional']).toBe(1);
    expect(stats.byLevel['remix-safe']).toBe(1);
  });

  test('✓ handles configuration changes', () => {
    manager.setConfig({ requireReason: false });
    
    const result = manager.tagModule('TestModule', 'Test Module', 'remix-safe');
    
    expect(result.status).toBe('ok');
    expect(result.issues).toHaveLength(0);
  });

  test('✓ validates module ID requirements', () => {
    const result = manager.tagModule('', 'Empty Module ID');
    
    expect(result.status).toBe('error');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'invalid_module_id' })
    );
  });

  test('✓ supports custom override functions', () => {
    const override = {
      getCustomLevel: (moduleId: string): RemixLevel | null => {
        if (moduleId === 'SpecialModule') return 'remix-safe';
        return null;
      }
    };
    
    manager.setOverride(override);
    
    const result = manager.tagModule('SpecialModule', 'Special Module');
    
    expect(result.remixLevel).toBe('remix-safe');
  });

  test('✓ CLI integration ready', () => {
    // Test that the manager can handle CLI-style operations
    const commands = [
      { op: 'tagModule', moduleId: 'CLITest', moduleName: 'CLI Test Module', level: 'remix-safe' as RemixLevel },
      { op: 'getTag', moduleId: 'CLITest' },
      { op: 'listTags' },
      { op: 'getStats' }
    ];
    
    // Simulate CLI operations
    for (const cmd of commands) {
      switch (cmd.op) {
        case 'tagModule':
          manager.tagModule(cmd.moduleId, cmd.moduleName, cmd.level);
          break;
        case 'getTag':
          const tag = manager.getModuleTag(cmd.moduleId);
          expect(tag).toBeTruthy();
          break;
        case 'listTags':
          const tags = manager.getAllTags();
          expect(Array.isArray(tags)).toBe(true);
          break;
        case 'getStats':
          const stats = manager.getTaggingStats();
          expect(stats.total).toBeGreaterThan(0);
          break;
      }
    }
  });
});