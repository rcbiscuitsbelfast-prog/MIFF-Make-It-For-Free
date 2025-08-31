#!/usr/bin/env node
/**
 * MIFF Pure Module Consolidation Script
 * Moves all Pure modules from repo root to miff/pure/
 * Updates all import paths across the repository
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apply = process.argv.includes('--apply');
const dryRun = !apply;

const plan = [];
const movedModules = new Set();

// Pure module patterns to identify
const pureModulePatterns = [
  /.*Pure\/?$/,
  /.*SystemPure\/?$/,
  /.*BridgePure\/?$/,
  /.*DemoPure\/?$/
];

function isPureModule(dirName) {
  return pureModulePatterns.some(pattern => pattern.test(dirName));
}

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

function moveModule(src, dest) {
  if (dryRun) {
    plan.push({ action: 'move', src, dest, type: 'module' });
    console.log(`[DRY-RUN] Would move: ${src} → ${dest}`);
  } else {
    try {
      if (fs.existsSync(dest)) {
        console.log(`[WARNING] Destination exists: ${dest}`);
        console.log(`[INFO] Checking if content is different...`);
        
        // Compare content to see if we should replace
        const srcContent = JSON.stringify(getDirStructure(src), null, 2);
        const destContent = JSON.stringify(getDirStructure(dest), null, 2);
        
        if (srcContent === destContent) {
          console.log(`[INFO] Content identical, removing source: ${src}`);
          fs.rmSync(src, { recursive: true, force: true });
          plan.push({ action: 'removed_duplicate', src, dest, type: 'module' });
        } else {
          console.log(`[INFO] Content different, replacing: ${dest}`);
          fs.rmSync(dest, { recursive: true, force: true });
          ensureDir(path.dirname(dest));
          fs.renameSync(src, dest);
          movedModules.add(path.basename(src));
          plan.push({ action: 'replaced', src, dest, type: 'module' });
        }
      } else {
        ensureDir(path.dirname(dest));
        fs.renameSync(src, dest);
        movedModules.add(path.basename(src));
        plan.push({ action: 'moved', src, dest, type: 'module' });
        console.log(`[MOVE] Moved: ${src} → ${dest}`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to move ${src}:`, error.message);
    }
  }
}

function getDirStructure(dir) {
  const structure = {};
  if (!fs.existsSync(dir)) return structure;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      structure[item] = getDirStructure(fullPath);
    } else {
      structure[item] = stat.size;
    }
  }
  return structure;
}

function updateReferences(filePath, content) {
  const original = content;
  let updated = content;
  
  // Update import paths for moved modules
  movedModules.forEach(moduleName => {
    const oldPath = `from ['"]${moduleName}`;
    const newPath = `from '../../miff/pure/${moduleName}`;
    updated = updated.replace(new RegExp(oldPath, 'g'), newPath);
    
    const oldPath2 = `import ['"]${moduleName}`;
    const newPath2 = `import '../../miff/pure/${moduleName}`;
    updated = updated.replace(new RegExp(oldPath2, 'g'), newPath2);
    
    const oldPath3 = `require\\(['"]${moduleName}`;
    const newPath3 = `require('../../miff/pure/${moduleName}`;
    updated = updated.replace(new RegExp(oldPath3, 'g'), newPath3);
  });
  
  // Update relative paths
  updated = updated.replace(/from ['"]\.\.\/\.\.\/[^\/]+Pure/g, "from '../../miff/pure");
  updated = updated.replace(/import ['"]\.\.\/\.\.\/[^\/]+Pure/g, "import '../../miff/pure");
  updated = updated.replace(/require\(['"]\.\.\/\.\.\/[^\/]+Pure/g, "require('../../miff/pure");
  
  if (updated !== original) {
    plan.push({ action: 'updated', file: filePath, type: 'reference' });
    if (!dryRun) {
      console.log(`[UPDATE] Updated references in: ${filePath}`);
    }
  }
  
  return updated;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const updated = updateReferences(filePath, content);
    
    if (updated !== content && !dryRun) {
      fs.writeFileSync(filePath, updated);
    }
  } catch (error) {
    console.error(`[ERROR] Failed to process ${filePath}:`, error.message);
  }
}

function walkAndUpdate(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkAndUpdate(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.js', '.ts', '.tsx', '.md', '.json'].includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

function consolidatePureModules() {
  console.log(`[CONSOLIDATE] Starting ${dryRun ? 'DRY-RUN' : 'APPLY'} consolidation...`);
  
  // Find all Pure modules in repo root
  const rootItems = fs.readdirSync(root);
  const pureModules = rootItems.filter(item => {
    const fullPath = path.join(root, item);
    return fs.statSync(fullPath).isDirectory() && isPureModule(item);
  });
  
  console.log(`[CONSOLIDATE] Found ${pureModules.length} Pure modules to consolidate:`);
  pureModules.forEach(module => console.log(`  - ${module}`));
  
  // Move each Pure module
  pureModules.forEach(moduleName => {
    const src = path.join(root, moduleName);
    const dest = path.join(root, 'miff', 'pure', moduleName);
    
    if (fs.existsSync(dest)) {
      console.log(`[WARNING] Destination already exists: ${dest}`);
      return;
    }
    
    moveModule(src, dest);
  });
  
  // Update all references in the repository
  console.log(`[CONSOLIDATE] Updating references across repository...`);
  walkAndUpdate(root);
  
  // Generate consolidation report
  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply',
    modulesFound: pureModules.length,
    modulesMoved: movedModules.size,
    plan: plan
  };
  
  const reportPath = path.join(root, 'consolidation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`[CONSOLIDATE] ${dryRun ? 'DRY-RUN' : 'APPLY'} complete!`);
  console.log(`[CONSOLIDATE] Report written to: ${reportPath}`);
  console.log(`[CONSOLIDATE] Total actions planned: ${plan.length}`);
  
  if (dryRun) {
    console.log(`[CONSOLIDATE] Run with --apply to execute the consolidation`);
  }
}

// Main execution
if (require.main === module) {
  consolidatePureModules();
}

module.exports = { consolidatePureModules };