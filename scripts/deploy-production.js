#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 MIFF Framework Production Deployment\n');

// Deployment configuration
const config = {
  sourceDir: './miff/pure',
  distDir: './dist',
  backupDir: './backups',
  version: '1.0.0',
  timestamp: new Date().toISOString()
};

// Create necessary directories
function createDirectories() {
  const dirs = [config.distDir, config.backupDir, './logs'];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// Backup current deployment
function backupCurrentDeployment() {
  if (fs.existsSync(config.distDir)) {
    const backupPath = path.join(config.backupDir, `backup-${config.timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Copy current dist to backup
    copyDirectory(config.distDir, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
  }
}

// Copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Deploy Manager files
function deployManagerFiles() {
  console.log('Deploying Manager files...');
  
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
  
  findManagerFiles(config.sourceDir);
  
  let deployed = 0;
  managerFiles.forEach(filePath => {
    const relativePath = path.relative(config.sourceDir, filePath);
    const destPath = path.join(config.distDir, relativePath);
    const destDir = path.dirname(destPath);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, destPath);
    deployed++;
  });
  
  console.log(`✅ Deployed ${deployed} Manager files`);
  return deployed;
}

// Deploy shared modules
function deploySharedModules() {
  console.log('Deploying shared modules...');
  
  const sharedDir = path.join(config.sourceDir, 'shared');
  if (!fs.existsSync(sharedDir)) {
    console.log('⚠️  No shared modules found');
    return 0;
  }
  
  const destSharedDir = path.join(config.distDir, 'shared');
  copyDirectory(sharedDir, destSharedDir);
  
  console.log('✅ Deployed shared modules');
  return 1;
}

// Deploy test files
function deployTestFiles() {
  console.log('Deploying test files...');
  
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
  
  findTestFiles(config.sourceDir);
  
  let deployed = 0;
  testFiles.forEach(filePath => {
    const relativePath = path.relative(config.sourceDir, filePath);
    const destPath = path.join(config.distDir, relativePath);
    const destDir = path.dirname(destPath);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, destPath);
    deployed++;
  });
  
  console.log(`✅ Deployed ${deployed} test files`);
  return deployed;
}

// Create deployment manifest
function createDeploymentManifest() {
  const manifest = {
    version: config.version,
    timestamp: config.timestamp,
    deployment: {
      managerFiles: 0,
      testFiles: 0,
      sharedModules: 0
    },
    status: 'deployed',
    checksum: 'generated'
  };
  
  const manifestPath = path.join(config.distDir, 'deployment-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Created deployment manifest');
  
  return manifest;
}

// Create production index file
function createProductionIndex() {
  const indexContent = `// MIFF Framework Production Build
// Version: ${config.version}
// Deployed: ${config.timestamp}

console.log('🚀 MIFF Framework v${config.version} - Production Build');
console.log('📅 Deployed:', '${config.timestamp}');

// Export all Manager classes
export * from './miff/pure';

// Framework information
export const FRAMEWORK_INFO = {
  name: 'MIFF Framework',
  version: '${config.version}',
  deployed: '${config.timestamp}',
  status: 'production'
};

// Health check function
export function healthCheck() {
  return {
    status: 'healthy',
    version: '${config.version}',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}

// Default export
export default {
  version: '${config.version}',
  healthCheck,
  info: FRAMEWORK_INFO
};
`;

  const indexPath = path.join(config.distDir, 'index.js');
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Created production index file');
}

// Validate deployment
function validateDeployment() {
  console.log('Validating deployment...');
  
  const issues = [];
  
  // Check if dist directory exists
  if (!fs.existsSync(config.distDir)) {
    issues.push('Dist directory not created');
  }
  
  // Check if Manager files exist
  const managerFiles = [];
  function findManagerFiles(dir) {
    if (!fs.existsSync(dir)) return;
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
  
  findManagerFiles(config.distDir);
  
  if (managerFiles.length === 0) {
    issues.push('No Manager files found in deployment');
  }
  
  // Check if manifest exists
  const manifestPath = path.join(config.distDir, 'deployment-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    issues.push('Deployment manifest not found');
  }
  
  if (issues.length === 0) {
    console.log('✅ Deployment validation passed');
    return true;
  } else {
    console.log('❌ Deployment validation failed:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    return false;
  }
}

// Main deployment function
async function deploy() {
  try {
    console.log('Starting production deployment...\n');
    
    // Step 1: Create directories
    createDirectories();
    
    // Step 2: Backup current deployment
    backupCurrentDeployment();
    
    // Step 3: Deploy Manager files
    const managerCount = deployManagerFiles();
    
    // Step 4: Deploy shared modules
    const sharedCount = deploySharedModules();
    
    // Step 5: Deploy test files
    const testCount = deployTestFiles();
    
    // Step 6: Create production index
    createProductionIndex();
    
    // Step 7: Create deployment manifest
    const manifest = createDeploymentManifest();
    manifest.deployment.managerFiles = managerCount;
    manifest.deployment.testFiles = testCount;
    manifest.deployment.sharedModules = sharedCount;
    
    // Step 8: Validate deployment
    const isValid = validateDeployment();
    
    if (isValid) {
      console.log('\n🎉 Production deployment completed successfully!');
      console.log(`📊 Deployed ${managerCount} Manager files`);
      console.log(`📊 Deployed ${testCount} test files`);
      console.log(`📊 Deployed ${sharedCount} shared modules`);
      console.log(`📁 Deployment directory: ${config.distDir}`);
      console.log(`📅 Deployment time: ${config.timestamp}`);
      
      process.exit(0);
    } else {
      console.log('\n❌ Production deployment failed validation');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run deployment
deploy();