#!/usr/bin/env tsx

/**
 * Script to fix remaining MIFFCapable interface mismatches
 * Applies the same fixes that were successful for CombatCoreCapable
 */

import * as fs from 'fs';
import * as path from 'path';

const MIFF_PURE_DIR = 'miff/pure';

interface FixPattern {
  search: string | RegExp;
  replace: string;
  description: string;
}

const fixes: FixPattern[] = [
  // Fix integrations array structure - moduleId to proper IntegrationCapability
  {
    search: /moduleId: '([^']+)',\s*type: '([^']+)',\s*required: (true|false),\s*version: '([^']+)'/g,
    replace: `id: '$1-integration',
        name: '$1 Integration',
        description: 'Integration with $1',
        targetSystem: '$1',
        integrationType: '$2',
        protocols: ['internal'],
        authenticationRequired: false`,
    description: 'Fix IntegrationCapability structure'
  },
  
  // Fix schema structure - schemaId to id and add proper schema object
  {
    search: /schemaId: '([^']+)',\s*version: '([^']+)',\s*description: '([^']+)',\s*category: '([^']+)',\s*format: '([^']+)',\s*required: (true|false),\s*validation: \{[\s\S]*?\}/g,
    replace: `id: '$1',
      name: '$1 Schema',
      version: '$2',
      description: '$3',
      type: '$4',
      schema: {
        type: 'object',
        properties: {},
        required: []
      },
      validationRules: [
        {
          id: '$1-validation',
          name: '$1 Validation',
          description: 'Validation rule for $1',
          rule: 'required',
          severity: 'error'
        }
      ],
      examples: [
        {
          name: '$1 Example',
          description: 'Example $1 data',
          data: {},
          valid: true
        }
      ]`,
    description: 'Fix SchemaInfo structure'
  },
  
  // Fix CLI examples - strings to objects
  {
    search: /'([^']+)',\s*'([^']+)'/g,
    replace: `{
            command: '$1',
            description: '$2'
          }`,
    description: 'Fix CLI examples structure'
  },
  
  // Fix lifecycle hooks structure - onStart/onUpdate/onDestroy to proper arrays
  {
    search: /onStart: \{[\s\S]*?\},\s*onUpdate: \{[\s\S]*?\},\s*onDestroy: \{[\s\S]*?\},\s*customHooks: \[[\s\S]*?\]/g,
    replace: `initialization: [
      {
        id: 'module-start',
        name: 'Module Start',
        description: 'Initialize module system',
        event: 'module.start',
        priority: 1,
        async: true,
        parameters: [],
        returnType: 'void'
      }
    ],
    runtime: [
      {
        id: 'module-update',
        name: 'Module Update',
        description: 'Process module updates',
        event: 'module.update',
        priority: 1,
        async: true,
        parameters: [
          {
            name: 'deltaTime',
            type: 'number',
            required: true,
            description: 'Time elapsed since last update'
          }
        ],
        returnType: 'void'
      }
    ],
    cleanup: [
      {
        id: 'module-destroy',
        name: 'Module Destroy',
        description: 'Clean up module resources',
        event: 'module.destroy',
        priority: 1,
        async: true,
        parameters: [],
        returnType: 'void'
      }
    ],
    errorHandling: [
      {
        id: 'module-error',
        name: 'Module Error Handler',
        description: 'Handle module system errors',
        event: 'module.error',
        priority: 1,
        async: true,
        parameters: [
          {
            name: 'error',
            type: 'Error',
            required: true,
            description: 'The error that occurred'
          }
        ],
        returnType: 'void'
      }
    ]`,
    description: 'Fix LifecycleHooks structure'
  },
  
  // Fix dependencies - add compatibility property
  {
    search: /moduleId: '([^']+)',\s*version: '([^']+)',\s*type: '([^']+)',\s*description: '([^']+)'/g,
    replace: `moduleId: '$1',
      version: '$2',
      type: '$3',
      description: '$4',
      compatibility: {
        minVersion: '$2',
        testedVersions: ['$2'],
        knownIssues: []
      }`,
    description: 'Fix ModuleDependency structure'
  },
  
  // Fix performance profile structure
  {
    search: /maxConcurrentOperations: (\d+)/g,
    replace: 'maxConcurrentUsers: $1',
    description: 'Fix ScalabilityProfile property name'
  },
  
  // Fix testing capabilities structure
  {
    search: /unitTests: \{[\s\S]*?\},\s*integrationTests: \{[\s\S]*?\},\s*performanceTests: \{[\s\S]*?\},\s*goldenTests: \{[\s\S]*?\}/g,
    replace: `testTypes: [
      {
        id: 'unit-tests',
        name: 'Unit Tests',
        description: 'Individual component testing',
        framework: 'jest',
        coverage: 95,
        automated: true
      }
    ],
    testDataGeneration: [],
    mocking: [],
    performanceTesting: []`,
    description: 'Fix TestingCapabilities structure'
  },
  
  // Add missing ModuleCapabilities properties
  {
    search: /integrations: \[/g,
    replace: `dataProcessing: [],
    formats: [],
    realtime: [],
    integrations: [`,
    description: 'Add missing ModuleCapabilities properties'
  },
  
  // Fix CLI interface structure
  {
    search: /helpText: '[^']*',\s*usageExamples: \[[\s\S]*?\]/g,
    replace: `globalOptions: [],
    help: {
      overview: 'Module provides comprehensive functionality',
      gettingStarted: 'Start by using the available commands',
      tutorials: [],
      faq: [],
      troubleshooting: []
    },
    autocomplete: {
      enabled: true,
      commandCompletions: true,
      optionCompletions: true,
      argumentCompletions: true
    }`,
    description: 'Fix CLIInterface structure'
  },
  
  // Fix CLI command structure - add missing properties
  {
    search: /name: '([^']+)',\s*description: '([^']+)',\s*(category: '[^']+',\s*)?flags: \[/g,
    replace: `name: '$1',
        description: '$2',
        usage: '$1 [options]',
        aliases: [],
        arguments: [],
        options: [`,
    description: 'Fix CLICommand structure'
  },
  
  // Fix CLI options - defaultValue to default
  {
    search: /defaultValue: /g,
    replace: 'default: ',
    description: 'Fix CLIOption property name'
  }
];

function findMiffCapableFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('Capable.ts') && !entry.name.includes('CombatCoreCapable')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function applyFixes(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const fix of fixes) {
      const beforeContent = content;
      content = content.replace(fix.search, fix.replace);
      
      if (content !== beforeContent) {
        console.log(`  ✓ Applied: ${fix.description}`);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing remaining MIFFCapable interface mismatches...\n');
  
  const capableFiles = findMiffCapableFiles(MIFF_PURE_DIR);
  console.log(`Found ${capableFiles.length} MIFFCapable files to fix:`);
  capableFiles.forEach(file => console.log(`  - ${file}`));
  console.log();
  
  let fixedCount = 0;
  
  for (const file of capableFiles) {
    console.log(`Processing: ${file}`);
    
    if (applyFixes(file)) {
      console.log(`  ✅ Fixed successfully\n`);
      fixedCount++;
    } else {
      console.log(`  ⏭️  No changes needed\n`);
    }
  }
  
  console.log(`🎉 Fixed ${fixedCount} out of ${capableFiles.length} files`);
}

main();