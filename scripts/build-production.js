#!/usr/bin/env node

/**
 * Production Build Script
 * Optimized production build with comprehensive validation and optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

console.log('🚀 Starting Production Build Process...\n');

const startTime = performance.now();
let buildSuccess = true;
const buildLog = [];

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message };
  buildLog.push(logEntry);
  
  const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${icon} [${timestamp}] ${message}`);
}

function executeCommand(command, description) {
  try {
    log(`Executing: ${description}...`);
    const result = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, 'success');
    return result;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    buildSuccess = false;
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Pre-build validation
    log('Step 1: Pre-build validation...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const requiredVersion = '18.0.0';
    if (nodeVersion < `v${requiredVersion}`) {
      throw new Error(`Node.js version ${requiredVersion} or higher required. Current: ${nodeVersion}`);
    }
    log(`✅ Node.js version check passed: ${nodeVersion}`, 'success');

    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json not found. Please run from project root.');
    }
    log('✅ Project structure validation passed', 'success');

    // Step 2: Clean previous builds
    log('Step 2: Cleaning previous builds...');
    executeCommand('npm run clean', 'Clean previous build artifacts');

    // Step 3: Install dependencies
    log('Step 3: Installing dependencies...');
    executeCommand('npm ci --only=production', 'Install production dependencies');

    // Step 4: TypeScript compilation
    log('Step 4: TypeScript compilation...');
    executeCommand('npx tsc --noEmit', 'TypeScript type checking');
    executeCommand('npx tsc', 'TypeScript compilation');

    // Step 5: Run tests
    log('Step 5: Running test suite...');
    executeCommand('npm run test:ci', 'Test suite execution');

    // Step 6: Linting
    log('Step 6: Code linting...');
    executeCommand('npm run lint', 'ESLint code analysis');

    // Step 7: Security audit
    log('Step 7: Security audit...');
    try {
      executeCommand('npm audit --audit-level=moderate', 'Security vulnerability scan');
    } catch (error) {
      log('⚠️ Security audit found issues, but continuing build...', 'warn');
    }

    // Step 8: Bundle optimization
    log('Step 8: Bundle optimization...');
    executeCommand('npm run build:optimize', 'Webpack bundle optimization');

    // Step 9: Bundle analysis
    log('Step 9: Bundle analysis...');
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      const totalSize = files.reduce((total, file) => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        return total + stats.size;
      }, 0);
      
      log(`📊 Bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`, 'info');
      
      // Check for large files
      files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        const sizeMB = stats.size / 1024 / 1024;
        if (sizeMB > 1) {
          log(`⚠️ Large file detected: ${file} (${sizeMB.toFixed(2)} MB)`, 'warn');
        }
      });
    }

    // Step 10: Production validation
    log('Step 10: Production validation...');
    
    // Check for console.log statements in production build
    const distFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.js'));
    let consoleLogCount = 0;
    distFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/console\.(log|debug|info)/g);
      if (matches) {
        consoleLogCount += matches.length;
      }
    });
    
    if (consoleLogCount > 0) {
      log(`⚠️ Found ${consoleLogCount} console statements in production build`, 'warn');
    } else {
      log('✅ No console statements found in production build', 'success');
    }

    // Check for source maps
    const sourceMapFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.map'));
    if (sourceMapFiles.length > 0) {
      log(`✅ Source maps generated: ${sourceMapFiles.length} files`, 'success');
    }

    // Step 11: Environment configuration
    log('Step 11: Environment configuration...');
    
    // Validate environment files
    const envFiles = ['.env.production', '.env.staging'];
    envFiles.forEach(envFile => {
      if (fs.existsSync(envFile)) {
        log(`✅ Environment file found: ${envFile}`, 'success');
      } else {
        log(`⚠️ Environment file missing: ${envFile}`, 'warn');
      }
    });

    // Step 12: Generate build report
    log('Step 12: Generating build report...');
    
    const endTime = performance.now();
    const buildDuration = Math.round(endTime - startTime);
    
    const buildReport = {
      timestamp: new Date().toISOString(),
      duration: buildDuration,
      success: buildSuccess,
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      bundleSize: totalSize || 0,
      consoleLogCount,
      sourceMapFiles: sourceMapFiles.length,
      distFiles: distFiles.length,
      logs: buildLog
    };

    // Save build report
    const reportPath = path.join(process.cwd(), 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(buildReport, null, 2));
    log(`✅ Build report saved: ${reportPath}`, 'success');

    // Step 13: Final validation
    log('Step 13: Final validation...');
    
    if (buildSuccess) {
      log('🎉 Production build completed successfully!', 'success');
      log(`⏱️  Build duration: ${buildDuration}ms`, 'info');
      log(`📦 Bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`, 'info');
      log(`📁 Generated files: ${distFiles.length}`, 'info');
      
      console.log('\n📊 Build Summary:');
      console.log(`   ✅ TypeScript compilation: PASSED`);
      console.log(`   ✅ Test suite: PASSED`);
      console.log(`   ✅ Linting: PASSED`);
      console.log(`   ✅ Bundle optimization: PASSED`);
      console.log(`   ✅ Production validation: PASSED`);
      console.log(`   ⏱️  Total duration: ${buildDuration}ms`);
      console.log(`   📦 Bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      
      process.exit(0);
    } else {
      log('❌ Production build failed!', 'error');
      process.exit(1);
    }

  } catch (error) {
    log(`💥 Build failed with error: ${error.message}`, 'error');
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('🛑 Build interrupted by user', 'warn');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('🛑 Build terminated', 'warn');
  process.exit(1);
});

// Run the build
main().catch(error => {
  log(`💥 Fatal error: ${error.message}`, 'error');
  process.exit(1);
});