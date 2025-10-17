#!/usr/bin/env tsx

/**
 * Phase 2 Import Test
 * 
 * Tests actual import/export functionality to identify real issues
 */

async function testImports() {
  console.log('🧪 Testing critical module imports...\n');

  const testModules = [
    'AIPure',
    'AvatarSystemPure', 
    'CombatPure',
    'ItemsPure',
    'TeamsPure',
    'StatusEffectsPure',
    'WebSocketBridgePure',
    'ObstacleCoursePure',
    'SurvivalSystemPure',
    'ThemeParkPure'
  ];

  const results = [];

  for (const moduleName of testModules) {
    try {
      console.log(`Testing ${moduleName}...`);
      const module = await import(`./miff/pure/${moduleName}`);
      console.log(`  ✅ ${moduleName} imported successfully`);
      console.log(`  📦 Exports: ${Object.keys(module).length} items`);
      results.push({ module: moduleName, status: 'success', exports: Object.keys(module).length });
    } catch (error) {
      console.log(`  ❌ ${moduleName} import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.push({ module: moduleName, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  console.log('\n📊 Import Test Results:');
  console.log(`  Successful: ${results.filter(r => r.status === 'success').length}`);
  console.log(`  Failed: ${results.filter(r => r.status === 'failed').length}`);

  const failed = results.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    console.log('\n❌ Failed Imports:');
    failed.forEach(f => {
      console.log(`  - ${f.module}: ${f.error}`);
    });
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testImports().catch(console.error);
}