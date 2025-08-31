#!/usr/bin/env node

/**
 * MIFF Documentation Deployment Setup Script
 * 
 * This script helps verify and configure the deployment environment
 * for the MIFF documentation site.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 MIFF Documentation Deployment Setup\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const isDocsDir = fs.existsSync(path.join(currentDir, 'astro.config.mjs'));

if (!isDocsDir) {
  console.error('❌ Error: This script must be run from the docs/ directory');
  console.log('Please run: cd docs && node miff/scripts/setup-deployment.js');
  process.exit(1);
}

console.log('✅ Running from docs/ directory');

// Check required files
const requiredFiles = [
  'astro.config.mjs',
  'package.json',
  'src/layouts/Layout.astro',
  '.github/workflows/deploy.yml',
  'public/favicon.svg',
  'public/404.html'
];

console.log('\n📋 Checking required files...');

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (missing)`);
  }
}

// Check package.json configuration
console.log('\n📦 Checking package.json configuration...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  if (packageJson.homepage === 'https://miff-framework.github.io/miff') {
    console.log('✅ Homepage URL configured correctly');
  } else {
    console.log('❌ Homepage URL not configured correctly');
  }
  
  if (packageJson.repository?.url === 'https://github.com/miff-framework/miff') {
    console.log('✅ Repository URL configured correctly');
  } else {
    console.log('❌ Repository URL not configured correctly');
  }
  
  if (packageJson.scripts.deploy) {
    console.log('✅ Deploy script configured');
  } else {
    console.log('❌ Deploy script missing');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check Astro configuration
console.log('\n⚙️ Checking Astro configuration...');

try {
  const astroConfig = fs.readFileSync('astro.config.mjs', 'utf-8');
  
  if (astroConfig.includes('base: \'/miff\'')) {
    console.log('✅ Base path configured for GitHub Pages');
  } else {
    console.log('❌ Base path not configured correctly');
  }
  
  if (astroConfig.includes('site: \'https://miff-framework.github.io\'')) {
    console.log('✅ Site URL configured correctly');
  } else {
    console.log('❌ Site URL not configured correctly');
  }
} catch (error) {
  console.log('❌ Error reading astro.config.mjs:', error.message);
}

// Check GitHub Actions workflow
console.log('\n🔧 Checking GitHub Actions workflow...');

try {
  const workflowPath = '.github/workflows/deploy.yml';
  if (fs.existsSync(workflowPath)) {
    const workflow = fs.readFileSync(workflowPath, 'utf-8');
    
    if (workflow.includes('actions/deploy-pages@v4')) {
      console.log('✅ GitHub Pages deployment action configured');
    } else {
      console.log('❌ GitHub Pages deployment action not found');
    }
    
    if (workflow.includes('npm run generate-cli-docs')) {
      console.log('✅ CLI documentation generation included');
    } else {
      console.log('❌ CLI documentation generation not included');
    }
  } else {
    console.log('❌ GitHub Actions workflow file missing');
  }
} catch (error) {
  console.log('❌ Error reading workflow file:', error.message);
}

// Check dependencies
console.log('\n📚 Checking dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const requiredDeps = ['astro', '@astrojs/markdown-remark', '@astrojs/mdx', '@astrojs/sitemap', '@astrojs/tailwind'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} (missing)`);
    }
  }
} catch (error) {
  console.log('❌ Error checking dependencies:', error.message);
}

// Test build process
console.log('\n🔨 Testing build process...');

try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Generating CLI documentation...');
  execSync('npm run generate-cli-docs', { stdio: 'inherit' });
  
  console.log('Building site...');
  execSync('npm run build', { stdio: 'inherit' });
  
  if (fs.existsSync('dist')) {
    console.log('✅ Build successful - dist/ directory created');
  } else {
    console.log('❌ Build failed - dist/ directory not found');
  }
} catch (error) {
  console.log('❌ Build process failed:', error.message);
}

// Deployment instructions
console.log('\n📋 Deployment Instructions:');
console.log('');
console.log('1. Ensure GitHub Pages is enabled in repository settings');
console.log('2. Set source to "GitHub Actions" in Pages settings');
console.log('3. Push changes to main branch to trigger deployment');
console.log('4. Site will be available at: https://miff-framework.github.io/miff');
console.log('');
console.log('To enable GitHub Pages:');
console.log('- Go to repository Settings > Pages');
console.log('- Set Source to "GitHub Actions"');
console.log('- Save the settings');
console.log('');
console.log('To test locally:');
console.log('- Run: npm run dev');
console.log('- Open: http://localhost:4321/miff');
console.log('');
console.log('To deploy manually:');
console.log('- Run: npm run build');
console.log('- Push to main branch');
console.log('');

console.log('🎉 Setup complete!');
console.log('The documentation site is ready for deployment to GitHub Pages.');