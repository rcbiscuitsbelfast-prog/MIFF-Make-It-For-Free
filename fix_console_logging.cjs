#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📝 Fixing console.log statements...\n');

// Find all TypeScript files
const tsFiles = [];
function findTsFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findTsFiles(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')) {
      tsFiles.push(filePath);
    }
  }
}

findTsFiles('./miff/pure');

console.log(`Found ${tsFiles.length} TypeScript files to check...\n`);

let fixed = 0;
let errors = 0;
let totalReplaced = 0;

// Process each file
for (const filePath of tsFiles) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Skip if it's a StructuredLogger file itself
    if (filePath.includes('StructuredLogger')) {
      continue;
    }
    
    // Skip if it's a test file
    if (filePath.includes('.test.ts')) {
      continue;
    }
    
    // Count console.log statements
    const consoleLogMatches = content.match(/console\.log\(/g);
    const consoleErrorMatches = content.match(/console\.error\(/g);
    const consoleWarnMatches = content.match(/console\.warn\(/g);
    const consoleInfoMatches = content.match(/console\.info\(/g);
    const consoleDebugMatches = content.match(/console\.debug\(/g);
    
    const totalConsoleStatements = (consoleLogMatches?.length || 0) + 
                                  (consoleErrorMatches?.length || 0) + 
                                  (consoleWarnMatches?.length || 0) + 
                                  (consoleInfoMatches?.length || 0) + 
                                  (consoleDebugMatches?.length || 0);
    
    if (totalConsoleStatements === 0) {
      continue;
    }
    
    // Add StructuredLogger import if not present
    if (!content.includes('StructuredLogger')) {
      // Find the best place to add the import
      const lines = content.split('\n');
      let importIndex = -1;
      
      // Look for existing imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') && lines[i].includes('from')) {
          importIndex = i;
        }
      }
      
      if (importIndex >= 0) {
        // Add after the last import
        lines.splice(importIndex + 1, 0, "import { StructuredLogger } from '../shared/logging/StructuredLogger';");
        content = lines.join('\n');
      } else {
        // Add at the top
        content = "import { StructuredLogger } from '../shared/logging/StructuredLogger';\n" + content;
      }
    }
    
    // Add logger initialization if not present
    if (!content.includes('this.logger') && !content.includes('const logger')) {
      // Look for class definition
      const classMatch = content.match(/class\s+(\w+)/);
      if (classMatch) {
        const className = classMatch[1];
        // Add logger property to class
        content = content.replace(
          new RegExp(`class\\s+${className}\\s*{`),
          `class ${className} {\n  private logger: StructuredLogger;`
        );
        
        // Add logger initialization in constructor
        const constructorMatch = content.match(/constructor\([^)]*\)\s*{/);
        if (constructorMatch) {
          content = content.replace(
            constructorMatch[0],
            constructorMatch[0] + '\n    this.logger = new StructuredLogger({ module: \'' + className + '\' });'
          );
        }
      }
    }
    
    // Replace console statements
    let replacements = 0;
    
    // Replace console.log with this.logger.info
    content = content.replace(/console\.log\(/g, (match) => {
      replacements++;
      return 'this.logger.info(';
    });
    
    // Replace console.error with this.logger.error
    content = content.replace(/console\.error\(/g, (match) => {
      replacements++;
      return 'this.logger.error(';
    });
    
    // Replace console.warn with this.logger.warn
    content = content.replace(/console\.warn\(/g, (match) => {
      replacements++;
      return 'this.logger.warn(';
    });
    
    // Replace console.info with this.logger.info
    content = content.replace(/console\.info\(/g, (match) => {
      replacements++;
      return 'this.logger.info(';
    });
    
    // Replace console.debug with this.logger.debug
    content = content.replace(/console\.debug\(/g, (match) => {
      replacements++;
      return 'this.logger.debug(';
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath} (${replacements} replacements)`);
      fixed++;
      totalReplaced += replacements;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    errors++;
  }
}

console.log(`\n✅ Console logging fixes complete!`);
console.log(`📊 Fixed: ${fixed} files`);
console.log(`🔄 Total replacements: ${totalReplaced}`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((fixed / tsFiles.length) * 100).toFixed(1)}%`);