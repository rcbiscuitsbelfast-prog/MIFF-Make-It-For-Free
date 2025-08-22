#!/usr/bin/env node

/**
 * CLI Documentation Generator for MIFF Framework
 * 
 * This script automatically generates CLI documentation from harness files
 * and golden test outputs. It extracts command usage, options, examples,
 * and expected outputs.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const CLI_MODULES = [
  {
    name: 'miff-simulate',
    path: 'cli/miff-simulate.ts',
    description: 'Scenario simulation and testing tool',
    category: 'Core CLI Tools'
  },
  {
    name: 'miff-diff',
    path: 'cli/miff-diff.ts',
    description: 'Output comparison and validation tool',
    category: 'Core CLI Tools'
  },
  {
    name: 'miff-init',
    path: 'cli/miff-init.ts',
    description: 'Project scaffolding and template generation',
    category: 'Core CLI Tools'
  },
  {
    name: 'RenderReplayPure',
    path: 'RenderReplayPure/cliHarness.ts',
    description: 'Visual replay and debugging tool',
    category: 'Visual Tools'
  },
  {
    name: 'DebugOverlayPure',
    path: 'DebugOverlayPure/cliHarness.ts',
    description: 'Real-time debug overlay tool',
    category: 'Visual Tools'
  },
  {
    name: 'BridgeInspectorPure',
    path: 'BridgeInspectorPure/cliHarness.ts',
    description: 'Bridge inspection and validation tool',
    category: 'Visual Tools'
  },
  {
    name: 'UnityBridgePure',
    path: 'UnityBridgePure/cliHarness.ts',
    description: 'Unity engine bridge CLI',
    category: 'Engine Bridges'
  },
  {
    name: 'WebBridgePure',
    path: 'WebBridgePure/cliHarness.ts',
    description: 'Web engine bridge CLI',
    category: 'Engine Bridges'
  },
  {
    name: 'GodotBridgePure',
    path: 'GodotBridgePure/cliHarness.ts',
    description: 'Godot engine bridge CLI',
    category: 'Engine Bridges'
  }
];

/**
 * Extract help text from CLI harness
 */
function extractHelpText(harnessPath) {
  try {
    const helpOutput = execSync(`npx ts-node --compiler-options '{"module":"commonjs"}' ${harnessPath} --help`, {
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    return helpOutput.trim();
  } catch (error) {
    console.warn(`Warning: Could not extract help text from ${harnessPath}: ${error.message}`);
    return null;
  }
}

/**
 * Extract command structure from help text
 */
function parseHelpText(helpText) {
  if (!helpText) return null;

  const lines = helpText.split('\n');
  const commands = [];
  const options = [];
  const examples = [];
  
  let currentSection = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.includes('Commands:')) {
      currentSection = 'commands';
    } else if (trimmed.includes('Options:')) {
      currentSection = 'options';
    } else if (trimmed.includes('Examples:')) {
      currentSection = 'examples';
    } else if (trimmed.startsWith('  ') && currentSection === 'commands') {
      const match = trimmed.match(/^(\w+)\s+(.+)$/);
      if (match) {
        commands.push({
          name: match[1],
          description: match[2].trim()
        });
      }
    } else if (trimmed.startsWith('  --') && currentSection === 'options') {
      const match = trimmed.match(/^--([^ ]+)(?:\s+<([^>]+)>)?\s+(.+)$/);
      if (match) {
        options.push({
          name: match[1],
          type: match[2] || 'flag',
          description: match[3].trim()
        });
      }
    } else if (trimmed.startsWith('#') && currentSection === 'examples') {
      examples.push(trimmed.substring(1).trim());
    }
  }
  
  return { commands, options, examples };
}

/**
 * Extract golden test examples
 */
function extractGoldenTestExamples(moduleName) {
  const testPath = path.join(process.cwd(), `${moduleName}/tests/golden${moduleName}.test.ts`);
  
  if (!fs.existsSync(testPath)) {
    return [];
  }
  
  try {
    const testContent = fs.readFileSync(testPath, 'utf-8');
    const examples = [];
    
    // Extract test descriptions and commands
    const testMatches = testContent.match(/test\('([^']+)',\s*\(\)\s*=>\s*{([^}]+)}/g);
    
    if (testMatches) {
      for (const match of testMatches) {
        const descriptionMatch = match.match(/test\('([^']+)'/);
        const commandMatch = match.match(/execFileSync\('npx',\s*\[([^\]]+)\]/);
        
        if (descriptionMatch && commandMatch) {
          const description = descriptionMatch[1];
          const command = commandMatch[1]
            .split(',')
            .map(arg => arg.trim().replace(/['"]/g, ''))
            .filter(arg => arg && arg !== 'ts-node' && arg !== '--compiler-options' && arg !== '{"module":"commonjs"}')
            .join(' ');
          
          examples.push({
            description,
            command: `npx ts-node ${moduleName}/cliHarness.ts ${command}`
          });
        }
      }
    }
    
    return examples;
  } catch (error) {
    console.warn(`Warning: Could not extract golden test examples from ${testPath}: ${error.message}`);
    return [];
  }
}

/**
 * Generate markdown documentation for a CLI module
 */
function generateModuleDocs(module) {
  const helpText = extractHelpText(module.path);
  const parsed = parseHelpText(helpText);
  const goldenExamples = extractGoldenTestExamples(module.name);
  
  let markdown = `# ${module.name}\n\n`;
  markdown += `${module.description}\n\n`;
  
  if (parsed) {
    if (parsed.commands.length > 0) {
      markdown += '## Commands\n\n';
      markdown += '| Command | Description |\n';
      markdown += '|---------|-------------|\n';
      
      for (const command of parsed.commands) {
        markdown += `| \`${command.name}\` | ${command.description} |\n`;
      }
      markdown += '\n';
    }
    
    if (parsed.options.length > 0) {
      markdown += '## Options\n\n';
      markdown += '| Option | Type | Description |\n';
      markdown += '|--------|------|-------------|\n';
      
      for (const option of parsed.options) {
        const type = option.type === 'flag' ? 'boolean' : option.type;
        markdown += `| \`--${option.name}\` | \`${type}\` | ${option.description} |\n`;
      }
      markdown += '\n';
    }
    
    if (parsed.examples.length > 0) {
      markdown += '## Examples\n\n';
      
      for (const example of parsed.examples) {
        markdown += `\`\`\`bash\n${example}\n\`\`\`\n\n`;
      }
    }
  }
  
  if (goldenExamples.length > 0) {
    markdown += '## Golden Test Examples\n\n';
    
    for (const example of goldenExamples) {
      markdown += `### ${example.description}\n\n`;
      markdown += `\`\`\`bash\n${example.command}\n\`\`\`\n\n`;
    }
  }
  
  return markdown;
}

/**
 * Generate complete CLI documentation
 */
function generateCLIDocs() {
  console.log('🔧 Generating CLI documentation...');
  
  const categories = {};
  
  // Group modules by category
  for (const module of CLI_MODULES) {
    if (!categories[module.category]) {
      categories[module.category] = [];
    }
    categories[module.category].push(module);
  }
  
  let fullDocs = `# CLI Reference\n\n`;
  fullDocs += `Complete command-line interface reference for MIFF Framework tools.\n\n`;
  
  // Generate table of contents
  fullDocs += '## Table of Contents\n\n';
  
  for (const [category, modules] of Object.entries(categories)) {
    fullDocs += `### ${category}\n\n`;
    
    for (const module of modules) {
      fullDocs += `- [${module.name}](#${module.name.toLowerCase()}) - ${module.description}\n`;
    }
    fullDocs += '\n';
  }
  
  // Generate documentation for each category
  for (const [category, modules] of Object.entries(categories)) {
    fullDocs += `## ${category}\n\n`;
    
    for (const module of modules) {
      console.log(`  📝 Generating docs for ${module.name}...`);
      fullDocs += generateModuleDocs(module);
      fullDocs += '---\n\n';
    }
  }
  
  // Add usage patterns section
  fullDocs += `## Common Usage Patterns\n\n`;
  
  fullDocs += `### Scenario Simulation\n\n`;
  fullDocs += `\`\`\`bash\n# Basic scenario simulation\nnpx ts-node cli/miff-simulate.ts scenario.json\n\n# Deterministic simulation with seed\nnpx ts-node cli/miff-simulate.ts scenario.json --seed 42\n\n# Verbose output with state dumping\nnpx ts-node cli/miff-simulate.ts scenario.json --verbose --dump-state\n\`\`\`\n\n`;
  
  fullDocs += `### Output Comparison\n\n`;
  fullDocs += `\`\`\`bash\n# Compare two simulation outputs\nnpx ts-node cli/miff-diff.ts output1.json output2.json\n\n# Compare with golden test output\nnpx ts-node cli/miff-diff.ts my_output.json expected_output.json\n\`\`\`\n\n`;
  
  fullDocs += `### Visual Replay\n\n`;
  fullDocs += `\`\`\`bash\n# Replay golden test with Unity engine\nnpx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts --engine unity\n\n# Replay CLI output with debug overlay\nnpx ts-node RenderReplayPure/cliHarness.ts replay-cli output.json --engine web --format html\n\`\`\`\n\n`;
  
  fullDocs += `### Bridge Inspection\n\n`;
  fullDocs += `\`\`\`bash\n# Inspect bridge compatibility\nnpx ts-node BridgeInspectorPure/cliHarness.ts inspect-golden WebBridgePure/tests/goldenBridge.test.ts\n\n# Validate renderData payload\nnpx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --format html\n\`\`\`\n\n`;
  
  // Write documentation to file
  const outputPath = path.join(process.cwd(), 'docs/src/pages/api/cli.md');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, fullDocs);
  console.log(`✅ CLI documentation generated: ${outputPath}`);
  
  return outputPath;
}

/**
 * Generate individual module documentation files
 */
function generateIndividualDocs() {
  console.log('📁 Generating individual module documentation...');
  
  for (const module of CLI_MODULES) {
    console.log(`  📝 Generating docs for ${module.name}...`);
    
    const docs = generateModuleDocs(module);
    const outputPath = path.join(process.cwd(), `docs/src/pages/api/cli/${module.name.toLowerCase()}.md`);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Add frontmatter
    const frontmatter = `---
layout: ../../../layouts/Layout.astro
title: "${module.name} CLI Reference"
description: "${module.description}"
---

`;
    
    fs.writeFileSync(outputPath, frontmatter + docs);
    console.log(`    ✅ ${module.name}: ${outputPath}`);
  }
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🚀 MIFF CLI Documentation Generator\n');
    
    // Generate complete CLI reference
    const cliDocsPath = generateCLIDocs();
    
    // Generate individual module docs
    generateIndividualDocs();
    
    console.log('\n🎉 CLI documentation generation complete!');
    console.log(`📖 Main reference: ${cliDocsPath}`);
    console.log('📁 Individual modules: docs/src/pages/api/cli/');
    
  } catch (error) {
    console.error('❌ Error generating CLI documentation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateCLIDocs, generateIndividualDocs };