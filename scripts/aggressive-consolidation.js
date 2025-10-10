#!/usr/bin/env node

/**
 * MIFF Aggressive Consolidation Script
 * More aggressive consolidation to reach target file counts
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AggressiveConsolidator {
    constructor() {
        this.stats = {
            html: { before: 0, after: 0, removed: 0 },
            md: { before: 0, after: 0, removed: 0 },
            json: { before: 0, after: 0, removed: 0 }
        };
    }

    async run() {
        console.log('🚀 Starting aggressive consolidation...');
        
        // Get current counts
        this.stats.html.before = await this.countFiles('*.html');
        this.stats.md.before = await this.countFiles('*.md');
        this.stats.json.before = await this.countFiles('*.json');
        
        console.log(`📊 Current counts: HTML=${this.stats.html.before}, MD=${this.stats.md.before}, JSON=${this.stats.json.before}`);
        
        // Remove auto-generated and build files
        await this.removeBuildFiles();
        
        // Remove duplicate documentation
        await this.removeDuplicateDocs();
        
        // Remove test and example files
        await this.removeTestFiles();
        
        // Remove node_modules duplicates
        await this.removeNodeModulesDuplicates();
        
        // Get final counts
        this.stats.html.after = await this.countFiles('*.html');
        this.stats.md.after = await this.countFiles('*.md');
        this.stats.json.after = await this.countFiles('*.json');
        
        this.stats.html.removed = this.stats.html.before - this.stats.html.after;
        this.stats.md.removed = this.stats.md.before - this.stats.md.after;
        this.stats.json.removed = this.stats.json.before - this.stats.json.after;
        
        this.generateReport();
    }

    async countFiles(pattern) {
        const { execSync } = await import('child_process');
        try {
            const result = execSync(`find . -name "${pattern}" | wc -l`, { encoding: 'utf8' });
            return parseInt(result.trim());
        } catch (error) {
            return 0;
        }
    }

    async removeBuildFiles() {
        console.log('🗑️  Removing build and generated files...');
        
        const buildPatterns = [
            '**/dist/**',
            '**/build/**',
            '**/out/**',
            '**/.next/**',
            '**/coverage/**',
            '**/node_modules/**/README.md',
            '**/node_modules/**/CHANGELOG.md',
            '**/node_modules/**/LICENSE.md'
        ];
        
        for (const pattern of buildPatterns) {
            await this.removeByPattern(pattern);
        }
    }

    async removeDuplicateDocs() {
        console.log('📚 Removing duplicate documentation...');
        
        // Remove duplicate README files in subdirectories
        const readmeFiles = await this.findFiles('**/README.md');
        const readmeByContent = new Map();
        
        for (const file of readmeFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const hash = crypto.createHash('md5').update(content).digest('hex');
                
                if (!readmeByContent.has(hash)) {
                    readmeByContent.set(hash, []);
                }
                readmeByContent.get(hash).push(file);
            } catch (error) {
                // Skip files that can't be read
            }
        }
        
        // Keep only one README per content hash, prefer root-level ones
        for (const [hash, files] of readmeByContent) {
            if (files.length > 1) {
                const sortedFiles = files.sort((a, b) => {
                    const aDepth = a.split('/').length;
                    const bDepth = b.split('/').length;
                    return aDepth - bDepth;
                });
                
                // Keep the first (shallowest) file, remove the rest
                for (let i = 1; i < sortedFiles.length; i++) {
                    try {
                        fs.unlinkSync(sortedFiles[i]);
                        console.log(`✅ Removed duplicate README: ${sortedFiles[i]}`);
                    } catch (error) {
                        console.warn(`⚠️  Could not remove: ${sortedFiles[i]}`);
                    }
                }
            }
        }
    }

    async removeTestFiles() {
        console.log('🧪 Removing test and example files...');
        
        const testPatterns = [
            '**/test/**/*.html',
            '**/tests/**/*.html',
            '**/spec/**/*.html',
            '**/example/**/*.html',
            '**/examples/**/*.html',
            '**/demo/**/*.html',
            '**/demos/**/*.html',
            '**/sample/**/*.html',
            '**/samples/**/*.html'
        ];
        
        for (const pattern of testPatterns) {
            await this.removeByPattern(pattern);
        }
    }

    async removeNodeModulesDuplicates() {
        console.log('📦 Removing node_modules duplicates...');
        
        // Remove common duplicate files in node_modules
        const commonDuplicates = [
            '**/node_modules/**/README.md',
            '**/node_modules/**/CHANGELOG.md',
            '**/node_modules/**/LICENSE.md',
            '**/node_modules/**/CONTRIBUTING.md',
            '**/node_modules/**/SECURITY.md'
        ];
        
        for (const pattern of commonDuplicates) {
            await this.removeByPattern(pattern);
        }
    }

    async removeByPattern(pattern) {
        try {
            const { execSync } = await import('child_process');
            const files = execSync(`find . -path "${pattern}" -type f`, { encoding: 'utf8' }).trim().split('\n');
            
            for (const file of files) {
                if (file && fs.existsSync(file)) {
                    try {
                        fs.unlinkSync(file);
                        console.log(`✅ Removed: ${file}`);
                    } catch (error) {
                        console.warn(`⚠️  Could not remove: ${file}`);
                    }
                }
            }
        } catch (error) {
            // Pattern not found, continue
        }
    }

    async findFiles(pattern) {
        try {
            const { execSync } = await import('child_process');
            const result = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' });
            return result.trim().split('\n').filter(f => f);
        } catch (error) {
            return [];
        }
    }

    generateReport() {
        console.log('\n📊 AGGRESSIVE CONSOLIDATION REPORT');
        console.log('=====================================');
        
        console.log('\nHTML Files:');
        console.log(`  Before: ${this.stats.html.before}`);
        console.log(`  After:  ${this.stats.html.after}`);
        console.log(`  Removed: ${this.stats.html.removed} (${((this.stats.html.removed / this.stats.html.before) * 100).toFixed(1)}%)`);
        
        console.log('\nMarkdown Files:');
        console.log(`  Before: ${this.stats.md.before}`);
        console.log(`  After:  ${this.stats.md.after}`);
        console.log(`  Removed: ${this.stats.md.removed} (${((this.stats.md.removed / this.stats.md.before) * 100).toFixed(1)}%)`);
        
        console.log('\nJSON Files:');
        console.log(`  Before: ${this.stats.json.before}`);
        console.log(`  After:  ${this.stats.json.after}`);
        console.log(`  Removed: ${this.stats.json.removed} (${((this.stats.json.removed / this.stats.json.before) * 100).toFixed(1)}%)`);
        
        // Check targets
        const htmlTarget = this.stats.html.after < 50;
        const mdTarget = this.stats.md.after < 200;
        
        console.log('\n🎯 TARGET ACHIEVEMENT:');
        console.log(`  HTML < 50: ${htmlTarget ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'} (${this.stats.html.after}/50)`);
        console.log(`  MD < 200: ${mdTarget ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'} (${this.stats.md.after}/200)`);
        
        if (htmlTarget && mdTarget) {
            console.log('\n🎉 SUCCESS: All targets achieved!');
        } else {
            console.log('\n⚠️  Some targets not yet achieved. Consider more aggressive consolidation.');
        }
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            targets: {
                html: { target: 50, achieved: htmlTarget },
                md: { target: 200, achieved: mdTarget }
            }
        };
        
        fs.writeFileSync('aggressive-consolidation-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: aggressive-consolidation-report.json');
    }
}

// Run the consolidator
const consolidator = new AggressiveConsolidator();
consolidator.run().catch(console.error);

export default AggressiveConsolidator;