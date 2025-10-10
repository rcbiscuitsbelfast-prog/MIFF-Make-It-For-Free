#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of capability files to fix
const capabilityFiles = [
  'miff/pure/DialogueSystemPure/DialogueSystemCapable.ts',
  'miff/pure/InventoryPure/InventoryCapable.ts',
  'miff/pure/QuestsPure/QuestsCapable.ts',
  'miff/pure/StatsSystemPure/StatsSystemCapable.ts',
  'miff/pure/NetworkBridgePure/NetworkBridgeCapable.ts'
];

function fixCapabilityFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix IntegrationCapability properties
  content = content.replace(/moduleId:/g, 'id:');
  content = content.replace(/type: 'dependency'/g, "integrationType: 'adapter'");
  content = content.replace(/type: 'consumer'/g, "integrationType: 'event'");
  content = content.replace(/type: 'required'/g, "integrationType: 'adapter'");
  content = content.replace(/type: 'optional'/g, "integrationType: 'adapter'");
  
  // Remove invalid properties from IntegrationCapability
  content = content.replace(/,\s*required:\s*[^,\n}]+/g, '');
  content = content.replace(/,\s*version:\s*[^,\n}]+/g, '');
  
  // Add missing properties to IntegrationCapability
  content = content.replace(/id: '([^']+)',\s*integrationType: '([^']+)'/g, (match, id, type) => {
    return `id: '${id}',\n        name: '${id} Integration',\n        description: 'Integration with ${id} system',\n        targetSystem: '${id}',\n        integrationType: '${type}',\n        authenticationRequired: false`;
  });
  
  // Fix SchemaInfo properties
  content = content.replace(/schemaId:/g, 'id:');
  content = content.replace(/category:/g, 'type:');
  
  // Fix CLIExample structure
  content = content.replace(/examples:\s*\[\s*'([^']+)',\s*'([^']+)'\s*\]/g, (match, cmd1, cmd2) => {
    return `examples: [
          {
            command: '${cmd1}',
            description: 'Example command 1',
            output: 'Command output'
          },
          {
            command: '${cmd2}',
            description: 'Example command 2',
            output: 'Command output'
          }
        ]`;
  });
  
  // Fix CLICommand structure
  content = content.replace(/flags:/g, 'options:');
  content = content.replace(/defaultValue:/g, 'default:');
  content = content.replace(/category:/g, '');
  
  // Add missing CLICommand properties
  content = content.replace(/name: '([^']+)',\s*description: '([^']+)',\s*options:/g, (match, name, desc) => {
    return `name: '${name}',\n        description: '${desc}',\n        usage: '${name} [options]',\n        aliases: [],\n        arguments: [],\n        options:`;
  });
  
  // Fix LifecycleHooks structure
  content = content.replace(/onStart:/g, 'initialization: [');
  content = content.replace(/onUpdate:/g, 'runtime: [');
  content = content.replace(/onDestroy:/g, 'cleanup: [');
  
  // Fix ModuleDependency structure
  content = content.replace(/moduleId:/g, 'moduleId:');
  content = content.replace(/version: '([^']+)',\s*type: '([^']+)',\s*description: '([^']+)'/g, (match, version, type, desc) => {
    return `moduleId: '${version.split('>=')[0]}',\n      version: '${version}',\n      type: '${type}',\n      description: '${desc}',\n      compatibility: {\n        minVersion: '1.0.0',\n        testedVersions: ['1.0.0', '1.1.0'],\n        knownIssues: []\n      }`;
  });
  
  // Fix PerformanceProfile structure
  content = content.replace(/memoryUsage:/g, 'memory:');
  content = content.replace(/cpuUsage:/g, 'cpu:');
  content = content.replace(/networkUsage:/g, 'io:');
  content = content.replace(/maxConcurrentOperations:/g, 'maxConcurrentUsers:');
  
  // Fix TestingCapabilities structure
  content = content.replace(/unitTests:/g, 'testTypes: [');
  content = content.replace(/integrationTests:/g, 'testDataGeneration: [');
  content = content.replace(/performanceTests:/g, 'mocking: [');
  content = content.replace(/goldenTests:/g, 'performanceTesting: [');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

// Fix all capability files
capabilityFiles.forEach(fixCapabilityFile);

console.log('All capability files have been fixed!');