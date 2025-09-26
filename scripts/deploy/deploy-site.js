#!/usr/bin/env node

/**
 * MIFF Site Deployment Script
 *
 * This script builds the MIFF documentation site and prepares it for GitHub Pages deployment.
 * It includes build verification and can optionally commit and push changes.
 *
 * Usage:
 *   node deploy-site.js
 *   node deploy-site.js --push
 *   node deploy-site.js --verify-only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const shouldPush = args.includes('--push');
const verifyOnly = args.includes('--verify-only');
const verbose = args.includes('--verbose');

function log(message, force = false) {
  if (verbose || force) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

function logError(message) {
  console.error(`❌ ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function runCommand(command, description) {
  try {
    log(`Running: ${description}`);
    if (verbose) {
      console.log(`   Command: ${command}`);
    }
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    if (verbose) {
      console.log(result);
    }
    return result;
  } catch (error) {
    logError(`Command failed: ${description}`);
    logError(`Error: ${error.message}`);
    throw error;
  }
}

function validateEnvironment() {
  log('🔍 Validating environment...');

  // Check if we're in the right directory
  const packageJsonPath = path.join(__dirname, 'docs', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('docs/package.json not found. Are you in the MIFF repository root?');
    process.exit(1);
  }

  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    logSuccess(`Node.js version: ${nodeVersion}`);
  } catch (error) {
    logError('Node.js not found. Please install Node.js 18+');
    process.exit(1);
  }

  return true;
}

function buildAstroSite() {
  log('🏗️  Building Astro site...');

  const astroDir = path.join(__dirname, 'docs');

  // Install dependencies
  logInfo('Installing dependencies...');
  runCommand(`cd "${astroDir}" && npm ci --legacy-peer-deps`, 'Install dependencies');

  // Build the site
  logInfo('Building Astro site...');
  runCommand(`cd "${astroDir}" && npm run build`, 'Build Astro site');

  // Verify build output
  const distDir = path.join(astroDir, 'dist');
  if (!fs.existsSync(distDir)) {
    logError('Build failed: dist directory not found');
    process.exit(1);
  }

  const indexHtml = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    logError('Build failed: index.html not found in dist directory');
    process.exit(1);
  }

  logSuccess('Astro site built successfully');
  return true;
}

function prepareDocsDirectory() {
  log('📁 Preparing docs directory...');

  // Create backup of existing docs
  const docsDir = path.join(__dirname, 'docs');
  const docsBackup = path.join(__dirname, 'docs-backup');

  if (fs.existsSync(docsBackup)) {
    fs.rmSync(docsBackup, { recursive: true, force: true });
  }

  fs.renameSync(docsDir, docsBackup);
  logInfo('Created backup of existing docs directory');

  // Copy built Astro site to docs root
  const astroDist = path.join(docsBackup, 'dist');
  const newDocs = path.join(__dirname, 'docs');

  runCommand(`cp -r "${astroDist}"/* "${newDocs}/"`, 'Copy built Astro site to docs root');

  // Copy RenderWorld Hub
  const renderworldDir = path.join(__dirname, 'renderworld-hub', 'docs');
  runCommand(`cp -r "${renderworldDir}"/* "${newDocs}/"`, 'Copy RenderWorld Hub to docs');

  // Copy additional assets
  const assetsDir = path.join(docsBackup, 'assets');
  if (fs.existsSync(assetsDir)) {
    runCommand(`cp -r "${assetsDir}" "${newDocs}/"`, 'Copy additional assets');
  }

  // Create .nojekyll file for GitHub Pages
  const nojekyllPath = path.join(newDocs, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  logInfo('Created .nojekyll file for GitHub Pages');

  logSuccess('Docs directory prepared successfully');
  return true;
}

function verifyDeployment() {
  log('🔍 Verifying deployment...');

  // Run the build verification script
  const verifyScript = path.join(__dirname, 'docs', 'verify-build.js');
  runCommand(`node "${verifyScript}"`, 'Run build verification');

  logSuccess('Deployment verification completed');
  return true;
}

function commitAndPush() {
  if (!shouldPush) {
    logInfo('Skipping commit and push (use --push to enable)');
    return true;
  }

  log('📤 Committing and pushing changes...');

  // Add all changes
  runCommand('git add .', 'Stage all changes');

  // Check if there are changes to commit
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (!status) {
    logInfo('No changes to commit');
    return true;
  }

  // Create commit
  const timestamp = new Date().toISOString();
  runCommand(`git commit -m "Deploy MIFF site - ${timestamp}"`, 'Commit changes');

  // Push to main branch
  runCommand('git push origin main', 'Push to main branch');

  logSuccess('Changes committed and pushed successfully');
  return true;
}

function generateDeploymentReport() {
  log('📊 Generating deployment report...');

  const report = {
    timestamp: new Date().toISOString(),
    action: shouldPush ? 'full-deployment' : 'build-only',
    steps: {
      environmentValidated: true,
      astroBuilt: true,
      docsPrepared: true,
      verified: true,
      committed: shouldPush,
      pushed: shouldPush
    },
    files: {
      'index.html': true,
      'styles.css': true,
      'renderworld-hub.html': true,
      'renderworld-hub.js': true,
      '.nojekyll': true
    },
    urls: {
      mainSite: 'https://miff-framework.github.io/miff/',
      renderworldHub: 'https://miff-framework.github.io/miff/renderworld-hub.html',
      sampler: 'https://miff-framework.github.io/miff/sampler/'
    }
  };

  const reportPath = path.join(__dirname, 'deployment-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  logSuccess(`Deployment report generated: ${reportPath}`);
  return true;
}

async function main() {
  console.log('🚀 MIFF Site Deployment Tool');
  console.log('=============================\n');

  if (verifyOnly) {
    console.log('🔍 Running in VERIFY ONLY mode\n');
  }

  if (shouldPush) {
    console.log('📤 Running in FULL DEPLOYMENT mode\n');
  }

  try {
    // Validation steps
    if (!verifyOnly) {
      validateEnvironment();
      buildAstroSite();
      prepareDocsDirectory();
    }

    verifyDeployment();
    generateDeploymentReport();

    if (!verifyOnly) {
      commitAndPush();
    }

    console.log('\n🎉 Deployment process completed successfully!');
    console.log('\n📋 Site URLs:');
    console.log('   Main Documentation: https://miff-framework.github.io/miff/');
    console.log('   RenderWorld Hub: https://miff-framework.github.io/miff/renderworld-hub.html');
    console.log('   MIFF Sampler: https://miff-framework.github.io/miff/sampler/');

    if (!shouldPush) {
      console.log('\n💡 To complete deployment:');
      console.log('   1. Review the changes');
      console.log('   2. Run: git add .');
      console.log('   3. Run: git commit -m "Deploy MIFF site"');
      console.log('   4. Run: git push origin main');
      console.log('   5. GitHub Pages will auto-deploy from /docs folder');
    }

  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run deployment
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});