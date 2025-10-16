/**
 * APIDocumentationGenerator - Automated API documentation generator
 * 
 * Generates comprehensive API documentation from TypeScript source code including:
 * - Module interfaces and classes
 * - Method signatures and parameters
 * - Type definitions and enums
 * - Usage examples and code snippets
 * - Cross-references and links
 * 
 * @version 1.0.0
 * @author MIFF Framework
 */

import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger, LogLevel } from '../logging/StructuredLogger';

export interface ModuleInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  path: string;
  description: string;
  version: string;
  exports: ExportInfo[];
  interfaces: InterfaceInfo[];
  classes: ClassInfo[];
  enums: EnumInfo[];
  functions: FunctionInfo[];
  types: TypeInfo[];
}

export interface ExportInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'class' | 'interface' | 'enum' | 'function' | 'type' | 'const' | 'default';
  description?: string;
  source: string;
}

export interface InterfaceInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  properties: PropertyInfo[];
  extends?: string[];
  generics?: string[];
  source: string;
}

export interface ClassInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  methods: MethodInfo[];
  properties: PropertyInfo[];
  constructor?: MethodInfo;
  extends?: string;
  implements?: string[];
  generics?: string[];
  source: string;
}

export interface EnumInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  values: EnumValueInfo[];
  source: string;
}

export interface FunctionInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  parameters: ParameterInfo[];
  returnType: string;
  generics?: string[];
  source: string;
}

export interface TypeInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  definition: string;
  generics?: string[];
  source: string;
}

export interface MethodInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  parameters: ParameterInfo[];
  returnType: string;
  visibility: 'public' | 'private' | 'protected';
  static: boolean;
  async: boolean;
  generics?: string[];
  source: string;
}

export interface PropertyInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  type: string;
  optional: boolean;
  readonly: boolean;
  visibility: 'public' | 'private' | 'protected';
  static: boolean;
  source: string;
}

export interface ParameterInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description?: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
  source: string;
}

export interface EnumValueInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  value: string | number;
  description?: string;
  source: string;
}

export interface DocumentationConfig {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  outputDir: string;
  includePrivate: boolean;
  includeSource: boolean;
  generateExamples: boolean;
  format: 'markdown' | 'html' | 'json';
  theme: 'default' | 'dark' | 'minimal';
}

export class APIDocumentationGenerator {
  
  private config: DocumentationConfig;
  private modules: Map<string, ModuleInfo> = new Map();

  constructor(config: Partial<DocumentationConfig> = {}) {
    this.config = {
      outputDir: './docs/api',
      includePrivate: false,
      includeSource: true,
      generateExamples: true,
      format: 'markdown',
      theme: 'default',
      ...config
    };

    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      modules: {
        'APIDocumentationGenerator': LogLevel.DEBUG
      }
    });
  }

  /**
   * Generate documentation for all modules
   */
  async generateDocumentation(): Promise<void> {
    const timerId = console.startTimer('APIDocumentationGenerator', 'generateDocumentation');
    
    try {
      console.info('APIDocumentationGenerator', 'Starting API documentation generation');

      // Discover all modules
      await this.discoverModules();

      // Generate documentation for each module
      for (const [moduleName, moduleInfo] of this.modules) {
        await this.generateModuleDocumentation(moduleInfo);
      }

      // Generate index documentation
      await this.generateIndexDocumentation();

      // Generate navigation
      await this.generateNavigation();

      const duration = console.endTimer(timerId);
      console.logPerformance('APIDocumentationGenerator', 'generateDocumentation', duration);
      
      console.info('APIDocumentationGenerator', 'API documentation generation completed', {
        modulesProcessed: this.modules.size,
        outputDir: this.config.outputDir
      });

    } catch (error) {
      console.error('APIDocumentationGenerator', 'Failed to generate documentation', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, error instanceof Error ? error : undefined);
      
      console.endTimer(timerId);
      throw error;
    }
  }

  /**
   * Generate documentation for a specific module
   */
  async generateModuleDocumentation(moduleInfo: ModuleInfo): Promise<void> {
    const outputPath = path.join(this.config.outputDir, `${moduleInfo.name}.${this.config.format}`);
    
    let content: string;
    
    switch (this.config.format) {
      case 'markdown':
        content = this.generateMarkdownDocumentation(moduleInfo);
        break;
      case 'html':
        content = this.generateHTMLDocumentation(moduleInfo);
        break;
      case 'json':
        content = this.generateJSONDocumentation(moduleInfo);
        break;
      default:
        throw new Error(`Unsupported format: ${this.config.format}`);
    }

    // Ensure output directory exists
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Write documentation file
    await fs.promises.writeFile(outputPath, content, 'utf8');
    
    console.debug('APIDocumentationGenerator', 'Generated module documentation', {
      module: moduleInfo.name,
      outputPath
    });
  }

  /**
   * Discover all modules in the framework
   */
  private async discoverModules(): Promise<void> {
    const pureDir = path.join(process.cwd(), 'miff', 'pure');
    const entries = await fs.promises.readdir(pureDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith('Pure')) {
        const modulePath = path.join(pureDir, entry.name);
        const moduleInfo = await this.analyzeModule(entry.name, modulePath);
        if (moduleInfo) {
          this.modules.set(moduleInfo.name, moduleInfo);
        }
      }
    }

    console.info('APIDocumentationGenerator', 'Discovered modules', {
      count: this.modules.size,
      modules: Array.from(this.modules.keys())
    });
  }

  /**
   * Analyze a module and extract API information
   */
  private async analyzeModule(name: string, modulePath: string): Promise<ModuleInfo | null> {
    try {
      const indexPath = path.join(modulePath, 'index.ts');
      const managerPath = path.join(modulePath, 'Manager.ts');
      
      // Check if module has required files
      if (!fs.existsSync(indexPath) && !fs.existsSync(managerPath)) {
        return null;
      }

      const moduleInfo: ModuleInfo = {
        name,
        path: modulePath,
        description: '',
        version: '1.0.0',
        exports: [],
        interfaces: [],
        classes: [],
        enums: [],
        functions: [],
        types: []
      };

      // Analyze index.ts if it exists
      if (fs.existsSync(indexPath)) {
        const indexContent = await fs.promises.readFile(indexPath, 'utf8');
        this.parseFileContent(indexContent, moduleInfo, indexPath);
      }

      // Analyze Manager.ts if it exists
      if (fs.existsSync(managerPath)) {
        const managerContent = await fs.promises.readFile(managerPath, 'utf8');
        this.parseFileContent(managerContent, moduleInfo, managerPath);
      }

      // Extract description from JSDoc comments
      moduleInfo.description = this.extractDescription(moduleInfo);

      return moduleInfo;

    } catch (error) {
      console.warn('APIDocumentationGenerator', 'Failed to analyze module', {
        module: name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Parse TypeScript file content and extract API information
   */
  private parseFileContent(content: string, moduleInfo: ModuleInfo, filePath: string): void {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Parse interfaces
      if (line.startsWith('export interface ')) {
        const interfaceInfo = this.parseInterface(lines, i, filePath);
        if (interfaceInfo) {
          moduleInfo.interfaces.push(interfaceInfo);
        }
      }
      
      // Parse classes
      else if (line.startsWith('export class ')) {
        const classInfo = this.parseClass(lines, i, filePath);
        if (classInfo) {
          moduleInfo.classes.push(classInfo);
        }
      }
      
      // Parse enums
      else if (line.startsWith('export enum ')) {
        const enumInfo = this.parseEnum(lines, i, filePath);
        if (enumInfo) {
          moduleInfo.enums.push(enumInfo);
        }
      }
      
      // Parse functions
      else if (line.startsWith('export function ')) {
        const functionInfo = this.parseFunction(lines, i, filePath);
        if (functionInfo) {
          moduleInfo.functions.push(functionInfo);
        }
      }
      
      // Parse types
      else if (line.startsWith('export type ')) {
        const typeInfo = this.parseType(lines, i, filePath);
        if (typeInfo) {
          moduleInfo.types.push(typeInfo);
        }
      }
    }
  }

  /**
   * Parse interface definition
   */
  private parseInterface(lines: string[], startIndex: number, filePath: string): InterfaceInfo | null {
    const line = lines[startIndex];
    const match = line.match(/export interface (\w+)/);
    if (!match) return null;

    const name = match[1];
    const description = this.extractJSDocComment(lines, startIndex);
    
    const interfaceInfo: InterfaceInfo = {
      name,
      description,
      properties: [],
      source: filePath
    };

    // Parse properties
    let i = startIndex + 1;
    while (i < lines.length && !lines[i].includes('}')) {
      const propLine = lines[i].trim();
      if (propLine && !propLine.startsWith('//') && !propLine.startsWith('*')) {
        const property = this.parseProperty(propLine, filePath);
        if (property) {
          interfaceInfo.properties.push(property);
        }
      }
      i++;
    }

    return interfaceInfo;
  }

  /**
   * Parse class definition
   */
  private parseClass(lines: string[], startIndex: number, filePath: string): ClassInfo | null {
    const line = lines[startIndex];
    const match = line.match(/export class (\w+)/);
    if (!match) return null;

    const name = match[1];
    const description = this.extractJSDocComment(lines, startIndex);
    
    const classInfo: ClassInfo = {
      name,
      description,
      methods: [],
      properties: [],
      source: filePath
    };

    // Parse class content
    let i = startIndex + 1;
    let braceCount = 0;
    let inClass = false;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (line.includes('{')) {
        braceCount++;
        inClass = true;
      }
      if (line.includes('}')) {
        braceCount--;
        if (inClass && braceCount === 0) break;
      }
      
      if (inClass) {
        // Parse methods
        if (line.match(/^\w+\s*\(/)) {
          const method = this.parseMethod(lines, i, filePath);
          if (method) {
            classInfo.methods.push(method);
          }
        }
        
        // Parse properties
        else if (line.match(/^\w+:/) || line.match(/private|public|protected/)) {
          const property = this.parseProperty(line, filePath);
          if (property) {
            classInfo.properties.push(property);
          }
        }
      }
      
      i++;
    }

    return classInfo;
  }

  /**
   * Parse enum definition
   */
  private parseEnum(lines: string[], startIndex: number, filePath: string): EnumInfo | null {
    const line = lines[startIndex];
    const match = line.match(/export enum (\w+)/);
    if (!match) return null;

    const name = match[1];
    const description = this.extractJSDocComment(lines, startIndex);
    
    const enumInfo: EnumInfo = {
      name,
      description,
      values: [],
      source: filePath
    };

    // Parse enum values
    let i = startIndex + 1;
    while (i < lines.length && !lines[i].includes('}')) {
      const valueLine = lines[i].trim();
      if (valueLine && !valueLine.startsWith('//') && !valueLine.startsWith('*')) {
        const value = this.parseEnumValue(valueLine, filePath);
        if (value) {
          enumInfo.values.push(value);
        }
      }
      i++;
    }

    return enumInfo;
  }

  /**
   * Parse function definition
   */
  private parseFunction(lines: string[], startIndex: number, filePath: string): FunctionInfo | null {
    const line = lines[startIndex];
    const match = line.match(/export function (\w+)/);
    if (!match) return null;

    const name = match[1];
    const description = this.extractJSDocComment(lines, startIndex);
    
    return {
      name,
      description,
      parameters: this.parseParameters(line),
      returnType: this.extractReturnType(line),
      source: filePath
    };
  }

  /**
   * Parse type definition
   */
  private parseType(lines: string[], startIndex: number, filePath: string): TypeInfo | null {
    const line = lines[startIndex];
    const match = line.match(/export type (\w+)/);
    if (!match) return null;

    const name = match[1];
    const description = this.extractJSDocComment(lines, startIndex);
    
    return {
      name,
      description,
      definition: line.replace(/export type \w+\s*=\s*/, ''),
      source: filePath
    };
  }

  /**
   * Parse method definition
   */
  private parseMethod(lines: string[], startIndex: number, filePath: string): MethodInfo | null {
    const line = lines[startIndex];
    const match = line.match(/(\w+)\s*\(/);
    if (!match) return null;

    const name = match[1];
    const description = this.extractJSDocComment(lines, startIndex);
    
    return {
      name,
      description,
      parameters: this.parseParameters(line),
      returnType: this.extractReturnType(line),
      visibility: this.extractVisibility(line),
      static: line.includes('static'),
      async: line.includes('async'),
      source: filePath
    };
  }

  /**
   * Parse property definition
   */
  private parseProperty(line: string, filePath: string): PropertyInfo | null {
    const match = line.match(/(\w+)(\?)?\s*:\s*([^;=]+)/);
    if (!match) return null;

    return {
      name: match[1],
      type: match[3].trim(),
      optional: !!match[2],
      readonly: line.includes('readonly'),
      visibility: this.extractVisibility(line),
      static: line.includes('static'),
      source: filePath
    };
  }

  /**
   * Parse enum value definition
   */
  private parseEnumValue(line: string, filePath: string): EnumValueInfo | null {
    const match = line.match(/(\w+)\s*=\s*([^,]+)/);
    if (!match) return null;

    return {
      name: match[1],
      value: match[2].trim().replace(/['"]/g, ''),
      source: filePath
    };
  }

  /**
   * Extract JSDoc comment from lines
   */
  private extractJSDocComment(lines: string[], startIndex: number): string! {
    let i = startIndex - 1;
    let comment = '';
    
    while (i >= 0) {
      const line = lines[i].trim();
      if (line.startsWith('*/')) {
        break;
      }
      if (line.startsWith('*') || line.startsWith('/**')) {
        comment = line.replace(/^\*+\s?/, '') + '\n' + comment;
      }
      i--;
    }
    
    return comment.trim() || undefined;
  }

  /**
   * Extract description from module info
   */
  private extractDescription(moduleInfo: ModuleInfo): string {
    // Try to find description in class or interface comments
    for (const cls of moduleInfo.classes) {
      if (cls.description) {
        return cls.description;
      }
    }
    
    for (const iface of moduleInfo.interfaces) {
      if (iface.description) {
        return iface.description;
      }
    }
    
    return `${moduleInfo.name} module`;
  }

  /**
   * Parse parameters from function/method signature
   */
  private parseParameters(line: string): ParameterInfo[] {
    const paramMatch = line.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];

    const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
    return params.map(param => {
      const [name, type] = param.split(':').map(s => s.trim());
      return {
        name: name.replace('?', ''),
        type: type || 'any',
        optional: name.includes('?'),
        source: ''
      };
    });
  }

  /**
   * Extract return type from function/method signature
   */
  private extractReturnType(line: string): string {
    const returnMatch = line.match(/\)\s*:\s*([^{]+)/);
    return returnMatch ? returnMatch[1].trim() : 'void';
  }

  /**
   * Extract visibility from line
   */
  private extractVisibility(line: string): 'public' | 'private' | 'protected' {
    if (line.includes('private')) return 'private';
    if (line.includes('protected')) return 'protected';
    return 'public';
  }

  /**
   * Generate Markdown documentation
   */
  private generateMarkdownDocumentation(moduleInfo: ModuleInfo): string {
    let content = `# ${moduleInfo.name}\n\n`;
    
    if (moduleInfo.description) {
      content += `${moduleInfo.description}\n\n`;
    }
    
    content += `## Overview\n\n`;
    content += `- **Version**: ${moduleInfo.version}\n`;
    content += `- **Path**: \`${moduleInfo.path}\`\n`;
    content += `- **Exports**: ${moduleInfo.exports.length}\n`;
    content += `- **Interfaces**: ${moduleInfo.interfaces.length}\n`;
    content += `- **Classes**: ${moduleInfo.classes.length}\n`;
    content += `- **Enums**: ${moduleInfo.enums.length}\n`;
    content += `- **Functions**: ${moduleInfo.functions.length}\n`;
    content += `- **Types**: ${moduleInfo.types.length}\n\n`;
    
    // Classes
    if (moduleInfo.classes.length > 0) {
      content += `## Classes\n\n`;
      for (const cls of moduleInfo.classes) {
        content += `### ${cls.name}\n\n`;
        if (cls.description) {
          content += `${cls.description}\n\n`;
        }
        
        if (cls.constructor) {
          content += `#### Constructor\n\n`;
          content += `\`\`\`typescript\n`;
          content += `constructor(${cls.constructor.parameters.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')})\n`;
          content += `\`\`\`\n\n`;
        }
        
        if (cls.methods.length > 0) {
          content += `#### Methods\n\n`;
          for (const method of cls.methods) {
            if (this.config.includePrivate || method.visibility === 'public') {
              content += `##### ${method.name}\n\n`;
              if (method.description) {
                content += `${method.description}\n\n`;
              }
              content += `\`\`\`typescript\n`;
              content += `${method.visibility} ${method.static ? 'static ' : ''}${method.async ? 'async ' : ''}${method.name}(${method.parameters.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')}): ${method.returnType}\n`;
              content += `\`\`\`\n\n`;
            }
          }
        }
        
        if (cls.properties.length > 0) {
          content += `#### Properties\n\n`;
          for (const prop of cls.properties) {
            if (this.config.includePrivate || prop.visibility === 'public') {
              content += `##### ${prop.name}\n\n`;
              if (prop.description) {
                content += `${prop.description}\n\n`;
              }
              content += `\`\`\`typescript\n`;
              content += `${prop.visibility} ${prop.static ? 'static ' : ''}${prop.readonly ? 'readonly ' : ''}${prop.name}${prop.optional ? '?' : ''}: ${prop.type}\n`;
              content += `\`\`\`\n\n`;
            }
          }
        }
      }
    }
    
    // Interfaces
    if (moduleInfo.interfaces.length > 0) {
      content += `## Interfaces\n\n`;
      for (const iface of moduleInfo.interfaces) {
        content += `### ${iface.name}\n\n`;
        if (iface.description) {
          content += `${iface.description}\n\n`;
        }
        
        if (iface.properties.length > 0) {
          content += `#### Properties\n\n`;
          for (const prop of iface.properties) {
            content += `- **${prop.name}**${prop.optional ? '?' : ''}: \`${prop.type}\`\n`;
            if (prop.description) {
              content += `  - ${prop.description}\n`;
            }
          }
          content += `\n`;
        }
      }
    }
    
    // Enums
    if (moduleInfo.enums.length > 0) {
      content += `## Enums\n\n`;
      for (const enumInfo of moduleInfo.enums) {
        content += `### ${enumInfo.name}\n\n`;
        if (enumInfo.description) {
          content += `${enumInfo.description}\n\n`;
        }
        
        content += `#### Values\n\n`;
        for (const value of enumInfo.values) {
          content += `- **${value.name}**: \`${value.value}\`\n`;
          if (value.description) {
            content += `  - ${value.description}\n`;
          }
        }
        content += `\n`;
      }
    }
    
    // Functions
    if (moduleInfo.functions.length > 0) {
      content += `## Functions\n\n`;
      for (const func of moduleInfo.functions) {
        content += `### ${func.name}\n\n`;
        if (func.description) {
          content += `${func.description}\n\n`;
        }
        
        content += `\`\`\`typescript\n`;
        content += `function ${func.name}(${func.parameters.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')}): ${func.returnType}\n`;
        content += `\`\`\`\n\n`;
      }
    }
    
    // Types
    if (moduleInfo.types.length > 0) {
      content += `## Types\n\n`;
      for (const type of moduleInfo.types) {
        content += `### ${type.name}\n\n`;
        if (type.description) {
          content += `${type.description}\n\n`;
        }
        
        content += `\`\`\`typescript\n`;
        content += `type ${type.name} = ${type.definition}\n`;
        content += `\`\`\`\n\n`;
      }
    }
    
    return content;
  }

  /**
   * Generate HTML documentation
   */
  private generateHTMLDocumentation(moduleInfo: ModuleInfo): string {
    // Implementation for HTML generation
    return `<!DOCTYPE html>
<html>
<head>
    <title>${moduleInfo.name} - API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin: 30px 0; }
        .method { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        code { background: #e8e8e8; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${moduleInfo.name}</h1>
        <p>${moduleInfo.description}</p>
    </div>
    <!-- HTML content would be generated here -->
</body>
</html>`;
  }

  /**
   * Generate JSON documentation
   */
  private generateJSONDocumentation(moduleInfo: ModuleInfo): string {
    return JSON.stringify(moduleInfo, null, 2);
  }

  /**
   * Generate index documentation
   */
  private async generateIndexDocumentation(): Promise<void> {
    const indexPath = path.join(this.config.outputDir, `index.${this.config.format}`);
    
    let content: string;
    
    if (this.config.format === 'markdown') {
      content = this.generateMarkdownIndex();
    } else if (this.config.format === 'html') {
      content = this.generateHTMLIndex();
    } else {
      content = JSON.stringify(Array.from(this.modules.values()), null, 2);
    }

    await fs.promises.writeFile(indexPath, content, 'utf8');
  }

  /**
   * Generate Markdown index
   */
  private generateMarkdownIndex(): string {
    let content = `# MIFF Framework API Documentation\n\n`;
    content += `Complete API documentation for all MIFF Framework modules.\n\n`;
    content += `## Modules (${this.modules.size})\n\n`;
    
    for (const [name, moduleInfo] of this.modules) {
      content += `### [${name}](./${name}.${this.config.format})\n`;
      content += `${moduleInfo.description}\n\n`;
    }
    
    return content;
  }

  /**
   * Generate HTML index
   */
  private generateHTMLIndex(): string {
    let content = `<!DOCTYPE html>
<html>
<head>
    <title>MIFF Framework API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .module { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        a { text-decoration: none; color: #0066cc; }
    </style>
</head>
<body>
    <h1>MIFF Framework API Documentation</h1>
    <p>Complete API documentation for all MIFF Framework modules.</p>
    <div class="modules">`;
    
    for (const [name, moduleInfo] of this.modules) {
      content += `
        <div class="module">
            <h2><a href="${name}.${this.config.format}">${name}</a></h2>
            <p>${moduleInfo.description}</p>
        </div>`;
    }
    
    content += `
    </div>
</body>
</html>`;
    
    return content;
  }

  /**
   * Generate navigation
   */
  private async generateNavigation(): Promise<void> {
    // Implementation for navigation generation
    console.debug('APIDocumentationGenerator', 'Navigation generation not implemented');
  }
}

// Export default instance
// export const apiDocumentationGenerator = new APIDocumentationGenerator();
export { APIDocumentationGenerator as default };