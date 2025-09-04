#!/usr/bin/env node

/**
 * Orchestration Validation Script
 * Purpose: Validate scenario orchestration files for MIFF framework
 * Version: 1.0.0
 * Author: MIFF Framework
 * License: MIT
 * RemixSafe: true
 */

const fs = require('fs');
const path = require('path');

// Configuration
const VALIDATION_CONFIG = {
  requiredFields: ['scenarioId', 'name', 'version', 'quests', 'npcs', 'locations', 'triggers'],
  schemaVersion: 'v14',
  maxFileSize: 1024 * 1024, // 1MB
  logLevel: 'info'
};

// Validation results
const validationResults = {
  timestamp: new Date().toISOString(),
  totalScenarios: 0,
  validScenarios: 0,
  invalidScenarios: 0,
  results: {},
  summary: {}
};

// Logging functions
function log(message, type = 'info') {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    validation: '🔍'
  }[type] || 'ℹ️';
  
  console.log(`${emoji} ${message}`);
}

// Validation functions
function validateOrchestrationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const orchestration = JSON.parse(content);
    
    const result = {
      file: filePath,
      valid: true,
      errors: [],
      warnings: [],
      metadata: {}
    };
    
    // Check required fields
    for (const field of VALIDATION_CONFIG.requiredFields) {
      if (!orchestration[field]) {
        result.errors.push(`Missing required field: ${field}`);
        result.valid = false;
      }
    }
    
    // Check schema version
    if (orchestration.schema && orchestration.schema !== VALIDATION_CONFIG.schemaVersion) {
      result.warnings.push(`Schema version mismatch: expected ${VALIDATION_CONFIG.schemaVersion}, got ${orchestration.schema}`);
    }
    
    // Check file size
    const fileSize = fs.statSync(filePath).size;
    if (fileSize > VALIDATION_CONFIG.maxFileSize) {
      result.warnings.push(`File size exceeds limit: ${fileSize} bytes`);
    }
    
    // Validate quests
    if (orchestration.quests) {
      const questCount = Object.keys(orchestration.quests).length;
      result.metadata.questCount = questCount;
      
      if (questCount === 0) {
        result.warnings.push('No quests defined');
      }
      
      // Check quest structure
      for (const [questId, quest] of Object.entries(orchestration.quests)) {
        if (!quest.steps || quest.steps.length === 0) {
          result.warnings.push(`Quest ${questId} has no steps`);
        }
      }
    }
    
    // Validate NPCs
    if (orchestration.npcs) {
      const npcCount = Object.keys(orchestration.npcs).length;
      result.metadata.npcCount = npcCount;
      
      if (npcCount === 0) {
        result.warnings.push('No NPCs defined');
      }
    }
    
    // Validate locations
    if (orchestration.locations) {
      const locationCount = Object.keys(orchestration.locations).length;
      result.metadata.locationCount = locationCount;
      
      if (locationCount === 0) {
        result.warnings.push('No locations defined');
      }
    }
    
    // Validate triggers
    if (orchestration.triggers) {
      const triggerCount = Object.keys(orchestration.triggers).length;
      result.metadata.triggerCount = triggerCount;
      
      if (triggerCount === 0) {
        result.warnings.push('No triggers defined');
      }
    }
    
    // Check remix safety
    if (orchestration.remixSafe === false) {
      result.warnings.push('Remix safety not enabled');
    }
    
    return result;
    
  } catch (error) {
    return {
      file: filePath,
      valid: false,
      errors: [`Parse error: ${error.message}`],
      warnings: [],
      metadata: {}
    };
  }
}

function walk(dir, acc) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && full.endsWith('.json')) acc.push(full);
  }
}

function findOrchestrationFiles() {
  const files = [];
  // Prefer curated scenario files; ignore legacy golden outputs that don't follow orchestration schema
  const roots = [
    path.resolve(process.cwd(), 'scenarios'),
    path.resolve(process.cwd(), 'miff/pure/WitcherExplorerDemoPure/fixtures'),
  ];
  for (const root of roots) {
    if (fs.existsSync(root)) {
      walk(root, files);
    }
  }
  // Filter out known non-orchestration outputs
  const ignoredNames = new Set([
    'spiritTamer.golden.json',
    'toppler.golden.json',
    'topplerDemo.golden.json'
  ]);
  return files.filter(f => !ignoredNames.has(path.basename(f)));
}

function generateValidationReport() {
  const totalScenarios = Object.keys(validationResults.results).length;
  const validScenarios = Object.values(validationResults.results).filter(r => r.valid).length;
  const invalidScenarios = totalScenarios - validScenarios;
  
  validationResults.totalScenarios = totalScenarios;
  validationResults.validScenarios = validScenarios;
  validationResults.invalidScenarios = invalidScenarios;
  
  validationResults.summary = {
    totalScenarios,
    validScenarios,
    invalidScenarios,
    successRate: totalScenarios > 0 ? `${Math.round((validScenarios / totalScenarios) * 100)}%` : '0%'
  };
  
  return validationResults;
}

function main() {
  log('🔍 Starting orchestration validation for MIFF framework...', 'validation');
  
  const orchestrationFiles = findOrchestrationFiles();
  
  if (orchestrationFiles.length === 0) {
    log('❌ No orchestration files found', 'error');
    process.exit(1);
  }
  
  log(`📁 Found ${orchestrationFiles.length} orchestration files`, 'info');
  
  // Validate each file
  for (const file of orchestrationFiles) {
    log(`🔍 Validating: ${path.basename(file)}`, 'validation');
    const result = validateOrchestrationFile(file);
    validationResults.results[path.basename(file)] = result;
    
    if (result.valid) {
      log(`✅ ${path.basename(file)}: Valid`, 'success');
    } else {
      log(`❌ ${path.basename(file)}: Invalid`, 'error');
      result.errors.forEach(error => log(`   ${error}`, 'error'));
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => log(`   ${warning}`, 'warning'));
    }
  }
  
  // Generate report
  const report = generateValidationReport();
  
  log('', 'info');
  log('📊 Validation Report', 'info');
  log('==================', 'info');
  log(`📁 Total Scenarios: ${report.totalScenarios}`, 'info');
  log(`✅ Valid Scenarios: ${report.validScenarios}`, 'success');
  log(`❌ Invalid Scenarios: ${report.invalidScenarios}`, 'error');
  log(`📈 Success Rate: ${report.summary.successRate}`, 'info');
  
  // Save detailed report
  const reportPath = path.resolve(process.cwd(), 'orchestration_validation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  log(`💾 Detailed report saved to: ${reportPath}`, 'info');
  
  // Exit with appropriate code
  if (report.invalidScenarios > 0) {
    log('⚠️  Some scenarios failed validation. Please review the errors above.', 'warning');
    process.exit(1);
  } else {
    log('🎉 All orchestration files are valid!', 'success');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for modular use
module.exports = {
  validateOrchestrationFile,
  findOrchestrationFiles,
  generateValidationReport,
  VALIDATION_CONFIG
};