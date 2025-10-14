#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixSyntaxIssuesInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Fix patterns where commented code leaves orphaned statements
    const patterns = [
      // Fix orphaned return statements
      {
        pattern: /\/\*[^*]*\*\/\s*\n\s*return\s+/g,
        replacement: (match: string) => {
          // Extract the function signature from the comment
          const commentMatch = match.match(/\/\*([^*]*)\*\/\s*\n\s*return/);
          if (commentMatch) {
            const commentContent = commentMatch[1];
            const functionMatch = commentContent.match(/(\w+)\s*\([^)]*\)\s*:\s*(\w+)/);
            if (functionMatch) {
              const [, funcName, returnType] = functionMatch;
              return `  ${funcName}(): ${returnType} {\n    return `;
            }
          }
          return match;
        }
      },
      // Fix missing function declarations
      {
        pattern: /export\s+const\s+\w+\s*=\s*{\s*\n\s*return\s+/g,
        replacement: (match: string) => {
          const nameMatch = match.match(/export\s+const\s+(\w+)\s*=\s*{\s*\n\s*return/);
          if (nameMatch) {
            const name = nameMatch[1];
            return `export const ${name} = {\n  defaultFunction(): string {\n    return `;
          }
          return match;
        }
      },
      // Fix missing closing braces
      {
        pattern: /(\w+)\s*:\s*([^,}]+)\s*(?=\n\s*[a-zA-Z_])/g,
        replacement: '$1: $2,'
      },
      // Fix missing commas in object literals
      {
        pattern: /(\w+)\s*:\s*([^,}]+)\s*(?=\n\s*[a-zA-Z_])/g,
        replacement: '$1: $2,'
      }
    ];
    
    for (const pattern of patterns) {
      const before = newContent;
      newContent = newContent.replace(pattern.pattern, pattern.replacement);
      if (before !== newContent) {
        modified = true;
      }
    }
    
    // Fix specific syntax issues line by line
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Fix orphaned return statements
      if (line.trim().startsWith('return ') && i > 0) {
        const prevLine = lines[i - 1].trim();
        if (prevLine.endsWith('*/') || prevLine.endsWith('{')) {
          // This is an orphaned return, we need to create a function
          const indent = line.match(/^(\s*)/)?.[1] || '';
          line = `${indent}defaultFunction(): string {\n${line}\n${indent}},`;
          modified = true;
        }
      }
      
      // Fix missing colons in object properties
      if (line.includes('=') && !line.includes(':') && !line.includes('function') && !line.includes('const') && !line.includes('let') && !line.includes('var')) {
        const match = line.match(/^(\s*)(\w+)\s*=\s*(.+)$/);
        if (match) {
          const [, indent, key, value] = match;
          line = `${indent}${key}: ${value},`;
          modified = true;
        }
      }
      
      // Fix missing commas at end of lines
      if (line.trim() && !line.trim().endsWith(',') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.trim().endsWith(';') && !line.trim().startsWith('//') && !line.trim().startsWith('/*') && !line.trim().startsWith('*') && !line.trim().startsWith('*/')) {
        if (i < lines.length - 1) {
          const nextLine = lines[i + 1].trim();
          if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('/*') && !nextLine.startsWith('*') && !nextLine.startsWith('*/')) {
            line = line + ',';
            modified = true;
          }
        }
      }
      
      if (line !== originalLine) {
        console.log(`Fixed line ${i + 1} in ${filePath}: ${originalLine.trim()} -> ${line.trim()}`);
      }
      
      newLines.push(line);
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed syntax issues in ${filePath}`);
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
  console.log('🔧 Starting syntax issue fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixSyntaxIssuesInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed syntax issues in ${fixedCount} files`);
  console.log('🎯 Syntax issue fixes complete!');
}

main().catch(console.error);