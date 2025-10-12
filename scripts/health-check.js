#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 MIFF Framework Health Check\n');

const healthChecks = [
  {
    name: 'TypeScript Compilation',
    check: () => {
      try {
        const { execSync } = require('child_process');
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return { status: 'PASS', message: 'TypeScript compilation successful' };
      } catch (error) {
        return { status: 'FAIL', message: `TypeScript errors: ${error.message}` };
      }
    }
  },
  {
    name: 'Test Suite',
    check: () => {
      try {
        const { execSync } = require('child_process');
        execSync('npm run test:ci', { stdio: 'pipe' });
        return { status: 'PASS', message: 'All tests passing' };
      } catch (error) {
        return { status: 'FAIL', message: `Test failures: ${error.message}` };
      }
    }
  },
  {
    name: 'Manager Files',
    check: () => {
      const managerFiles = [];
      function findManagerFiles(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            findManagerFiles(filePath);
          } else if (file === 'Manager.ts') {
            managerFiles.push(filePath);
          }
        }
      }
      
      try {
        findManagerFiles('./miff/pure');
        const expectedCount = 225;
        if (managerFiles.length >= expectedCount) {
          return { status: 'PASS', message: `${managerFiles.length} Manager files found` };
        } else {
          return { status: 'WARN', message: `Only ${managerFiles.length} Manager files found (expected ${expectedCount})` };
        }
      } catch (error) {
        return { status: 'FAIL', message: `Error scanning Manager files: ${error.message}` };
      }
    }
  },
  {
    name: 'Test Coverage',
    check: () => {
      const testFiles = [];
      function findTestFiles(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            findTestFiles(filePath);
          } else if (file.endsWith('.test.ts')) {
            testFiles.push(filePath);
          }
        }
      }
      
      try {
        findTestFiles('./miff/pure');
        const expectedCount = 225;
        if (testFiles.length >= expectedCount) {
          return { status: 'PASS', message: `${testFiles.length} test files found` };
        } else {
          return { status: 'WARN', message: `Only ${testFiles.length} test files found (expected ${expectedCount})` };
        }
      } catch (error) {
        return { status: 'FAIL', message: `Error scanning test files: ${error.message}` };
      }
    }
  },
  {
    name: 'Security Modules',
    check: () => {
      const securityModules = [
        './miff/pure/shared/security/SafeExpressionEvaluator.ts',
        './miff/pure/shared/security/SafeJSONParser.ts',
        './miff/pure/shared/security/SafePathUtils.ts',
        './miff/pure/shared/security/SafeObjectUtils.ts',
        './miff/pure/shared/security/InputSanitizer.ts'
      ];
      
      const missing = securityModules.filter(module => !fs.existsSync(module));
      if (missing.length === 0) {
        return { status: 'PASS', message: 'All security modules present' };
      } else {
        return { status: 'FAIL', message: `Missing security modules: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: 'Performance Modules',
    check: () => {
      const performanceModules = [
        './miff/pure/shared/logging/StructuredLogger.ts',
        './miff/pure/shared/performance/PerformanceOptimizer.ts',
        './miff/pure/shared/memory/MemoryManager.ts'
      ];
      
      const missing = performanceModules.filter(module => !fs.existsSync(module));
      if (missing.length === 0) {
        return { status: 'PASS', message: 'All performance modules present' };
      } else {
        return { status: 'FAIL', message: `Missing performance modules: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: 'Documentation',
    check: () => {
      const docs = [
        './CONTRIBUTOR_ONBOARDING_GUIDE.md',
        './PRODUCTION_DEPLOYMENT_PLAN.md',
        './README.md'
      ];
      
      const missing = docs.filter(doc => !fs.existsSync(doc));
      if (missing.length === 0) {
        return { status: 'PASS', message: 'All documentation present' };
      } else {
        return { status: 'WARN', message: `Missing documentation: ${missing.join(', ')}` };
      }
    }
  }
];

let passed = 0;
let warned = 0;
let failed = 0;

console.log('Running health checks...\n');

for (const check of healthChecks) {
  try {
    const result = check.check();
    const status = result.status;
    const message = result.message;
    
    let icon = '❌';
    if (status === 'PASS') {
      icon = '✅';
      passed++;
    } else if (status === 'WARN') {
      icon = '⚠️';
      warned++;
    } else {
      failed++;
    }
    
    console.log(`${icon} ${check.name}: ${message}`);
  } catch (error) {
    console.log(`❌ ${check.name}: Error - ${error.message}`);
    failed++;
  }
}

console.log('\n📊 Health Check Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warned}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All health checks passed! Framework is ready for production.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some health checks failed. Please address issues before production deployment.');
  process.exit(1);
}