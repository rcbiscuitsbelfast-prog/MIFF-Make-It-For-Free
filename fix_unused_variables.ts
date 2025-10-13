#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixUnusedVariablesInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Skip if line is empty or just whitespace
      if (line.trim() === '') {
        newLines.push(line);
        continue;
      }
      
      // Check for unused import patterns
      if (line.includes('import {') && line.includes('} from')) {
        // Extract the import statement
        const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(imp => imp.trim());
          const modulePath = importMatch[2];
          
          // Check which imports are actually used in the file
          const usedImports: string[] = [];
          for (const imp of imports) {
            const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim();
            // Check if this import is used anywhere in the file
            const usageRegex = new RegExp(`\\b${cleanImport}\\b`, 'g');
            const matches = newContent.match(usageRegex);
            if (matches && matches.length > 1) { // More than 1 because the import itself counts
              usedImports.push(imp);
            }
          }
          
          if (usedImports.length === 0) {
            // Remove the entire import line
            line = '';
            modified = true;
          } else if (usedImports.length !== imports.length) {
            // Rebuild the import with only used imports
            line = `import { ${usedImports.join(', ')} } from '${modulePath}';`;
            modified = true;
          }
        }
      }
      
      // Check for unused variable declarations
      if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
        const varMatch = line.match(/(const|let|var)\s+(\w+)/);
        if (varMatch) {
          const varName = varMatch[2];
          // Check if this variable is used elsewhere in the file
          const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
          const matches = newContent.match(usageRegex);
          if (matches && matches.length === 1) { // Only the declaration itself
            // Comment out the unused variable
            line = `// ${line}`;
            modified = true;
          }
        }
      }
      
      // Check for unused function parameters
      if (line.includes('function ') || line.includes('=>')) {
        // This is a complex case that would need more sophisticated analysis
        // For now, we'll skip it
      }
      
      if (line !== originalLine) {
        console.log(`Fixed line ${i + 1} in ${filePath}: ${originalLine.trim()} -> ${line.trim()}`);
      }
      
      if (line !== '') {
        newLines.push(line);
      }
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findTypeScriptFiles(fullPath));
      } else if (entry.endsWith('.ts') && !entry.includes('test') && !entry.includes('spec')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

async function main() {
  console.log('🔧 Starting unused variable fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixUnusedVariablesInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed unused variables in ${fixedCount} files`);
  console.log('🎯 Unused variable fixes complete!');
}

main().catch(console.error);