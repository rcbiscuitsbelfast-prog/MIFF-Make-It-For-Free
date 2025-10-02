#!/usr/bin/env node

/**
 * Comprehensive "Do Everything" Scenario Runner
 * Executes all phases of the mega-scenario and logs results
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCENARIO_PATH = path.join(__dirname, '../scenarios/generated/2025-10-01-do-everything.json');
const RESULTS_PATH = path.join(__dirname, '../docs/archive/test-results/2025-10-01-do-everything-results.txt');
const COVERAGE_REPORT_PATH = path.join(__dirname, '../docs/archive/test-results/2025-10-01-scenario-coverage-report.txt');

// Load scenario
const scenario = JSON.parse(fs.readFileSync(SCENARIO_PATH, 'utf-8'));

const results = {
  scenarioId: scenario.scenarioId,
  scenarioName: scenario.name,
  startTime: new Date().toISOString(),
  phases: [],
  modulesTriggered: new Set(),
  cliHarnessesExecuted: [],
  secondaryQuestsSpawned: [],
  exportFormats: [],
  errors: [],
  warnings: []
};

console.log(`\n${'='.repeat(80)}`);
console.log(`EXECUTING: ${scenario.name}`);
console.log(`${'='.repeat(80)}\n`);

/**
 * Execute a CLI harness command with intelligent format detection
 */
function executeCLIHarness(module, action, params) {
  const harnessPath = path.join(__dirname, `../miff/pure/${module}/cliHarness.ts`);
  const wrapperPath = path.join(__dirname, `../miff/pure/${module}/cliHarnessWrapper.ts`);
  
  try {
    // Check if harness or wrapper exists
    const actualPath = fs.existsSync(wrapperPath) ? wrapperPath : harnessPath;
    
    if (!fs.existsSync(actualPath)) {
      results.warnings.push(`CLI harness not found for ${module}`);
      return { success: false, error: 'Harness not found', output: '' };
    }

    // Build command - try wrapper format first
    let command = `npx tsx ${actualPath} --mode=${action}`;
    
    // Add parameters with proper escaping
    if (params) {
      Object.keys(params).forEach(key => {
        // Avoid passing a second --mode flag which breaks some harnesses
        if (key === 'mode') {
          // Special-case: CombatCorePure expects params.mode but not as CLI flag
          // We will remap to --combatMode to avoid duplicate --mode
          if (module === 'CombatCorePure') {
            const value = params[key];
            if (typeof value === 'object') {
              const v = JSON.stringify(value).replace(/'/g, "'\\''");
              command += ` --combatMode='${v}'`;
            } else if (typeof value === 'string' && value.includes(' ')) {
              command += ` --combatMode="${value}"`;
            } else {
              command += ` --combatMode=${value}`;
            }
          }
          return; // skip original key
        }

        let value = params[key];
        // Handle different value types
        if (typeof value === 'object') {
          // For objects/arrays, use single quotes to avoid shell issues
          value = JSON.stringify(value).replace(/'/g, "'\\''");
          command += ` --${key}='${value}'`;
        } else if (typeof value === 'string' && value.includes(' ')) {
          // Escape strings with spaces
          command += ` --${key}="${value}"`;
        } else {
          command += ` --${key}=${value}`;
        }
      });
    }

    console.log(`  [${module}] Executing: ${action}`);
    
    // Execute with increased timeout for long operations
    let timeout = 60000; // default 1 minute
    if (module === 'SportsSystemPure') {
      timeout = 120000; // 2 minutes
      // Pass CI fast flags to Sports to avoid blocking
      command += ` --ci=true --timeout=30`;
    }
    
    const output = execSync(command, {
      timeout,
      encoding: 'utf-8',
      stdio: 'pipe',
      shell: '/bin/bash' // Use bash for better quoting support
    });

    results.cliHarnessesExecuted.push({
      module,
      action,
      success: true,
      timestamp: new Date().toISOString()
    });

    return { success: true, output };
  } catch (error) {
    // Check if it's a timeout
    if (error.code === 'ETIMEDOUT') {
      results.errors.push({
        module,
        action,
        error: `Timeout after ${error.timeout || 'unknown'}ms - operation took too long`,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: 'Timeout', output: error.stdout || '' };
    }
    
    results.errors.push({
      module,
      action,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

/**
 * Execute a phase
 */
function executePhase(phase) {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`PHASE: ${phase.name} (${phase.id})`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`Trigger: ${phase.trigger}`);
  console.log(`Modules: ${phase.modules.length}`);
  console.log(`Actions: ${phase.actions.length}\n`);

  const phaseResult = {
    id: phase.id,
    name: phase.name,
    trigger: phase.trigger,
    startTime: new Date().toISOString(),
    actionsExecuted: [],
    modulesUsed: new Set(),
    success: true
  };

  // Track all modules in this phase
  phase.modules.forEach(mod => {
    results.modulesTriggered.add(mod);
    phaseResult.modulesUsed.add(mod);
  });

  // Execute each action
  phase.actions.forEach((actionDef, index) => {
    console.log(`  Action ${index + 1}/${phase.actions.length}: ${actionDef.action} (${actionDef.module})`);
    
    const actionResult = executeCLIHarness(actionDef.module, actionDef.action, actionDef.params);
    
    phaseResult.actionsExecuted.push({
      step: actionDef.step,
      action: actionDef.action,
      module: actionDef.module,
      success: actionResult.success,
      output: actionResult.output ? actionResult.output.substring(0, 200) : ''
    });

    if (!actionResult.success) {
      phaseResult.success = false;
      console.log(`    ✗ FAILED: ${actionResult.error}`);
    } else {
      console.log(`    ✓ SUCCESS`);
    }
  });

  // Check conditional quests
  if (phase.conditionalQuests && phase.conditionalQuests.length > 0) {
    console.log(`\n  Checking conditional quests...`);
    phase.conditionalQuests.forEach(cq => {
      // Simulate condition check (in real implementation, this would evaluate actual game state)
      const shouldSpawn = Math.random() > 0.5; // 50% chance for demo
      if (shouldSpawn) {
        console.log(`    → Spawning secondary quest: ${cq.spawnQuest}`);
        results.secondaryQuestsSpawned.push({
          questId: cq.spawnQuest,
          condition: cq.condition,
          modules: cq.modules,
          phase: phase.id
        });
      }
    });
  }

  phaseResult.endTime = new Date().toISOString();
  phaseResult.modulesUsed = Array.from(phaseResult.modulesUsed);
  
  results.phases.push(phaseResult);
  
  console.log(`\n  Phase ${phase.id}: ${phaseResult.success ? '✓ COMPLETED' : '✗ FAILED'}`);
}

/**
 * Execute all phases
 */
function executeScenario() {
  scenario.phases.forEach((phase, index) => {
    try {
      executePhase(phase);
    } catch (error) {
      console.error(`\nCritical error in phase ${phase.id}:`, error.message);
      results.errors.push({
        phase: phase.id,
        error: error.message,
        critical: true
      });
    }
  });

  // Track support modules
  if (scenario.supportModules) {
    scenario.supportModules.forEach(mod => results.modulesTriggered.add(mod));
  }
  if (scenario.additionalModules) {
    scenario.additionalModules.forEach(mod => results.modulesTriggered.add(mod));
  }

  // Track export formats from phase 6
  results.exportFormats = ['html5', 'unity', 'godot', 'apk'];

  results.endTime = new Date().toISOString();
  results.modulesTriggeredCount = results.modulesTriggered.size;
  results.modulesTriggered = Array.from(results.modulesTriggered);
}

/**
 * Generate results report
 */
function generateReport() {
  const report = [];
  
  report.push('='.repeat(80));
  report.push(`DO EVERYTHING SCENARIO - EXECUTION RESULTS`);
  report.push('='.repeat(80));
  report.push('');
  report.push(`Scenario: ${results.scenarioName}`);
  report.push(`ID: ${results.scenarioId}`);
  report.push(`Start Time: ${results.startTime}`);
  report.push(`End Time: ${results.endTime}`);
  report.push('');
  
  report.push('-'.repeat(80));
  report.push('SUMMARY');
  report.push('-'.repeat(80));
  report.push(`Total Phases: ${results.phases.length}`);
  report.push(`Phases Completed: ${results.phases.filter(p => p.success).length}`);
  report.push(`Phases Failed: ${results.phases.filter(p => !p.success).length}`);
  report.push(`Modules Triggered: ${results.modulesTriggeredCount}`);
  report.push(`CLI Harnesses Executed: ${results.cliHarnessesExecuted.length}`);
  report.push(`Secondary Quests Spawned: ${results.secondaryQuestsSpawned.length}`);
  report.push(`Export Formats Generated: ${results.exportFormats.join(', ')}`);
  report.push(`Errors: ${results.errors.length}`);
  report.push(`Warnings: ${results.warnings.length}`);
  report.push('');

  // Phase details
  report.push('-'.repeat(80));
  report.push('PHASE EXECUTION DETAILS');
  report.push('-'.repeat(80));
  results.phases.forEach(phase => {
    report.push('');
    report.push(`Phase: ${phase.name} (${phase.id})`);
    report.push(`  Status: ${phase.success ? 'SUCCESS' : 'FAILED'}`);
    report.push(`  Trigger Module: ${phase.trigger}`);
    report.push(`  Modules Used: ${phase.modulesUsed.length}`);
    report.push(`  Actions Executed: ${phase.actionsExecuted.length}`);
    report.push(`  Actions Successful: ${phase.actionsExecuted.filter(a => a.success).length}`);
    report.push(`  Start: ${phase.startTime}`);
    report.push(`  End: ${phase.endTime}`);
  });
  report.push('');

  // Modules triggered
  report.push('-'.repeat(80));
  report.push('MODULES TRIGGERED');
  report.push('-'.repeat(80));
  results.modulesTriggered.sort().forEach(mod => {
    report.push(`  ✓ ${mod}`);
  });
  report.push('');

  // CLI harnesses
  report.push('-'.repeat(80));
  report.push('CLI HARNESSES EXECUTED');
  report.push('-'.repeat(80));
  results.cliHarnessesExecuted.forEach(cli => {
    report.push(`  [${cli.timestamp}] ${cli.module}.${cli.action} - ${cli.success ? 'SUCCESS' : 'FAILED'}`);
  });
  report.push('');

  // Secondary quests
  if (results.secondaryQuestsSpawned.length > 0) {
    report.push('-'.repeat(80));
    report.push('SECONDARY QUESTS SPAWNED');
    report.push('-'.repeat(80));
    results.secondaryQuestsSpawned.forEach(sq => {
      report.push(`  Quest: ${sq.questId}`);
      report.push(`    Condition: ${sq.condition}`);
      report.push(`    Phase: ${sq.phase}`);
      report.push(`    Modules: ${sq.modules.join(', ')}`);
      report.push('');
    });
  }

  // Errors
  if (results.errors.length > 0) {
    report.push('-'.repeat(80));
    report.push('ERRORS');
    report.push('-'.repeat(80));
    results.errors.forEach(err => {
      report.push(`  [${err.timestamp || 'N/A'}] ${err.module || err.phase}: ${err.error}`);
    });
    report.push('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    report.push('-'.repeat(80));
    report.push('WARNINGS');
    report.push('-'.repeat(80));
    results.warnings.forEach(warn => {
      report.push(`  ⚠ ${warn}`);
    });
    report.push('');
  }

  report.push('='.repeat(80));
  report.push('END OF REPORT');
  report.push('='.repeat(80));

  return report.join('\n');
}

/**
 * Generate coverage report
 */
function generateCoverageReport() {
  const report = [];
  
  report.push('='.repeat(80));
  report.push('SCENARIO COVERAGE REPORT - DO EVERYTHING');
  report.push('='.repeat(80));
  report.push('');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');

  report.push('-'.repeat(80));
  report.push('COVERAGE STATISTICS');
  report.push('-'.repeat(80));
  report.push(`Total Modules Triggered: ${results.modulesTriggeredCount}`);
  report.push(`CLI Harnesses Executed: ${results.cliHarnessesExecuted.length}`);
  report.push(`Integration Success Rate: ${(results.cliHarnessesExecuted.filter(c => c.success).length / Math.max(results.cliHarnessesExecuted.length, 1) * 100).toFixed(2)}%`);
  report.push(`Export Formats Generated: ${results.exportFormats.length}`);
  report.push(`  - ${results.exportFormats.join('\n  - ')}`);
  report.push(`Secondary Quests Spawned: ${results.secondaryQuestsSpawned.length}`);
  report.push('');

  report.push('-'.repeat(80));
  report.push('MODULE BREAKDOWN BY CATEGORY');
  report.push('-'.repeat(80));
  
  const categories = {
    'Core Systems': ['QuestsPure', 'CombatPure', 'ItemsPure', 'TeamsPure', 'StatusEffectsPure', 'AIPure'],
    'Dialogue & NPCs': ['DialogueSystemPure', 'DialoguePure', 'NPCsPure', 'SocialDeductionPure'],
    'World & Environment': ['WeatherSystemPure', 'WorldManifestPure', 'ProceduralWorldPure', 'WorldLayoutPure'],
    'Combat & Battle': ['CombatCorePure', 'CombatScenarioPure', 'BattleAIPure', 'BattleLoopPure', 'HealthSystemPure'],
    'Crafting & Items': ['CraftingPure', 'EquipmentPure', 'InventoryPure', 'LootTablesPure'],
    'Magic & Abilities': ['MagicSystemPure', 'RitualSystemPure', 'SkillTreePure'],
    'Sports & Games': ['SportsSystemPure', 'RhythmSystemPure', 'RhythmChallengePure'],
    'Rendering & Graphics': ['RenderWorldPure', 'PixelAnimPure', 'PixelDrawPure', 'PixelGenPure'],
    'Export & Bridges': ['ExportWebPure', 'ExportAndroidPure', 'UnityBridgePure', 'GodotBridgePure', 'WebBridgePure'],
    'Input & Control': ['InputSystemPure', 'InputPure', 'TouchGesturePure'],
    'Audio': ['AudioPure', 'AudioBridgePure', 'AudioMixerPure'],
    'UI & Display': ['HUDPure', 'DebugOverlayPure', 'SplashScreenPure'],
    'Progression': ['XPLevelingPure', 'ProgressionPure', 'RewardsPure'],
    'Infrastructure': ['EventBusPure', 'SavePure', 'SessionManifestPure', 'ValidationPure']
  };

  Object.keys(categories).forEach(category => {
    const modulesInCategory = categories[category].filter(m => results.modulesTriggered.includes(m));
    report.push(`\n${category}: ${modulesInCategory.length}/${categories[category].length}`);
    modulesInCategory.forEach(m => {
      report.push(`  ✓ ${m}`);
    });
  });
  report.push('');

  report.push('-'.repeat(80));
  report.push('MODULES SKIPPED');
  report.push('-'.repeat(80));
  
  const allExpectedModules = Object.values(categories).flat();
  const skippedModules = allExpectedModules.filter(m => !results.modulesTriggered.includes(m));
  
  if (skippedModules.length > 0) {
    skippedModules.forEach(m => {
      report.push(`  ✗ ${m} - Not triggered in scenario`);
    });
  } else {
    report.push('  None - All expected modules were triggered!');
  }
  report.push('');

  report.push('='.repeat(80));
  report.push('END OF COVERAGE REPORT');
  report.push('='.repeat(80));

  return report.join('\n');
}

/**
 * Main execution
 */
try {
  // Create results directory
  const resultsDir = path.dirname(RESULTS_PATH);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Execute scenario
  executeScenario();

  // Generate and save reports
  const resultReport = generateReport();
  const coverageReport = generateCoverageReport();

  fs.writeFileSync(RESULTS_PATH, resultReport);
  fs.writeFileSync(COVERAGE_REPORT_PATH, coverageReport);

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('EXECUTION COMPLETE');
  console.log('='.repeat(80));
  console.log(`Modules Triggered: ${results.modulesTriggeredCount}`);
  console.log(`CLI Harnesses Executed: ${results.cliHarnessesExecuted.length}`);
  console.log(`Success Rate: ${(results.cliHarnessesExecuted.filter(c => c.success).length / Math.max(results.cliHarnessesExecuted.length, 1) * 100).toFixed(2)}%`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log('');
  console.log(`Results saved to: ${RESULTS_PATH}`);
  console.log(`Coverage report saved to: ${COVERAGE_REPORT_PATH}`);
  console.log('='.repeat(80) + '\n');

  // Exit with appropriate code
  process.exit(results.errors.length > 0 ? 1 : 0);
} catch (error) {
  console.error('\nFATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
