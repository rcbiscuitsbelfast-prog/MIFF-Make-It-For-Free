#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Clean external URLs from license files
 * This script removes external URLs from license files while preserving essential licensing information
 */

const licenseFiles = [
  'docs/assets/KayKitAssets/LICENSE.txt',
  'docs/assets/Isometric Blocks/License.txt'
];

const processedFiles = [];
const errors = [];

function cleanLicenseFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove external URLs while preserving essential information
    content = content.replace(/https?:\/\/[^\s]+/g, '[URL_REMOVED]');
    content = content.replace(/http:\/\/[^\s]+/g, '[URL_REMOVED]');
    
    // Clean up any remaining URL patterns
    content = content.replace(/www\.[^\s]+/g, '[WEBSITE_REMOVED]');
    
    // Remove social media references but keep the names
    content = content.replace(/@[^\s]+/g, '[SOCIAL_HANDLE_REMOVED]');
    
    // Clean up any malformed URL remnants
    content = content.replace(/[^\s]*\.com[^\s]*/g, '[DOMAIN_REMOVED]');
    content = content.replace(/[^\s]*\.io[^\s]*/g, '[DOMAIN_REMOVED]');
    content = content.replace(/[^\s]*\.shop[^\s]*/g, '[DOMAIN_REMOVED]');

    // Only write if content changed
    if (content !== originalContent) {
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, originalContent);
      
      // Write cleaned content
      fs.writeFileSync(filePath, content);
      processedFiles.push(filePath);
      
      console.log(`✅ Cleaned external URLs from: ${path.basename(filePath)}`);
    } else {
      console.log(`ℹ️  No external URLs found in: ${path.basename(filePath)}`);
    }
  } catch (error) {
    errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

console.log('🧹 Cleaning external URLs from license files...');

licenseFiles.forEach(cleanLicenseFile);

console.log(`\n📊 Summary:`);
console.log(`✅ Files processed: ${processedFiles.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(({ file, error }) => {
    console.log(`  ${file}: ${error}`);
  });
}

console.log('\n🎉 License URL cleaning completed!');
console.log('📝 Backup files created with .backup extension');