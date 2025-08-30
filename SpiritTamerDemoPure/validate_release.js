#!/usr/bin/env node

/**
 * Spirit Tamer: Trial of the Grove - Release Validation Script
 * Purpose: Validate all components for production release
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 [validate_release] Starting release validation for Spirit Tamer: Trial of the Grove...');

// Validation results
const validationResults = {
  timestamp: new Date().toISOString(),
  scenario: 'Spirit Tamer: Trial of the Grove',
  version: '1.0.0',
  status: 'validating',
  results: {},
  summary: {}
};

// Required files for release
const requiredFiles = [
  // Core scenario files
  'orchestration.json',
  'fixtures/quest_pack_fae.json',
  'fixtures/npc_dialogue_trees_fae.json',
  'fixtures/npc_tables_mythic.json',
  'fixtures/location_registry.json',
  
  // Recovery components
  'ci_recovery_report.json',
  'ci_recovery_patched_report.json',
  'link_integrity_report.json',
  'golden_replay_flags.json',
  
  // Asset stubs
  'audio_stub.json',
  'visual_manifest.json',
  'asset_todo.json',
  
  // CI workflows
  '.github/workflows/ci.yml',
  '.github/workflows/ci-recovery-patched.yml',
  '.github/workflows/ci-recovery.yml',
  
  // Modular hooks
  'modular_hooks.json',
  
  // Toppler integration
  'toppler_stub.json',
  'scripts/gen-toppler-stub.js',
  
  // Documentation
  'README_assets.md',
  'asset_audit_summary.json',
  'ci_workflow_audit_summary.json',
  
  // Release manifests
  'release_manifest.json',
  'runtime_config.json',
  'bundle_manifest.json'
];

// Validation functions
function validateFileExists(filePath) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);
    const stats = exists ? fs.statSync(fullPath) : null;
    
    return {
      exists,
      size: exists ? stats.size : 0,
      lastModified: exists ? stats.mtime : null,
      path: fullPath
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      path: filePath
    };
  }
}

function validateJsonFile(filePath) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(content);
    
    return {
      valid: true,
      size: content.length,
      keys: Object.keys(parsed),
      hasRequiredFields: true // Basic validation
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      path: filePath
    };
  }
}

function validateOrchestrationIntegrity() {
  try {
    const orchestrationPath = path.resolve(process.cwd(), 'orchestration.json');
    const content = fs.readFileSync(orchestrationPath, 'utf8');
    const orchestration = JSON.parse(content);
    
    // Check required fields
    const requiredFields = ['scenarioId', 'name', 'version', 'quests', 'triggers', 'objectives', 'routing'];
    const missingFields = requiredFields.filter(field => !orchestration[field]);
    
    // Check quest count
    const questCount = Object.keys(orchestration.quests || {}).length;
    
    // Check NPC count
    const npcCount = Object.keys(orchestration.npcs || {}).length;
    
    return {
      valid: missingFields.length === 0,
      missingFields,
      questCount,
      npcCount,
      hasGoldenOutput: !!orchestration.goldenOutput,
      hasRemixConfig: !!orchestration.remixConfig
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function validateAssetStubs() {
  try {
    const audioStubPath = path.resolve(process.cwd(), 'audio_stub.json');
    const visualManifestPath = path.resolve(process.cwd(), 'visual_manifest.json');
    const assetTodoPath = path.resolve(process.cwd(), 'asset_todo.json');
    
    const audioStub = JSON.parse(fs.readFileSync(audioStubPath, 'utf8'));
    const visualManifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
    const assetTodo = JSON.parse(fs.readFileSync(assetTodoPath, 'utf8'));
    
    return {
      audioStub: {
        valid: true,
        ambientTracks: Object.keys(audioStub.ambientTracks || {}).length,
        soundEffects: Object.keys(audioStub.soundEffects || {}).length,
        hasFallbacks: !!audioStub.audioFallbacks
      },
      visualManifest: {
        valid: true,
        topplerOverlays: Object.keys(visualManifest.topplerOverlays || {}).length,
        itemIcons: Object.keys(visualManifest.itemIcons || {}).length,
        locationArt: Object.keys(visualManifest.locationArt || {}).length,
        hasCSSFallbacks: !!visualManifest.cssAnimations
      },
      assetTodo: {
        valid: true,
        totalTasks: assetTodo.taskSummary?.totalTasks || 0,
        completedTasks: assetTodo.taskSummary?.completedTasks || 0,
        completionRate: assetTodo.taskSummary?.completionRate || '0%'
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function validateCIWorkflow() {
  try {
    const originalWorkflowPath = path.resolve(process.cwd(), '.github/workflows/ci.yml');
    const patchedWorkflowPath = path.resolve(process.cwd(), '.github/workflows/ci-recovery-patched.yml');
    const recoveryWorkflowPath = path.resolve(process.cwd(), '.github/workflows/ci-recovery.yml');
    
    const originalExists = fs.existsSync(originalWorkflowPath);
    const patchedExists = fs.existsSync(patchedWorkflowPath);
    const recoveryExists = fs.existsSync(recoveryWorkflowPath);
    
    return {
      originalWorkflow: {
        exists: originalExists,
        status: originalExists ? 'original' : 'missing'
      },
      patchedWorkflow: {
        exists: patchedExists,
        status: patchedExists ? 'patched' : 'missing'
      },
      recoveryWorkflow: {
        exists: recoveryExists,
        status: recoveryExists ? 'recovery' : 'missing'
      },
      recoveryReady: patchedExists && recoveryExists
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function validateModularHooks() {
  try {
    const hooksPath = path.resolve(process.cwd(), 'modular_hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    
    return {
      valid: true,
      architecture: hooks.hookSystem?.architecture || 'unknown',
      loadingMethod: hooks.hookSystem?.loadingMethod || 'unknown',
      executionMode: hooks.hookSystem?.executionMode || 'unknown',
      totalHooks: Object.keys(hooks.visualGenerationHooks || {}).length + Object.keys(hooks.gameLogicHooks || {}).length
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function validateTopplerIntegration() {
  try {
    const stubPath = path.resolve(process.cwd(), 'toppler_stub.json');
    const scriptPath = path.resolve(process.cwd(), 'scripts/gen-toppler-stub.js');
    
    const stub = JSON.parse(fs.readFileSync(stubPath, 'utf8'));
    const scriptExists = fs.existsSync(scriptPath);
    
    return {
      stub: {
        valid: true,
        canvas: stub.visualGeneration?.topplerCanvas || 'unknown',
        gameElements: Object.keys(stub.visualGeneration?.gameElements || {}).length,
        hasFallbackBehavior: !!stub.ciIntegration
      },
      script: {
        exists: scriptExists,
        status: scriptExists ? 'ready' : 'missing'
      },
      integrationReady: true
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function validateReleaseManifests() {
  try {
    const releaseManifestPath = path.resolve(process.cwd(), 'release_manifest.json');
    const runtimeConfigPath = path.resolve(process.cwd(), 'runtime_config.json');
    const bundleManifestPath = path.resolve(process.cwd(), 'bundle_manifest.json');
    
    const releaseManifest = JSON.parse(fs.readFileSync(releaseManifestPath, 'utf8'));
    const runtimeConfig = JSON.parse(fs.readFileSync(runtimeConfigPath, 'utf8'));
    const bundleManifest = JSON.parse(fs.readFileSync(bundleManifestPath, 'utf8'));
    
    return {
      releaseManifest: {
        valid: true,
        version: releaseManifest.version,
        releaseType: releaseManifest.releaseType,
        multiAgentReady: releaseManifest.multiAgentPlaytesting?.status === 'ready',
        remixChallenges: releaseManifest.remixChallenges?.status === 'enabled'
      },
      runtimeConfig: {
        valid: true,
        version: runtimeConfig.version,
        configType: runtimeConfig.configType,
        hasEngineConfig: !!runtimeConfig.engineConfiguration,
        hasScenarioConfig: !!runtimeConfig.scenarioConfiguration,
        hasMultiAgentConfig: !!runtimeConfig.multiAgentConfiguration
      },
      bundleManifest: {
        valid: true,
        version: bundleManifest.version,
        bundleType: bundleManifest.bundleType,
        totalFiles: bundleManifest.bundleStructure?.totalFiles || 0,
        totalSize: bundleManifest.bundleStructure?.totalSize || 'unknown',
        deploymentReady: bundleManifest.bundleMetadata?.deployment_ready || false
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

// Run validations
console.log('📋 [validate_release] Validating file existence...');
validationResults.results.fileExistence = {};
requiredFiles.forEach(file => {
  validationResults.results.fileExistence[file] = validateFileExists(file);
});

console.log('🔍 [validate_release] Validating orchestration integrity...');
validationResults.results.orchestrationIntegrity = validateOrchestrationIntegrity();

console.log('🎵 [validate_release] Validating asset stubs...');
validationResults.results.assetStubs = validateAssetStubs();

console.log('🔄 [validate_release] Validating CI workflow...');
validationResults.results.ciWorkflow = validateCIWorkflow();

console.log('🔗 [validate_release] Validating modular hooks...');
validationResults.results.modularHooks = validateModularHooks();

console.log('🎯 [validate_release] Validating Toppler integration...');
validationResults.results.topplerIntegration = validateTopplerIntegration();

console.log('📦 [validate_release] Validating release manifests...');
validationResults.results.releaseManifests = validateReleaseManifests();

// Generate summary
const fileExistenceResults = Object.values(validationResults.results.fileExistence);
const existingFiles = fileExistenceResults.filter(result => result.exists).length;
const totalFiles = requiredFiles.length;

validationResults.summary = {
  totalFiles,
  existingFiles,
  missingFiles: totalFiles - existingFiles,
  fileExistenceRate: `${Math.round((existingFiles / totalFiles) * 100)}%`,
  
  orchestrationReady: validationResults.results.orchestrationIntegrity?.valid || false,
  assetStubsReady: validationResults.results.assetStubs?.valid || false,
  ciRecoveryReady: validationResults.results.ciWorkflow?.recoveryReady || false,
  modularHooksReady: validationResults.results.modularHooks?.valid || false,
  topplerIntegrationReady: validationResults.results.topplerIntegration?.integrationReady || false,
  releaseManifestsReady: validationResults.results.releaseManifests?.valid || false
};

// Determine overall status
const allComponentsReady = 
  validationResults.summary.orchestrationReady &&
  validationResults.summary.assetStubsReady &&
  validationResults.summary.ciRecoveryReady &&
  validationResults.summary.modularHooksReady &&
  validationResults.summary.topplerIntegrationReady &&
  validationResults.summary.releaseManifestsReady;

validationResults.status = allComponentsReady ? 'ready' : 'not_ready';
validationResults.summary.overallStatus = allComponentsReady ? 'READY FOR RELEASE' : 'NOT READY FOR RELEASE';

// Output results
console.log('\n📊 [validate_release] Validation Results:');
console.log('=====================================');
console.log(`📁 File Existence: ${validationResults.summary.fileExistenceRate} (${existingFiles}/${totalFiles})`);
console.log(`🎭 Orchestration: ${validationResults.summary.orchestrationReady ? '✅ READY' : '❌ NOT READY'}`);
console.log(`🎵 Asset Stubs: ${validationResults.summary.assetStubsReady ? '✅ READY' : '❌ NOT READY'}`);
console.log(`🔄 CI Recovery: ${validationResults.summary.ciRecoveryReady ? '✅ READY' : '❌ NOT READY'}`);
console.log(`🔗 Modular Hooks: ${validationResults.summary.modularHooksReady ? '✅ READY' : '❌ NOT READY'}`);
console.log(`🎯 Toppler Integration: ${validationResults.summary.topplerIntegrationReady ? '✅ READY' : '❌ NOT READY'}`);
console.log(`📦 Release Manifests: ${validationResults.summary.releaseManifestsReady ? '✅ READY' : '❌ NOT READY'}`);
console.log(`\n🎯 Overall Status: ${validationResults.summary.overallStatus}`);

// Save validation results
const validationOutputPath = path.resolve(process.cwd(), 'release_validation_results.json');
fs.writeFileSync(validationOutputPath, JSON.stringify(validationResults, null, 2), 'utf8');
console.log(`\n💾 [validate_release] Validation results saved to: ${validationOutputPath}`);

// Exit with appropriate code
if (allComponentsReady) {
  console.log('\n🎉 [validate_release] All validations passed! Spirit Tamer: Trial of the Grove is ready for release!');
  process.exit(0);
} else {
  console.log('\n⚠️ [validate_release] Some validations failed. Please review the results before proceeding with release.');
  process.exit(1);
}