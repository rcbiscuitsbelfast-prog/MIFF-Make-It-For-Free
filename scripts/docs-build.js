#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'docs-build');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const summary = `MIFF docs placeholder\nGenerated: ${new Date().toISOString()}\n`;
fs.writeFileSync(path.join(outDir, 'README.md'), summary);
console.log('Docs build completed:', outDir);

