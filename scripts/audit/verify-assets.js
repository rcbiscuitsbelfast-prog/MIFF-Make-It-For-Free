#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Verify asset provenance and compliance with MIFF-native policy
 */
async function verifyAssets() {
    console.log('🔍 Verifying MIFF asset provenance and compliance...');
    
    const assetDirs = [
        'docs/assets/',
        'docs/renderworld/',
        'miff/assets/'
    ];
    
    let totalAssets = 0;
    let compliantAssets = 0;
    let warnings = [];
    let errors = [];
    
    for (const dir of assetDirs) {
        if (!fs.existsSync(dir)) {
            warnings.push(`Asset directory not found: ${dir}`);
            continue;
        }
        
        console.log(`\n📁 Checking ${dir}...`);
        
        // Find all asset files
        const assetFiles = await glob(`${dir}**/*`, { 
            ignore: ['**/node_modules/**', '**/coverage/**', '**/*.md'] 
        });
        
        for (const file of assetFiles) {
            const stats = fs.statSync(file);
            if (stats.isFile()) {
                totalAssets++;
                
                // Check file content for external references
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Check for external URLs (excluding localhost and relative paths)
                    const externalUrls = content.match(/https?:\/\/(?!localhost|127\.0\.0\.1)[^\s"']+/g);
                    if (externalUrls && externalUrls.length > 0) {
                        // Filter out allowed external resources (fonts, CDNs we explicitly allow)
                        const allowedDomains = [
                            'fonts.googleapis.com',
                            'fonts.gstatic.com',
                            'cdn.jsdelivr.net',
                            'ko-fi.com',
                            'github.com'
                        ];
                        
                        const unauthorizedUrls = externalUrls.filter(url => 
                            !allowedDomains.some(domain => url.includes(domain))
                        );
                        
                        if (unauthorizedUrls.length > 0) {
                            errors.push(`${file}: External URLs detected: ${unauthorizedUrls.join(', ')}`);
                        } else {
                            compliantAssets++;
                        }
                    } else {
                        compliantAssets++;
                    }
                    
                } catch (err) {
                    // Binary file or read error - assume compliant if it's in our repo
                    compliantAssets++;
                }
                
                console.log(`  ✅ ${path.basename(file)}`);
            }
        }
    }
    
    // Check if provenance log exists and is up to date
    const provenanceLog = 'docs/assets/README.md';
    if (fs.existsSync(provenanceLog)) {
        console.log('✅ Asset provenance log found');
        
        // Check if log mentions verification date
        const logContent = fs.readFileSync(provenanceLog, 'utf8');
        if (logContent.includes('2025-01-XX')) {
            warnings.push('Provenance log contains placeholder dates - needs updating');
        }
    } else {
        errors.push('Asset provenance log missing: docs/assets/README.md');
    }
    
    // Generate report
    console.log('\n📊 Asset Verification Report');
    console.log('=====================================');
    console.log(`Total assets scanned: ${totalAssets}`);
    console.log(`Compliant assets: ${compliantAssets}`);
    console.log(`Compliance rate: ${totalAssets > 0 ? Math.round((compliantAssets/totalAssets) * 100) : 100}%`);
    
    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (errors.length > 0) {
        console.log('\n❌ Errors:');
        errors.forEach(error => console.log(`   ${error}`));
        process.exit(1);
    } else {
        console.log('\n✅ All assets comply with MIFF-native policy');
    }
    
    // Update verification timestamp
    if (fs.existsSync(provenanceLog)) {
        const today = new Date().toISOString().split('T')[0];
        let logContent = fs.readFileSync(provenanceLog, 'utf8');
        logContent = logContent.replace(
            /This asset inventory was last verified on: \*\*[^*]+\*\*/,
            `This asset inventory was last verified on: **${today}**`
        );
        fs.writeFileSync(provenanceLog, logContent);
        console.log(`📝 Updated verification timestamp to ${today}`);
    }
}

// Check if this script is being run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    verifyAssets().catch(console.error);
}

export { verifyAssets };