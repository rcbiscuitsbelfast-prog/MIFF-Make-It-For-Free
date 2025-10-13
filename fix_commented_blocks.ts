#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixCommentedBlocksInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    const lines = newContent.split('\n');
    const newLines: string[] = [];
    let inCommentedBlock = false;
    let blockStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check if this line starts a commented export/const/let/var
      if (trimmedLine.startsWith('//') && 
          (trimmedLine.includes('export const') || 
           trimmedLine.includes('export let') || 
           trimmedLine.includes('export var') ||
           trimmedLine.includes('const ') ||
           trimmedLine.includes('let ') ||
           trimmedLine.includes('var ')) &&
          (trimmedLine.includes('= {') || trimmedLine.includes('= ['))) {
        
        // Start of a commented block
        inCommentedBlock = true;
        blockStart = i;
        newLines.push(line.replace('//', '/*'));
        continue;
      }
      
      // If we're in a commented block
      if (inCommentedBlock) {
        // Check if this line ends the block
        if (trimmedLine.endsWith('};') || trimmedLine.endsWith('];') || trimmedLine.endsWith(');')) {
          newLines.push(line + '*/');
          inCommentedBlock = false;
          blockStart = -1;
          modified = true;
          continue;
        } else {
          // Continue the block
          newLines.push(line);
          continue;
        }
      }
      
      // Regular line
      newLines.push(line);
    }
    
    if (modified) {
      newContent = newLines.join('\n');
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed commented blocks in ${filePath}`);
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
  console.log('🔧 Starting commented block fixes...');
  
  const files = findTypeScriptFiles('miff');
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixCommentedBlocksInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed commented blocks in ${fixedCount} files`);
  console.log('🎯 Commented block fixes complete!');
}

main().catch(console.error);