const fs = require('fs');
const path = require('path');

// Simple TypeScript to JavaScript converter for specific modules
const modulesToCompile = [
  'PlayerStatePure',
  'InputSystemPure', 
  'CameraSystemPure'
];

const sourceDir = 'miff/pure';
const outputDir = 'docs/dist/pure-modules';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Simple module compilation (just copy and wrap in module format)
modulesToCompile.forEach(moduleName => {
  const moduleDir = path.join(sourceDir, moduleName);
  const indexPath = path.join(moduleDir, 'index.ts');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Simple transformations
    content = content
      .replace(/export /g, '')
      .replace(/import.*from.*['"][^'"]*['"];?\n?/g, '')
      .replace(/\/\*\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    
    // Wrap in module format
    const wrappedContent = `
// Compiled from ${moduleName}
(function() {
  'use strict';
  
  ${content}
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.${moduleName} = {
      // Add exports here as needed
    };
  }
})();
`;
    
    const outputFile = path.join(outputDir, `${moduleName}.js`);
    fs.writeFileSync(outputFile, wrappedContent);
    console.log(`Compiled ${moduleName} to ${outputFile}`);
  }
});

console.log('Module compilation complete!');