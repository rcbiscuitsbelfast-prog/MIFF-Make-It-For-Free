#!/usr/bin/env node

/**
 * MIFF Markdown Consolidation Script
 * Consolidates duplicate markdown files to reduce count from 1,361 to <200
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarkdownConsolidator {
    constructor() {
        this.duplicates = new Map();
        this.keepFiles = new Set();
        this.removeFiles = new Set();
        this.consolidatedContent = new Map();
        this.stats = {
            total: 0,
            duplicates: 0,
            removed: 0,
            kept: 0,
            consolidated: 0
        };
    }

    async run() {
        console.log('🔍 Starting Markdown consolidation process...');
        
        // Find all markdown files
        const mdFiles = await this.findMarkdownFiles();
        this.stats.total = mdFiles.length;
        
        console.log(`📊 Found ${mdFiles.length} markdown files`);
        
        // Group files by content hash
        await this.groupByContent(mdFiles);
        
        // Identify files to keep and remove
        this.identifyDuplicates();
        
        // Consolidate similar content
        await this.consolidateContent();
        
        // Remove duplicate files
        await this.removeDuplicates();
        
        // Generate consolidated documentation
        await this.generateConsolidatedDocs();
        
        // Generate report
        this.generateReport();
    }

    async findMarkdownFiles() {
        const mdFiles = [];
        
        function scanDirectory(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.md')) {
                    mdFiles.push(fullPath);
                }
            }
        }
        
        scanDirectory('.');
        return mdFiles;
    }

    async groupByContent(files) {
        console.log('🔍 Analyzing markdown contents...');
        
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
                    content: content,
                    basename: path.basename(file)
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
            // 1. Main README.md files in root directories
            // 2. Files in docs/ directory
            // 3. Files with more content
            // 4. Files with shorter paths
            
            const aIsRootReadme = aPath.endsWith('/README.md') && aPath.split('/').length <= 3;
            const bIsRootReadme = bPath.endsWith('/README.md') && bPath.split('/').length <= 3;
            
            if (aIsRootReadme && !bIsRootReadme) return -1;
            if (!aIsRootReadme && bIsRootReadme) return 1;
            
            const aIsDocs = aPath.includes('/docs/');
            const bIsDocs = bPath.includes('/docs/');
            
            if (aIsDocs && !bIsDocs) return -1;
            if (!aIsDocs && bIsDocs) return 1;
            
            // Prefer more content
            if (a.size !== b.size) return b.size - a.size;
            
            // Prefer shorter paths
            const aDepth = aPath.split('/').length;
            const bDepth = bPath.split('/').length;
            
            return aDepth - bDepth;
        });
    }

    async consolidateContent() {
        console.log('📝 Consolidating similar content...');
        
        // Group files by basename for potential consolidation
        const contentGroups = new Map();
        
        for (const file of this.keepFiles) {
            const basename = path.basename(file);
            if (!contentGroups.has(basename)) {
                contentGroups.set(basename, []);
            }
            contentGroups.get(basename).push(file);
        }
        
        // Consolidate similar files
        for (const [basename, files] of contentGroups) {
            if (files.length > 1 && basename === 'README.md') {
                await this.consolidateReadmeFiles(files);
            }
        }
    }

    async consolidateReadmeFiles(files) {
        const consolidatedContent = [];
        const sections = new Map();
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                let currentSection = 'General';
                let sectionContent = [];
                
                for (const line of lines) {
                    if (line.startsWith('# ')) {
                        // Save previous section
                        if (sectionContent.length > 0) {
                            if (!sections.has(currentSection)) {
                                sections.set(currentSection, []);
                            }
                            sections.get(currentSection).push({
                                file: file,
                                content: sectionContent.join('\n')
                            });
                        }
                        
                        // Start new section
                        currentSection = line.substring(2).trim();
                        sectionContent = [line];
                    } else {
                        sectionContent.push(line);
                    }
                }
                
                // Save last section
                if (sectionContent.length > 0) {
                    if (!sections.has(currentSection)) {
                        sections.set(currentSection, []);
                    }
                    sections.get(currentSection).push({
                        file: file,
                        content: sectionContent.join('\n')
                    });
                }
            } catch (error) {
                console.warn(`⚠️  Could not process file: ${file}`);
            }
        }
        
        // Create consolidated README
        if (sections.size > 0) {
            const consolidatedPath = 'web/docs-consolidated/README.md';
            await this.createConsolidatedReadme(consolidatedPath, sections);
            this.stats.consolidated++;
        }
    }

    async createConsolidatedReadme(filePath, sections) {
        let content = '# MIFF Documentation\n\n';
        content += 'This is a consolidated README containing information from multiple sources.\n\n';
        
        for (const [sectionName, sectionFiles] of sections) {
            content += `## ${sectionName}\n\n`;
            
            // Merge content from all files for this section
            const mergedContent = this.mergeSectionContent(sectionFiles);
            content += mergedContent + '\n\n';
        }
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created consolidated README: ${filePath}`);
    }

    mergeSectionContent(sectionFiles) {
        // Simple merge - just concatenate content
        // In a more sophisticated version, we could deduplicate similar content
        return sectionFiles.map(item => item.content).join('\n\n---\n\n');
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

    async generateConsolidatedDocs() {
        console.log('📚 Generating consolidated documentation...');
        
        const docsDir = 'web/docs-consolidated';
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        
        // Create master documentation index
        const masterIndex = this.createMasterIndex();
        fs.writeFileSync(path.join(docsDir, 'MASTER_INDEX.md'), masterIndex);
        
        console.log(`✅ Created master documentation index: ${docsDir}/MASTER_INDEX.md`);
    }

    createMasterIndex() {
        let content = '# MIFF Master Documentation Index\n\n';
        content += 'This is the consolidated documentation index for the MIFF framework.\n\n';
        
        content += '## Quick Navigation\n\n';
        content += '- [Getting Started](./README.md)\n';
        content += '- [API Reference](./api/)\n';
        content += '- [Tutorials](./tutorials/)\n';
        content += '- [Best Practices](./best-practices/)\n';
        content += '- [Contributing](./contributing/)\n\n';
        
        content += '## Module Documentation\n\n';
        
        // Add sections for different types of documentation
        const categories = [
            'Core Modules',
            'Rendering',
            'Animation',
            'Audio',
            'Networking',
            'AI/ML',
            'Tools',
            'Testing'
        ];
        
        for (const category of categories) {
            content += `### ${category}\n\n`;
            content += `*Documentation for ${category.toLowerCase()} modules*\n\n`;
        }
        
        content += '## Statistics\n\n';
        content += `- Total files processed: ${this.stats.total}\n`;
        content += `- Duplicates removed: ${this.stats.removed}\n`;
        content += `- Files kept: ${this.stats.kept}\n`;
        content += `- Consolidated files: ${this.stats.consolidated}\n`;
        
        return content;
    }

    generateReport() {
        console.log('\n📊 CONSOLIDATION REPORT');
        console.log('========================');
        console.log(`Total markdown files found: ${this.stats.total}`);
        console.log(`Duplicate files found: ${this.stats.duplicates}`);
        console.log(`Files kept: ${this.stats.kept}`);
        console.log(`Files removed: ${this.stats.removed}`);
        console.log(`Files consolidated: ${this.stats.consolidated}`);
        console.log(`Reduction: ${((this.stats.removed / this.stats.total) * 100).toFixed(1)}%`);
        
        if (this.stats.kept < 200) {
            console.log('🎉 SUCCESS: Markdown file count reduced to under 200!');
        } else {
            console.log(`⚠️  Still ${this.stats.kept} files remaining. Target: <200`);
        }
        
        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            keptFiles: Array.from(this.keepFiles),
            removedFiles: Array.from(this.removeFiles)
        };
        
        fs.writeFileSync('markdown-consolidation-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: markdown-consolidation-report.json');
    }
}

// Run the consolidator
const consolidator = new MarkdownConsolidator();
consolidator.run().catch(console.error);

export default MarkdownConsolidator;