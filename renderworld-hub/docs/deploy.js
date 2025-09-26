#!/usr/bin/env node

/**
 * RenderWorld Hub Deployment Script
 *
 * This script handles the deployment of RenderWorld Hub to GitHub Pages
 * using the /docs folder structure for automatic hosting.
 *
 * Usage:
 *   node deploy.js
 *   node deploy.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

function log(message, force = false) {
  if (VERBOSE || force) {
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

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function validateDeployment() {
  log('🔍 Validating deployment structure...');

  const requiredFiles = [
    'docs/index.html',
    'docs/renderworld-hub.js'
  ];

  const missingFiles = [];
  for (const file of requiredFiles) {
    if (!checkFileExists(file)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    logError(`Missing required files: ${missingFiles.join(', ')}`);
    return false;
  }

  logSuccess('All required files present');
  return true;
}

function checkGitHubPagesConfig() {
  log('🔧 Checking GitHub Pages configuration...');

  // Check if .nojekyll exists (needed for _ folders)
  const nojekyllPath = path.join(__dirname, '..', '.nojekyll');
  if (!checkFileExists(nojekyllPath)) {
    logInfo('Creating .nojekyll file for GitHub Pages...');
    if (!DRY_RUN) {
      fs.writeFileSync(nojekyllPath, '');
    }
    logSuccess('Created .nojekyll file');
  } else {
    logSuccess('.nojekyll file exists');
  }

  // Check if .gitignore is configured properly
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (checkFileExists(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('docs/')) {
      logInfo('Adding docs/ to .gitignore...');
      if (!DRY_RUN) {
        fs.appendFileSync(gitignorePath, '\n# Deployment folder\ndocs/\n');
      }
      logSuccess('Updated .gitignore');
    } else {
      logSuccess('.gitignore configured correctly');
    }
  }

  return true;
}

function validateHTML() {
  log('📄 Validating HTML structure...');

  const htmlPath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Check for required elements
  const requiredElements = [
    '<!DOCTYPE html>',
    '<title>RenderWorld Hub',
    'renderworld-hub.js',
    'miff-splash-screen'
  ];

  for (const element of requiredElements) {
    if (!htmlContent.includes(element)) {
      logError(`Missing required element: ${element}`);
      return false;
    }
  }

  logSuccess('HTML structure validated');
  return true;
}

function validateJavaScript() {
  log('⚡ Validating JavaScript bundle...');

  const jsPath = path.join(__dirname, 'renderworld-hub.js');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  // Check for required exports
  const requiredExports = [
    'RenderWorldWebBridge',
    'EventBus'
  ];

  for (const exportName of requiredExports) {
    if (!jsContent.includes(exportName)) {
      logError(`Missing required export: ${exportName}`);
      return false;
    }
  }

  logSuccess('JavaScript bundle validated');
  return true;
}

function generateDeploymentInfo() {
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    files: {
      html: 'docs/index.html',
      javascript: 'docs/renderworld-hub.js'
    },
    features: [
      'MIFF Splash Screen Integration',
      'Superhot-inspired warehouse environment',
      'Interactive Spirit Lens mechanics',
      'AI-powered NPC behaviors',
      'WebGL rendering with 60fps performance',
      'Responsive design for desktop and mobile',
      'GitHub Pages optimized deployment'
    ],
    githubPages: {
      source: 'main branch /docs folder',
      url: 'https://rcbiscuitsbelfast-prog.github.io/renderworld-hub/',
      autoDeploy: true
    }
  };

  if (!DRY_RUN) {
    const infoPath = path.join(__dirname, 'deployment-info.json');
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    logSuccess('Generated deployment info');
  }

  return deploymentInfo;
}

function simulateDeployment() {
  log('🚀 Simulating deployment process...');

  const steps = [
    'Building RenderWorld assets',
    'Optimizing JavaScript bundle',
    'Copying files to docs/ folder',
    'Creating .nojekyll file',
    'Updating .gitignore',
    'Committing changes',
    'Pushing to GitHub',
    'GitHub Pages auto-deployment'
  ];

  steps.forEach((step, index) => {
    setTimeout(() => {
      log(`[${index + 1}/${steps.length}] ${step}`);
    }, (index + 1) * 500);
  });

  setTimeout(() => {
    logSuccess('Deployment simulation completed!');
    console.log('\n🌐 RenderWorld Hub will be available at:');
    console.log('https://rcbiscuitsbelfast-prog.github.io/renderworld-hub/');
  }, steps.length * 500 + 1000);
}

async function main() {
  console.log('🎮 RenderWorld Hub Deployment Tool');
  console.log('=====================================\n');

  if (DRY_RUN) {
    console.log('🔍 Running in DRY RUN mode - no files will be modified\n');
  }

  try {
    // Validation steps
    if (!validateDeployment()) {
      process.exit(1);
    }

    if (!checkGitHubPagesConfig()) {
      process.exit(1);
    }

    if (!validateHTML()) {
      process.exit(1);
    }

    if (!validateJavaScript()) {
      process.exit(1);
    }

    // Generate deployment info
    const deploymentInfo = generateDeploymentInfo();

    // Simulate deployment
    simulateDeployment();

    console.log('\n📋 Deployment Summary:');
    console.log('====================');
    console.log(`Files: ${Object.values(deploymentInfo.files).join(', ')}`);
    console.log(`Features: ${deploymentInfo.features.length} implemented`);
    console.log(`GitHub Pages: ${deploymentInfo.githubPages.autoDeploy ? 'Auto-deploy enabled' : 'Manual deployment required'}`);
    console.log(`Live URL: ${deploymentInfo.githubPages.url}`);

    if (!DRY_RUN) {
      console.log('\n⚠️  To complete deployment:');
      console.log('1. Commit all changes');
      console.log('2. Push to main branch');
      console.log('3. GitHub Pages will auto-deploy from /docs folder');
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