#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

interface WitcherExplorerOperation {
  op: 'demo' | 'navigate' | 'dialogue' | 'quest' | 'dump';
  target?: string;
  data?: Record<string, unknown>;
}

interface WitcherGroveState {
  player: { x: number; y: number };
  currentLocation: string;
  activeQuests: string[];
  npcs: Record<string, any>;
  inventory: string[];
}

class WitcherExplorerDemo {
  private state: WitcherGroveState;
  private scenario: any;

  constructor() {
    this.state = {
      player: { x: 85, y: 262 },
      currentLocation: 'grove_clearing',
      activeQuests: ['campfire_intro'],
      npcs: {
        'npc1': { name: 'Wandering Hunter', location: 'grove_clearing', available: true }
      },
      inventory: ['torch', 'map']
    };

    // Load scenario data
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const fixturePath = path.resolve(currentDir, 'fixtures/witcher_grove.golden.json');
    if (fs.existsSync(fixturePath)) {
      this.scenario = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    } else {
      this.scenario = {
        scenarioId: 'witcher-grove-demo-v1',
        name: 'Witcher Grove Demo',
        quests: { campfire_intro: { steps: ['enter_grove', 'speak_to_npc', 'accept_task'] } },
        npcs: { npc1: { name: 'Wandering Hunter' } },
        locations: { grove_clearing: { description: 'A quiet forest clearing with a campfire.' } }
      };
    }
  }

  runDemo() {
    return {
      op: 'witcher_explorer_demo',
      status: 'ok',
      nav: {
        op: 'nav.path',
        path: ['grove', 'altar'],
        validated: true,
        currentLocation: this.state.currentLocation
      },
      dlg: {
        op: 'dialogue.next',
        node: 'welcome',
        choices: ['friendly', 'neutral', 'hostile'],
        npc: this.state.npcs.npc1.name
      },
      quest: {
        op: 'parse',
        id: 'campfire_intro',
        title: 'Witcher Explorer',
        status: 'active',
        steps: this.scenario.quests.campfire_intro.steps
      },
      metadata: {
        scene: 'grove',
        player: this.state.player,
        scenario: this.scenario.scenarioId,
        remixSafe: true
      }
    };
  }

  navigate(target: string) {
    const validLocations = Object.keys(this.scenario.locations || {});
    if (!validLocations.includes(target)) {
      throw new Error(`Invalid location: ${target}`);
    }

    this.state.currentLocation = target;
    return {
      op: 'navigate',
      status: 'ok',
      location: target,
      description: this.scenario.locations[target]?.description || 'Unknown location',
      player: this.state.player
    };
  }

  handleDialogue(npcId: string) {
    const npc = this.state.npcs[npcId];
    if (!npc) {
      throw new Error(`NPC not found: ${npcId}`);
    }

    return {
      op: 'dialogue',
      status: 'ok',
      npc: npc.name,
      dialogue: {
        text: `${npc.name} greets you warmly by the campfire.`,
        choices: [
          { id: 'ask_quest', text: 'Ask about the local troubles' },
          { id: 'trade', text: 'Inquire about trade' },
          { id: 'leave', text: 'Bid farewell' }
        ]
      }
    };
  }

  parseQuest(questId: string) {
    const quest = this.scenario.quests[questId];
    if (!quest) {
      throw new Error(`Quest not found: ${questId}`);
    }

    return {
      op: 'quest_parse',
      status: 'ok',
      quest: {
        id: questId,
        steps: quest.steps,
        currentStep: 0,
        completed: false
      }
    };
  }

  dump() {
    return {
      op: 'dump',
      status: 'ok',
      state: this.state,
      scenario: this.scenario,
      info: {
        version: '1.0.0',
        capabilities: ['demo', 'navigate', 'dialogue', 'quest']
      }
    };
  }
}

function main() {
  const argv = process.argv.slice(2);
  const demo = new WitcherExplorerDemo();

  try {
    let operation: WitcherExplorerOperation;
    
    if (argv.length === 0) {
      // Default to demo mode
      operation = { op: 'demo' };
    } else if (argv[0].endsWith('.json') && fs.existsSync(argv[0])) {
      const content = JSON.parse(fs.readFileSync(argv[0], 'utf-8'));
      operation = content as WitcherExplorerOperation;
    } else {
      // Parse subcommand
      const command = argv[0];
      switch (command) {
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'navigate':
          operation = { op: 'navigate', target: argv[1] || 'grove_clearing' };
          break;
        case 'dialogue':
          operation = { op: 'dialogue', target: argv[1] || 'npc1' };
          break;
        case 'quest':
          operation = { op: 'quest', target: argv[1] || 'campfire_intro' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    }

    let result;
    switch (operation.op) {
      case 'demo':
        result = demo.runDemo();
        break;
      case 'navigate':
        result = demo.navigate(operation.target!);
        break;
      case 'dialogue':
        result = demo.handleDialogue(operation.target!);
        break;
      case 'quest':
        result = demo.parseQuest(operation.target!);
        break;
      case 'dump':
        result = demo.dump();
        break;
      default:
        throw new Error(`Unknown operation: ${(operation as any).op}`);
    }

    console.log(JSON.stringify(result, null, 2));

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    const errorResult = {
      op: 'error',
      status: 'error',
      error: error instanceof Error ? message: String(error),
      timestamp: new Date()
    };
    console.error(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();

