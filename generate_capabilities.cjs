#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Generating capability files for all modules...\n');

// Find all Pure modules
const pureModules = [];
function findPureModules(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file.endsWith('Pure')) {
      pureModules.push({ name: file, path: filePath });
    }
  }
}

findPureModules('./miff/pure');

console.log(`Found ${pureModules.length} Pure modules to process...\n`);

let generated = 0;
let errors = 0;

// Process each module
for (const module of pureModules) {
  try {
    const capabilityPath = path.join(module.path, 'capabilities.ts');
    
    // Skip if capability file already exists
    if (fs.existsSync(capabilityPath)) {
      console.log(`⏭️  Skipping ${module.name} (capabilities.ts already exists)`);
      continue;
    }
    
    // Analyze module
    const moduleInfo = analyzeModule(module.name, module.path);
    
    // Generate capability file
    const capability = createCapability(module.name, moduleInfo);
    const capabilityContent = generateCapabilityContent(capability);
    
    // Write capability file
    fs.writeFileSync(capabilityPath, capabilityContent);
    console.log(`✅ Generated capabilities for ${module.name}`);
    generated++;
    
  } catch (error) {
    console.error(`❌ Error generating capabilities for ${module.name}: ${error.message}`);
    errors++;
  }
}

console.log(`\n✅ Capability generation complete!`);
console.log(`📊 Generated: ${generated} capability files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((generated / pureModules.length) * 100).toFixed(1)}%`);

// Helper functions
function analyzeModule(name, modulePath) {
  const moduleInfo = {
    name,
    path: modulePath,
    hasManager: false,
    hasCLI: false,
    hasIndex: false,
    interfaces: [],
    classes: [],
    functions: [],
    exports: []
  };

  try {
    // Check for Manager.ts
    const managerPath = path.join(modulePath, 'Manager.ts');
    if (fs.existsSync(managerPath)) {
      moduleInfo.hasManager = true;
    }

    // Check for cliHarness.ts
    const cliPath = path.join(modulePath, 'cliHarness.ts');
    if (fs.existsSync(cliPath)) {
      moduleInfo.hasCLI = true;
    }

    // Check for index.ts
    const indexPath = path.join(modulePath, 'index.ts');
    if (fs.existsSync(indexPath)) {
      moduleInfo.hasIndex = true;
    }

  } catch (error) {
    console.warn(`Warning: Failed to analyze module ${name}: ${error.message}`);
  }

  return moduleInfo;
}

function createCapability(moduleName, moduleInfo) {
  const baseName = moduleName.replace('Pure', '');
  
  return {
    id: baseName.toLowerCase(),
    name: moduleName,
    description: `${baseName} module providing core functionality`,
    version: '1.0.0',
    type: determineType(moduleName),
    category: determineCategory(moduleName),
    tags: generateTags(moduleName, moduleInfo),
    dependencies: generateDependencies(moduleInfo),
    interfaces: [],
    methods: generateMethods(moduleInfo),
    properties: generateProperties(moduleInfo),
    events: generateEvents(moduleInfo),
    metadata: {
      hasManager: moduleInfo.hasManager,
      hasCLI: moduleInfo.hasCLI,
      hasIndex: moduleInfo.hasIndex
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function determineType(moduleName) {
  if (moduleName.includes('Core') || moduleName.includes('System')) {
    return 'core';
  }
  if (moduleName.includes('Bridge') || moduleName.includes('Integration')) {
    return 'integration';
  }
  if (moduleName.includes('Pure') && !moduleName.includes('Bridge')) {
    return 'feature';
  }
  return 'utility';
}

function determineCategory(moduleName) {
  const categories = {
    'AI': 'ai',
    'Audio': 'audio',
    'Avatar': 'avatar',
    'Combat': 'combat',
    'Dialog': 'dialogue',
    'Input': 'input',
    'Inventory': 'inventory',
    'Quest': 'quest',
    'Render': 'rendering',
    'Save': 'persistence',
    'UI': 'interface',
    'Validation': 'validation'
  };

  for (const [key, category] of Object.entries(categories)) {
    if (moduleName.includes(key)) {
      return category;
    }
  }

  return 'general';
}

function generateTags(moduleName, moduleInfo) {
  const tags = ['miff', 'module'];
  
  if (moduleInfo.hasManager) tags.push('manager');
  if (moduleInfo.hasCLI) tags.push('cli');
  if (moduleInfo.hasIndex) tags.push('exported');
  
  const baseName = moduleName.replace('Pure', '').toLowerCase();
  tags.push(baseName);
  
  return tags;
}

function generateDependencies(moduleInfo) {
  const dependencies = [];
  
  if (moduleInfo.hasManager) {
    dependencies.push('core-manager');
  }
  
  dependencies.push('core-logging');
  
  return dependencies;
}

function generateMethods(moduleInfo) {
  const methods = [];
  
  if (moduleInfo.hasManager) {
    methods.push({
      name: 'initialize',
      description: 'Initialize the module manager',
      parameters: [],
      returnType: 'Promise<void>',
      isAsync: true,
      isPublic: true,
      examples: ['await manager.initialize();']
    });
    
    methods.push({
      name: 'destroy',
      description: 'Destroy the module manager',
      parameters: [],
      returnType: 'Promise<void>',
      isAsync: true,
      isPublic: true,
      examples: ['await manager.destroy();']
    });
  }
  
  return methods;
}

function generateProperties(moduleInfo) {
  const properties = [];
  
  if (moduleInfo.hasManager) {
    properties.push({
      name: 'isInitialized',
      type: 'boolean',
      description: 'Whether the module is initialized',
      readOnly: true,
      defaultValue: false
    });
  }
  
  return properties;
}

function generateEvents(moduleInfo) {
  return [
    {
      name: 'moduleReady',
      description: 'Module is ready for use',
      payload: 'ModuleInfo',
      isAsync: true
    }
  ];
}

function generateCapabilityContent(capability) {
  return `/**
 * Capability definition for ${capability.name}
 * Generated automatically by CapabilityGenerator
 */

export const ${capability.id}Capability = ${JSON.stringify(capability, null, 2)};

export default ${capability.id}Capability;
`;
}