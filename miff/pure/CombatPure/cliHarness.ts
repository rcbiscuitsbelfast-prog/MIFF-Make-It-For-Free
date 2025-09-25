#!/usr/bin/env tsx

import { CombatEngine, Combatant, Action, CombatState, ActionSource } from './engine';
import * as fs from 'fs';
import * as path from 'path';

interface CombatOperation {
  op: 'addCombatant' | 'queueAction' | 'stepTurn' | 'stepBattle' | 'dump' | 'reset' | 'simulate' | 'export';
  id?: string;
  name?: string;
  team?: string;
  hp?: number;
  maxHp?: number;
  atk?: number;
  def?: number;
  spd?: number;
  moves?: string[];
  actorId?: string;
  type?: 'attack' | 'defend' | 'item' | 'flee';
  targetId?: string;
  itemId?: string;
  format?: 'json' | 'csv' | 'markdown' | 'html';
}

class CombatCLI {
  private engine: CombatEngine;
  private log: string[];

  constructor() {
    this.engine = new CombatEngine();
    this.log = [];
    this.initializeSampleCombatants();
  }

  private initializeSampleCombatants() {
    // Add sample combatants for testing
    const sampleCombatants: Combatant[] = [
      {
        id: 'hero',
        name: 'Hero',
        team: 'player',
        stats: { hp: 100, maxHp: 100, atk: 15, def: 8, spd: 12 },
        moves: ['tackle', 'fire_blast']
      },
      {
        id: 'goblin1',
        name: 'Goblin Warrior',
        team: 'enemy',
        stats: { hp: 60, maxHp: 60, atk: 12, def: 5, spd: 10 },
        moves: ['scratch', 'bite']
      },
      {
        id: 'goblin2',
        name: 'Goblin Archer',
        team: 'enemy',
        stats: { hp: 40, maxHp: 40, atk: 10, def: 3, spd: 14 },
        moves: ['shoot', 'aim']
      }
    ];

    sampleCombatants.forEach(combatant => {
      this.engine.addCombatant(combatant);
    });
  }

  async execute(operation: CombatOperation): Promise<any> {
    try {
      switch (operation.op) {
        case 'addCombatant':
          return this.addCombatant(operation);
        
        case 'queueAction':
          return this.queueAction(operation);
        
        case 'stepTurn':
          return this.stepTurn();
        
        case 'stepBattle':
          return this.stepBattle();
        
        case 'dump':
          return this.dump();
        
        case 'reset':
          return this.reset();
        
        case 'simulate':
          return this.simulate();
        
        case 'export':
          return this.export(operation.format || 'json');
        
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

  private addCombatant(op: CombatOperation): any {
    if (!op.id || !op.name || !op.team) {
      throw new Error('Missing required fields: id, name, team');
    }

    const combatant: Combatant = {
      id: op.id,
      name: op.name,
      team: op.team,
      stats: {
        hp: op.hp || 100,
        maxHp: op.maxHp || 100,
        atk: op.atk || 10,
        def: op.def || 5,
        spd: op.spd || 10
      },
      moves: op.moves || ['tackle']
    };

    this.engine.addCombatant(combatant);
    this.log.push(`Added combatant: ${combatant.name} (${combatant.team})`);

    return {
      op: 'addCombatant',
      status: 'ok',
      result: {
        combatant,
        totalCombatants: Object.keys(this.engine.state.combatants).length,
        turnOrder: this.engine.state.order
      },
      timestamp: Date.now()
    };
  }

  private queueAction(op: CombatOperation): any {
    if (!op.actorId || !op.type) {
      throw new Error('Missing required fields: actorId, type');
    }

    const action: Action = {
      actorId: op.actorId,
      type: op.type,
      targetId: op.targetId,
      itemId: op.itemId,
      source: ActionSource.PLAYER
    };

    this.engine.enqueue(action);
    this.log.push(`Queued action: ${action.actorId} ${action.type}${action.targetId ? ` -> ${action.targetId}` : ''}`);

    return {
      op: 'queueAction',
      status: 'ok',
      result: {
        action,
        queueLength: this.engine.state.queue.length,
        nextActor: this.engine.state.order[0]
      },
      timestamp: Date.now()
    };
  }

  private stepTurn(): any {
    const beforeState = { ...this.engine.state };
    this.engine.stepTurn();
    this.log.push('Executed turn step');

    return {
      op: 'stepTurn',
      status: 'ok',
      result: {
        beforeState,
        afterState: this.engine.state,
        battleOver: this.engine.state.over,
        winnerTeam: this.engine.state.winnerTeam,
        queueLength: this.engine.state.queue.length
      },
      timestamp: Date.now()
    };
  }

  private stepBattle(): any {
    const turns: any[] = [];
    let turnCount = 0;
    const maxTurns = 50; // Prevent infinite loops

    while (!this.engine.state.over && turnCount < maxTurns) {
      const beforeState = { ...this.engine.state };
      this.engine.stepTurn();
      turnCount++;

      turns.push({
        turn: turnCount,
        beforeState,
        afterState: { ...this.engine.state }
      });

      // Auto-queue basic actions if queue is empty
      if (this.engine.state.queue.length === 0 && !this.engine.state.over) {
        this.autoQueueActions();
      }
    }

    this.log.push(`Battle completed in ${turnCount} turns`);

    return {
      op: 'stepBattle',
      status: 'ok',
      result: {
        turns,
        totalTurns: turnCount,
        battleOver: this.engine.state.over,
        winnerTeam: this.engine.state.winnerTeam,
        finalState: this.engine.state
      },
      timestamp: Date.now()
    };
  }

  private autoQueueActions(): void {
    // Simple AI: each combatant attacks a random enemy
    for (const combatantId of this.engine.state.order) {
      const combatant = this.engine.state.combatants[combatantId];
      if (combatant.status?.ko || combatant.status?.fled) continue;

      const enemies = Object.values(this.engine.state.combatants)
        .filter(c => c.team !== combatant.team && !c.status?.ko && !c.status?.fled);
      
      if (enemies.length > 0) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        this.engine.enqueue({
          actorId: combatantId,
          type: 'attack',
          targetId: target.id,
          source: ActionSource.AI
        });
      }
    }
  }

  private dump(): any {
    return {
      op: 'dump',
      status: 'ok',
      result: {
        state: this.engine.state,
        log: this.log,
        combatants: Object.values(this.engine.state.combatants).map(c => ({
          id: c.id,
          name: c.name,
          team: c.team,
          stats: c.stats,
          status: c.status,
          alive: !c.status?.ko && !c.status?.fled
        })),
        turnOrder: this.engine.state.order,
        queue: this.engine.state.queue,
        battleOver: this.engine.state.over,
        winnerTeam: this.engine.state.winnerTeam
      },
      timestamp: Date.now()
    };
  }

  private reset(): any {
    this.engine = new CombatEngine();
    this.log = [];
    this.initializeSampleCombatants();

    return {
      op: 'reset',
      status: 'ok',
      result: {
        message: 'Combat engine reset to initial state',
        combatants: Object.keys(this.engine.state.combatants).length
      },
      timestamp: Date.now()
    };
  }

  private simulate(): any {
    // Reset and run a full battle simulation
    this.reset();
    return this.stepBattle();
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
      case 'yaml': {
        const yaml = this.toYAML(data);
        return { op: 'export', status: 'ok', result: { yaml }, format: 'yaml', timestamp: Date.now() };
      }
      case 'xml': {
        const xml = this.toXML(data);
        return { op: 'export', status: 'ok', result: { xml }, format: 'xml', timestamp: Date.now() };
      }
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

  private toYAML(obj: any, indent = 0): string {
    const pad = '  '.repeat(indent);
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj !== 'object') return String(obj);
    if (Array.isArray(obj)) {
      return obj.map(v => `${pad}- ${this.toYAML(v, indent + 1).replace(/^\s+/, '')}`).join('\n');
    }
    return Object.entries(obj).map(([k, v]) => {
      const val = typeof v === 'object' && v !== null ? `\n${this.toYAML(v, indent + 1)}` : `${this.toYAML(v, 0)}`;
      return `${pad}${k}: ${typeof v === 'object' && v !== null ? '' : ''}${val}`;
    }).join('\n');
  }

  private toXML(obj: any, tag = 'root'): string {
    if (obj === null || obj === undefined) return `<${tag}/>`;
    if (typeof obj !== 'object') return `<${tag}>${String(obj)}</${tag}>`;
    if (Array.isArray(obj)) return `<${tag}>${obj.map(v => this.toXML(v, 'item')).join('')}</${tag}>`;
    const children = Object.entries(obj).map(([k, v]) => this.toXML(v as any, k)).join('');
    return `<${tag}>${children}</${tag}>`;
  }

  private exportCSV(data: any): any {
    const csv = [
      'Combatant,Team,HP,MaxHP,Attack,Defense,Speed,Status',
      ...Object.values(data.combatants).map((c: any) => 
        `${c.name},${c.team},${c.stats.hp},${c.stats.maxHp},${c.stats.atk},${c.stats.def},${c.stats.spd},${c.alive ? 'Alive' : 'KO'}`
      )
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
      '# Combat State Report',
      '',
      `**Battle Status**: ${data.battleOver ? `Over - Winner: ${data.winnerTeam}` : 'In Progress'}`,
      `**Turn Order**: ${data.turnOrder.join(' → ')}`,
      '',
      '## Combatants',
      '',
      '| Name | Team | HP | Max HP | Attack | Defense | Speed | Status |',
      '|------|------|----|---------|---------|---------|-------|--------|',
      ...Object.values(data.combatants).map((c: any) => 
        `| ${c.name} | ${c.team} | ${c.stats.hp} | ${c.stats.maxHp} | ${c.stats.atk} | ${c.stats.def} | ${c.stats.spd} | ${c.alive ? 'Alive' : 'KO'} |`
      )
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
    <title>Combat State Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .alive { color: green; }
        .ko { color: red; }
    </style>
</head>
<body>
    <h1>Combat State Report</h1>
    <p><strong>Battle Status</strong>: ${data.battleOver ? `Over - Winner: ${data.winnerTeam}` : 'In Progress'}</p>
    <p><strong>Turn Order</strong>: ${data.turnOrder.join(' → ')}</p>
    
    <h2>Combatants</h2>
    <table>
        <tr>
            <th>Name</th>
            <th>Team</th>
            <th>HP</th>
            <th>Max HP</th>
            <th>Attack</th>
            <th>Defense</th>
            <th>Speed</th>
            <th>Status</th>
        </tr>
        ${Object.values(data.combatants).map((c: any) => `
        <tr>
            <td>${c.name}</td>
            <td>${c.team}</td>
            <td>${c.stats.hp}</td>
            <td>${c.stats.maxHp}</td>
            <td>${c.stats.atk}</td>
            <td>${c.stats.def}</td>
            <td>${c.stats.spd}</td>
            <td class="${c.alive ? 'alive' : 'ko'}">${c.alive ? 'Alive' : 'KO'}</td>
        </tr>
        `).join('')}
    </table>
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

async function main() {
  const cli = new CombatCLI();
  
  if (process.argv.length < 3) {
    console.error('Usage: cliHarness.ts <operation> [args...]');
    console.error('Operations: dump, simulate, reset, export [format]');
    process.exit(1);
  }

  const operation = process.argv[2];
  const args = process.argv.slice(3);

  let op: CombatOperation;
  
  switch (operation) {
    case 'dump':
      op = { op: 'dump' };
      break;
    case 'simulate':
      op = { op: 'simulate' };
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
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}