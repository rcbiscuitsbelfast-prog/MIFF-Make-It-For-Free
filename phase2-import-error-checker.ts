#!/usr/bin/env tsx

/**
 * Phase 2 Import Error Checker
 * 
 * Comprehensive check for import/export errors across all modules
 */

async function checkImportErrors() {
  console.log('🔍 Checking for import/export errors...\n');

  const modules = [
    'AIPure',
    'AvatarSystemPure',
    'AvatarAssetRegistryPure', 
    'AvatarRendererWebPure',
    'AvatarRendererGodotPure',
    'BattleAIPure',
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
  let totalErrors = 0;

  for (const moduleName of modules) {
    try {
      console.log(`Checking ${moduleName}...`);
      
      // Test basic import
      const module = await import(`./miff/pure/${moduleName}`);
      
      // Test CLI harness import if it exists
      try {
        const cliModule = await import(`./miff/pure/${moduleName}/cliHarness`);
        console.log(`  ✅ CLI harness available`);
      } catch (cliError) {
        console.log(`  ⚠️  CLI harness not available`);
      }

      // Test main exports
      const exportCount = Object.keys(module).length;
      console.log(`  ✅ Exports: ${exportCount} items`);
      
      // Test specific common exports
      const commonExports = ['default', 'Manager', moduleName, `${moduleName}Manager`];
      const foundExports = commonExports.filter(exp => exp in module);
      
      if (foundExports.length > 0) {
        console.log(`  ✅ Common exports found: ${foundExports.join(', ')}`);
      }

      results.push({
        module: moduleName,
        status: 'success',
        exports: exportCount,
        commonExports: foundExports
      });

    } catch (error) {
      console.log(`  ❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      totalErrors++;
      
      results.push({
        module: moduleName,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('\n📊 Import Check Results:');
  console.log(`  Total Modules: ${modules.length}`);
  console.log(`  Successful: ${results.filter(r => r.status === 'success').length}`);
  console.log(`  Failed: ${results.filter(r => r.status === 'failed').length}`);
  console.log(`  Total Errors: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log('\n🎉 All modules imported successfully!');
  } else {
    console.log('\n❌ Import errors found:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`  - ${r.module}: ${r.error}`);
    });
  }

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  checkImportErrors().catch(console.error);
}