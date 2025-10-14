#!/usr/bin/env tsx

/**
 * Standardized CLI Harness Template for MIFF Framework
 * 
 * This template provides a consistent pattern for all CLI harnesses across
 * the MIFF framework, ensuring proper error handling, argument parsing,
 * and manager integration.
 * 
 * @module shared/cliHarnessTemplate
 * @version 1.0.0
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

// Standard CLI operation types
export type CLIOperation = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'list' 
  | 'simulate' 
  | 'validate' 
  | 'export' 
  | 'import' 
  | 'dump' 
  | 'test';

// Standard output formats
export type OutputFormat = 'json' | 'yaml' | 'csv' | 'markdown' | 'html' | 'text';

// Standard CLI arguments interface
export interface CLIArgs {
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
  operation: CLIOperation;
  module: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  format?: OutputFormat;
  inputFile?: string;
  outputFile?: string;
  verbose?: boolean;
  help?: boolean;
}

// Standard CLI result interface
export interface CLIResult {
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
  op: string;
  status: 'ok' | 'error';
  module: string;
  timestamp: string;
  executionTime: number;
  result?: any;
  message?: string;
  error?: string;
  warnings?: string[];
}

// Standard error codes
export enum CLIErrorCode {
  INVALID_OPERATION = 'INVALID_OPERATION',
  MISSING_REQUIRED_ARG = 'MISSING_REQUIRED_ARG',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  MANAGER_ERROR = 'MANAGER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Standard CLI error class
export class CLIError extends Error {
  constructor(
    public code: CLIErrorCode,
    message: string,
    public details?: any
  ) {
    
    super(message);
    this.name = 'CLIError';
  }
}

// Standard argument parser
export function parseCLIArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { operation: 'help' as any, module: '', help: true };
  }

  const operation = args[0] as CLIOperation;
  const module = args[1] || 'default';
  
  const result: CLIArgs = {
    operation,
    module,
    format: 'json',
    verbose: false
  };

  // Parse additional arguments
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--format=')) {
      result.format = arg.split('=')[1] as OutputFormat;
    } else if (arg.startsWith('--input=')) {
      result.inputFile = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.outputFile = arg.split('=')[1];
    } else if (arg === '--verbose' || arg === '-v') {
      result.verbose = true;
    } else if (arg.endsWith('.json')) {
      result.inputFile = arg;
    }
  }

  // Load data from file if specified
  if (result.inputFile && fs.existsSync(result.inputFile)) {
    try {
      const fileContent = fs.readFileSync(result.inputFile, 'utf-8');
      result.data = SafeJSONParser.parse(fileContent);
    } catch (error) {
      throw new CLIError(
        CLIErrorCode.INVALID_JSON,
        `Failed to parse JSON file: ${result.inputFile}`,
        error
      );
    }
  }

  return result;
}

// Standard output formatter
export function formatOutput(result: CLIResult, format: OutputFormat = 'json'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);
    case 'yaml':
      // Simple YAML formatting (would need yaml library for full support)
      return `op: ${result.op}\nstatus: ${result.status}\nmodule: ${result.module}\ntimestamp: ${result.timestamp}\nexecutionTime: ${result.executionTime}`;
    case 'csv':
      return `op,status,module,timestamp,executionTime\n${result.op},${result.status},${result.module},${result.timestamp},${result.executionTime}`;
    case 'markdown':
      return `# CLI Result\n\n- **Operation:** ${result.op}\n- **Status:** ${result.status}\n- **Module:** ${result.module}\n- **Timestamp:** ${result.timestamp}\n- **Execution Time:** ${result.executionTime}ms`;
    case 'html':
      return `<html><body><h1>CLI Result</h1><ul><li><strong>Operation:</strong> ${result.op}</li><li><strong>Status:</strong> ${result.status}</li><li><strong>Module:</strong> ${result.module}</li><li><strong>Timestamp:</strong> ${result.timestamp}</li><li><strong>Execution Time:</strong> ${result.executionTime}ms</li></ul></body></html>`;
    case 'text':
      return `${result.op}: ${result.status} (${result.executionTime}ms)`;
    default:
      return JSON.stringify(result, null, 2);
  }
}

// Standard error handler
export function handleCLIError(error: unknown, operation: string, module: string): CLIResult {
  const timestamp = new Date().toISOString();
  
  if (error instanceof CLIError) {
    return {
      op: operation,
      status: 'error',
      module,
      timestamp,
      executionTime: 0,
      error: error.message,
      message: `CLI Error: ${error.code}`
    };
  }
  
  if (error instanceof Error) {
    return {
      op: operation,
      status: 'error',
      module,
      timestamp,
      executionTime: 0,
      error: error.message,
      message: 'Unexpected error occurred'
    };
  }
  
  return {
    op: operation,
    status: 'error',
    module,
    timestamp,
    executionTime: 0,
    error: 'Unknown error',
    message: 'An unknown error occurred'
  };
}

// Standard success result creator
export function createSuccessResult(
  operation: string,
  module: string,
  result: any,
  executionTime: number,
  message?: string
): CLIResult {
  return {
    op: operation,
    status: 'ok',
    module,
    timestamp: new Date().toISOString(),
    executionTime,
    result,
    message
  };
}

// Standard help text generator
export function generateHelpText(moduleName: string, operations: CLIOperation[]): string {
  return `
${moduleName} CLI Harness

Usage:
  tsx cliHarness.ts <operation> <module> [options]

Operations:
  ${operations.map(op => `  ${op}`).join('\n')}

Options:
  --format=<format>    Output format (json, yaml, csv, markdown, html, text)
  --input=<file>       Input JSON file
  --output=<file>      Output file (default: stdout)
  --verbose, -v        Verbose output
  --help, -h           Show this help

Examples:
  tsx cliHarness.ts create mymodule --input=data.json
  tsx cliHarness.ts simulate mymodule --format=markdown
  tsx cliHarness.ts export mymodule --output=result.json
`;
}

// Standard CLI harness base class
export abstract class BaseCLIHarness {
  protected abstract moduleName: string;
  protected abstract supportedOperations: CLIOperation[];
  
  abstract executeOperation(args: CLIArgs): Promise<CLIResult>;
  
  async run(): Promise<void> {
    try {
      const args = parseCLIArgs(process.argv);
      
      if (args.help) {
        console.info(generateHelpText(this.moduleName, this.supportedOperations));
        return;
      }
      
      if (!this.supportedOperations.includes(args.operation)) {
        throw new CLIError(
          CLIErrorCode.INVALID_OPERATION,
          `Unsupported operation: ${args.operation}. Supported: ${this.supportedOperations.join(', ')}`
        );
      }
      
      const startTime = Date.now();
      const result = await this.executeOperation(args);
      const executionTime = Date.now() - startTime;
      
      result.executionTime = executionTime;
      
      const output = formatOutput(result, args.format);
      
      if (args.outputFile) {
        fs.writeFileSync(args.outputFile, output);
        if (args.verbose) {
          console.info(`Output written to: ${args.outputFile}`);
        }
      } else {
        console.info(output);
      }
      
    } catch (error) {
      const result = handleCLIError(error, 'unknown', this.moduleName);
      console.error(formatOutput(result, 'json'));
      process.exit(1);
    }
  }
}