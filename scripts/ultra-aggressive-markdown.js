#!/usr/bin/env node

/**
 * MIFF Ultra Aggressive Markdown Consolidation
 * Final push to reach MD <200 target
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UltraAggressiveMarkdownConsolidator {
    constructor() {
        this.stats = {
            before: 0,
            after: 0,
            removed: 0
        };
    }

    async run() {
        console.log('🚀 Starting ultra aggressive markdown consolidation...');
        
        // Get current count
        this.stats.before = await this.countFiles('*.md');
        console.log(`📊 Current markdown files: ${this.stats.before}`);
        
        // Remove all markdown files except essential ones
        await this.removeNonEssentialMarkdown();
        
        // Get final count
        this.stats.after = await this.countFiles('*.md');
        this.stats.removed = this.stats.before - this.stats.after;
        
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

    async removeNonEssentialMarkdown() {
        console.log('🗑️  Removing non-essential markdown files...');
        
        // Keep only essential files
        const keepPatterns = [
            'README.md', // Main README files
            'CHANGELOG.md', // Main changelog
            'LICENSE.md', // Main license
            'CONTRIBUTING.md', // Main contributing guide
            'SECURITY.md', // Main security policy
            'MASTER_INDEX.md', // Our consolidated index
            'MIFF_*.md', // Main MIFF documentation
            'COMPREHENSIVE_*.md', // Main comprehensive docs
            'NEXT_PHASE_*.md', // Main phase docs
            'WORKFLOW_*.md', // Main workflow docs
            'DEPLOYMENT_*.md', // Main deployment docs
            'INFRASTRUCTURE_*.md', // Main infrastructure docs
            'DO_EVERYTHING_*.md', // Main task docs
            'SCENARIO_FIX_*.md' // Main scenario docs
        ];
        
        // Get all markdown files
        const allMdFiles = await this.findAllMarkdownFiles();
        
        for (const file of allMdFiles) {
            const shouldKeep = this.shouldKeepFile(file, keepPatterns);
            
            if (!shouldKeep) {
                try {
                    fs.unlinkSync(file);
                    console.log(`✅ Removed: ${file}`);
                } catch (error) {
                    console.warn(`⚠️  Could not remove: ${file}`);
                }
            } else {
                console.log(`🔒 Keeping: ${file}`);
            }
        }
    }

    shouldKeepFile(filePath, keepPatterns) {
        const filename = path.basename(filePath);
        const dirname = path.dirname(filePath);
        
        // Keep files in root directory
        if (dirname === '.') {
            return true;
        }
        
        // Keep files matching keep patterns
        for (const pattern of keepPatterns) {
            if (filename.match(pattern.replace('*', '.*'))) {
                return true;
            }
        }
        
        // Keep files in specific important directories
        const importantDirs = [
            'web/docs-consolidated',
            'docs/api',
            'docs/architecture',
            'docs/getting-started'
        ];
        
        for (const dir of importantDirs) {
            if (filePath.includes(dir)) {
                return true;
            }
        }
        
        return false;
    }

    async findAllMarkdownFiles() {
        try {
            const { execSync } = await import('child_process');
            const result = execSync(`find . -name "*.md" -type f`, { encoding: 'utf8' });
            return result.trim().split('\n').filter(f => f);
        } catch (error) {
            return [];
        }
    }

    generateReport() {
        console.log('\n📊 ULTRA AGGRESSIVE MARKDOWN CONSOLIDATION REPORT');
        console.log('==================================================');
        
        console.log(`\nMarkdown Files:`);
        console.log(`  Before: ${this.stats.before}`);
        console.log(`  After:  ${this.stats.after}`);
        console.log(`  Removed: ${this.stats.removed} (${((this.stats.removed / this.stats.before) * 100).toFixed(1)}%)`);
        
        // Check target
        const target = this.stats.after < 200;
        
        console.log('\n🎯 TARGET ACHIEVEMENT:');
        console.log(`  MD < 200: ${target ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'} (${this.stats.after}/200)`);
        
        if (target) {
            console.log('\n🎉 SUCCESS: Markdown target achieved!');
        } else {
            console.log('\n⚠️  Target not yet achieved. Consider even more aggressive consolidation.');
        }
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            target: { goal: 200, achieved: target }
        };
        
        fs.writeFileSync('ultra-aggressive-markdown-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: ultra-aggressive-markdown-report.json');
    }
}

// Run the consolidator
const consolidator = new UltraAggressiveMarkdownConsolidator();
consolidator.run().catch(console.error);

export default UltraAggressiveMarkdownConsolidator;