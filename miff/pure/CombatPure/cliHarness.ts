#!/usr/bin/env npx tsx
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

/**
 * CombatPure CLI Harness
 * 
 * Provides comprehensive CLI interface for CombatPure module testing and validation
 */

import { 
  CombatEngine, 
  BattleEngine, 
  SpiritInstance, 
  MoveData, 
  MoveCategory, 
  ActionSource,
  TypeEffectiveness,
  DamageCalculator,
  CombatUtils
} from './engine';

interface CLIResult {
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
  op: string;
  status: 'ok' | 'error';
  result?: any;
  message?: string;
  error?: string;
}

class CombatCLI {
  
  private battleEngine: BattleEngine;
  private typeChart: TypeEffectiveness;

  constructor(...args: any[]) {
    
    this.typeChart = new TypeEffectiveness();
    this.battleEngine = new BattleEngine(this.typeChart);
  }

  // Test method for module validation
  public test(): CLIResult {
    try {
      console.info('🧪 Testing CombatPure module...');
      
      // Test 1: Create basic combatants
      const player = CombatUtils.createStandardSpirit(1, 'Player', 5, 100, 50, 30, 20);
      const enemy = CombatUtils.createStandardSpirit(2, 'Enemy', 3, 80, 40, 25, 15);
      
      console.info('✅ Created combatants');
      
      // Test 2: Add to battle engine
      this.battleEngine.addCombatant(player);
      this.battleEngine.addCombatant(enemy);
      
      console.info('✅ Added combatants to battle');
      
      // Test 3: Create moves
      const basicAttack = CombatUtils.createStandardMove('basic_attack', 'Basic Attack', MoveCategory.PHYSICAL, 40, 'normal');
//       const specialAttack = CombatUtils.createStandardMove('special_attack', 'Special Attack', MoveCategory.SPECIAL, 60, 'fire');
      
      console.info('✅ Created moves');
      
      // Test 4: Test damage calculation
      const damageCalc = new DamageCalculator(this.typeChart);
      const damageResult = damageCalc.calculateDamage(basicAttack, player, enemy);
      
      console.info(`✅ Damage calculation: ${damageResult.damage} damage`);
      
      // Test 5: Test battle actions
      this.battleEngine.startBattle();
      this.battleEngine.enqueueAction({
        actorId: player.id,
        type: 'attack',
        targetId: enemy.id,
        moveId: 'basic_attack',
        source: ActionSource.PLAYER
      });
      
      const turnResult = this.battleEngine.processTurn();
      console.info(`✅ Battle turn processed: ${turnResult.results.join(', ')}`);
      
      // Test 6: Validate combatants
      const playerErrors = CombatUtils.validateSpiritInstance(player);
      const enemyErrors = CombatUtils.validateSpiritInstance(enemy);
      
      if (playerErrors.length > 0 || enemyErrors.length > 0) {
        console.info('⚠️ Validation errors found');
      } else {
        console.info('✅ Combatant validation passed');
      }
      
      return {
        op: 'test',
        status: 'ok',
        result: {
          combatants: this.battleEngine.getAllCombatants().length,
          battlePhase: this.battleEngine.phase,
          turnNumber: this.battleEngine.turnNumber,
          isBattleOver: this.battleEngine.isBattleOver,
          damageTest: damageResult.damage,
          validationErrors: playerErrors.length + enemyErrors.length
        },
        message: 'CombatPure module test completed successfully'
      };
      
    } catch (error) {
      return {
        op: 'test',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'CombatPure module test failed'
      };
    }
  }

  // Create a new battle
  public createBattle(combatants: any[]): CLIResult {
    try {
      this.battleEngine = new BattleEngine(this.typeChart);
      
      for (const combatantData of combatants) {
        const combatant = new SpiritInstance(
          combatantData.id,
          combatantData.name,
          combatantData.team || 'neutral',
          combatantData.stats,
          combatantData.moves || [],
          combatantData.typeTag,
          combatantData.resourcePoints || 10
        );
        this.battleEngine.addCombatant(combatant);
      }
      
      this.battleEngine.startBattle();
      
      return {
        op: 'create_battle',
        status: 'ok',
        result: {
          combatants: this.battleEngine.getAllCombatants().length,
          phase: this.battleEngine.phase,
          turnNumber: this.battleEngine.turnNumber
        },
        message: 'Battle created successfully'
      };
      
    } catch (error) {
      return {
        op: 'create_battle',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Add a combatant to the current battle
  public addCombatant(combatantData: any): CLIResult {
    try {
      const combatant = new SpiritInstance(
        combatantData.id,
        combatantData.name,
        combatantData.team || 'neutral',
        combatantData.stats,
        combatantData.moves || [],
        combatantData.typeTag,
        combatantData.resourcePoints || 10
      );
      
      this.battleEngine.addCombatant(combatant);
      
      return {
        op: 'add_combatant',
        status: 'ok',
        result: {
          combatant: combatant.getCombatSummary(),
          totalCombatants: this.battleEngine.getAllCombatants().length
        },
        message: 'Combatant added successfully'
      };
      
    } catch (error) {
      return {
        op: 'add_combatant',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process a battle turn
  public processTurn(): CLIResult {
    try {
      const result = this.battleEngine.processTurn();
      
      return {
        op: 'process_turn',
        status: 'ok',
        result: {
          completed: result.completed,
          results: result.results,
          battleStatus: this.battleEngine.getBattleStatus()
        },
        message: result.completed ? 'Turn processed successfully' : 'No actions to process'
      };
      
    } catch (error) {
      return {
        op: 'process_turn',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get battle status
  public getStatus(): CLIResult {
    try {
      const status = this.battleEngine.getBattleStatus();
      const combatants = this.battleEngine.getAllCombatants();
      
      return {
        op: 'get_status',
        status: 'ok',
        result: {
          battleStatus: status,
          combatants: combatants.map(c => ({
            id: c.id,
            name: c.name,
            team: c.team,
            hp: c.stats.hp,
            maxHp: c.stats.maxHp,
            status: c.status
          })),
          phase: this.battleEngine.phase,
          turnNumber: this.battleEngine.turnNumber
        },
        message: 'Battle status retrieved successfully'
      };
      
    } catch (error) {
      return {
        op: 'get_status',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Create a move
  public createMove(moveData: any): CLIResult {
    try {
      const move = new MoveData(
        moveData.id,
        moveData.name,
        moveData.category || MoveCategory.PHYSICAL,
        moveData.power || 40,
        moveData.accuracy || 0.95,
        moveData.cost || 0,
        moveData.typeTag || 'normal',
        moveData.statusEffectId,
        moveData.animationTag,
        moveData.effects,
        moveData.priority || 0
      );
      
      const validationErrors = move.validate();
      
      return {
        op: 'create_move',
        status: validationErrors.length === 0 ? 'ok' : 'error',
        result: {
          move: move.getSummary(),
          validationErrors
        },
        message: validationErrors.length === 0 ? 'Move created successfully' : 'Move validation failed'
      };
      
    } catch (error) {
      return {
        op: 'create_move',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Calculate damage
  public calculateDamage(moveData: any, attackerData: any, defenderData: any): CLIResult {
    try {
      const move = new MoveData(
        moveData.id || 'test_move',
        moveData.name || 'Test Move',
        moveData.category || MoveCategory.PHYSICAL,
        moveData.power || 40,
        moveData.accuracy || 0.95,
        moveData.cost || 0,
        moveData.typeTag || 'normal'
      );
      
      const attacker = new SpiritInstance(
        attackerData.id || 'attacker',
        attackerData.name || 'Attacker',
        attackerData.team || 'neutral',
        attackerData.stats || { hp: 100, maxHp: 100, atk: 50, def: 30, spd: 20 },
        attackerData.moves || [],
        attackerData.typeTag
      );
      
      const defender = new SpiritInstance(
        defenderData.id || 'defender',
        defenderData.name || 'Defender',
        defenderData.team || 'neutral',
        defenderData.stats || { hp: 100, maxHp: 100, atk: 50, def: 30, spd: 20 },
        defenderData.moves || [],
        defenderData.typeTag
      );
      
      const damageCalc = new DamageCalculator(this.typeChart);
      const result = damageCalc.calculateDamage(move, attacker, defender);
      
      return {
        op: 'calculate_damage',
        status: 'ok',
        result: {
          damage: result.damage,
          isCritical: result.isCritical,
          effectiveness: result.effectiveness,
          messages: result.messages
        },
        message: 'Damage calculated successfully'
      };
      
    } catch (error) {
      return {
        op: 'calculate_damage',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get help information
  public help(): CLIResult {
    return {
      op: 'help',
      status: 'ok',
      result: {
        commands: [
          'test - Test CombatPure module functionality',
          'create_battle <combatants> - Create a new battle',
          'add_combatant <combatant> - Add combatant to current battle',
          'process_turn - Process next battle turn',
          'get_status - Get current battle status',
          'create_move <move> - Create a new move',
          'calculate_damage <move> <attacker> <defender> - Calculate damage',
          'help - Show this help message'
        ],
        examples: [
          'npx tsx cliHarness.ts test',
          'npx tsx cliHarness.ts create_battle \'[{"id":"1","name":"Player","stats":{"hp":100,"maxHp":100,"atk":50,"def":30,"spd":20}}]\'',
          'npx tsx cliHarness.ts get_status'
        ]
      },
      message: 'CombatPure CLI help'
    };
  }
}

// CLI execution
function main(...args: any[]) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const cli = new CombatCLI();
  let result: CLIResult;
  
  try {
    switch (command) {
      case 'test':
        result = cli.test();
        break;
        
      case 'create_battle':
        const combatantsData = args[1] ? SafeJSONParser.parse(args[1]) : [];
        result = cli.createBattle(combatantsData);
        break;
        
      case 'add_combatant':
        const combatantData = args[1] ? SafeJSONParser.parse(args[1]) : {};
        result = cli.addCombatant(combatantData);
        break;
        
      case 'process_turn':
        result = cli.processTurn();
        break;
        
      case 'get_status':
        result = cli.getStatus();
        break;
        
      case 'create_move':
        const moveData = args[1] ? SafeJSONParser.parse(args[1]) : {};
        result = cli.createMove(moveData);
        break;
        
      case 'calculate_damage':
        const move = args[1] ? SafeJSONParser.parse(args[1]) : {};
        const attacker = args[2] ? SafeJSONParser.parse(args[2]) : {};
        const defender = args[3] ? SafeJSONParser.parse(args[3]) : {};
        result = cli.calculateDamage(move, attacker, defender);
        break;
        
      case 'help':
      default:
        result = cli.help();
        break;
    }
    
    console.info(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.info(JSON.stringify({
      op: command,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Command execution failed'
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CombatCLI };