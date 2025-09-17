/**
 * Shared CLI Harness Utilities for Pure Modules
 * 
 * This module provides reusable functions for CLI harnesses across all Pure modules.
 * It eliminates code duplication and ensures consistent output formats.
 * 
 * @module cliHarnessUtils
 * @version 1.0.0
 * @license MIT
 */

// Deprecated synthetic helpers removed - use real module logic in CLI harnesses instead

/**
 * CLI argument parser for consistent argument handling
 * @param argv Process arguments array
 * @returns Parsed mode and arguments
 */
function parseCLIArgs(argv: string[]) {
  const args = argv.slice(2);
  const mode = args[0] || 'default';
  return { mode, args };
}

/**
 * Enhanced CLI argument parser for complex commands
 * @param argv Process arguments array
 * @returns Parsed command, arguments, and options
 */
function parseComplexCLIArgs(argv: string[]) {
  const args = argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);
  const options: Record<string, any> = {};

  // Parse options
  for (let i = 0; i < commandArgs.length; i++) {
    const arg = commandArgs[i];
    
    if (arg.startsWith('--')) {
      const optionName = arg.slice(2);
      const nextArg = commandArgs[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        options[optionName] = nextArg;
        i++; // Skip next arg since we consumed it
      } else {
        options[optionName] = true;
      }
    }
  }

  return { 
    command, 
    args: commandArgs.filter((arg: string) => !arg.startsWith('--')), 
    options 
  };
}

/**
 * Output formatter for consistent JSON output
 * @param data Data to output
 * @returns Formatted JSON string
 */
function formatOutput(data: any) {
  return JSON.stringify(data, null, 2);
}

/**
 * Error handler for consistent error output
 * @param error Error object or message
 * @param exitCode Exit code to use
 * @returns Formatted error output
 */
function handleError(error: any, exitCode = 1) {
  const errorOutput = {
    op: 'error',
    status: 'error',
    error: error instanceof Error ? error.message : String(error),
    timestamp: Date.now()
  };
  
  console.error(formatOutput(errorOutput));
  process.exit(exitCode);
}

/**
 * Success handler for consistent success output
 * @param data Success data
 * @param operation Operation name
 * @returns Formatted success output
 */
function handleSuccess(data: any, operation = 'operation') {
  const successOutput = {
    op: operation,
    status: 'ok',
    data,
    timestamp: Date.now()
  };
  
  console.log(formatOutput(successOutput));
}

/**
 * Executes a CLI harness file and returns the output
 * @param cliPath Path to the CLI harness file
 * @param args Arguments to pass to the CLI
 * @returns Output from the CLI execution
 */
function runCLI(cliPath: string, args: string[] = []): string {
  const path = require('path');
  const { execFileSync } = require('child_process');
  const resolvedPath = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);
  try {
    const output = execFileSync('npx', ['tsx', resolvedPath, ...args], { encoding: 'utf-8', timeout: 15000 });
    return output.trim();
  } catch (error) {
    return JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    });
  }
}

export {
  parseCLIArgs,
  parseComplexCLIArgs,
  formatOutput,
  handleError,
  handleSuccess,
  runCLI
};