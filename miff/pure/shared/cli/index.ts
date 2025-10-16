/**
 * CLI System - Ensures consistent CLI harness interfaces across all MIFF modules
 * Includes CLI interface standardization and safety validation
 */

export * from './CLIInterfaceStandardizer';

// Re-export main classes
export { CLIInterfaceStandardizer } from './CLIInterfaceStandardizer';

// Export types
export type {
  CLICommand,
  CLIOption,
  CLIArgument,
  CLIConfig,
  CLIParseResult,
  CLIExecutionResult,
  CLIHelpInfo
} from './CLIInterfaceStandardizer';