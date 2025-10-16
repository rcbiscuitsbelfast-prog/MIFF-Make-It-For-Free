#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { StoryManager, StoryArc, StoryNode } from './Manager';
import { addExportSupport } from '../shared/exportUtils';

type Cmd =
  | { op: 'createArc'; arc: StoryArc }
  | { op: 'startArc'; arcId: string }
  | { op: 'advanceToNode'; arcId: string; nodeId: string }
  | { op: 'setFlag'; flagId: string; value: any; type?: string; description?: string }
  | { op: 'getFlag'; flagId: string }
  | { op: 'hasFlag'; flagId: string }
  | { op: 'setStat'; statId: string; value: number }
  | { op: 'getStat'; statId: string }
  | { op: 'getArc'; arcId: string }
  | { op: 'getAllArcs' }
  | { op: 'getArcProgress'; arcId: string }
  | { op: 'getStatistics' }
  | { op: 'simulateStory'; arcId: string }
  | { op: 'dump' };

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: Cmd;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as Cmd;
    } else {
      // Parse subcommand
      switch (first) {
        case 'createArc':
          if (!argv[1]) {
            throw new Error('createArc requires arc data JSON file');
          }
          const arcData = JSON.parse(fs.readFileSync(argv[1], 'utf-8'));
          operation = { op: 'createArc', arc: arcData };
          break;
        case 'startArc':
          if (!argv[1]) {
            throw new Error('startArc requires arcId');
          }
          operation = { op: 'startArc', arcId: argv[1] };
          break;
        case 'advanceToNode':
          if (!argv[1] || !argv[2]) {
            throw new Error('advanceToNode requires arcId and nodeId');
          }
          operation = { op: 'advanceToNode', arcId: argv[1], nodeId: argv[2] };
          break;
        case 'setFlag':
          if (!argv[1] || !argv[2]) {
            throw new Error('setFlag requires flagId and value');
          }
          operation = { 
            op: 'setFlag', 
            flagId: argv[1],
            value: JSON.parse(argv[2]),
            type: argv[3] || 'boolean',
            description: argv[4] || ''
          };
          break;
        case 'getFlag':
          if (!argv[1]) {
            throw new Error('getFlag requires flagId');
          }
          operation = { op: 'getFlag', flagId: argv[1] };
          break;
        case 'hasFlag':
          if (!argv[1]) {
            throw new Error('hasFlag requires flagId');
          }
          operation = { op: 'hasFlag', flagId: argv[1] };
          break;
        case 'setStat':
          if (!argv[1] || !argv[2]) {
            throw new Error('setStat requires statId and value');
          }
          operation = { 
            op: 'setStat', 
            statId: argv[1],
            value: parseFloat(argv[2])
          };
          break;
        case 'getStat':
          if (!argv[1]) {
            throw new Error('getStat requires statId');
          }
          operation = { op: 'getStat', statId: argv[1] };
          break;
        case 'getArc':
          if (!argv[1]) {
            throw new Error('getArc requires arcId');
          }
          operation = { op: 'getArc', arcId: argv[1] };
          break;
        case 'getAllArcs':
          operation = { op: 'getAllArcs' };
          break;
        case 'getArcProgress':
          if (!argv[1]) {
            throw new Error('getArcProgress requires arcId');
          }
          operation = { op: 'getArcProgress', arcId: argv[1] };
          break;
        case 'getStatistics':
          operation = { op: 'getStatistics' };
          break;
        case 'simulateStory':
          if (!argv[1]) {
            throw new Error('simulateStory requires arcId');
          }
          operation = { op: 'simulateStory', arcId: argv[1] };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    const storyManager = new StoryManager();
    let result: any;

    switch (operation.op) {
      case 'createArc':
        result = storyManager.createArc(operation.arc);
        break;

      case 'startArc':
        const startResult = storyManager.startArc(operation.arcId);
        result = {
          started: startResult !== null,
          result: startResult || null
        };
        break;

      case 'advanceToNode':
        const advanceResult = storyManager.advanceToNode(operation.arcId, operation.nodeId);
        result = {
          advanced: advanceResult !== null,
          result: advanceResult || null
        };
        break;

      case 'setFlag':
        storyManager.setFlag(operation.flagId, operation.value, operation.type as any, operation.description);
        result = {
          set: true,
          flagId: operation.flagId,
          value: operation.value
        };
        break;

      case 'getFlag':
        const flag = storyManager.getFlag(operation.flagId);
        result = {
          found: flag !== null,
          flag: flag || null
        };
        break;

      case 'hasFlag':
        const hasFlag = storyManager.hasFlag(operation.flagId);
        result = {
          hasFlag,
          flagId: operation.flagId
        };
        break;

      case 'setStat':
        storyManager.setStat(operation.statId, operation.value);
        result = {
          set: true,
          statId: operation.statId,
          value: operation.value
        };
        break;

      case 'getStat':
        const statValue = storyManager.getStat(operation.statId);
        result = {
          statId: operation.statId,
          value: statValue
        };
        break;

      case 'getArc':
        const arc = storyManager.getArc(operation.arcId);
        result = {
          found: arc !== null,
          arc: arc || null
        };
        break;

      case 'getAllArcs':
        result = {
          arcs: storyManager.getAllArcs(),
          count: storyManager.getAllArcs().length
        };
        break;

      case 'getArcProgress':
        const progress = storyManager.getArcProgress(operation.arcId);
        result = {
          arcId: operation.arcId,
          progress
        };
        break;

      case 'getStatistics':
        result = storyManager.getStoryStatistics();
        break;

      case 'simulateStory':
        // Simulate a story progression
        const simArc = storyManager.getArc(operation.arcId);
        if (!simArc) {
          result = { error: 'Arc not found' };
          break;
        }

        // Set some initial stats and flags
        storyManager.setStat('level', 5);
        storyManager.setStat('xp', 1000);
        storyManager.setFlag('tutorial_completed', true, 'boolean', 'Tutorial completed');

        // Start the arc
        const simResult = storyManager.startArc(operation.arcId);
        
        result = {
          simulation: {
            arc: simArc,
            result: simResult,
            stats: {
              level: storyManager.getStat('level'),
              xp: storyManager.getStat('xp')
            },
            flags: {
              tutorial_completed: storyManager.hasFlag('tutorial_completed')
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: [
            'createArc', 'startArc', 'advanceToNode', 'setFlag', 'getFlag',
            'hasFlag', 'setStat', 'getStat', 'getArc', 'getAllArcs',
            'getArcProgress', 'getStatistics', 'simulateStory', 'dump'
          ],
          description: 'StorySystemPure - Narrative hooks and progression',
          features: [
            'Story arc creation and management',
            'Node-based story progression',
            'Conditional story branching',
            'Flag and stat tracking',
            'Reward system integration',
            'Progress tracking and analytics',
            'Multi-format story export'
          ],
          nodeTypes: ['narrative', 'choice', 'action', 'cutscene', 'battle', 'exploration'],
          conditionTypes: ['level', 'quest', 'item', 'flag', 'stat', 'location', 'time'],
          rewardTypes: ['xp', 'item', 'currency', 'unlock', 'flag', 'stat', 'cutscene'],
          arcStructure: {
            id: 'string - Unique arc identifier',
            name: 'string - Arc display name',
            description: 'string - Arc description',
            nodes: 'Map<string, StoryNode> - Story nodes',
            startNode: 'string - Starting node ID',
            endNodes: 'string[] - Ending node IDs',
            flags: 'Map<string, StoryFlag> - Arc-specific flags',
            progress: 'Map<string, StoryProgress> - Progress tracking',
            metadata: 'Record<string, any> - Additional data'
          },
          nodeStructure: {
            id: 'string - Node identifier',
            title: 'string - Node title',
            content: 'string - Node content',
            type: 'StoryNodeType - Node type',
            conditions: 'StoryCondition[] - Access conditions',
            rewards: 'StoryReward[] - Node rewards',
            nextNodes: 'string[] - Next node IDs',
            metadata: 'Record<string, any> - Additional data'
          }
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html', 'yaml', 'xml'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'StorySystemPure Export',
      'Narrative system and story progression data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
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
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}