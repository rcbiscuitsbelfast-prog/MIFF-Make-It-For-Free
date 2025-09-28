#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const CSP_HEADER = `    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'">`;

async function addCSPHeaders() {
    console.log('🔒 Adding CSP headers to HTML files...');
    
    // Find all HTML files in docs directory
    const htmlFiles = await glob('docs/**/*.html', { ignore: ['docs/node_modules/**', 'docs/coverage/**'] });
    
    let updated = 0;
    let skipped = 0;
    
    for (const filePath of htmlFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Skip if CSP header already exists
            if (content.includes('Content-Security-Policy')) {
                skipped++;
                continue;
            }
            
            // Skip if not a proper HTML file (no <head> tag)
            if (!content.includes('<head>')) {
                skipped++;
                continue;
            }
            
            // Add CSP header after viewport meta tag or at beginning of head
            let updatedContent = content;
            
            if (content.includes('<meta name="viewport"')) {
                // Add after viewport meta tag
                updatedContent = content.replace(
                    /(<meta name="viewport"[^>]*>)/,
                    `$1\n${CSP_HEADER}`
                );
            } else if (content.includes('<head>')) {
                // Add at beginning of head
                updatedContent = content.replace(
                    /<head>/,
                    `<head>\n${CSP_HEADER}`
                );
            }
            
            if (updatedContent !== content) {
                fs.writeFileSync(filePath, updatedContent);
                console.log(`✅ Added CSP header to ${filePath}`);
                updated++;
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} files`);
    console.log(`   Skipped: ${skipped} files`);
    console.log(`   Total processed: ${htmlFiles.length} files`);
}

// Check if this script is being run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    addCSPHeaders().catch(console.error);
}

export { addCSPHeaders };