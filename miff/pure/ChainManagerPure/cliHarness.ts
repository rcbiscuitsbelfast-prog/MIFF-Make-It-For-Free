#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { ChainManager, QuestChain, ChainProgress } from './Manager';
import { addExportSupport } from '../shared/exportUtils';

type Cmd =
  | { op: 'createChain'; chain: QuestChain }
  | { op: 'updateProgress'; chainId: string; questId: string; completed: boolean }
  | { op: 'getChain'; chainId: string }
  | { op: 'getProgress'; chainId: string }
  | { op: 'getAllChains' }
  | { op: 'getAvailableChains' }
  | { op: 'getChainsByQuest'; questId: string }
  | { op: 'validateAllChains' }
  | { op: 'exportChain'; chainId: string; format?: string }
  | { op: 'getStatistics' }
  | { op: 'dump' };

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0!];
    let operation: Cmd;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as Cmd;
    } else {
      // Parse subcommand
      switch (first) {
        case 'createChain':
          if (!argv[1!]) {
            throw new Error('createChain requires chain data JSON file');
          }
          const chainData = JSON.parse(fs.readFileSync(argv[1!], 'utf-8'));
          operation = { op: 'createChain', chain: chainData };
          break;
        case 'updateProgress':
          if (!argv[1!] || !argv[2!] || !argv[3!]) {
            throw new Error('updateProgress requires chainId, questId, and completed (true/false)');
          }
          operation = { 
            op: 'updateProgress', 
            chainId: argv[1!],
            questId: argv[2!],
            completed: argv[3] === 'true'
          };
          break;
        case 'getChain':
          if (!argv[1!]) {
            throw new Error('getChain requires chainId');
          }
          operation = { op: 'getChain', chainId: argv[1!] };
          break;
        case 'getProgress':
          if (!argv[1!]) {
            throw new Error('getProgress requires chainId');
          }
          operation = { op: 'getProgress', chainId: argv[1!] };
          break;
        case 'getAllChains':
          operation = { op: 'getAllChains' };
          break;
        case 'getAvailableChains':
          operation = { op: 'getAvailableChains' };
          break;
        case 'getChainsByQuest':
          if (!argv[1!]) {
            throw new Error('getChainsByQuest requires questId');
          }
          operation = { op: 'getChainsByQuest', questId: argv[1!] };
          break;
        case 'validateAllChains':
          operation = { op: 'validateAllChains' };
          break;
        case 'exportChain':
          if (!argv[1!]) {
            throw new Error('exportChain requires chainId');
          }
          operation = { 
            op: 'exportChain', 
            chainId: argv[1!],
            format: argv[2!] || 'json'
          };
          break;
        case 'getStatistics':
          operation = { op: 'getStatistics' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    const chainManager = new ChainManager();
    let result: any;

    switch (operation.op) {
      case 'createChain':
        result = chainManager.createChain(operation.chain);
        break;

      case 'updateProgress':
        const progress = chainManager.updateProgress(operation.chainId, operation.questId, operation.completed);
        result = {
          updated: progress !== null,
          progress: progress || null
        };
        break;

      case 'getChain':
        const chain = chainManager.getChain(operation.chainId);
        result = {
          found: chain !== null,
          chain: chain || null
        };
        break;

      case 'getProgress':
        const chainProgress = chainManager.getProgress(operation.chainId);
        result = {
          found: chainProgress !== null,
          progress: chainProgress || null
        };
        break;

      case 'getAllChains':
        result = {
          chains: chainManager.getAllChains(),
          count: chainManager.getAllChains().length
        };
        break;

      case 'getAvailableChains':
        result = {
          chains: chainManager.getAvailableChains(),
          count: chainManager.getAvailableChains().length
        };
        break;

      case 'getChainsByQuest':
        result = {
          chains: chainManager.getChainsByQuest(operation.questId),
          questId: operation.questId
        };
        break;

      case 'validateAllChains':
        result = {
          results: chainManager.validateAllChains(),
          totalValidated: chainManager.validateAllChains().length
        };
        break;

      case 'exportChain':
        result = chainManager.exportChain(operation.chainId, operation.format as any);
        break;

      case 'getStatistics':
        result = chainManager.getChainStatistics();
        break;

      case 'dump':
        result = {
          operations: [
            'createChain', 'updateProgress', 'getChain', 'getProgress',
            'getAllChains', 'getAvailableChains', 'getChainsByQuest',
            'validateAllChains', 'exportChain', 'getStatistics', 'dump'
          ],
          description: 'ChainManagerPure - Quest chain linking and validation',
          features: [
            'Quest chain creation and management',
            'Progress tracking and validation',
            'Dependency resolution',
            'Circular dependency detection',
            'Multi-format export (JSON, YAML, CSV)',
            'Chain statistics and analytics'
          ],
          chainStructure: {
            id: 'string - Unique chain identifier',
            name: 'string - Human-readable chain name',
            description: 'string - Chain description',
            quests: 'string[] - Array of quest IDs in order',
            prerequisites: 'string[] - Required completed chains',
            rewards: 'QuestChainReward[] - Chain completion rewards',
            metadata: 'Record<string, any> - Additional chain data'
          },
          progressStructure: {
            chainId: 'string - Chain identifier',
            completedQuests: 'string[] - Completed quest IDs',
            currentQuest: 'string? - Currently active quest',
            progress: 'number - Completion percentage (0-100)',
            status: 'locked|available|active|completed',
            unlockedAt: 'number? - Timestamp when unlocked',
            completedAt: 'number? - Timestamp when completed'
          }
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1!] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html', 'yaml', 'xml'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'ChainManagerPure Export',
      'Quest chain management and progress tracking data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: new Date()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1!]}`) {
  main();
}