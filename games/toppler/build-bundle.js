#!/usr/bin/env node

import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

async function buildBundle() {
    try {
        console.log('🔨 Building Toppler bundle...');
        
        const result = await esbuild.build({
            entryPoints: ['./index.ts'],
            bundle: true,
            outfile: './dist/bundle.js',
            format: 'iife', // Immediately Invoked Function Expression
            globalName: 'TopplerBundle',
            platform: 'browser',
            target: ['es2020'],
            minify: false, // Keep readable for debugging
            sourcemap: false,
            define: {
                'process.env.NODE_ENV': '"production"'
            },
            loader: {
                '.ts': 'ts',
                '.js': 'js'
            },
            tsconfig: './tsconfig.standalone.json',
            write: true,
            logLevel: 'verbose'
        });
        
        console.log('✅ Bundle built successfully:', result.outputFiles?.[0]?.path);
        
        // Add bootstrap code to auto-start the game
        const bootstrapCode = `
// Auto-start the bundled game
(function() {
    console.log('[Bundle] Auto-starting Toppler...');
    
    // Check for autostart parameter
    const autostart = window.location.search.includes('autostart=1');
    console.log('[Bundle] Autostart enabled:', autostart);
    
    // Start the game when DOM is ready
    function startGame() {
        console.log('[Bundle] Starting game...');
        if (typeof TopplerBundle !== 'undefined' && TopplerBundle.bootstrap) {
            TopplerBundle.bootstrap();
        } else {
            console.error('[Bundle] TopplerBundle.bootstrap not found');
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGame);
    } else {
        startGame();
    }
})();
`;
        
        // Read the generated bundle and append bootstrap code
        const bundlePath = './dist/bundle.js';
        const bundleContent = fs.readFileSync(bundlePath, 'utf8');
        const finalContent = bundleContent + '\n' + bootstrapCode;
        fs.writeFileSync(bundlePath, finalContent);
        
        console.log('✅ Bootstrap code added to bundle');
        
    } catch (error) {
        console.error('❌ Bundle build failed:', error);
        process.exit(1);
    }
}

buildBundle();