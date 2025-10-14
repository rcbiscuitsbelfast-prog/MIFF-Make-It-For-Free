#!/usr/bin/env tsx

import { nextNode, Dialogue, Node } from './index';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface DialogueOperation {
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
  op: 'start' | 'next' | 'dump' | 'simulate' | 'export' | 'validate' | 'reset';
  dialogueId?: string;
  current?: string;
  choiceIndex?: number;
  format?: 'json' | 'csv' | 'markdown' | 'html';
  dialogue?: Dialogue;
}

class DialogueCLI {
  
  private currentDialogue: Dialogue | null = null;
  private currentNode: string | null = null;
  private history: Array<{ node: string; choice?: string; timestamp: number }> = [];
  private log: string[] = [];

  constructor(...args: any[]) {
    
    this.initializeSampleDialogue();
  }

  private initializeSampleDialogue(...args: any[]) {
    this.currentDialogue = {
      start: 'greeting',
      nodes: {
        greeting: {
          id: 'greeting',
          text: 'Welcome, traveler! I am the village elder. How may I help you today?',
          choices: [
            { text: 'I need information about the quest', next: 'quest_info' },
            { text: 'Tell me about this village', next: 'village_info' },
            { text: 'I have a question about magic', next: 'magic_info' },
            { text: 'Goodbye', next: 'farewell' }
          ]
        },
        quest_info: {
          id: 'quest_info',
          text: 'Ah, you seek the ancient artifact! It lies deep in the Crystal Caverns. But beware - the path is treacherous.',
          choices: [
            { text: 'How do I get to the Crystal Caverns?', next: 'cavern_directions' },
            { text: 'What dangers should I expect?', next: 'dangers' },
            { text: 'Do you have any advice?', next: 'advice' },
            { text: 'Thank you, I\'ll be careful', next: 'farewell' }
          ]
        },
        village_info: {
          id: 'village_info',
          text: 'Our village has stood here for over 200 years. We are known for our skilled craftsmen and our connection to the ancient magic.',
          choices: [
            { text: 'Tell me about the craftsmen', next: 'craftsmen' },
            { text: 'What about the ancient magic?', next: 'magic_info' },
            { text: 'How many people live here?', next: 'population' },
            { text: 'That\'s interesting, thank you', next: 'farewell' }
          ]
        },
        magic_info: {
          id: 'magic_info',
          text: 'Magic flows through our land like water through a river. Some say it comes from the Crystal Caverns themselves.',
          choices: [
            { text: 'Can you teach me magic?', next: 'magic_teaching' },
            { text: 'What kind of magic exists here?', next: 'magic_types' },
            { text: 'Is magic dangerous?', next: 'magic_danger' },
            { text: 'Fascinating!', next: 'farewell' }
          ]
        },
        farewell: {
          id: 'farewell',
          text: 'Safe travels, and may the light guide your path!',
          choices: []
        },
        cavern_directions: {
          id: 'cavern_directions',
          text: 'Head north from the village until you reach the Whispering Woods. Follow the path marked with blue stones.',
          choices: [
            { text: 'What if I get lost?', next: 'lost_advice' },
            { text: 'How long will it take?', next: 'travel_time' },
            { text: 'Thank you for the directions', next: 'farewell' }
          ]
        },
        dangers: {
          id: 'dangers',
          text: 'The caverns are home to shadow creatures and unstable crystal formations. Bring light and be prepared for battle.',
          choices: [
            { text: 'What kind of shadow creatures?', next: 'creatures' },
            { text: 'How do I prepare for battle?', next: 'battle_prep' },
            { text: 'I understand the risks', next: 'farewell' }
          ]
        },
        advice: {
          id: 'advice',
          text: 'Trust your instincts, but don\'t be reckless. The artifact will reveal itself to those who are worthy.',
          choices: [
            { text: 'What makes someone worthy?', next: 'worthiness' },
            { text: 'Thank you for the wisdom', next: 'farewell' }
          ]
        },
        craftsmen: {
          id: 'craftsmen',
          text: 'Our blacksmiths create the finest weapons, and our jewelers work with crystals from the caverns.',
          choices: [
            { text: 'Can I buy weapons here?', next: 'weapons' },
            { text: 'Tell me about the crystals', next: 'crystals' },
            { text: 'Impressive craftsmanship', next: 'farewell' }
          ]
        },
        population: {
          id: 'population',
          text: 'We are a small but close-knit community of about 150 people. Everyone knows everyone here.',
          choices: [
            { text: 'That sounds peaceful', next: 'farewell' },
            { text: 'Do you ever get visitors?', next: 'visitors' }
          ]
        },
        magic_teaching: {
          id: 'magic_teaching',
          text: 'Magic cannot be taught in a single conversation, young one. It requires years of study and practice.',
          choices: [
            { text: 'Where can I learn?', next: 'learning_places' },
            { text: 'I understand', next: 'farewell' }
          ]
        },
        magic_types: {
          id: 'magic_types',
          text: 'We practice elemental magic - earth, water, fire, and air. Some say there are other types, but they are rare.',
          choices: [
            { text: 'Which is the most powerful?', next: 'powerful_magic' },
            { text: 'Can I see some magic?', next: 'magic_demo' },
            { text: 'Very interesting', next: 'farewell' }
          ]
        },
        magic_danger: {
          id: 'magic_danger',
          text: 'Magic is like fire - useful when controlled, destructive when not. Respect it, and it will serve you well.',
          choices: [
            { text: 'Have you seen magic go wrong?', next: 'magic_accidents' },
            { text: 'I will be careful', next: 'farewell' }
          ]
        },
        lost_advice: {
          id: 'lost_advice',
          text: 'If you get lost, look for the blue stones. They will always point you back to the path.',
          choices: [
            { text: 'Thank you for the tip', next: 'farewell' }
          ]
        },
        travel_time: {
          id: 'travel_time',
          text: 'The journey takes about half a day on foot. You should arrive by evening if you leave in the morning.',
          choices: [
            { text: 'Good to know', next: 'farewell' }
          ]
        },
        creatures: {
          id: 'creatures',
          text: 'Shadow wraiths and crystal spiders. The wraiths fear light, and the spiders are attracted to movement.',
          choices: [
            { text: 'How do I fight them?', next: 'combat_tips' },
            { text: 'I\'ll be prepared', next: 'farewell' }
          ]
        },
        battle_prep: {
          id: 'battle_prep',
          text: 'Bring a sturdy weapon, healing potions, and plenty of light sources. Armor wouldn\'t hurt either.',
          choices: [
            { text: 'Where can I get these supplies?', next: 'supplies' },
            { text: 'I\'ll stock up', next: 'farewell' }
          ]
        },
        worthiness: {
          id: 'worthiness',
          text: 'The worthy are those who seek not for power, but for wisdom. Those who help others before themselves.',
          choices: [
            { text: 'I hope I am worthy', next: 'farewell' }
          ]
        },
        weapons: {
          id: 'weapons',
          text: 'Visit our blacksmith, Marcus. He\'s in the building with the anvil symbol. His weapons are the best in the region.',
          choices: [
            { text: 'I\'ll visit him', next: 'farewell' }
          ]
        },
        crystals: {
          id: 'crystals',
          text: 'The crystals from the caverns have unique properties. Some glow, others can store magical energy.',
          choices: [
            { text: 'Can I buy some crystals?', next: 'crystal_purchase' },
            { text: 'Fascinating', next: 'farewell' }
          ]
        },
        visitors: {
          id: 'visitors',
          text: 'We get the occasional traveler, like yourself. Most are seeking the artifact or studying our magic.',
          choices: [
            { text: 'Do they usually succeed?', next: 'success_rate' },
            { text: 'I see', next: 'farewell' }
          ]
        },
        learning_places: {
          id: 'learning_places',
          text: 'There are academies in the capital city, but they are expensive. Some learn from nature itself.',
          choices: [
            { text: 'Maybe I\'ll try the natural way', next: 'farewell' }
          ]
        },
        powerful_magic: {
          id: 'powerful_magic',
          text: 'Each element has its strengths. Fire for destruction, water for healing, earth for protection, air for speed.',
          choices: [
            { text: 'Which do you prefer?', next: 'elder_preference' },
            { text: 'All sound useful', next: 'farewell' }
          ]
        },
        magic_demo: {
          id: 'magic_demo',
          text: 'Watch closely... *waves hand* A small flame appears, dancing in the air before fading away.',
          choices: [
            { text: 'Amazing!', next: 'farewell' }
          ]
        },
        magic_accidents: {
          id: 'magic_accidents',
          text: 'Yes, but those are stories for another time. Suffice to say, magic demands respect.',
          choices: [
            { text: 'I understand', next: 'farewell' }
          ]
        },
        combat_tips: {
          id: 'combat_tips',
          text: 'Use light against wraiths, and stay still when spiders are near. Strike quickly and retreat if needed.',
          choices: [
            { text: 'Good advice', next: 'farewell' }
          ]
        },
        supplies: {
          id: 'supplies',
          text: 'Marcus has weapons and armor, and our healer Sarah has potions. Both are in the village square.',
          choices: [
            { text: 'I\'ll visit them both', next: 'farewell' }
          ]
        },
        crystal_purchase: {
          id: 'crystal_purchase',
          text: 'Our jeweler Elena has some smaller crystals for sale. The larger ones are too valuable to sell.',
          choices: [
            { text: 'I\'ll check with Elena', next: 'farewell' }
          ]
        },
        success_rate: {
          id: 'success_rate',
          text: 'Some succeed, some don\'t. The caverns test not just strength, but wisdom and character.',
          choices: [
            { text: 'I hope I have what it takes', next: 'farewell' }
          ]
        },
        elder_preference: {
          id: 'elder_preference',
          text: 'I favor earth magic - it\'s steady and reliable. But each mage finds their own path.',
          choices: [
            { text: 'Wise words', next: 'farewell' }
          ]
        }
      }
    };
    this.currentNode = this.currentDialogue.start;
  }

  async execute(operation: DialogueOperation): Promise<any> {
    try {
      switch (operation.op) {
        case 'start':
          return this.startDialogue(operation);
        
        case 'next':
          return this.nextNode(operation);
        
        case 'dump':
          return this.dump();
        
        case 'simulate':
          return this.simulate();
        
        case 'export':
          return this.export(operation.format || 'json');
        
        case 'validate':
          return this.validate(operation.dialogue);
        
        case 'reset':
          return this.reset();
        
        default:
          throw new Error(`Unknown operation: ${operation.op}`);
      }
    } catch (error) {
      return {
        op: operation.op,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  private startDialogue(op: DialogueOperation): any {
    if (op.dialogue) {
      this.currentDialogue = op.dialogue;
    }
    
    if (!this.currentDialogue) {
      throw new Error('No dialogue loaded');
    }

    this.currentNode = this.currentDialogue.start;
    this.history = [];
    this.log = [];
    
    this.history.push({ node: this.currentNode, timestamp: Date.now() });
    this.log.push(`Started dialogue: ${this.currentDialogue.start}`);

    return {
      op: 'start',
      status: 'ok',
      result: {
        currentNode: this.currentNode,
        node: this.currentDialogue.nodes[this.currentNode],
        totalNodes: Object.keys(this.currentDialogue.nodes).length,
        history: this.history
      },
      timestamp: Date.now()
    };
  }

  private nextNode(op: DialogueOperation): any {
    if (!this.currentDialogue || !this.currentNode) {
      throw new Error('No active dialogue');
    }

    const choiceIndex = op.choiceIndex || 0;
    const result = nextNode(this.currentDialogue, this.currentNode, choiceIndex);
    
    if (result.status === 'ok' && result.id) {
      const previousNode = this.currentNode;
      this.currentNode = result.id;
      
      const previousNodeData = this.currentDialogue.nodes[previousNode];
      const choiceText = previousNodeData.choices?.[choiceIndex]?.text || 'Unknown choice';
      
      this.history.push({ 
        node: this.currentNode, 
        choice: choiceText,
        timestamp: Date.now() 
      });
      
      this.log.push(`Moved from ${previousNode} to ${this.currentNode} via "${choiceText}"`);
    }

    return {
      op: 'next',
      status: result.status,
      result: {
        ...result,
        currentNode: this.currentNode,
        node: this.currentNode ? this.currentDialogue.nodes[this.currentNode] : null,
        history: this.history,
        log: this.log
      },
      timestamp: Date.now()
    };
  }

  private dump(): any {
    return {
      op: 'dump',
      status: 'ok',
      result: {
        dialogue: this.currentDialogue,
        currentNode: this.currentNode,
        history: this.history,
        log: this.log,
        statistics: {
          totalNodes: this.currentDialogue ? Object.keys(this.currentDialogue.nodes).length : 0,
          nodesVisited: this.history.length,
          currentDepth: this.history.length,
          hasChoices: this.currentNode && this.currentDialogue?.nodes[this.currentNode]?.choices?.length > 0
        }
      },
      timestamp: Date.now()
    };
  }

  private simulate(): any {
    if (!this.currentDialogue) {
      throw new Error('No dialogue loaded');
    }

    this.reset();
    const simulation = [];
    let currentNode = this.currentDialogue.start;
    let depth = 0;
    const maxDepth = 20; // Prevent infinite loops

    while (currentNode && depth < maxDepth) {
      const node = this.currentDialogue.nodes[currentNode];
      if (!node || !node.choices || node.choices.length === 0) {
        break; // End of dialogue
      }

      // Randomly choose a path
      const choiceIndex = Math.floor(Math.random() * node.choices.length);
      const choice = node.choices[choiceIndex];
      
      simulation.push({
        depth,
        node: currentNode,
        nodeText: node.text,
        choice: choice.text,
        nextNode: choice.next
      });

      currentNode = choice.next;
      depth++;
    }

    this.log.push(`Simulated dialogue path with ${simulation.length} steps`);

    return {
      op: 'simulate',
      status: 'ok',
      result: {
        simulation,
        totalSteps: simulation.length,
        finalNode: currentNode,
        dialogue: this.currentDialogue
      },
      timestamp: Date.now()
    };
  }

  private validate(dialogue?: Dialogue): any {
    const targetDialogue = dialogue || this.currentDialogue;
    
    if (!targetDialogue) {
      throw new Error('No dialogue to validate');
    }

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check if start node exists
    if (!targetDialogue.nodes[targetDialogue.start]) {
      issues.push(`Start node '${targetDialogue.start}' does not exist`);
    }

    // Check all nodes
    for (const [nodeId, node] of Object.entries(targetDialogue.nodes)) {
      if (!node.text || node.text.trim() === '') {
        issues.push(`Node '${nodeId}' has empty text`);
      }

      if (node.choices) {
        for (let i = 0; i < node.choices.length; i++) {
          const choice = node.choices[i];
          if (!choice.text || choice.text.trim() === '') {
            issues.push(`Node '${nodeId}' choice ${i} has empty text`);
          }
          if (!choice.next || !targetDialogue.nodes[choice.next]) {
            issues.push(`Node '${nodeId}' choice ${i} points to non-existent node '${choice.next}'`);
          }
        }
      }
    }

    // Check for unreachable nodes
    const reachable = new Set<string>();
    const queue = [targetDialogue.start];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      
      reachable.add(current);
      const node = targetDialogue.nodes[current];
      if (node.choices) {
        for (const choice of node.choices) {
          if (!reachable.has(choice.next)) {
            queue.push(choice.next);
          }
        }
      }
    }

    for (const nodeId of Object.keys(targetDialogue.nodes)) {
      if (!reachable.has(nodeId)) {
        warnings.push(`Node '${nodeId}' is unreachable from start node`);
      }
    }

    return {
      op: 'validate',
      status: 'ok',
      result: {
        valid: issues.length === 0,
        issues,
        warnings,
        statistics: {
          totalNodes: Object.keys(targetDialogue.nodes).length,
          reachableNodes: reachable.size,
          unreachableNodes: Object.keys(targetDialogue.nodes).length - reachable.size,
          totalChoices: Object.values(targetDialogue.nodes).reduce((sum, node) => 
            sum + (node.choices?.length || 0), 0)
        }
      },
      timestamp: Date.now()
    };
  }

  private reset(): any {
    this.currentNode = this.currentDialogue?.start || null;
    this.history = [];
    this.log = [];

    return {
      op: 'reset',
      status: 'ok',
      result: {
        message: 'Dialogue reset to start',
        currentNode: this.currentNode
      },
      timestamp: Date.now()
    };
  }

  private export(format: string): any {
    const data = this.dump().result;

    switch (format) {
      case 'csv':
        return this.exportCSV(data);
      case 'markdown':
        return this.exportMarkdown(data);
      case 'html':
        return this.exportHTML(data);
      default:
        return {
          op: 'export',
          status: 'ok',
          result: data,
          format: 'json',
          timestamp: Date.now()
        };
    }
  }

  private exportCSV(data: any): any {
    const csv = [
      'Node ID,Text,Choices Count,Choices',
      ...Object.entries(data.dialogue.nodes).map(([id, node]: [string, any]) => {
        const choices = node.choices ? node.choices.map((c: any) => `${c.text}->${c.next}`).join(';') : '';
        return `"${id}","${node.text.replace(/"/g, '""')}",${node.choices?.length || 0},"${choices}"`;
      })
    ].join('\n');

    return {
      op: 'export',
      status: 'ok',
      result: { csv },
      format: 'csv',
      timestamp: Date.now()
    };
  }

  private exportMarkdown(data: any): any {
    const md = [
      '# Dialogue System Report',
      '',
      `**Current Node**: ${data.currentNode}`,
      `**Total Nodes**: ${data.statistics.totalNodes}`,
      `**Nodes Visited**: ${data.statistics.nodesVisited}`,
      '',
      '## Dialogue Tree',
      '',
      ...Object.entries(data.dialogue.nodes).map(([id, node]: [string, any]) => [
        `### ${id}`,
        '',
        node.text,
        '',
        ...(node.choices ? [
          '**Choices:**',
          '',
          ...node.choices.map((choice: any, i: number) => 
            `${i + 1}. ${choice.text} → ${choice.next}`
          ),
          ''
        ] : ['*End of dialogue*', ''])
      ]).flat()
    ].join('\n');

    return {
      op: 'export',
      status: 'ok',
      result: { markdown: md },
      format: 'markdown',
      timestamp: Date.now()
    };
  }

  private exportHTML(data: any): any {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Dialogue System Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .node { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .current { background-color: #e8f4fd; border-color: #2196F3; }
        .choice { margin: 5px 0; padding: 5px; background-color: #f5f5f5; border-radius: 3px; }
        .stats { background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Dialogue System Report</h1>
    
    <div class="stats">
        <h3>Statistics</h3>
        <p><strong>Current Node</strong>: ${data.currentNode}</p>
        <p><strong>Total Nodes</strong>: ${data.statistics.totalNodes}</p>
        <p><strong>Nodes Visited</strong>: ${data.statistics.nodesVisited}</p>
        <p><strong>Current Depth</strong>: ${data.statistics.currentDepth}</p>
    </div>
    
    <h2>Dialogue Tree</h2>
    ${Object.entries(data.dialogue.nodes).map(([id, node]: [string, any]) => `
    <div class="node ${id === data.currentNode ? 'current' : ''}">
        <h3>${id}</h3>
        <p>${node.text}</p>
        ${node.choices ? `
        <h4>Choices:</h4>
        ${node.choices.map((choice: any, i: number) => `
        <div class="choice">
            ${i + 1}. ${choice.text} → ${choice.next}
        </div>
        `).join('')}
        ` : '<p><em>End of dialogue</em></p>'}
    </div>
    `).join('')}
</body>
</html>`;

    return {
      op: 'export',
      status: 'ok',
      result: { html },
      format: 'html',
      timestamp: Date.now()
    };
  }
}

async function main(...args: any[]) {
  const cli = new DialogueCLI();
  const argv = process.argv.slice(2);

  // Legacy mode: single JSON path argument triggers one deterministic next step
  if (argv.length === 1 && argv[0].endsWith('.json')) {
    try {
      const jsonPath = argv[0];
      const raw = SafeJSONParser.parse(fs.readFileSync(path.resolve(jsonPath), 'utf-8')) as any;
      const data: Dialogue = (raw && raw.dialogue) ? raw.dialogue : raw;
      const choiceIndex = typeof raw?.choiceIndex === 'number' ? raw.choiceIndex : 0;
      // Start then take first choice deterministically
      await cli.execute({ op: 'start', dialogue: data });
      const step = await cli.execute({ op: 'next', choiceIndex });
      const id = step.result?.id;
      const issue = step.result?.issue;
      const status = step.status;
      const out = { op: 'dialogue.next', status, id, issue };
      console.info(JSON.stringify(out));
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      const out = { op: 'dialogue.next', status: 'error', issue: message };
      console.info(JSON.stringify(out));
      process.exit(1);
    }
  }

  if (process.argv.length < 3) {
    console.error('Usage: cliHarness.ts <operation> [args...]');
    console.error('Operations: start, next [choiceIndex], dump, simulate, validate, reset, export [format]');
    process.exit(1);
  }

  const operation = process.argv[2];
  const args = process.argv.slice(3);

  let op: DialogueOperation;
  
  switch (operation) {
    case 'start':
      op = { op: 'start' };
      break;
    case 'next':
      op = { op: 'next', choiceIndex: args[0] ? parseInt(args[0]) : 0 };
      break;
    case 'dump':
      op = { op: 'dump' };
      break;
    case 'simulate':
      op = { op: 'simulate' };
      break;
    case 'validate':
      op = { op: 'validate' };
      break;
    case 'reset':
      op = { op: 'reset' };
      break;
    case 'export':
      op = { op: 'export', format: args[0] as any || 'json' };
      break;
    default:
      console.error(`Unknown operation: ${operation}`);
      process.exit(1);
  }

  const result = await cli.execute(op);
  console.info(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}