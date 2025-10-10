#!/usr/bin/env node

/**
 * MIFF HTML Consolidation Script
 * Identifies and removes duplicate HTML files to reduce count from 223 to <50
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HTMLConsolidator {
    constructor() {
        this.duplicates = new Map();
        this.keepFiles = new Set();
        this.removeFiles = new Set();
        this.stats = {
            total: 0,
            duplicates: 0,
            removed: 0,
            kept: 0
        };
    }

    async run() {
        console.log('🔍 Starting HTML consolidation process...');
        
        // Find all HTML files
        const htmlFiles = await this.findHTMLFiles();
        this.stats.total = htmlFiles.length;
        
        console.log(`📊 Found ${htmlFiles.length} HTML files`);
        
        // Group files by content hash
        await this.groupByContent(htmlFiles);
        
        // Identify files to keep and remove
        this.identifyDuplicates();
        
        // Remove duplicate files
        await this.removeDuplicates();
        
        // Generate report
        this.generateReport();
    }

    async findHTMLFiles() {
        const htmlFiles = [];
        
        function scanDirectory(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.html')) {
                    htmlFiles.push(fullPath);
                }
            }
        }
        
        scanDirectory('.');
        return htmlFiles;
    }

    async groupByContent(files) {
        console.log('🔍 Analyzing file contents...');
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const hash = crypto.createHash('md5').update(content).digest('hex');
                
                if (!this.duplicates.has(hash)) {
                    this.duplicates.set(hash, []);
                }
                
                this.duplicates.get(hash).push({
                    path: file,
                    size: content.length,
                    content: content
                });
            } catch (error) {
                console.warn(`⚠️  Could not read file: ${file}`);
            }
        }
    }

    identifyDuplicates() {
        console.log('🎯 Identifying duplicates...');
        
        for (const [hash, files] of this.duplicates) {
            if (files.length > 1) {
                this.stats.duplicates += files.length - 1;
                
                // Sort by priority: keep the most important file
                const sortedFiles = this.prioritizeFiles(files);
                
                // Keep the first (highest priority) file
                this.keepFiles.add(sortedFiles[0].path);
                
                // Mark others for removal
                for (let i = 1; i < sortedFiles.length; i++) {
                    this.removeFiles.add(sortedFiles[i].path);
                }
            } else {
                // Single file, keep it
                this.keepFiles.add(files[0].path);
            }
        }
        
        this.stats.kept = this.keepFiles.size;
        this.stats.removed = this.removeFiles.size;
    }

    prioritizeFiles(files) {
        return files.sort((a, b) => {
            const aPath = a.path;
            const bPath = b.path;
            
            // Priority order:
            // 1. Main index.html files
            // 2. Files in web/ directory (main site)
            // 3. Files in docs/ directory
            // 4. Files with shorter paths (less nested)
            // 5. Files with more content
            
            const aIsIndex = aPath.includes('index.html');
            const bIsIndex = bPath.includes('index.html');
            
            if (aIsIndex && !bIsIndex) return -1;
            if (!aIsIndex && bIsIndex) return 1;
            
            const aIsWeb = aPath.startsWith('./web/');
            const bIsWeb = bPath.startsWith('./web/');
            
            if (aIsWeb && !bIsWeb) return -1;
            if (!aIsWeb && bIsWeb) return 1;
            
            const aIsDocs = aPath.includes('/docs/');
            const bIsDocs = bPath.includes('/docs/');
            
            if (aIsDocs && !bIsDocs) return -1;
            if (!aIsDocs && bIsDocs) return 1;
            
            // Prefer shorter paths
            const aDepth = aPath.split('/').length;
            const bDepth = bPath.split('/').length;
            
            if (aDepth !== bDepth) return aDepth - bDepth;
            
            // Prefer more content
            return b.size - a.size;
        });
    }

    async removeDuplicates() {
        console.log('🗑️  Removing duplicate files...');
        
        for (const file of this.removeFiles) {
            try {
                fs.unlinkSync(file);
                console.log(`✅ Removed: ${file}`);
            } catch (error) {
                console.warn(`⚠️  Could not remove: ${file} - ${error.message}`);
            }
        }
    }

    generateReport() {
        console.log('\n📊 CONSOLIDATION REPORT');
        console.log('========================');
        console.log(`Total HTML files found: ${this.stats.total}`);
        console.log(`Duplicate files found: ${this.stats.duplicates}`);
        console.log(`Files kept: ${this.stats.kept}`);
        console.log(`Files removed: ${this.stats.removed}`);
        console.log(`Reduction: ${((this.stats.removed / this.stats.total) * 100).toFixed(1)}%`);
        
        if (this.stats.kept < 50) {
            console.log('🎉 SUCCESS: HTML file count reduced to under 50!');
        } else {
            console.log(`⚠️  Still ${this.stats.kept} files remaining. Target: <50`);
        }
        
        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            keptFiles: Array.from(this.keepFiles),
            removedFiles: Array.from(this.removeFiles)
        };
        
        fs.writeFileSync('html-consolidation-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: html-consolidation-report.json');
    }
}

// Run the consolidator
const consolidator = new HTMLConsolidator();
consolidator.run().catch(console.error);

export default HTMLConsolidator;