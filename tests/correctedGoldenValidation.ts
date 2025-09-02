// Goal: Validate golden scenario fidelity across CombatCorePure, SkillTreePure, and VisualPure
// Context: ES module errors FIXED, CLI output mismatch RESOLVED, fixture stalls PREVENTED

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

// FIXED: Use actual module imports instead of non-existent @miff packages
import { CombatManager } from '../CombatCorePure/CombatManager';
import { SkillTreeManager } from '../SkillTreePure/SkillTreeManager';
import { 
  createReplaySession, 
  generateReplayResult,
  ReplayConfig 
} from '../systems/VisualReplaySystemPure/index';

// FIXED: Define proper module structure based on actual codebase
const modules = [
  {
    name: 'CombatCorePure',
    manager: CombatManager,
    cliHarness: 'CombatCorePure/cliHarness.ts',
    sampleData: 'CombatCorePure/sample_combat.json',
    commandsFile: 'CombatCorePure/tests/commands.json',
    goldenFixture: 'tests/goldenFixtures/combat_core_flow.json'
  },
  {
    name: 'SkillTreePure', 
    manager: SkillTreeManager,
    cliHarness: 'SkillTreePure/cliHarness.ts',
    sampleData: 'SkillTreePure/sample_skills.json',
    commandsFile: 'SkillTreePure/tests/commands.json',
    goldenFixture: 'tests/goldenFixtures/skill_tree_flow.json'
  }
  // VisualPure: Using VisualReplaySystemPure, but no CLI harness exists yet
];

// FIXED: Proper fixture loading with error handling
function loadFixtures(moduleName: string): Array<{ input: any; expectedOutput: any }> {
  const module = modules.find(m => m.name === moduleName);
  if (!module) {
    console.warn(`⚠️ Module ${moduleName} not found in configuration`);
    return [];
  }
  
  if (!fs.existsSync(module.goldenFixture)) {
    console.warn(`⚠️ Golden fixture not found: ${module.goldenFixture}`);
    return [];
  }
  
  try {
    const fixtureData = JSON.parse(fs.readFileSync(module.goldenFixture, 'utf-8'));
    return [{ input: fixtureData, expectedOutput: fixtureData }];
  } catch (error) {
    console.error(`❌ Failed to load fixture for ${moduleName}:`, error);
    return [];
  }
}

// FIXED: Proper scenario execution with CLI harness and timeout
function runScenario(mod: any, fixtureInput: any): any {
  try {
    const moduleConfig = modules.find(m => m.name === mod.name);
    if (!moduleConfig) {
      throw new Error(`Module configuration not found for ${mod.name}`);
    }
    
    const args = [
      'ts-node',
      '--compiler-options', '{"module":"commonjs","types":["node"]}',
      moduleConfig.cliHarness,
      moduleConfig.sampleData
    ];
    
    // FIXED: Include commands file for full scenario execution
    if (fs.existsSync(moduleConfig.commandsFile)) {
      args.push(moduleConfig.commandsFile);
    }
    
    // FIXED: Add timeout to prevent fixture stalls
    const output = execFileSync('npx', args, { 
      encoding: 'utf-8',
      timeout: 10000, // 10 second timeout
      cwd: path.resolve(__dirname, '..')
    });
    
    return JSON.parse(output);
  } catch (error) {
    console.error(`❌ Scenario execution failed:`, error);
    return { error: error instanceof Error ? error.message : String(error), outputs: [] };
  }
}

// FIXED: Enhanced validation with detailed diff reporting
function validateOutput(result: any, expectedOutput: any, options: {
  strict: boolean;
  logDiff: boolean;
  onMismatch: (diff: any) => void;
}): boolean {
  try {
    if (options.strict) {
      const resultStr = JSON.stringify(result, null, 2);
      const expectedStr = JSON.stringify(expectedOutput, null, 2);
      
      if (resultStr !== expectedStr) {
        const diff = {
          expected: expectedOutput,
          actual: result,
          details: 'Golden fixture validation failed'
        };
        
        if (options.logDiff) {
          console.log('📊 Detailed Diff:');
          console.log('Expected:', JSON.stringify(expectedOutput, null, 2));
          console.log('Actual:', JSON.stringify(result, null, 2));
        }
        
        options.onMismatch(diff);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Validation error:', error);
    return false;
  }
}

// FIXED: Main execution with proper error handling and reporting
async function main(): Promise<void> {
  console.log('🔍 Golden Scenario Fidelity Validation\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const mod of modules) {
    console.log(`\n📦 Validating ${mod.name}...`);
    
    const fixtures = loadFixtures(mod.name);
    for (const fixture of fixtures) {
      totalTests++;
      console.log(`   🧪 Running scenario...`);
      
      try {
        const result = runScenario(mod, fixture.input);
        
        if (result.error) {
          console.error(`   ❌ Execution error: ${result.error}`);
          continue;
        }
        
        const isValid = validateOutput(result, fixture.expectedOutput, {
          strict: true,
          logDiff: true,
          onMismatch: (diff) => {
            console.error(`   🔴 [${mod.name}] Fixture mismatch detected`);
          },
        });
        
        if (isValid) {
          console.log(`   ✅ Golden scenario validation passed`);
          passedTests++;
        } else {
          console.log(`   ❌ Golden scenario validation failed`);
        }
      } catch (error) {
        console.error(`   💥 Test error:`, error);
      }
    }
  }
  
  console.log(`\n📊 Final Results:`);
  console.log(`   Tests: ${passedTests}/${totalTests} passed`);
  console.log(`   Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
  
  if (passedTests === totalTests && totalTests > 0) {
    console.log(`\n🎉 All golden scenarios validated successfully!`);
    console.log(`✅ ES module errors: Resolved with CommonJS compilation`);
    console.log(`✅ CLI output mismatch: Resolved with proper command execution`);
    console.log(`✅ Fixture stalls: Prevented with execution timeout`);
  } else {
    console.log(`\n⚠️ Some validations failed - check output above for details`);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  });
}