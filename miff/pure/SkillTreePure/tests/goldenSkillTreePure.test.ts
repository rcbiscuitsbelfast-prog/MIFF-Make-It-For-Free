import { runCLICommand } from '../../shared/testUtils';

describe('SkillTreePure CLI Harness', () => {
  test('load - should load skills from file', async () => {
    const result = await runCLICommand('SkillTreePure', 'load', 'sample_skills.json');
    
    expect(result.op).toBe('load');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('createTree - should create a skill tree', async () => {
    const result = await runCLICommand('SkillTreePure', 'createTree', 'demo_tree', 'Demo Tree', 'A demo skill tree');
    
    expect(result.op).toBe('createTree');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.id).toBe('demo_tree');
    expect(result.result.name).toBe('Demo Tree');
  });

  test('getTree - should get skill tree by ID', async () => {
    const result = await runCLICommand('SkillTreePure', 'getTree', 'demo_tree');
    
    expect(result.op).toBe('getTree');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
  });

  test('listTrees - should list all skill trees', async () => {
    const result = await runCLICommand('SkillTreePure', 'listTrees');
    
    expect(result.op).toBe('listTrees');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('list - should list all skill IDs', async () => {
    const result = await runCLICommand('SkillTreePure', 'list');
    
    expect(result.op).toBe('list');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('getUnlocked - should list unlocked skill IDs', async () => {
    const result = await runCLICommand('SkillTreePure', 'getUnlocked');
    
    expect(result.op).toBe('getUnlocked');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('get - should get skill by ID', async () => {
    const result = await runCLICommand('SkillTreePure', 'get', 'sword_mastery');
    
    expect(result.op).toBe('get');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
  });

  test('canUnlock - should check if skill can be unlocked', async () => {
    const result = await runCLICommand('SkillTreePure', 'canUnlock', 'sword_mastery');
    
    expect(result.op).toBe('canUnlock');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.canUnlock).toBeDefined();
  });

  test('unlock - should unlock a skill', async () => {
    const result = await runCLICommand('SkillTreePure', 'unlock', 'sword_mastery');
    
    expect(result.op).toBe('unlock');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('lock - should lock a skill', async () => {
    const result = await runCLICommand('SkillTreePure', 'lock', 'sword_mastery');
    
    expect(result.op).toBe('lock');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('levelUp - should level up a skill', async () => {
    const result = await runCLICommand('SkillTreePure', 'levelUp', 'sword_mastery');
    
    expect(result.op).toBe('levelUp');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('addExperience - should add experience to skill', async () => {
    const result = await runCLICommand('SkillTreePure', 'addExperience', 'sword_mastery', '100');
    
    expect(result.op).toBe('addExperience');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('useSkill - should use a skill', async () => {
    const result = await runCLICommand('SkillTreePure', 'useSkill', 'sword_mastery');
    
    expect(result.op).toBe('useSkill');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('getProgress - should get skill progress', async () => {
    const result = await runCLICommand('SkillTreePure', 'getProgress', 'sword_mastery');
    
    expect(result.op).toBe('getProgress');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
  });

  test('getAllProgress - should get all skill progress', async () => {
    const result = await runCLICommand('SkillTreePure', 'getAllProgress');
    
    expect(result.op).toBe('getAllProgress');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('getStats - should get skill tree statistics', async () => {
    const result = await runCLICommand('SkillTreePure', 'getStats');
    
    expect(result.op).toBe('getStats');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.totalSkills).toBeDefined();
    expect(result.result.unlockedSkills).toBeDefined();
    expect(result.result.lockedSkills).toBeDefined();
  });

  test('listSkills - should list skills with optional filter', async () => {
    const result = await runCLICommand('SkillTreePure', 'listSkills');
    
    expect(result.op).toBe('listSkills');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('export json - should export skills in JSON format', async () => {
    const result = await runCLICommand('SkillTreePure', 'export', 'json');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('json');
    expect(result.result.data).toBeDefined();
  });

  test('export csv - should export skills in CSV format', async () => {
    const result = await runCLICommand('SkillTreePure', 'export', 'csv');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('csv');
    expect(result.result.data).toBeDefined();
  });

  test('export markdown - should export skills in Markdown format', async () => {
    const result = await runCLICommand('SkillTreePure', 'export', 'markdown');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('markdown');
    expect(result.result.data).toBeDefined();
  });

  test('reset - should reset skill tree manager', async () => {
    const result = await runCLICommand('SkillTreePure', 'reset');
    
    expect(result.op).toBe('reset');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('SkillTreeManager reset successfully');
  });

  test('demo - should run demonstration scenarios', async () => {
    const result = await runCLICommand('SkillTreePure', 'demo');
    
    expect(result.op).toBe('demo');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('SkillTreePure Demo completed');
    expect(result.result.scenarios).toBeDefined();
    expect(result.result.tree).toBeDefined();
    expect(result.result.stats).toBeDefined();
    expect(result.result.progress).toBeDefined();
    expect(result.result.unlocked).toBeDefined();
    expect(result.result.exportFormats).toBeDefined();
  });

  test('help - should show help information', async () => {
    const result = await runCLICommand('SkillTreePure', 'help');
    
    expect(result.op).toBe('help');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.usage).toBeDefined();
    expect(result.result.commands).toBeDefined();
    expect(result.result.examples).toBeDefined();
  });

  test('invalid command - should return error', async () => {
    const result = await runCLICommand('SkillTreePure', 'invalidCommand');
    
    expect(result.op).toBe('invalidCommand');
    expect(result.status).toBe('error');
    expect(result.result).toBeDefined();
    expect(result.result.error).toBeDefined();
  });
});