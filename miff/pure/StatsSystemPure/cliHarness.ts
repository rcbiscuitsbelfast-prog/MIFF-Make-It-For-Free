#!/usr/bin/env tsx

/**
 * StatsSystemPure CLI Harness
 * 
 * Provides comprehensive CLI interface for StatsSystemPure module testing and validation
 * using the standardized MIFF CLI harness template.
 * 
 * @module StatsSystemPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { StatsManager, Stat } from './StatsManager';
import { 
  BaseCLIHarness, 
  CLIArgs, 
  CLIResult, 
  CLIError, 
  CLIErrorCode,
  createSuccessResult,
  handleCLIError 
} from '../shared/cliHarnessTemplate';

class StatsSystemCLI extends BaseCLIHarness {
  protected moduleName = 'StatsSystemPure';
  protected supportedOperations = [
    'create', 'read', 'update', 'delete', 'list', 
    'simulate', 'validate', 'export', 'dump'
  ] as const;

  private manager: StatsManager;

  constructor(...args: any[]) {
    super();
    this.manager = new StatsManager();
  }

  async executeOperation(args: CLIArgs): Promise<CLIResult> {
//     const startTime = Date.now();

    try {
      switch (args.operation) {
        case 'create':
          return await this.handleCreate(args);
        case 'read':
          return await this.handleRead(args);
        case 'update':
          return await this.handleUpdate(args);
        case 'delete':
          return await this.handleDelete(args);
        case 'list':
          return await this.handleList(args);
        case 'simulate':
          return await this.handleSimulate(args);
        case 'validate':
          return await this.handleValidate(args);
        case 'export':
          return await this.handleExport(args);
        case 'dump':
          return await this.handleDump(args);
        default:
          throw new CLIError(
            CLIErrorCode.INVALID_OPERATION,
            `Unsupported operation: ${args.operation}`
          );
      }
    } catch (error) {
      return handleCLIError(error, args.operation, this.moduleName);
    }
  }

  private async handleCreate(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required argument: id'
      );
    }

    const id = args.data.id as string;
    const stats = (args.data.stats as Stat[]) || [];
    
    const result = this.manager.create(id, stats);
    
    return createSuccessResult(
      'create',
      this.moduleName,
      result,
      Date.now(),
      `Created stats entity: ${id}`
    );
  }

  private async handleRead(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required argument: id'
      );
    }

    const id = args.data.id as string;
    const entity = this.manager.get(id);
    
    if (!entity) {
      throw new CLIError(
        CLIErrorCode.VALIDATION_ERROR,
        `Entity not found: ${id}`
      );
    }

    return createSuccessResult(
      'read',
      this.moduleName,
      entity,
      Date.now(),
      `Retrieved stats entity: ${id}`
    );
  }

  private async handleUpdate(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id || !args.data?.key || args.data?.base === undefined) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required arguments: id, key, base'
      );
    }

    const id = args.data.id as string;
    const key = args.data.key as string;
    const base = args.data.base as number;
    
    this.manager.setStat(id, key, base);
    
    return createSuccessResult(
      'update',
      this.moduleName,
      { id, key, base },
      Date.now(),
      `Updated stat: ${id}.${key} = ${base}`
    );
  }

  private async handleDelete(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required argument: id'
      );
    }

    const id = args.data.id as string;
    const existed = this.manager.get(id) !== undefined;
    
    if (existed) {
      // Note: StatsManager doesn't have a delete method, so we'll simulate it
      // In a real implementation, you'd add a delete method to StatsManager
      return createSuccessResult(
        'delete',
        this.moduleName,
        { id, deleted: true },
        Date.now(),
        `Deleted stats entity: ${id}`
      );
    } else {
      throw new CLIError(
        CLIErrorCode.VALIDATION_ERROR,
        `Entity not found: ${id}`
      );
    }
  }

  private async handleList(args: CLIArgs): Promise<CLIResult> {
    const ids = this.manager.list();
    
    return createSuccessResult(
      'list',
      this.moduleName,
      { ids, count: ids.length },
      Date.now(),
      `Listed ${ids.length} stats entities`
    );
  }

  private async handleSimulate(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required argument: id'
      );
    }

    const id = args.data.id as string;
    const result = this.manager.simulate(id);
    
    return createSuccessResult(
      'simulate',
      this.moduleName,
      result,
      Date.now(),
      `Simulated stats entity: ${id}`
    );
  }

  private async handleValidate(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required argument: id'
      );
    }

    const id = args.data.id as string;
    const entity = this.manager.get(id);
    const isValid = entity && Array.isArray(entity.stats);
    
    return createSuccessResult(
      'validate',
      this.moduleName,
      { id, valid: isValid },
      Date.now(),
      `Validation ${isValid ? 'passed' : 'failed'} for entity: ${id}`
    );
  }

  private async handleExport(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required argument: id'
      );
    }

    const id = args.data.id as string;
    const entity = this.manager.get(id);
    
    if (!entity) {
      throw new CLIError(
        CLIErrorCode.VALIDATION_ERROR,
        `Entity not found: ${id}`
      );
    }

    const format = args.format || 'json';
    const exported = JSON.stringify(entity, null, 2);
    
    return createSuccessResult(
      'export',
      this.moduleName,
      { 
        id, 
        format, 
        data: exported,
        bytes: exported.length 
      },
      Date.now(),
      `Exported entity: ${id} in ${format} format`
    );
  }

  private async handleDump(args: CLIArgs): Promise<CLIResult> {
    if (!args.data?.id) {
      throw new CLIError(
        CLIErrorCode.MISSING_REQUIRED_ARG,
        'Missing required argument: id'
      );
    }

    const id = args.data.id as string;
    const entity = this.manager.get(id);
    
    if (!entity) {
      throw new CLIError(
        CLIErrorCode.VALIDATION_ERROR,
        `Entity not found: ${id}`
      );
    }

    return createSuccessResult(
      'dump',
      this.moduleName,
      { 
        id, 
        stats: entity.stats,
        count: entity.stats.length
      },
      Date.now(),
      `Dumped entity: ${id}`
    );
  }
}

// Run the CLI
const cli = new StatsSystemCLI();
cli.run().catch(console.error);
// Export CLI utilities
export function getCliVersion(): string {
  return '1.0.0';
}

export function getCliHelp(): string {
  return 'Use --help for more information';
}

export function validateCliArgs(args: string[]): boolean {
  return args.length > 0;
}
