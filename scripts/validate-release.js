#!/usr/bin/env node

/**
 * Release Validation Script
 * Purpose: Validate release manifests and ensure release readiness
 * Version: 1.0.0
 * Author: MIFF Framework
 * License: MIT
 * RemixSafe: true
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RELEASE_CONFIG = {
  requiredFields: ['scenarioId', 'name', 'version', 'author', 'license', 'remixSafe'],
  requiredFiles: ['orchestration.json', 'README.md', 'release_manifest.json'],
  maxFileSize: 1024 * 1024, // 1MB
  logLevel: 'info'
};

// Validation results
const validationResults = {
  timestamp: new Date().toISOString(),
  scenario: 'Spirit Tamer: Trial of the Grove',
  status: 'unknown',
  errors: [],
  warnings: [],
  checks: {},
  summary: {}
};

// Logging functions
function log(message, type = 'info') {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    validation: '🔍',
    release: '🚀'
  }[type] || 'ℹ️';
  
  console.log(`${emoji} ${message}`);
}

// Validation functions
function validateReleaseManifest(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(content);
    
    const result = {
      file: path.basename(filePath),
      valid: true,
      errors: [],
      warnings: [],
      metadata: {}
    };
    
    // Check required fields - first try root level, then scenarioMetadata
    for (const field of RELEASE_CONFIG.requiredFields) {
      if (!manifest[field] && !manifest.scenarioMetadata?.[field]) {
        result.errors.push(`Missing required field: ${field}`);
        result.valid = false;
      }
    }
    
    // Check remix safety
    if (manifest.remixSafe === false) {
      result.warnings.push('Remix safety not enabled');
    }
    
    // Check version format
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      result.warnings.push('Version format should be semantic (e.g., 1.0.0)');
    }
    
    // Check license
    if (manifest.license && !['MIT', 'Apache-2.0', 'GPL-3.0', 'CC-BY-4.0'].includes(manifest.license)) {
      result.warnings.push('License should be a standard open source license');
    }
    
    result.metadata = {
      scenarioId: manifest.scenarioId || manifest.scenarioMetadata?.scenarioId,
      version: manifest.version || manifest.scenarioMetadata?.version,
      author: manifest.author || manifest.scenarioMetadata?.author,
      license: manifest.license || manifest.scenarioMetadata?.license,
      remixSafe: manifest.remixSafe || manifest.scenarioMetadata?.remixSafe
    };
    
    return result;
    
  } catch (error) {
    return {
      file: path.basename(filePath),
      valid: false,
      errors: [`Parse error: ${error.message}`],
      warnings: [],
      metadata: {}
    };
  }
}

function validateRequiredFiles() {
  const checks = {};
  let allValid = true;
  
  for (const file of RELEASE_CONFIG.requiredFiles) {
    const filePath = path.resolve(process.cwd(), 'SpiritTamerDemoPure', file);
    
    if (!fs.existsSync(filePath)) {
      checks[file] = { exists: false, valid: false, error: 'File not found' };
      allValid = false;
    } else {
      const stats = fs.statSync(filePath);
      checks[file] = {
        exists: true,
        valid: true,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };
      
      // Check file size
      if (stats.size > RELEASE_CONFIG.maxFileSize) {
        checks[file].warnings = [`File size exceeds limit: ${stats.size} bytes`];
      }
    }
  }
  
  return { checks, allValid };
}

function validateOrchestration() {
  const orchestrationPath = path.resolve(process.cwd(), 'SpiritTamerDemoPure/orchestration.json');
  
  if (!fs.existsSync(orchestrationPath)) {
    return { valid: false, error: 'Orchestration file not found' };
  }
  
  try {
    const content = fs.readFileSync(orchestrationPath, 'utf8');
    const orchestration = JSON.parse(content);
    
    // Basic validation
    const required = ['scenarioId', 'name', 'version', 'quests', 'npcs', 'locations'];
    const missing = required.filter(field => !orchestration[field]);
    
    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }
    
    return { valid: true, metadata: orchestration };
    
  } catch (error) {
    return { valid: false, error: `Parse error: ${error.message}` };
  }
}

function generateReleaseReport() {
  const totalChecks = Object.keys(validationResults.checks).length;
  const validChecks = Object.values(validationResults.checks).filter(c => c.valid).length;
  const invalidChecks = totalChecks - validChecks;
  
  validationResults.summary = {
    totalChecks,
    validChecks,
    invalidChecks,
    successRate: totalChecks > 0 ? `${Math.round((validChecks / totalChecks) * 100)}%` : '0%',
    releaseReady: validationResults.errors.length === 0 && validationResults.warnings.length <= 2
  };
  
  return validationResults;
}

function main() {
  log('🚀 Starting release validation for Spirit Tamer: Trial of the Grove...', 'release');
  
  // Validate release manifest
  const manifestPath = path.resolve(process.cwd(), 'SpiritTamerDemoPure/release_manifest.json');
  if (fs.existsSync(manifestPath)) {
    log('🔍 Validating release manifest...', 'validation');
    const manifestResult = validateReleaseManifest(manifestPath);
    validationResults.checks.manifest = manifestResult;
    
    if (manifestResult.valid) {
      log('✅ Release manifest: Valid', 'success');
    } else {
      log('❌ Release manifest: Invalid', 'error');
      manifestResult.errors.forEach(error => validationResults.errors.push(error));
    }
    
    if (manifestResult.warnings.length > 0) {
      manifestResult.warnings.forEach(warning => validationResults.warnings.push(warning));
    }
  } else {
    log('❌ Release manifest not found', 'error');
    validationResults.errors.push('Release manifest file not found');
  }
  
  // Validate required files
  log('🔍 Validating required files...', 'validation');
  const fileValidation = validateRequiredFiles();
  validationResults.checks.files = fileValidation;
  
  if (fileValidation.allValid) {
    log('✅ Required files: All present', 'success');
  } else {
    log('❌ Required files: Some missing', 'error');
    validationResults.errors.push('Some required files are missing');
  }
  
  // Validate orchestration
  log('🔍 Validating orchestration...', 'validation');
  const orchestrationValidation = validateOrchestration();
  validationResults.checks.orchestration = orchestrationValidation;
  
  if (orchestrationValidation.valid) {
    log('✅ Orchestration: Valid', 'success');
  } else {
    log('❌ Orchestration: Invalid', 'error');
    validationResults.errors.push(`Orchestration validation failed: ${orchestrationValidation.error}`);
  }
  
  // Generate report
  const report = generateReleaseReport();
  
  // Determine overall status
  if (report.errors.length === 0) {
    if (report.warnings.length === 0) {
      report.status = 'ready';
    } else {
      report.status = 'ready_with_warnings';
    }
  } else {
    report.status = 'not_ready';
  }
  
  // Display results
  log('', 'info');
  log('📊 Release Validation Report', 'release');
  log('============================', 'release');
  log(`🎮 Scenario: ${report.scenario}`, 'info');
  log(`📊 Status: ${report.status}`, report.status === 'ready' ? 'success' : 'warning');
  log(`✅ Valid Checks: ${report.summary.validChecks}/${report.summary.totalChecks}`, 'info');
  log(`📈 Success Rate: ${report.summary.successRate}`, 'info');
  log(`🚀 Release Ready: ${report.summary.releaseReady ? 'Yes' : 'No'}`, report.summary.releaseReady ? 'success' : 'error');
  
  if (report.errors.length > 0) {
    log('', 'info');
    log('❌ Errors Found:', 'error');
    report.errors.forEach(error => log(`   ${error}`, 'error'));
  }
  
  if (report.warnings.length > 0) {
    log('', 'info');
    log('⚠️  Warnings:', 'warning');
    report.warnings.forEach(warning => log(`   ${warning}`, 'warning'));
  }
  
  // Save detailed report
  const reportPath = path.resolve(process.cwd(), 'release_validation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  log(`💾 Detailed report saved to: ${reportPath}`, 'info');
  
  // Exit with appropriate code
  if (report.status === 'ready' || report.status === 'ready_with_warnings') {
    log('🎉 Release validation completed successfully!', 'success');
    if (report.status === 'ready') {
      log('🚀 Scenario is ready for release!', 'success');
    } else {
      log('⚠️  Scenario is ready but has warnings to address', 'warning');
    }
    process.exit(0);
  } else {
    log('❌ Release validation failed. Please fix the errors above.', 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for modular use
module.exports = {
  validateReleaseManifest,
  validateRequiredFiles,
  validateOrchestration,
  generateReleaseReport,
  RELEASE_CONFIG
};