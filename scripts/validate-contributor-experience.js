#!/usr/bin/env node

/**
 * Contributor Experience Validation Script
 * Validates the contributor onboarding experience and provides feedback
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Validating Contributor Experience...\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
  details: []
};

// Helper function to add result
function addResult(name, status, message, details = {}) {
  results.total++;
  results[status]++;
  results.details.push({ name, status, message, details });
  
  const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${message}`);
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Check if directory exists
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

// Check file content
function fileContains(filePath, content) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent.includes(content);
  } catch (error) {
    return false;
  }
}

// Check if command runs successfully
function commandExists(command) {
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Validation functions
function validateDocumentation() {
  console.log('\n📚 Checking Documentation...');
  
  const docs = [
    'CONTRIBUTOR_QUICK_START.md',
    'MODULE_DEVELOPMENT_GUIDE.md',
    'COMMUNITY_GUIDELINES.md',
    'CONTRIBUTOR_ONBOARDING_GUIDE.md',
    'README.md'
  ];
  
  docs.forEach(doc => {
    if (fileExists(doc)) {
      addResult(`Documentation: ${doc}`, 'passed', 'Document exists');
    } else {
      addResult(`Documentation: ${doc}`, 'failed', 'Document missing');
    }
  });
}

function validateExamples() {
  console.log('\n🎮 Checking Examples...');
  
  const examplesDir = 'examples';
  if (dirExists(examplesDir)) {
    addResult('Examples Directory', 'passed', 'Examples directory exists');
    
    // Check for simple game tutorial
    const tutorialDir = path.join(examplesDir, 'simple-game-tutorial');
    if (dirExists(tutorialDir)) {
      addResult('Simple Game Tutorial', 'passed', 'Tutorial directory exists');
      
      // Check tutorial files
      const tutorialFiles = ['README.md', 'src', 'tests'];
      tutorialFiles.forEach(file => {
        const filePath = path.join(tutorialDir, file);
        if (fileExists(filePath) || dirExists(filePath)) {
          addResult(`Tutorial: ${file}`, 'passed', 'Tutorial file exists');
        } else {
          addResult(`Tutorial: ${file}`, 'failed', 'Tutorial file missing');
        }
      });
    } else {
      addResult('Simple Game Tutorial', 'failed', 'Tutorial directory missing');
    }
  } else {
    addResult('Examples Directory', 'failed', 'Examples directory missing');
  }
}

function validateModuleStructure() {
  console.log('\n🏗️ Checking Module Structure...');
  
  const pureDir = 'miff/pure';
  if (dirExists(pureDir)) {
    addResult('Pure Modules Directory', 'passed', 'Pure modules directory exists');
    
    // Check for a sample module
    const sampleModules = ['SimpleGamePure', 'ItemsPure', 'AudioPure'];
    sampleModules.forEach(module => {
      const moduleDir = path.join(pureDir, module);
      if (dirExists(moduleDir)) {
        addResult(`Sample Module: ${module}`, 'passed', 'Sample module exists');
        
        // Check module files
        const moduleFiles = ['Manager.ts', 'index.ts', 'capabilities.ts'];
        moduleFiles.forEach(file => {
          const filePath = path.join(moduleDir, file);
          if (fileExists(filePath)) {
            addResult(`Module File: ${module}/${file}`, 'passed', 'Module file exists');
          } else {
            addResult(`Module File: ${module}/${file}`, 'failed', 'Module file missing');
          }
        });
      } else {
        addResult(`Sample Module: ${module}`, 'failed', 'Sample module missing');
      }
    });
  } else {
    addResult('Pure Modules Directory', 'failed', 'Pure modules directory missing');
  }
}

function validateTestingInfrastructure() {
  console.log('\n🧪 Checking Testing Infrastructure...');
  
  // Check package.json for test scripts
  if (fileExists('package.json')) {
    const packageContent = fs.readFileSync('package.json', 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    if (packageJson.scripts && packageJson.scripts.test) {
      addResult('Test Script', 'passed', 'Test script configured');
    } else {
      addResult('Test Script', 'failed', 'Test script missing');
    }
    
    if (packageJson.jest) {
      addResult('Jest Configuration', 'passed', 'Jest configured');
    } else {
      addResult('Jest Configuration', 'failed', 'Jest not configured');
    }
  } else {
    addResult('Package.json', 'failed', 'Package.json missing');
  }
  
  // Check for test files
  const testFiles = fs.readdirSync('miff/pure').filter(dir => {
    const testDir = path.join('miff/pure', dir, 'tests');
    return dirExists(testDir);
  });
  
  if (testFiles.length > 0) {
    addResult('Test Files', 'passed', `${testFiles.length} modules have tests`);
  } else {
    addResult('Test Files', 'failed', 'No test files found');
  }
}

function validateDevelopmentTools() {
  console.log('\n🛠️ Checking Development Tools...');
  
  // Check TypeScript configuration
  if (fileExists('tsconfig.json')) {
    addResult('TypeScript Config', 'passed', 'TypeScript configured');
  } else {
    addResult('TypeScript Config', 'failed', 'TypeScript not configured');
  }
  
  // Check ESLint configuration
  if (fileExists('.eslintrc.js') || fileExists('.eslintrc.json')) {
    addResult('ESLint Config', 'passed', 'ESLint configured');
  } else {
    addResult('ESLint Config', 'warnings', 'ESLint not configured');
  }
  
  // Check Prettier configuration
  if (fileExists('.prettierrc') || fileExists('.prettierrc.json')) {
    addResult('Prettier Config', 'passed', 'Prettier configured');
  } else {
    addResult('Prettier Config', 'warnings', 'Prettier not configured');
  }
}

function validateHealthChecks() {
  console.log('\n🏥 Checking Health Checks...');
  
  // Check if health check script exists
  if (fileExists('scripts/health-check.js')) {
    addResult('Health Check Script', 'passed', 'Health check script exists');
  } else {
    addResult('Health Check Script', 'failed', 'Health check script missing');
  }
  
  // Check if health check can run
  try {
    execSync('node scripts/health-check.js', { stdio: 'pipe' });
    addResult('Health Check Execution', 'passed', 'Health check runs successfully');
  } catch (error) {
    addResult('Health Check Execution', 'warnings', 'Health check has issues');
  }
}

function validateCapabilitySystem() {
  console.log('\n🔧 Checking Capability System...');
  
  // Check capability system files
  const capabilityFiles = [
    'miff/pure/shared/capability/CapabilitySystem.ts',
    'miff/pure/shared/capability/CapabilityGenerator.ts',
    'miff/pure/shared/capability/index.ts'
  ];
  
  capabilityFiles.forEach(file => {
    if (fileExists(file)) {
      addResult(`Capability File: ${file}`, 'passed', 'Capability file exists');
    } else {
      addResult(`Capability File: ${file}`, 'failed', 'Capability file missing');
    }
  });
  
  // Check for capability files in modules
  const moduleCapabilityFiles = fs.readdirSync('miff/pure').filter(dir => {
    const capabilityFile = path.join('miff/pure', dir, 'capabilities.ts');
    return fileExists(capabilityFile);
  });
  
  if (moduleCapabilityFiles.length > 0) {
    addResult('Module Capabilities', 'passed', `${moduleCapabilityFiles.length} modules have capabilities`);
  } else {
    addResult('Module Capabilities', 'failed', 'No module capabilities found');
  }
}

function validateCommunityInfrastructure() {
  console.log('\n🤝 Checking Community Infrastructure...');
  
  // Check for community files
  const communityFiles = [
    'COMMUNITY_GUIDELINES.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md'
  ];
  
  communityFiles.forEach(file => {
    if (fileExists(file)) {
      addResult(`Community File: ${file}`, 'passed', 'Community file exists');
    } else {
      addResult(`Community File: ${file}`, 'warnings', 'Community file missing');
    }
  });
  
  // Check for GitHub templates
  const githubDir = '.github';
  if (dirExists(githubDir)) {
    addResult('GitHub Directory', 'passed', 'GitHub directory exists');
    
    const templateFiles = ['ISSUE_TEMPLATE', 'pull_request_template.md'];
    templateFiles.forEach(file => {
      const filePath = path.join(githubDir, file);
      if (fileExists(filePath) || dirExists(filePath)) {
        addResult(`GitHub Template: ${file}`, 'passed', 'GitHub template exists');
      } else {
        addResult(`GitHub Template: ${file}`, 'warnings', 'GitHub template missing');
      }
    });
  } else {
    addResult('GitHub Directory', 'warnings', 'GitHub directory missing');
  }
}

// Run all validations
function runValidations() {
  console.log('🚀 Starting Contributor Experience Validation...\n');
  
  validateDocumentation();
  validateExamples();
  validateModuleStructure();
  validateTestingInfrastructure();
  validateDevelopmentTools();
  validateHealthChecks();
  validateCapabilitySystem();
  validateCommunityInfrastructure();
  
  // Calculate score
  const score = Math.round((results.passed / results.total) * 100);
  
  console.log('\n📊 Validation Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.total}`);
  console.log(`🎯 Score: ${score}%`);
  
  // Provide recommendations
  console.log('\n💡 Recommendations:');
  
  if (results.failed > 0) {
    console.log('❌ Critical issues that need to be addressed:');
    results.details
      .filter(d => d.status === 'failed')
      .forEach(d => console.log(`   - ${d.name}: ${d.message}`));
  }
  
  if (results.warnings > 0) {
    console.log('⚠️  Warnings that should be addressed:');
    results.details
      .filter(d => d.status === 'warnings')
      .forEach(d => console.log(`   - ${d.name}: ${d.message}`));
  }
  
  if (score >= 90) {
    console.log('🎉 Excellent! The contributor experience is well set up.');
  } else if (score >= 80) {
    console.log('👍 Good! The contributor experience is mostly ready.');
  } else if (score >= 70) {
    console.log('⚠️  Fair! The contributor experience needs improvement.');
  } else {
    console.log('❌ Poor! The contributor experience needs significant work.');
  }
  
  // Exit with appropriate code
  if (results.failed > 0) {
    process.exit(1);
  } else if (results.warnings > 5) {
    process.exit(2);
  } else {
    process.exit(0);
  }
}

// Run the validation
runValidations();