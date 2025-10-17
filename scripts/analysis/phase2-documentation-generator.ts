#!/usr/bin/env tsx

/**
 * Phase 2 Documentation Generator
 * 
 * Creates comprehensive module documentation and API references
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

interface ModuleDocumentation {
  name: string;
  description: string;
  version: string;
  exports: string[];
  classes: ClassDocumentation[];
  interfaces: InterfaceDocumentation[];
  enums: EnumDocumentation[];
  functions: FunctionDocumentation[];
  cliCommands: string[];
  dependencies: string[];
  examples: string[];
}

interface ClassDocumentation {
  name: string;
  description: string;
  methods: MethodDocumentation[];
  properties: PropertyDocumentation[];
  constructor: MethodDocumentation | null;
}

interface InterfaceDocumentation {
  name: string;
  description: string;
  properties: PropertyDocumentation[];
  methods: MethodDocumentation[];
}

interface EnumDocumentation {
  name: string;
  description: string;
  values: { [key: string]: any };
}

interface FunctionDocumentation {
  name: string;
  description: string;
  parameters: ParameterDocumentation[];
  returnType: string;
  example?: string;
}

interface MethodDocumentation {
  name: string;
  description: string;
  parameters: ParameterDocumentation[];
  returnType: string;
  visibility: 'public' | 'private' | 'protected';
  static: boolean;
  async: boolean;
}

interface PropertyDocumentation {
  name: string;
  description: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  optional: boolean;
}

interface ParameterDocumentation {
  name: string;
  type: string;
  description: string;
  optional: boolean;
  defaultValue?: string;
}

class Phase2DocumentationGenerator {
  private modules: ModuleDocumentation[] = [];
  private pureDir = '/workspace/miff/pure';

  async generateDocumentation(): Promise<ModuleDocumentation[]> {
    console.log('📚 Generating module documentation...');
    
    await this.scanAllModules();
    this.generateMarkdownDocs();
    
    console.log(`📊 Generated documentation for ${this.modules.length} modules`);
    return this.modules;
  }

  private async scanAllModules(): Promise<void> {
    try {
      const entries = readdirSync(this.pureDir);
      
      for (const entry of entries) {
        const fullPath = join(this.pureDir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          await this.analyzeModule(entry, fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan pure modules: ${error}`);
    }
  }

  private async analyzeModule(moduleName: string, modulePath: string): Promise<void> {
    try {
      const indexPath = join(modulePath, 'index.ts');
      if (!existsSync(indexPath)) {
        return;
      }

      const content = readFileSync(indexPath, 'utf-8');
      const moduleDoc = await this.parseModule(moduleName, content, modulePath);
      this.modules.push(moduleDoc);
    } catch (error) {
      console.warn(`⚠️  Could not analyze module ${moduleName}: ${error}`);
    }
  }

  private async parseModule(moduleName: string, content: string, modulePath: string): Promise<ModuleDocumentation> {
    const moduleDoc: ModuleDocumentation = {
      name: moduleName,
      description: this.extractDescription(content),
      version: this.extractVersion(content),
      exports: this.extractExports(content),
      classes: [],
      interfaces: [],
      enums: [],
      functions: [],
      cliCommands: [],
      dependencies: this.extractDependencies(content),
      examples: []
    };

    // Parse classes
    const classMatches = content.match(/export\s+class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{[^}]*\}/gs);
    if (classMatches) {
      for (const classMatch of classMatches) {
        const className = classMatch.match(/export\s+class\s+(\w+)/)?.[1];
        if (className) {
          moduleDoc.classes.push(this.parseClass(className, classMatch));
        }
      }
    }

    // Parse interfaces
    const interfaceMatches = content.match(/export\s+interface\s+(\w+)\s*\{[^}]*\}/gs);
    if (interfaceMatches) {
      for (const interfaceMatch of interfaceMatches) {
        const interfaceName = interfaceMatch.match(/export\s+interface\s+(\w+)/)?.[1];
        if (interfaceName) {
          moduleDoc.interfaces.push(this.parseInterface(interfaceName, interfaceMatch));
        }
      }
    }

    // Parse enums
    const enumMatches = content.match(/export\s+enum\s+(\w+)\s*\{[^}]*\}/gs);
    if (enumMatches) {
      for (const enumMatch of enumMatches) {
        const enumName = enumMatch.match(/export\s+enum\s+(\w+)/)?.[1];
        if (enumName) {
          moduleDoc.enums.push(this.parseEnum(enumName, enumMatch));
        }
      }
    }

    // Parse functions
    const functionMatches = content.match(/export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/gs);
    if (functionMatches) {
      for (const functionMatch of functionMatches) {
        const functionName = functionMatch.match(/export\s+(?:async\s+)?function\s+(\w+)/)?.[1];
        if (functionName) {
          moduleDoc.functions.push(this.parseFunction(functionName, functionMatch));
        }
      }
    }

    // Check for CLI harness
    const cliPath = join(modulePath, 'cliHarness.ts');
    if (existsSync(cliPath)) {
      const cliContent = readFileSync(cliPath, 'utf-8');
      moduleDoc.cliCommands = this.extractCLICommands(cliContent);
    }

    return moduleDoc;
  }

  private extractDescription(content: string): string {
    const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
      const lines = commentMatch[0].split('\n');
      const descriptionLines = lines
        .filter(line => line.trim().startsWith('*') && !line.trim().startsWith('* @'))
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => line.length > 0);
      
      return descriptionLines.join(' ');
    }
    return `${this.extractModuleName(content)} module`;
  }

  private extractModuleName(content: string): string {
    const nameMatch = content.match(/@module\s+(\w+)/);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  private extractVersion(content: string): string {
    const versionMatch = content.match(/@version\s+([\d.]+)/);
    return versionMatch ? versionMatch[1] : '1.0.0';
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    
    // Named exports
    const namedExports = content.match(/export\s+(?:const|let|var|function|class|interface|enum|type)\s+(\w+)/g);
    if (namedExports) {
      namedExports.forEach(exp => {
        const match = exp.match(/export\s+(?:const|let|var|function|class|interface|enum|type)\s+(\w+)/);
        if (match) exports.push(match[1]);
      });
    }

    // Default exports
    const defaultExports = content.match(/export\s+default\s+(\w+)/g);
    if (defaultExports) {
      defaultExports.forEach(exp => {
        const match = exp.match(/export\s+default\s+(\w+)/);
        if (match) exports.push(match[1]);
      });
    }

    return [...new Set(exports)];
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const importMatches = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    
    if (importMatches) {
      importMatches.forEach(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          let dep = match[1];
          if (dep.startsWith('../')) {
            dep = dep.replace('../', '');
          }
          dependencies.push(dep);
        }
      });
    }

    return [...new Set(dependencies)];
  }

  private extractCLICommands(content: string): string[] {
    const commands: string[] = [];
    const commandMatches = content.match(/case\s+['"]([^'"]+)['"]:/g);
    
    if (commandMatches) {
      commandMatches.forEach(cmd => {
        const match = cmd.match(/case\s+['"]([^'"]+)['"]:/);
        if (match) commands.push(match[1]);
      });
    }

    return commands;
  }

  private parseClass(className: string, classContent: string): ClassDocumentation {
    const classDoc: ClassDocumentation = {
      name: className,
      description: this.extractClassDescription(classContent),
      methods: [],
      properties: [],
      constructor: null
    };

    // Parse methods
    const methodMatches = classContent.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g);
    if (methodMatches) {
      for (const methodMatch of methodMatches) {
        const methodName = methodMatch.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\(/)?.[1];
        if (methodName) {
          classDoc.methods.push(this.parseMethod(methodName, methodMatch));
        }
      }
    }

    // Parse properties
    const propertyMatches = classContent.match(/(?:public|private|protected)?\s*(?:static\s+)?(\w+)\s*:\s*(\w+)/g);
    if (propertyMatches) {
      for (const propertyMatch of propertyMatches) {
        const propertyName = propertyMatch.match(/(?:public|private|protected)?\s*(?:static\s+)?(\w+)\s*:/)?.[1];
        const propertyType = propertyMatch.match(/:\s*(\w+)/)?.[1];
        if (propertyName && propertyType) {
          classDoc.properties.push({
            name: propertyName,
            description: '',
            type: propertyType,
            visibility: 'public',
            optional: false
          });
        }
      }
    }

    return classDoc;
  }

  private parseInterface(interfaceName: string, interfaceContent: string): InterfaceDocumentation {
    return {
      name: interfaceName,
      description: this.extractInterfaceDescription(interfaceContent),
      properties: [],
      methods: []
    };
  }

  private parseEnum(enumName: string, enumContent: string): EnumDocumentation {
    const values: { [key: string]: any } = {};
    const valueMatches = enumContent.match(/(\w+)\s*=\s*([^,}]+)/g);
    
    if (valueMatches) {
      valueMatches.forEach(valueMatch => {
        const match = valueMatch.match(/(\w+)\s*=\s*([^,}]+)/);
        if (match) {
          values[match[1]] = match[2].trim();
        }
      });
    }

    return {
      name: enumName,
      description: this.extractEnumDescription(enumContent),
      values
    };
  }

  private parseFunction(functionName: string, functionContent: string): FunctionDocumentation {
    return {
      name: functionName,
      description: this.extractFunctionDescription(functionContent),
      parameters: [],
      returnType: 'any'
    };
  }

  private parseMethod(methodName: string, methodContent: string): MethodDocumentation {
    return {
      name: methodName,
      description: this.extractMethodDescription(methodContent),
      parameters: [],
      returnType: 'any',
      visibility: 'public',
      static: methodContent.includes('static'),
      async: methodContent.includes('async')
    };
  }

  private extractClassDescription(content: string): string {
    const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
      return commentMatch[0].replace(/\/\*\*|\*\//g, '').replace(/\*/g, '').trim();
    }
    return `${this.extractClassName(content)} class`;
  }

  private extractClassName(content: string): string {
    const nameMatch = content.match(/class\s+(\w+)/);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  private extractInterfaceDescription(content: string): string {
    const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
      return commentMatch[0].replace(/\/\*\*|\*\//g, '').replace(/\*/g, '').trim();
    }
    return `${this.extractInterfaceName(content)} interface`;
  }

  private extractInterfaceName(content: string): string {
    const nameMatch = content.match(/interface\s+(\w+)/);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  private extractEnumDescription(content: string): string {
    const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
      return commentMatch[0].replace(/\/\*\*|\*\//g, '').replace(/\*/g, '').trim();
    }
    return `${this.extractEnumName(content)} enum`;
  }

  private extractEnumName(content: string): string {
    const nameMatch = content.match(/enum\s+(\w+)/);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  private extractFunctionDescription(content: string): string {
    const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
      return commentMatch[0].replace(/\/\*\*|\*\//g, '').replace(/\*/g, '').trim();
    }
    return `${this.extractFunctionName(content)} function`;
  }

  private extractFunctionName(content: string): string {
    const nameMatch = content.match(/function\s+(\w+)/);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  private extractMethodDescription(content: string): string {
    const commentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
      return commentMatch[0].replace(/\/\*\*|\*\//g, '').replace(/\*/g, '').trim();
    }
    return `${this.extractMethodName(content)} method`;
  }

  private extractMethodName(content: string): string {
    const nameMatch = content.match(/(\w+)\s*\(/);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  private generateMarkdownDocs(): void {
    const docsDir = '/workspace/docs/api';
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }

    // Generate main API documentation
    this.generateMainAPIDoc(docsDir);

    // Generate individual module documentation
    for (const module of this.modules) {
      this.generateModuleDoc(module, docsDir);
    }

    // Generate CLI documentation
    this.generateCLIDoc(docsDir);
  }

  private generateMainAPIDoc(docsDir: string): void {
    const content = `# MIFF API Documentation

Generated: ${new Date().toISOString()}

## Overview

This documentation covers all modules in the MIFF (Make It For Free) framework.

## Modules

${this.modules.map(module => `- [${module.name}](./${module.name}.md) - ${module.description}`).join('\n')}

## Quick Start

\`\`\`typescript
import { CombatEngine } from './miff/pure/CombatPure';
import { ItemUsageManager } from './miff/pure/ItemsPure';
import { TeamManager } from './miff/pure/TeamsPure';

// Create a combat engine
const combatEngine = new CombatEngine();

// Create item manager
const itemManager = new ItemUsageManager(playerContext);

// Create team manager
const teamManager = new TeamManager();
\`\`\`

## CLI Commands

Each module provides CLI commands for testing and interaction:

\`\`\`bash
# Test combat system
npx tsx miff/pure/CombatPure/cliHarness.ts test

# Test items system
npx tsx miff/pure/ItemsPure/cliHarness.ts test

# Test teams system
npx tsx miff/pure/TeamsPure/cliHarness.ts test
\`\`\`

## Integration

All modules are designed to work together seamlessly:

\`\`\`typescript
// Full integration example
import { CombatEngine } from './miff/pure/CombatPure';
import { ItemUsageManager } from './miff/pure/ItemsPure';
import { TeamManager } from './miff/pure/TeamsPure';
import { StatusEffectsManager } from './miff/pure/StatusEffectsPure';

// Create integrated game system
const gameSystem = {
  combat: new CombatEngine(),
  items: new ItemUsageManager(playerContext),
  teams: new TeamManager(),
  statusEffects: new StatusEffectsManager()
};
\`\`\`
`;

    writeFileSync(join(docsDir, 'README.md'), content);
  }

  private generateModuleDoc(module: ModuleDocumentation, docsDir: string): void {
    const content = `# ${module.name}

**Version:** ${module.version}  
**Description:** ${module.description}

## Exports

${module.exports.map(exp => `- \`${exp}\``).join('\n')}

## Classes

${module.classes.map(cls => `### ${cls.name}

${cls.description}

**Methods:**
${cls.methods.map(method => `- \`${method.name}()\` - ${method.description}`).join('\n')}

**Properties:**
${cls.properties.map(prop => `- \`${prop.name}: ${prop.type}\` - ${prop.description}`).join('\n')}
`).join('\n')}

## Interfaces

${module.interfaces.map(iface => `### ${iface.name}

${iface.description}

**Properties:**
${iface.properties.map(prop => `- \`${prop.name}: ${prop.type}\` - ${prop.description}`).join('\n')}
`).join('\n')}

## Enums

${module.enums.map(enumItem => `### ${enumItem.name}

${enumItem.description}

**Values:**
${Object.entries(enumItem.values).map(([key, value]) => `- \`${key} = ${value}\``).join('\n')}
`).join('\n')}

## Functions

${module.functions.map(func => `### ${func.name}

${func.description}

**Parameters:** ${func.parameters.map(param => `${param.name}: ${param.type}`).join(', ')}  
**Returns:** ${func.returnType}
`).join('\n')}

## CLI Commands

${module.cliCommands.length > 0 ? module.cliCommands.map(cmd => `- \`${cmd}\``).join('\n') : 'No CLI commands available'}

## Dependencies

${module.dependencies.map(dep => `- \`${dep}\``).join('\n')}

## Usage Example

\`\`\`typescript
import { ${module.exports[0] || module.name} } from './miff/pure/${module.name}';

// Example usage
const instance = new ${module.exports[0] || module.name}();
\`\`\`
`;

    writeFileSync(join(docsDir, `${module.name}.md`), content);
  }

  private generateCLIDoc(docsDir: string): void {
    const content = `# CLI Commands Reference

Generated: ${new Date().toISOString()}

## Overview

Each module provides CLI commands for testing and interaction.

## Available Commands

${this.modules.map(module => `### ${module.name}

${module.cliCommands.length > 0 ? 
  module.cliCommands.map(cmd => `- \`npx tsx miff/pure/${module.name}/cliHarness.ts ${cmd}\``).join('\n') : 
  'No CLI commands available'
}`).join('\n')}

## Usage

\`\`\`bash
# Run a specific command
npx tsx miff/pure/ModuleName/cliHarness.ts command

# Get help for a module
npx tsx miff/pure/ModuleName/cliHarness.ts --help

# Run tests
npx tsx miff/pure/ModuleName/cliHarness.ts test
\`\`\`

## Examples

\`\`\`bash
# Test combat system
npx tsx miff/pure/CombatPure/cliHarness.ts test

# Create a battle
npx tsx miff/pure/CombatPure/cliHarness.ts create_battle

# Add combatant
npx tsx miff/pure/CombatPure/cliHarness.ts add_combatant "spirit1"

# Process turn
npx tsx miff/pure/CombatPure/cliHarness.ts process_turn
\`\`\`
`;

    writeFileSync(join(docsDir, 'CLI.md'), content);
  }
}

// Main execution
async function main() {
  const generator = new Phase2DocumentationGenerator();
  const modules = await generator.generateDocumentation();
  
  console.log(`\n📚 Documentation generated for ${modules.length} modules`);
  console.log('📁 Documentation saved to /workspace/docs/api/');
  console.log('📖 Main API documentation: /workspace/docs/api/README.md');
  console.log('🔧 CLI documentation: /workspace/docs/api/CLI.md');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}