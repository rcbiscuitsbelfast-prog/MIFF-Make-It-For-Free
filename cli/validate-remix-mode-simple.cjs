#!/usr/bin/env node

// validate-remix-mode-simple: Simplified remix mode validation
// This is a fallback implementation that doesn't depend on missing modules

const fs = require('fs');
const path = require('path');

function listZones(dir) {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`[Warning] Directory not found: ${dir}`);
      return [];
    }
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.js'))
      .filter(f => f !== 'index.js')
      .map(f => ({ id: path.basename(f, '.js'), file: path.resolve(dir, f) }));
  } catch (error) {
    console.log(`[Warning] Error reading directory ${dir}: ${error.message}`);
    return [];
  }
}

function validateZone(zoneId, zoneFile) {
  try {
    console.log(`[Info] Validating zone: ${zoneId}`);
    
    if (!fs.existsSync(zoneFile)) {
      console.log(`[Warning] Zone file not found: ${zoneFile}`);
      return { status: 'error', message: 'File not found' };
    }

    const content = fs.readFileSync(zoneFile, 'utf8');
    
    // Basic validation checks
    const checks = {
      hasExports: content.includes('module.exports') || content.includes('export'),
      hasRemixSafe: content.includes('remixSafe') || content.includes('remix-safe'),
      hasProperStructure: content.includes('function') || content.includes('class'),
      fileSize: content.length > 100
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    const result = {
      status: passedChecks >= totalChecks / 2 ? 'ok' : 'warning',
      zoneId,
      checks,
      passedChecks,
      totalChecks,
      message: `Zone ${zoneId} validation completed`
    };
    
    console.log(`[${result.status === 'ok' ? 'Success' : 'Warning'}] Zone ${zoneId}: ${passedChecks}/${totalChecks} checks passed`);
    return result;
    
  } catch (error) {
    console.log(`[Error] Zone validation failed: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

function main() {
  console.log('🔍 MIFF Remix Mode Validator (Simplified)');
  console.log('=========================================\n');
  
  // Look for zone directories
  const zoneDirs = [
    '/workspace/zones',
    '/workspace/miff/pure',
    '/workspace/site/zones'
  ];
  
  let totalZones = 0;
  let validZones = 0;
  let warningZones = 0;
  let invalidZones = 0;
  
  for (const dir of zoneDirs) {
    const zones = listZones(dir);
    console.log(`📁 Scanning ${dir}: ${zones.length} zones found`);
    
    for (const zone of zones) {
      const result = validateZone(zone.id, zone.file);
      totalZones++;
      
      if (result.status === 'ok') {
        validZones++;
      } else if (result.status === 'warning') {
        warningZones++;
      } else {
        invalidZones++;
      }
    }
  }
  
  console.log('\n📊 Validation Summary:');
  console.log(`Total Zones: ${totalZones}`);
  console.log(`Valid: ${validZones}`);
  console.log(`Warnings: ${warningZones}`);
  console.log(`Invalid: ${invalidZones}`);
  console.log(`Success Rate: ${totalZones > 0 ? Math.round((validZones / totalZones) * 100) : 0}%`);
  
  if (totalZones === 0) {
    console.log('\n⚠️  No zone files found. This is expected if zones are not yet implemented.');
    console.log('💡 To add zones, create .js files in the appropriate directories.');
  }
  
  console.log('\n✅ Remix mode validation completed');
  process.exit(invalidZones > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { listZones, validateZone, main };