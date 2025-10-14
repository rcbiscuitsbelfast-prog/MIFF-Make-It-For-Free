import { StructuredLogger } from '../logging/StructuredLogger';
import { StandardErrorHandler } from '../error/StandardErrorHandler';
import { SafeJSONParser } from '../security/SafeJSONParser';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI Interface Standardizer - Ensures consistent CLI harness interfaces across all modules
 * Addresses interface safety standardization for all CLI harnesses
 */

export interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  arguments: CLIArgument[];
  examples: string[];
  category: string;
  version: string;
}

export interface CLIOption {
  name: string;
  shortName?: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
  choices?: any[];
  validator?: (value: any) => boolean;
}

export interface CLIArgument {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'directory';
  required: boolean;
  multiple: boolean;
  validator?: (value: any) => boolean;
}

export interface CLIConfig {
  moduleName: string;
  version: string;
  description: string;
  commands: CLICommand[];
  globalOptions: CLIOption[];
  errorHandling: 'strict' | 'lenient' | 'custom';
  outputFormat: 'json' | 'yaml' | 'table' | 'text';
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  timeout: number;
  retryAttempts: number;
}

export interface CLIParseResult {
  command: string;
  options: Record<string, any>;
  arguments: Record<string, any>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface CLIExecutionResult {
  success: boolean;
  output: any;
  errors: string[];
  warnings: string[];
  executionTime: number;
  exitCode: number;
}

export interface CLIHelpInfo {
  // Auto-added common properties
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
  moduleName: string;
  version: string;
  description: string;
  usage: string;
  commands: Array<{
    name: string;
    description: string;
    usage: string;
  }>;
  options: Array<{
    name: string;
    description: string;
    type: string;
    required: boolean;
  }>;
  examples: string[];
}

export class CLIInterfaceStandardizer {
  
  private errorHandler: StandardErrorHandler;
  private config: CLIConfig;
  private isInitialized: boolean = false;

  constructor(config: CLIConfig) {
    
    this.errorHandler = new StandardErrorHandler();
    this.config = config;
  }

  /**
   * Initialize the CLI interface standardizer
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('CLI interface standardizer already initialized');
      return;
    }

    try {
      console.info('Initializing CLI interface standardizer...');
      
      // Validate configuration
      this.validateConfiguration();
      
      this.isInitialized = true;
      console.info('CLI interface standardizer initialized successfully');
      
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to initialize CLI interface standardizer');
      throw error;
    }
  }

  /**
   * Parse command line arguments
   */
  parseArguments(): CLIParseResult {
    if (!this.isInitialized) {
      throw new Error('CLI interface standardizer not initialized');
    }

    const result: CLIParseResult = {
      command: '',
      options: {},
      arguments: {},
      errors: [],
      warnings: [],
      isValid: true
    };

    try {
      // Skip node/tsx and script name
      const args = argv.slice(2);
      
      if (args.length === 0) {
        result.errors.push('No command provided');
        result.isValid = false;
        return result;
      }

      // Parse command
      result.command = args[0];
      
      // Validate command exists
      const command = this.config.commands.find(cmd => cmd.name === result.command);
      if (!command) {
        result.errors.push(`Unknown command: ${result.command}`);
        result.isValid = false;
        return result;
      }

      // Parse options and arguments
      this.parseOptionsAndArguments(args.slice(1), command, result);
      
      // Validate required options and arguments
      this.validateRequiredFields(command, result);
      
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to parse CLI arguments');
      result.errors.push(`Parse error: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Execute a CLI command
   */
  async executeCommand(
    command: string, 
    options: Record<string, any>, 
    arguments: Record<string, any>,
    handler: (cmd: string, opts: Record<string, any>, args: Record<string, any>) => Promise<any>
  ): Promise<CLIExecutionResult> {
    const startTime = Date.now();
    const result: CLIExecutionResult = {
      success: false,
      output: null,
      errors: [],
      warnings: [],
      executionTime: 0,
      exitCode: 0
    };

    try {
      console.info('Executing CLI command', { command, options, arguments });
      
      // Execute the command
      result.output = await handler(command, options, arguments);
      result.success = true;
      result.exitCode = 0;
      
    } catch (error) {
      this.errorHandler.handleError(error, `Failed to execute command: ${command}`);
      result.errors.push(error.message);
      result.success = false;
      result.exitCode = 1;
    } finally {
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Generate help information
   */
  generateHelp(): CLIHelpInfo {
    const help: CLIHelpInfo = {
      moduleName: this.config.moduleName,
      version: this.config.version,
      description: this.config.description,
      usage: this.generateUsage(),
      commands: [],
      options: [],
      examples: []
    };

    // Add commands
    for (const cmd of this.config.commands) {
      if (!command || cmd.name === command) {
        help.commands.push({
          name: cmd.name,
          description: cmd.description,
          usage: this.generateCommandUsage(cmd)
        });
        
        // Add examples for this command
        help.examples.push(...cmd.examples);
      }
    }

    // Add global options
    for (const option of this.config.globalOptions) {
      help.options.push({
        name: option.name,
        description: option.description,
        type: option.type,
        required: option.required
      });
    }

    return help;
  }

  /**
   * Validate CLI interface compliance
   */
  validateCLIInterface(modulePath: string): {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if cliHarness.ts exists
      const cliPath = path.join(modulePath, 'cliHarness.ts');
      if (!fs.existsSync(cliPath)) {
        issues.push('Missing cliHarness.ts file');
        recommendations.push('Create cliHarness.ts file with standardized interface');
        return { compliant: false, issues, recommendations };
      }

      // Read and analyze the CLI harness
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      
      // Check for required patterns
      if (!cliContent.includes('#!/usr/bin/env')) {
        issues.push('Missing shebang line');
        recommendations.push('Add shebang line: #!/usr/bin/env tsx');
      }

      if (!cliContent.includes('StructuredLogger')) {
        issues.push('Not using StructuredLogger');
        recommendations.push('Import and use StructuredLogger for consistent logging');
      }

      if (!cliContent.includes('SafeJSONParser')) {
        issues.push('Not using SafeJSONParser');
        recommendations.push('Import and use SafeJSONParser for safe JSON parsing');
      }

      if (!cliContent.includes('StandardErrorHandler')) {
        issues.push('Not using StandardErrorHandler');
        recommendations.push('Import and use StandardErrorHandler for consistent error handling');
      }

      if (!cliContent.includes('process.exit(')) {
        issues.push('Missing proper exit handling');
        recommendations.push('Add proper process.exit() calls for error conditions');
      }

      // Check for help functionality
      if (!cliContent.includes('--help') && !cliContent.includes('help')) {
        issues.push('Missing help functionality');
        recommendations.push('Add --help option and help display');
      }

      // Check for version functionality
      if (!cliContent.includes('--version') && !cliContent.includes('version')) {
        issues.push('Missing version functionality');
        recommendations.push('Add --version option and version display');
      }

    } catch (error) {
      issues.push(`Error analyzing CLI interface: ${error.message}`);
    }

    return {
      compliant: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Standardize a CLI harness file
   */
  async standardizeCLIHarness(modulePath: string, moduleName: string): Promise<boolean> {
    try {
      const cliPath = path.join(modulePath, 'cliHarness.ts');
      
      // Create standardized CLI harness
      const standardizedContent = this.generateStandardizedCLIHarness(moduleName);
      
      // Write the standardized file
      fs.writeFileSync(cliPath, standardizedContent);
      
      console.info('CLI harness standardized', { moduleName, cliPath });
      return true;
      
    } catch (error) {
      this.errorHandler.handleError(error, `Failed to standardize CLI harness: ${moduleName}`);
      return false;
    }
  }

  /**
   * Parse options and arguments
   */
  private parseOptionsAndArguments(
    args: string[], 
    command: CLICommand, 
    result: CLIParseResult
  ): void {
    let i = 0;
    const allOptions = [...this.config.globalOptions, ...command.options];
    
    while (i < args.length) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        // Long option
        const optionName = arg.slice(2);
        const option = allOptions.find(opt => opt.name === optionName);
        
        if (!option) {
          result.errors.push(`Unknown option: ${arg}`);
          i++;
          continue;
        }
        
        // Parse option value
        if (option.type === 'boolean') {
          result.options[optionName] = true;
        } else {
          if (i + 1 >= args.length) {
            result.errors.push(`Option ${arg} requires a value`);
            i++;
            continue;
          }
          
          const value = this.parseOptionValue(args[i + 1], option);
          if (value !== null) {
            result.options[optionName] = value;
          } else {
            result.errors.push(`Invalid value for option ${arg}: ${args[i + 1]}`);
          }
          i += 2;
        }
      } else if (arg.startsWith('-')) {
        // Short option
        const shortName = arg.slice(1);
        const option = allOptions.find(opt => opt.shortName === shortName);
        
        if (!option) {
          result.errors.push(`Unknown option: ${arg}`);
          i++;
          continue;
        }
        
        // Parse option value
        if (option.type === 'boolean') {
          result.options[option.name] = true;
        } else {
          if (i + 1 >= args.length) {
            result.errors.push(`Option ${arg} requires a value`);
            i++;
            continue;
          }
          
          const value = this.parseOptionValue(args[i + 1], option);
          if (value !== null) {
            result.options[option.name] = value;
          } else {
            result.errors.push(`Invalid value for option ${arg}: ${args[i + 1]}`);
          }
          i += 2;
        }
      } else {
        // Argument
        const argIndex = i - args.filter(a => !a.startsWith('-')).length;
        const argument = command.arguments[argIndex];
        
        if (!argument) {
          result.errors.push(`Unexpected argument: ${arg}`);
          i++;
          continue;
        }
        
        const value = this.parseArgumentValue(arg, argument);
        if (value !== null) {
          result.arguments[argument.name] = value;
        } else {
          result.errors.push(`Invalid argument value: ${arg}`);
        }
        i++;
      }
    }
  }

  /**
   * Parse option value
   */
  private parseOptionValue(value: string, option: CLIOption): any {
    try {
      switch (option.type) {
        case 'string':
          return value;
        case 'number':
          const num = parseFloat(value);
          if (isNaN(num)) return null;
          return num;
        case 'boolean':
          return value.toLowerCase() === 'true';
        case 'array':
          return value.split(',').map(v => v.trim());
        default:
          return value;
      }
    } catch {
      return null;
    }
  }

  /**
   * Parse argument value
   */
  private parseArgumentValue(value: string, argument: CLIArgument): any {
    try {
      switch (argument.type) {
        case 'string':
          return value;
        case 'number':
          const num = parseFloat(value);
          if (isNaN(num)) return null;
          return num;
        case 'boolean':
          return value.toLowerCase() === 'true';
        case 'file':
          if (!fs.existsSync(value)) {
            return null;
          }
          return value;
        case 'directory':
          if (!fs.existsSync(value) || !fs.statSync(value).isDirectory()) {
            return null;
          }
          return value;
        default:
          return value;
      }
    } catch {
      return null;
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(command: CLICommand, result: CLIParseResult): void {
    // Check required options
    for (const option of command.options) {
      if (option.required && !(option.name in result.options)) {
        result.errors.push(`Required option --${option.name} is missing`);
        result.isValid = false;
      }
    }

    // Check required arguments
    for (const argument of command.arguments) {
      if (argument.required && !(argument.name in result.arguments)) {
        result.errors.push(`Required argument ${argument.name} is missing`);
        result.isValid = false;
      }
    }
  }

  /**
   * Generate usage string
   */
  private generateUsage(): string {
    return `${this.config.moduleName} <command> [options] [arguments]`;
  }

  /**
   * Generate command usage string
   */
  private generateCommandUsage(command: CLICommand): string {
    let usage = `${this.config.moduleName} ${command.name}`;
    
    // Add required arguments
    for (const arg of command.arguments) {
      if (arg.required) {
        usage += ` <${arg.name}>`;
      } else {
        usage += ` [${arg.name}]`;
      }
    }
    
    // Add required options
    for (const option of command.options) {
      if (option.required) {
        usage += ` --${option.name}`;
      }
    }
    
    return usage;
  }

  /**
   * Generate standardized CLI harness content
   */
  private generateStandardizedCLIHarness(moduleName: string): string {
    return `#!/usr/bin/env tsx

import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { StandardErrorHandler } from '../shared/error/StandardErrorHandler';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { CLIInterfaceStandardizer } from '../shared/cli/CLIInterfaceStandardizer';

// CLI Configuration
const cliConfig = {
  moduleName: '${moduleName}',
  version: '1.0.0',
  description: '${moduleName} CLI Interface',
  commands: [
    {
      name: 'run',
      description: 'Run the ${moduleName} module',
      options: [
        {
          name: 'config',
          shortName: 'c',
          description: 'Configuration file path',
          type: 'string' as const,
          required: false
        },
        {
          name: 'verbose',
          shortName: 'v',
          description: 'Enable verbose output',
          type: 'boolean' as const,
          required: false,
          defaultValue: false
        }
      ],
      arguments: [
        {
          name: 'input',
          description: 'Input data',
          type: 'string' as const,
          required: true
        }
      ],
      examples: [
        \`\${moduleName} run --config config.json input.txt\`,
        \`\${moduleName} run -v input.txt\`
      ],
      category: 'main',
      version: '1.0.0'
    }
  ],
  globalOptions: [
    {
      name: 'help',
      shortName: 'h',
      description: 'Show help information',
      type: 'boolean' as const,
      required: false
    },
    {
      name: 'version',
      description: 'Show version information',
      type: 'boolean' as const,
      required: false
    }
  ],
  errorHandling: 'strict' as const,
  outputFormat: 'json' as const,
  logLevel: 'info' as const,
  timeout: 30000,
  retryAttempts: 3
};

async function main(...args: any[]) {
  const logger = new StructuredLogger({ module: '${moduleName}CLI' });
  const errorHandler = new StandardErrorHandler();
  
  try {
    // Initialize CLI standardizer
    const cliStandardizer = new CLIInterfaceStandardizer(cliConfig);
    await cliStandardizer.initialize();
    
    // Parse arguments
    const parseResult = cliStandardizer.parseArguments(process.argv);
    
    if (!parseResult.isValid) {
      console.error('Error:', parseResult.errors.join(', '));
      process.exit(1);
    }
    
    // Handle help and version
    if (parseResult.options.help) {
      const help = cliStandardizer.generateHelp();
      console.log(JSON.stringify(help, null, 2));
      process.exit(0);
    }
    
    if (parseResult.options.version) {
      console.log(cliConfig.version);
      process.exit(0);
    }
    
    // Execute command
    const result = await cliStandardizer.executeCommand(
      parseResult.command,
      parseResult.options,
      parseResult.arguments,
      async (cmd, opts, args) => {
        // TODO: Implement actual command logic
        logger.info('Executing command', { command: cmd, options: opts, arguments: args });
        return { success: true, message: 'Command executed successfully' };
      }
    );
    
    if (result.success) {
      console.log(JSON.stringify(result.output, null, 2));
      process.exit(0);
    } else {
      console.error('Error:', result.errors.join(', '));
      process.exit(result.exitCode);
    }
    
  } catch (error) {
    errorHandler.handleError(error, 'CLI execution failed');
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  main();
}
`;
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    if (!this.config.moduleName) {
      throw new Error('Module name is required');
    }
    
    if (!this.config.version) {
      throw new Error('Version is required');
    }
    
    if (!this.config.commands || this.config.commands.length === 0) {
      throw new Error('At least one command is required');
    }
    
    for (const command of this.config.commands) {
      if (!command.name) {
        throw new Error('Command name is required');
      }
      
      if (!command.description) {
        throw new Error('Command description is required');
      }
    }
  }

  /**
   * Destroy the CLI interface standardizer
   */
  async destroy(): Promise<void> {
    console.info('Destroying CLI interface standardizer...');
    this.isInitialized = false;
    console.info('CLI interface standardizer destroyed');
  }
}

export default CLIInterfaceStandardizer;