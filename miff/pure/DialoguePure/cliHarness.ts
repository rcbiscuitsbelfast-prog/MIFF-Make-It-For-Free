#!/usr/bin/env tsx
/// <reference types="node" />

import { 
  DialogueParser, 
  DialogueEngine, 
  DialogueTree, 
  DialogueNode, 
  DialogueContext,
  DialogueResult 
} from './Manager';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface DialogueOperation {
  op: 'parse' | 'create-tree' | 'start-dialogue' | 'continue' | 'make-choice' | 'get-context' | 'demo' | 'dump';
  treeFile?: string;
  treeId?: string;
  nodeId?: string;
  choiceId?: string;
  context?: DialogueContext;
  exportFormat?: string;
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0!];
    let operation: DialogueOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as DialogueOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'parse':
          if (!argv[1!]) throw new Error('parse requires dialogue tree file');
          operation = { op: 'parse', treeFile: argv[1!] };
          break;
        case 'create-tree':
          operation = { op: 'create-tree' };
          break;
        case 'start-dialogue':
          if (!argv[1!]) throw new Error('start-dialogue requires tree ID');
          operation = { op: 'start-dialogue', treeId: argv[1!] };
          break;
        case 'continue':
          if (!argv[1!]) throw new Error('continue requires tree ID');
          operation = { op: 'continue', treeId: argv[1!] };
          break;
        case 'make-choice':
          if (!argv[1!] || !argv[2!]) throw new Error('make-choice requires tree ID and choice ID');
          operation = { op: 'make-choice', treeId: argv[1], choiceId: argv[2] };
          break;
        case 'get-context':
          if (!argv[1!]) throw new Error('get-context requires tree ID');
          operation = { op: 'get-context', treeId: argv[1!] };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    let result: any;

    switch (operation.op) {
      case 'parse':
        const treeData = JSON.parse(fs.readFileSync(operation.treeFile!, 'utf-8'));
        const tree = DialogueEngine.deserialize(JSON.stringify(treeData));
        result = {
          parsed: {
            treeId: tree.id,
            name: tree.name,
            version: tree.version,
            nodeCount: tree.nodes.size,
            variables: Array.from(tree.variables.keys()),
            flags: Array.from(tree.flags)
          },
          tree
        };
        break;

      case 'create-tree':
        // Create a sample dialogue tree using deserialize
        const sampleTreeData = {
          id: 'sample_dialogue',
          name: 'Sample Dialogue Tree',
          version: '1.0.0',
          nodes: {},
          variables: {},
          flags: []
        };
        const sampleTree = DialogueEngine.deserialize(JSON.stringify(sampleTreeData));
        
        // Add a simple start node
        const startNode: DialogueNode = {
          id: 'start',
          type: 'text',
          content: 'Hello! Welcome to our adventure. What would you like to do?',
          choices: [
            {
              id: 'choice_1',
              text: 'Tell me about the quest',
              next: 'quest_info'
            },
            {
              id: 'choice_2',
              text: 'Goodbye',
              next: 'end'
            }
          ]
        };
        
        const questNode: DialogueNode = {
          id: 'quest_info',
          type: 'text',
          content: 'There\'s a dangerous dragon in the mountains. Will you help us?',
          choices: [
            {
              id: 'accept_quest',
              text: 'Yes, I\'ll help!',
              next: 'quest_accepted'
            },
            {
              id: 'decline_quest',
              text: 'Not today, thanks.',
              next: 'start'
            }
          ]
        };
        
        const questAcceptedNode: DialogueNode = {
          id: 'quest_accepted',
          type: 'text',
          content: 'Excellent! The dragon is in the northern mountains. Good luck!',
          next: 'end'
        };
        
        const endNode: DialogueNode = {
          id: 'end',
          type: 'end',
          content: 'Farewell, traveler!'
        };
        
        sampleTree.nodes.set('start', startNode);
        sampleTree.nodes.set('quest_info', questNode);
        sampleTree.nodes.set('quest_accepted', questAcceptedNode);
        sampleTree.nodes.set('end', endNode);
        
        result = {
          created: {
            treeId: sampleTree.id,
            name: sampleTree.name,
            version: sampleTree.version,
            nodeCount: sampleTree.nodes.size,
            nodes: Array.from(sampleTree.nodes.keys())
          },
          tree: sampleTree
        };
        break;

      case 'start-dialogue':
        // Create a simple tree and start dialogue
        const simpleTreeData = {
          id: 'simple_dialogue',
          name: 'Simple Dialogue',
          version: '1.0.0',
          nodes: {},
          variables: {},
          flags: []
        };
        const simpleTree = DialogueEngine.deserialize(JSON.stringify(simpleTreeData));
        const simpleStartNode: DialogueNode = {
          id: 'start',
          type: 'text',
          content: 'Hello! How are you today?',
          choices: [
            {
              id: 'good',
              text: 'I\'m doing well!',
              next: 'end'
            },
            {
              id: 'bad',
              text: 'Not so good.',
              next: 'end'
            }
          ]
        };
        const simpleEndNode: DialogueNode = {
          id: 'end',
          type: 'end',
          content: 'Thanks for talking with me!'
        };
        simpleTree.nodes.set('start', simpleStartNode);
        simpleTree.nodes.set('end', simpleEndNode);
        
        const engine = new DialogueEngine(simpleTree);
        const startResult = engine.start('start');
        
        result = {
          action: 'dialogue_started',
          treeId: 'simple_dialogue',
          result: startResult,
          context: startResult?.context
        };
        break;

      case 'continue':
        // Use a minimal ephemeral tree to demonstrate continue
        const contTreeData = {
          id: 'cont_dialogue',
          name: 'Continue Demo',
          version: '1.0.0',
          nodes: {},
          variables: {},
          flags: []
        };
        const contTree = DialogueEngine.deserialize(JSON.stringify(contTreeData));
        const contStart: DialogueNode = { id: 'start', type: 'text', content: 'Step 1', next: 'step2' };
        const contStep2: DialogueNode = { id: 'step2', type: 'text', content: 'Step 2', next: 'end' };
        const contEnd: DialogueNode = { id: 'end', type: 'end', content: 'Done' };
        contTree.nodes.set('start', contStart);
        contTree.nodes.set('step2', contStep2);
        contTree.nodes.set('end', contEnd);
        const contEngine = new DialogueEngine(contTree);
        const contStartRes = contEngine.start('start');
        const contRes = contEngine.continue();
        result = {
          action: 'continued',
          start: contStartRes,
          next: contRes,
          final: contEngine.continue()
        };
        break;

      case 'make-choice':
        // Small tree to exercise selectChoice
        const choiceTreeData = {
          id: 'choice_dialogue',
          name: 'Choice Demo',
          version: '1.0.0',
          nodes: {},
          variables: {},
          flags: []
        };
        const choiceTree = DialogueEngine.deserialize(JSON.stringify(choiceTreeData));
        const choiceStart: DialogueNode = {
          id: 'start', type: 'choice', content: 'Pick one', choices: [
            { id: 'c1', text: 'One', next: 'n1' },
            { id: 'c2', text: 'Two', next: 'n2' }
          ]
        };
        const n1: DialogueNode = { id: 'n1', type: 'text', content: 'You chose one', next: 'end' };
        const n2: DialogueNode = { id: 'n2', type: 'text', content: 'You chose two', next: 'end' };
        const cEnd: DialogueNode = { id: 'end', type: 'end', content: 'Finished' };
        choiceTree.nodes.set('start', choiceStart);
        choiceTree.nodes.set('n1', n1);
        choiceTree.nodes.set('n2', n2);
        choiceTree.nodes.set('end', cEnd);
        const choiceEngine = new DialogueEngine(choiceTree);
        choiceEngine.start('start');
        const choiceId = operation.choiceId || 'c1';
        const choiceRes = choiceEngine.selectChoice(choiceId);
        result = { action: 'choice_made', choiceId, result: choiceRes, context: choiceEngine.getContext() };
        break;

      case 'get-context':
        const ctxTreeData = {
          id: 'ctx_dialogue',
          name: 'Context Demo',
          version: '1.0.0',
          nodes: {},
          variables: { v: 1 },
          flags: ['f']
        };
        const ctxTree = DialogueEngine.deserialize(JSON.stringify(ctxTreeData));
        const ctxStart: DialogueNode = { id: 'start', type: 'text', content: 'Ctx', next: 'end' };
        const ctxEnd: DialogueNode = { id: 'end', type: 'end', content: 'E' };
        ctxTree.nodes.set('start', ctxStart);
        ctxTree.nodes.set('end', ctxEnd);
        const ctxEngine = new DialogueEngine(ctxTree);
        ctxEngine.start('start');
        result = { action: 'context', context: ctxEngine.getContext() };
        break;

      case 'demo':
        // Create and run a simple dialogue demo
        const demoTreeData = {
          id: 'demo_dialogue',
          name: 'Demo Dialogue',
          version: '1.0.0',
          nodes: {},
          variables: {},
          flags: []
        };
        const demoTree = DialogueEngine.deserialize(JSON.stringify(demoTreeData));
        
        const demoStartNode: DialogueNode = {
          id: 'demo_start',
          type: 'text',
          content: 'You find yourself in a mysterious forest. A wise old owl approaches.',
          choices: [
            {
              id: 'talk_to_owl',
              text: 'Greet the owl',
              next: 'owl_greeting'
            },
            {
              id: 'ignore_owl',
              text: 'Walk away',
              next: 'demo_end'
            }
          ]
        };
        
        const owlGreetingNode: DialogueNode = {
          id: 'owl_greeting',
          type: 'text',
          content: 'Hoo hoo! I am the Forest Guardian. Welcome, traveler.',
          next: 'demo_end'
        };
        
        const demoEndNode: DialogueNode = {
          id: 'demo_end',
          type: 'end',
          content: 'The owl flies away into the trees. Your adventure continues...'
        };
        
        demoTree.nodes.set('demo_start', demoStartNode);
        demoTree.nodes.set('owl_greeting', owlGreetingNode);
        demoTree.nodes.set('demo_end', demoEndNode);
        
        const demoEngine = new DialogueEngine(demoTree);
        const demoStart = demoEngine.start('demo_start');
        const demoChoice = demoEngine.selectChoice('talk_to_owl');
        const demoContinue = demoEngine.continue();
        
        result = {
          demo: {
            treeId: 'demo_dialogue',
            name: 'Demo Dialogue',
            nodeCount: demoTree.nodes.size,
            dialogueFlow: [
              { step: 1, action: 'start', result: demoStart },
              { step: 2, action: 'choice: talk_to_owl', result: demoChoice },
              { step: 3, action: 'continue', result: demoContinue }
            ],
            summary: {
              totalSteps: 3,
              choicesMade: 1,
              finalNode: demoContinue?.node.id || 'unknown'
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['parse', 'create-tree', 'start-dialogue', 'continue', 'make-choice', 'get-context', 'demo', 'dump'],
          description: 'DialoguePure - Dialogue and narrative system with CEL scripting support',
          features: [
            'Dialogue tree parsing and management',
            'Interactive dialogue flow',
            'Choice-based conversations',
            'Conditional dialogue branches',
            'Action execution (variables, flags, items, quests)',
            'CEL-like scripting support',
            'Context-aware dialogue state'
          ],
          nodeTypes: ['text', 'choice', 'condition', 'action', 'branch', 'end'],
          actionTypes: ['set_variable', 'set_flag', 'add_item', 'remove_item', 'start_quest', 'complete_quest', 'play_sound', 'script'],
          conditionTypes: ['variable', 'flag', 'inventory', 'quest', 'script'],
          operators: ['equals', 'not_equals', 'greater', 'less', 'contains', 'exists']
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1!] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'DialoguePure Export',
      'Dialogue and narrative system data'
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
      error: error instanceof Error ? message: String(error),
      timestamp: new Date()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1!]}`) {
  main();
}