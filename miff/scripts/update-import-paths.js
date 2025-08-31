#!/usr/bin/env node
/**
 * MIFF Import Path Update Script
 * Updates all import paths to use the new consolidated miff/pure/ structure
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apply = process.argv.includes('--apply');
const dryRun = !apply;

const plan = [];
const updatedFiles = new Set();

function updateImportPaths(content, filePath) {
  let updated = content;
  const original = content;
  
  // Update various import patterns
  const patterns = [
    // From root Pure modules
    {
      from: /from ['"]([^\/]+Pure)/g,
      to: "from '../../miff/pure/$1"
    },
    {
      from: /import ['"]([^\/]+Pure)/g,
      to: "import '../../miff/pure/$1"
    },
    {
      from: /require\(['"]([^\/]+Pure)/g,
      to: "require('../../miff/pure/$1"
    },
    // From relative paths to Pure modules
    {
      from: /from ['"]\.\.\/\.\.\/[^\/]+Pure/g,
      to: "from '../../miff/pure"
    },
    {
      from: /import ['"]\.\.\/\.\.\/[^\/]+Pure/g,
      to: "import '../../miff/pure"
    },
    {
      from: /require\(['"]\.\.\/\.\.\/[^\/]+Pure/g,
      to: "require('../../miff/pure"
    },
    // From absolute paths
    {
      from: /from ['"]\/[^\/]+Pure/g,
      to: "from '../../miff/pure"
    },
    {
      from: /import ['"]\/[^\/]+Pure/g,
      to: "import '../../miff/pure"
    },
    {
      from: /require\(['"]\/[^\/]+Pure/g,
      to: "require('../../miff/pure"
    },
    // From systems directory
    {
      from: /from ['"]\.\.\/systems\/[^\/]+Pure/g,
      to: "from '../../miff/pure"
    },
    {
      from: /import ['"]\.\.\/systems\/[^\/]+Pure/g,
      to: "import '../../miff/pure"
    },
    {
      from: /require\(['"]\.\.\/systems\/[^\/]+Pure/g,
      to: "require('../../miff/pure"
    },
    // From src/modules directory
    {
      from: /from ['"]\.\.\/\.\.\/src\/modules\/[^\/]+Pure/g,
      to: "from '../../miff/pure"
    },
    {
      from: /import ['"]\.\.\/\.\.\/src\/modules\/[^\/]+Pure/g,
      to: "import '../../miff/pure"
    },
    {
      from: /require\(['"]\.\.\/\.\.\/src\/modules\/[^\/]+Pure/g,
      to: "require('../../miff/pure"
    },
    // From current directory Pure modules
    {
      from: /from ['"]\.\/[^\/]+Pure/g,
      to: "from '../../miff/pure"
    },
    {
      from: /import ['"]\.\/[^\/]+Pure/g,
      to: "import '../../miff/pure"
    },
    {
      from: /require\(['"]\.\/[^\/]+Pure/g,
      to: "require('../../miff/pure"
    },
    // From relative paths with single dot
    {
      from: /from ['"]\.\.\/[^\/]+Pure/g,
      to: "from '../../miff/pure"
    },
    {
      from: /import ['"]\.\.\/[^\/]+Pure/g,
      to: "import '../../miff/pure"
    },
    {
      from: /require\(['"]\.\.\/[^\/]+Pure/g,
      to: "require('../../miff/pure"
    },
    // From relative paths with double dots
    {
      from: /from ['"]\.\.\/\.\.\/[^\/]+Pure/g,
      to: "from '../../miff/pure"
    },
    {
      from: /import ['"]\.\.\/\.\.\/[^\/]+Pure/g,
      to: "import '../../miff/pure"
    },
    {
      from: /require\(['"]\.\.\/\.\.\/[^\/]+Pure/g,
      to: "require('../../miff/pure"
    }
  ];
  
  patterns.forEach(({ from, to }) => {
    updated = updated.replace(from, to);
  });
  
  if (updated !== original) {
    updatedFiles.add(filePath);
    plan.push({ action: 'updated', file: filePath, type: 'import_path' });
    if (!dryRun) {
      console.log(`[UPDATE] Updated imports in: ${filePath}`);
    }
  }
  
  return updated;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const updated = updateImportPaths(content, filePath);
    
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
      // Skip miff/pure to avoid infinite recursion
      if (fullPath.includes('miff/pure')) continue;
      walkAndUpdate(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.js', '.ts', '.tsx', '.md', '.json'].includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

function main() {
  console.log(`[IMPORT-UPDATE] Starting ${dryRun ? 'DRY-RUN' : 'APPLY'} import path updates...`);
  
  // Update all files in the repository
  walkAndUpdate(root);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply',
    filesUpdated: updatedFiles.size,
    totalActions: plan.length,
    updatedFiles: Array.from(updatedFiles),
    plan: plan
  };
  
  const reportPath = path.join(root, 'import-update-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`[IMPORT-UPDATE] ${dryRun ? 'DRY-RUN' : 'APPLY'} complete!`);
  console.log(`[IMPORT-UPDATE] Files updated: ${updatedFiles.size}`);
  console.log(`[IMPORT-UPDATE] Total actions: ${plan.length}`);
  console.log(`[IMPORT-UPDATE] Report written to: ${reportPath}`);
  
  if (dryRun) {
    console.log(`[IMPORT-UPDATE] Run with --apply to execute the updates`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateImportPaths };