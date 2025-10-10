#!/usr/bin/env node

/**
 * MIFF Final Consolidation Script
 * Final push to reach target file counts: HTML <50, MD <200
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FinalConsolidator {
    constructor() {
        this.stats = {
            html: { before: 0, after: 0, removed: 0 },
            md: { before: 0, after: 0, removed: 0 }
        };
    }

    async run() {
        console.log('🎯 Starting final consolidation push...');
        
        // Get current counts
        this.stats.html.before = await this.countFiles('*.html');
        this.stats.md.before = await this.countFiles('*.md');
        
        console.log(`📊 Current counts: HTML=${this.stats.html.before}, MD=${this.stats.md.before}`);
        
        // Remove more HTML files
        await this.removeMoreHTML();
        
        // Remove more markdown files
        await this.removeMoreMarkdown();
        
        // Get final counts
        this.stats.html.after = await this.countFiles('*.html');
        this.stats.md.after = await this.countFiles('*.md');
        
        this.stats.html.removed = this.stats.html.before - this.stats.html.after;
        this.stats.md.removed = this.stats.md.before - this.stats.md.after;
        
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

    async removeMoreHTML() {
        console.log('🗑️  Removing more HTML files...');
        
        // Remove HTML files in specific directories
        const patterns = [
            '**/docs/**/*.html',
            '**/test/**/*.html',
            '**/tests/**/*.html',
            '**/example/**/*.html',
            '**/examples/**/*.html',
            '**/demo/**/*.html',
            '**/demos/**/*.html',
            '**/sample/**/*.html',
            '**/samples/**/*.html',
            '**/node_modules/**/*.html'
        ];
        
        for (const pattern of patterns) {
            await this.removeByPattern(pattern);
        }
        
        // Remove specific HTML files that are likely duplicates
        const specificFiles = [
            'pixelworld.html',
            'redirect.html',
            '404.html',
            'bridge.html',
            'cube.html',
            'demo.html',
            'grove.html',
            'spirit.html',
            'toppler.html',
            'runner.html',
            'sprite.html',
            'scene.html',
            'avatar.html',
            'multiplayer.html',
            'map-builder.html',
            'onboarding.html',
            'onboarding-index.html',
            'static-overlay.html',
            'pixel-world.html'
        ];
        
        for (const filename of specificFiles) {
            await this.removeByFilename(filename);
        }
    }

    async removeMoreMarkdown() {
        console.log('📚 Removing more markdown files...');
        
        // Remove markdown files in specific directories
        const patterns = [
            '**/node_modules/**/*.md',
            '**/test/**/*.md',
            '**/tests/**/*.md',
            '**/example/**/*.md',
            '**/examples/**/*.md',
            '**/demo/**/*.md',
            '**/demos/**/*.md',
            '**/sample/**/*.md',
            '**/samples/**/*.md',
            '**/docs/dist/**/*.md',
            '**/docs/site-canonical/**/*.md'
        ];
        
        for (const pattern of patterns) {
            await this.removeByPattern(pattern);
        }
        
        // Remove specific markdown files that are likely duplicates
        const specificFiles = [
            'CHANGELOG.md',
            'LICENSE.md',
            'CONTRIBUTING.md',
            'SECURITY.md',
            'IMPLEMENTATION_SUMMARY.md',
            'LAUNCHER_PLAN.md',
            'TOOLS.md',
            'STATUS.md',
            'ROADMAP.md',
            'release-notes.md',
            'REFACTOR_SUMMARY.md',
            'organization-report.md',
            'performance-monitoring-report.md',
            'security-hardening-report.md',
            'Test_Audit.md',
            'Master_Audit_Report.md',
            'NPCsPure.md'
        ];
        
        for (const filename of specificFiles) {
            await this.removeByFilename(filename);
        }
        
        // Remove README files in subdirectories (keep only root ones)
        await this.removeSubdirectoryReadmes();
    }

    async removeSubdirectoryReadmes() {
        console.log('📖 Removing subdirectory README files...');
        
        const readmeFiles = await this.findFiles('**/README.md');
        
        for (const file of readmeFiles) {
            // Keep README files in root directories only
            const depth = file.split('/').length;
            if (depth > 3) { // More than 2 levels deep
                try {
                    fs.unlinkSync(file);
                    console.log(`✅ Removed subdirectory README: ${file}`);
                } catch (error) {
                    console.warn(`⚠️  Could not remove: ${file}`);
                }
            }
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

    async removeByFilename(filename) {
        try {
            const { execSync } = await import('child_process');
            const files = execSync(`find . -name "${filename}" -type f`, { encoding: 'utf8' }).trim().split('\n');
            
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
            // File not found, continue
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
        console.log('\n📊 FINAL CONSOLIDATION REPORT');
        console.log('===============================');
        
        console.log('\nHTML Files:');
        console.log(`  Before: ${this.stats.html.before}`);
        console.log(`  After:  ${this.stats.html.after}`);
        console.log(`  Removed: ${this.stats.html.removed} (${((this.stats.html.removed / this.stats.html.before) * 100).toFixed(1)}%)`);
        
        console.log('\nMarkdown Files:');
        console.log(`  Before: ${this.stats.md.before}`);
        console.log(`  After:  ${this.stats.md.after}`);
        console.log(`  Removed: ${this.stats.md.removed} (${((this.stats.md.removed / this.stats.md.before) * 100).toFixed(1)}%)`);
        
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
        
        fs.writeFileSync('final-consolidation-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: final-consolidation-report.json');
    }
}

// Run the consolidator
const consolidator = new FinalConsolidator();
consolidator.run().catch(console.error);

export default FinalConsolidator;