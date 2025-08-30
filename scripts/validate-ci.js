#!/usr/bin/env node

/**
 * CI Validation Script
 * Purpose: Validate CI workflows and identify issues for MIFF framework
 * Version: 1.0.0
 * Author: MIFF Framework
 * License: MIT
 * RemixSafe: true
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CI_VALIDATION_CONFIG = {
  requiredWorkflows: ['ci.yml', 'miff-ci.yml'],
  requiredScripts: ['gen-toppler', 'test:ci', 'build'],
  maxWorkflowSize: 10 * 1024, // 10KB
  logLevel: 'info'
};

// Validation results
const ciValidationResults = {
  timestamp: new Date().toISOString(),
  workflows: {},
  scripts: {},
  packageJson: {},
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
    ci: '🔄'
  }[type] || 'ℹ️';
  
  console.log(`${emoji} ${message}`);
}

// Validation functions
function validateWorkflowFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const yaml = content; // Basic YAML validation
    
    const result = {
      file: path.basename(filePath),
      valid: true,
      errors: [],
      warnings: [],
      metadata: {}
    };
    
    // Check file size
    const fileSize = fs.statSync(filePath).size;
    result.metadata.fileSize = fileSize;
    
    if (fileSize > CI_VALIDATION_CONFIG.maxWorkflowSize) {
      result.warnings.push(`File size exceeds limit: ${fileSize} bytes`);
    }
    
    // Check for required CI elements
    if (!yaml.includes('on:')) {
      result.warnings.push('Missing trigger configuration');
    }
    
    if (!yaml.includes('jobs:')) {
      result.warnings.push('Missing jobs configuration');
    }
    
    if (!yaml.includes('runs-on:')) {
      result.warnings.push('Missing runner configuration');
    }
    
    // Check for common CI steps
    const requiredSteps = ['checkout', 'setup-node', 'install', 'test'];
    for (const step of requiredSteps) {
      if (!yaml.includes(step)) {
        result.warnings.push(`Missing common step: ${step}`);
      }
    }
    
    // Check for npm scripts
    if (yaml.includes('npm run')) {
      result.metadata.hasNpmScripts = true;
    }
    
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

function validatePackageJson() {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return {
      valid: false,
      errors: ['package.json not found'],
      warnings: [],
      metadata: {}
    };
  }
  
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      metadata: {}
    };
    
    // Check scripts section
    if (!packageJson.scripts) {
      result.errors.push('Missing scripts section');
      result.valid = false;
    } else {
      const scripts = Object.keys(packageJson.scripts);
      result.metadata.scriptCount = scripts.length;
      result.metadata.scripts = scripts;
      
      // Check for required scripts
      for (const requiredScript of CI_VALIDATION_CONFIG.requiredScripts) {
        if (!scripts.includes(requiredScript)) {
          result.warnings.push(`Missing required script: ${requiredScript}`);
        }
      }
    }
    
    // Check dependencies
    if (packageJson.dependencies) {
      result.metadata.dependencyCount = Object.keys(packageJson.dependencies).length;
    }
    
    if (packageJson.devDependencies) {
      result.metadata.devDependencyCount = Object.keys(packageJson.devDependencies).length;
    }
    
    return result;
    
  } catch (error) {
    return {
      valid: false,
      errors: [`Parse error: ${error.message}`],
      warnings: [],
      metadata: {}
    };
  }
}

function findWorkflowFiles() {
  const workflowsDir = path.resolve(process.cwd(), '.github/workflows');
  
  if (!fs.existsSync(workflowsDir)) {
    return [];
  }
  
  return fs.readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map(file => path.join(workflowsDir, file));
}

function generateCIValidationReport() {
  const workflowCount = Object.keys(ciValidationResults.workflows).length;
  const validWorkflows = Object.values(ciValidationResults.workflows).filter(w => w.valid).length;
  const invalidWorkflows = workflowCount - validWorkflows;
  
  const packageJsonValid = ciValidationResults.packageJson.valid;
  
  ciValidationResults.summary = {
    workflowCount,
    validWorkflows,
    invalidWorkflows,
    packageJsonValid,
    overallStatus: (validWorkflows === workflowCount && packageJsonValid) ? 'healthy' : 'needs_attention'
  };
  
  return ciValidationResults;
}

function main() {
  log('🔄 Starting CI validation for MIFF framework...', 'ci');
  
  // Validate workflows
  const workflowFiles = findWorkflowFiles();
  
  if (workflowFiles.length === 0) {
    log('❌ No CI workflow files found', 'error');
    ciValidationResults.workflows = {};
  } else {
    log(`📁 Found ${workflowFiles.length} CI workflow files`, 'info');
    
    for (const file of workflowFiles) {
      log(`🔍 Validating workflow: ${path.basename(file)}`, 'validation');
      const result = validateWorkflowFile(file);
      ciValidationResults.workflows[path.basename(file)] = result;
      
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
  }
  
  // Validate package.json
  log('🔍 Validating package.json...', 'validation');
  const packageJsonResult = validatePackageJson();
  ciValidationResults.packageJson = packageJsonResult;
  
  if (packageJsonResult.valid) {
    log('✅ package.json: Valid', 'success');
  } else {
    log('❌ package.json: Invalid', 'error');
    packageJsonResult.errors.forEach(error => log(`   ${error}`, 'error'));
  }
  
  if (packageJsonResult.warnings.length > 0) {
    packageJsonResult.warnings.forEach(warning => log(`   ${warning}`, 'warning'));
  }
  
  // Generate report
  const report = generateCIValidationReport();
  
  log('', 'info');
  log('📊 CI Validation Report', 'info');
  log('=====================', 'info');
  log(`📁 Workflows: ${report.summary.workflowCount}`, 'info');
  log(`✅ Valid Workflows: ${report.summary.validWorkflows}`, 'success');
  log(`❌ Invalid Workflows: ${report.summary.invalidWorkflows}`, 'error');
  log(`📦 Package.json: ${report.summary.packageJsonValid ? 'Valid' : 'Invalid'}`, report.summary.packageJsonValid ? 'success' : 'error');
  log(`🏥 Overall Status: ${report.summary.overallStatus}`, report.summary.overallStatus === 'healthy' ? 'success' : 'warning');
  
  // Save detailed report
  const reportPath = path.resolve(process.cwd(), 'ci_validation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  log(`💾 Detailed report saved to: ${reportPath}`, 'info');
  
  // Exit with appropriate code
  if (report.summary.overallStatus === 'healthy') {
    log('🎉 CI configuration is healthy!', 'success');
    process.exit(0);
  } else {
    log('⚠️  CI configuration needs attention. Please review the issues above.', 'warning');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for modular use
module.exports = {
  validateWorkflowFile,
  validatePackageJson,
  findWorkflowFiles,
  generateCIValidationReport,
  CI_VALIDATION_CONFIG
};