#!/usr/bin/env tsx

import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
TeamsPure CLI Harness - Team Management System

Usage: npx tsx miff/pure/TeamsPure/cliHarness.ts [command] [options]

Commands:
  add <spiritId>           - Add spirit to team
  remove <index>           - Remove spirit from team at index
  swap <indexA> <indexB>   - Swap spirits at two positions
  list                     - List active team
  get-team                 - Get team data
  get-reserves             - Get reserves data
  set-max-size <size>      - Set maximum team size
  simulate                 - Simulate team operations
  dump                     - Dump all data
  help                     - Show this help

Examples:
  npx tsx miff/pure/TeamsPure/cliHarness.ts add "spirit1"
  npx tsx miff/pure/TeamsPure/cliHarness.ts list
  npx tsx miff/pure/TeamsPure/cliHarness.ts set-max-size 4
`);
  process.exit(0);
}

interface TeamOperation {
  op: 'add' | 'remove' | 'swap' | 'list' | 'get-team' | 'get-reserves' | 'set-max-size' | 'simulate' | 'dump';
  spiritId?: string;
  indexA?: number;
  indexB?: number;
  maxSize?: number;
  data?: Record<string, unknown>;
  exportFormat?: string;
}

interface SpiritInstance {
  instanceId: string;
  name: string;
  level: number;
  type: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

class TeamManager {
  private activeTeam: SpiritInstance[] = [];
  private reserves: SpiritInstance[] = [];
  private maxTeamSize: number = 6;
  private operations: Array<{ op: string; success: boolean; timestamp: number }> = [];

  addToTeam(spirit: SpiritInstance): boolean {
    if (!spirit) {
      this.logOperation('add', false);
      return false;
    }
    
    if (this.activeTeam.length >= this.maxTeamSize) {
      this.reserves.push(spirit);
      this.logOperation('add', false);
      return false;
    }
    
    this.activeTeam.push(spirit);
    this.logOperation('add', true);
    return true;
  }

  removeFromTeam(spiritId: string): boolean {
    if (!spiritId) {
      this.logOperation('remove', false);
      return false;
    }
    
    // Try to remove from active team
    const activeIndex = this.activeTeam.findIndex(s => s.instanceId === spiritId);
    if (activeIndex >= 0) {
      this.activeTeam.splice(activeIndex, 1);
      this.logOperation('remove', true);
      return true;
    }
    
    // Try to remove from reserves
    const reserveIndex = this.reserves.findIndex(s => s.instanceId === spiritId);
    if (reserveIndex >= 0) {
      this.reserves.splice(reserveIndex, 1);
      this.logOperation('remove', true);
      return true;
    }
    
    this.logOperation('remove', false);
    return false;
  }

  swapTeamMembers(indexA: number, indexB: number): boolean {
    if (indexA < 0 || indexA >= this.activeTeam.length || 
        indexB < 0 || indexB >= this.activeTeam.length) {
      this.logOperation('swap', false);
      return false;
    }
    
    [this.activeTeam[indexA], this.activeTeam[indexB]] = [this.activeTeam[indexB], this.activeTeam[indexA]];
    this.logOperation('swap', true);
    return true;
  }

  setMaxTeamSize(size: number): boolean {
    if (size < 1 || size > 10) {
      this.logOperation('set-max-size', false);
      return false;
    }
    
    this.maxTeamSize = size;
    
    // Move excess spirits to reserves if needed
    while (this.activeTeam.length > this.maxTeamSize) {
      const excess = this.activeTeam.pop()!;
      this.reserves.push(excess);
    }
    
    this.logOperation('set-max-size', true);
    return true;
  }

  getTeam(): SpiritInstance[] {
    return [...this.activeTeam];
  }

  getReserves(): SpiritInstance[] {
    return [...this.reserves];
  }

  getAllSpirits(): SpiritInstance[] {
    return [...this.activeTeam, ...this.reserves];
  }

  getTeamStats(): { totalSpirits: number; activeCount: number; reserveCount: number; maxSize: number } {
    return {
      totalSpirits: this.activeTeam.length + this.reserves.length,
      activeCount: this.activeTeam.length,
      reserveCount: this.reserves.length,
      maxSize: this.maxTeamSize
    };
  }

  private logOperation(op: string, success: boolean): void {
    this.operations.push({
      op,
      success,
      timestamp: new Date()
    });
  }

  getOperationHistory(): typeof this.operations {
    return [...this.operations];
  }

  clearHistory(): void {
    this.operations = [];
  }
}

function createSampleSpirit(id: string, name: string, type: string, level: number): SpiritInstance {
  const baseStats = { hp: 50, attack: 20, defense: 15, speed: 10 };
  const levelMultiplier = 1 + (level - 1) * 0.1;
  
  return {
    instanceId: id,
    name,
    level,
    type,
    stats: {
      hp: Math.floor(baseStats.hp * levelMultiplier),
      attack: Math.floor(baseStats.attack * levelMultiplier),
      defense: Math.floor(baseStats.defense * levelMultiplier),
      speed: Math.floor(baseStats.speed * levelMultiplier)
    }
  };
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0!];
    let operation: TeamOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as TeamOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'add':
          if (!argv[1!]) throw new Error('add requires spiritId');
          operation = { op: 'add', spiritId: argv[1!] };
          break;
        case 'remove':
          if (!argv[1!]) throw new Error('remove requires spiritId');
          operation = { op: 'remove', spiritId: argv[1!] };
          break;
        case 'swap':
          if (!argv[1!] || !argv[2!]) throw new Error('swap requires two indices');
          operation = { op: 'swap', indexA: parseInt(argv[1]), indexB: parseInt(argv[2]) };
          break;
        case 'list':
          operation = { op: 'list' };
          break;
        case 'get-team':
          operation = { op: 'get-team' };
          break;
        case 'get-reserves':
          operation = { op: 'get-reserves' };
          break;
        case 'set-max-size':
          if (!argv[1!]) throw new Error('set-max-size requires a size');
          operation = { op: 'set-max-size', maxSize: parseInt(argv[1!]) };
          break;
        case 'simulate':
          operation = { op: 'simulate' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    const teamManager = new TeamManager();
    let result: any;

    switch (operation.op) {
      case 'add':
        // Create a sample spirit for demonstration
        const spirit = createSampleSpirit(
          operation.spiritId!,
          `Spirit_${operation.spiritId}`,
          'elemental',
          Math.floor(Math.random() * 10) + 1
        );
        const addSuccess = teamManager.addToTeam(spirit);
        result = {
          spiritId: operation.spiritId,
          success: addSuccess,
          spirit: addSuccess ? spirit : null,
          teamStats: teamManager.getTeamStats()
        };
        break;

      case 'remove':
        const removeSuccess = teamManager.removeFromTeam(operation.spiritId!);
        result = {
          spiritId: operation.spiritId,
          success: removeSuccess,
          teamStats: teamManager.getTeamStats()
        };
        break;

      case 'swap':
        const swapSuccess = teamManager.swapTeamMembers(operation.indexA!, operation.indexB!);
        result = {
          indexA: operation.indexA,
          indexB: operation.indexB,
          success: swapSuccess,
          team: teamManager.getTeam()
        };
        break;

      case 'list':
        result = {
          team: teamManager.getTeam(),
          reserves: teamManager.getReserves(),
          stats: teamManager.getTeamStats()
        };
        break;

      case 'get-team':
        result = {
          team: teamManager.getTeam(),
          count: teamManager.getTeam().length
        };
        break;

      case 'get-reserves':
        result = {
          reserves: teamManager.getReserves(),
          count: teamManager.getReserves().length
        };
        break;

      case 'set-max-size':
        const sizeSuccess = teamManager.setMaxTeamSize(operation.maxSize!);
        result = {
          maxSize: operation.maxSize,
          success: sizeSuccess,
          teamStats: teamManager.getTeamStats()
        };
        break;

      case 'simulate':
        // Simulate team building
        const spirits = [
          createSampleSpirit('emberfox_1', 'Ember Fox', 'fire', 5),
          createSampleSpirit('glimmerbat_1', 'Glimmer Bat', 'air', 3),
          createSampleSpirit('shadowwolf_1', 'Shadow Wolf', 'dark', 7),
          createSampleSpirit('crystalwing_1', 'Crystal Wing', 'light', 4),
          createSampleSpirit('stormbear_1', 'Storm Bear', 'earth', 6),
          createSampleSpirit('frostcat_1', 'Frost Cat', 'ice', 2),
          createSampleSpirit('thunderbird_1', 'Thunder Bird', 'electric', 8)
        ];

        // Add spirits to team
        spirits.forEach((spirit: any) => teamManager.addToTeam(spirit));
        
        // Try some operations
        teamManager.swapTeamMembers(0, 1);
        teamManager.setMaxTeamSize(4);
        
        result = {
          team: teamManager.getTeam(),
          reserves: teamManager.getReserves(),
          stats: teamManager.getTeamStats(),
          operationHistory: teamManager.getOperationHistory(),
          summary: {
            totalSpirits: spirits.length,
            activeTeamSize: teamManager.getTeam().length,
            reserveCount: teamManager.getReserves().length,
            operationsPerformed: teamManager.getOperationHistory().length
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['add', 'remove', 'swap', 'list', 'get-team', 'get-reserves', 'set-max-size', 'simulate', 'dump'],
          description: 'TeamsPure - Team management and spirit organization',
          features: [
            'Active team management (max 6 spirits)',
            'Reserve spirit storage',
            'Team member swapping',
            'Dynamic team size limits',
            'Operation history tracking'
          ],
          defaultMaxSize: 6,
          maxAllowedSize: 10
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
      'TeamsPure Export',
      'Team management and spirit organization data'
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