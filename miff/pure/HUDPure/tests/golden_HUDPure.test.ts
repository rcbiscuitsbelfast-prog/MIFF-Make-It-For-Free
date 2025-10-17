/**
 * HUDPure Golden Tests
 *
 * Comprehensive tests for the HUDPure battle HUD management system.
 * Tests cover spirit management, turn states, battle progression, and rendering.
 */

import {
  SpiritHUDState,
  TurnHUDState,
  BattleHUDModel,
  HUDManager,
  CLIHUDRenderer,
  HUDPureUtils,
  IHUDUpdateEvent,
  HUDUpdateType
} from '../index';

describe('HUDPure Golden Tests', () => {
  describe('SpiritHUDState Basic Functionality', () => {
    test('should create spirit with default values', () => {
      const spirit = new SpiritHUDState();
      expect(spirit.spiritId).toBe('');
      expect(spirit.name).toBe('');
      expect(spirit.currentHP).toBe(0);
      expect(spirit.maxHP).toBe(1);
      expect(spirit.statusEffects).toHaveLength(0);
      expect(spirit.isKO).toBe(true);
    });

    test('should create spirit with custom values', () => {
      const spirit = new SpiritHUDState('test_id', 'Test Spirit', 100, 120, ['poison', 'regen'], 15, 'fire', 1);
      expect(spirit.spiritId).toBe('test_id');
      expect(spirit.name).toBe('Test Spirit');
      expect(spirit.currentHP).toBe(100);
      expect(spirit.maxHP).toBe(120);
      expect(spirit.statusEffects).toEqual(['poison', 'regen']);
      expect(spirit.level).toBe(15);
      expect(spirit.element).toBe('fire');
      expect(spirit.position).toBe(1);
    });

    test('should enforce HP constraints', () => {
      const spirit = new SpiritHUDState('test', 'Test', 150, 100, [], 10);
      expect(spirit.currentHP).toBe(100); // Should be clamped to maxHP
    });

    test('should calculate HP percentage correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 75, 100);
      expect(spirit.hpPercentage).toBe(75);
    });

    test('should determine health status correctly', () => {
      const fullHealth = new SpiritHUDState('test1', 'Test1', 100, 100);
      const highHealth = new SpiritHUDState('test2', 'Test2', 80, 100);
      const mediumHealth = new SpiritHUDState('test3', 'Test3', 60, 100);
      const lowHealth = new SpiritHUDState('test4', 'Test4', 30, 100);
      const criticalHealth = new SpiritHUDState('test5', 'Test5', 20, 100);
      const koSpirit = new SpiritHUDState('test6', 'Test6', 0, 100);

      expect(fullHealth.healthStatus).toBe('full');
      expect(highHealth.healthStatus).toBe('high');
      expect(mediumHealth.healthStatus).toBe('medium');
      expect(lowHealth.healthStatus).toBe('low');
      expect(criticalHealth.healthStatus).toBe('critical');
      expect(koSpirit.healthStatus).toBe('ko');
    });

    test('should determine health condition flags correctly', () => {
      const fullHealth = new SpiritHUDState('test1', 'Test1', 100, 100);
      const halfHealth = new SpiritHUDState('test2', 'Test2', 50, 100);
      const quarterHealth = new SpiritHUDState('test3', 'Test3', 25, 100);
      const koSpirit = new SpiritHUDState('test4', 'Test4', 0, 100);

      expect(fullHealth.isFullHealth).toBe(true);
      expect(halfHealth.isLowHealth).toBe(true);
      expect(quarterHealth.isCritical).toBe(true);
      expect(koSpirit.isKO).toBe(true);
    });

    test('should generate health bar correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 15, 20);
      const healthBar = spirit.getHealthBar(10);
      expect(healthBar).toMatch(/\[#{7}-{3}\]/); // 15/20 = 75% = 7 filled, 3 empty
    });

    test('should format status effects correctly', () => {
      const spirit1 = new SpiritHUDState('test1', 'Test1', 100, 100, []);
      const spirit2 = new SpiritHUDState('test2', 'Test2', 100, 100, ['poison']);
      const spirit3 = new SpiritHUDState('test3', 'Test3', 100, 100, ['poison', 'regen', 'burn']);

      expect(spirit1.getStatusString()).toBe('-');
      expect(spirit2.getStatusString()).toBe('poison');
      expect(spirit3.getStatusString()).toBe('poison,regen,burn');
    });

    test('should format display name correctly', () => {
      const spirit1 = new SpiritHUDState('test1', 'Test Spirit', 100, 100);
      const spirit2 = new SpiritHUDState('test2', 'Test Spirit', 100, 100, [], 15);
      const spirit3 = new SpiritHUDState('test3', 'Test Spirit', 100, 100, [], 15, 'fire');
      const spirit4 = new SpiritHUDState('test4', 'Test Spirit', 100, 100, [], 15, 'fire', 1);

      expect(spirit1.getDisplayName()).toBe('Test Spirit');
      expect(spirit2.getDisplayName()).toBe('Test Spirit (Lv.15)');
      expect(spirit3.getDisplayName()).toBe('Test Spirit (Lv.15) [fire]');
      expect(spirit4.getDisplayName()).toBe('Test Spirit (Lv.15) [fire]');
    });

    test('should handle damage correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 100, 100);
      const actualDamage = spirit.takeDamage(30);

      expect(actualDamage).toBe(30);
      expect(spirit.currentHP).toBe(70);
    });

    test('should handle healing correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 70, 100);
      const actualHeal = spirit.heal(25);

      expect(actualHeal).toBe(25);
      expect(spirit.currentHP).toBe(95);
    });

    test('should handle over-healing correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 90, 100);
      const actualHeal = spirit.heal(25);

      expect(actualHeal).toBe(10); // Only 10 needed to reach max
      expect(spirit.currentHP).toBe(100);
    });

    test('should handle over-damage correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 30, 100);
      const actualDamage = spirit.takeDamage(50);

      expect(actualDamage).toBe(30); // Only 30 HP remaining
      expect(spirit.currentHP).toBe(0);
    });

    test('should manage status effects correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 100, 100);

      // Add effects
      spirit.addStatusEffect('poison');
      spirit.addStatusEffect('regen');
      expect(spirit.statusEffects).toEqual(['poison', 'regen']);

      // Add duplicate effect (should not add)
      spirit.addStatusEffect('poison');
      expect(spirit.statusEffects).toEqual(['poison', 'regen']);

      // Check effect presence
      expect(spirit.hasStatusEffect('poison')).toBe(true);
      expect(spirit.hasStatusEffect('burn')).toBe(false);

      // Remove effect
      const removed = spirit.removeStatusEffect('poison');
      expect(removed).toBe(true);
      expect(spirit.statusEffects).toEqual(['regen']);

      // Remove non-existent effect
      const notRemoved = spirit.removeStatusEffect('burn');
      expect(notRemoved).toBe(false);
      expect(spirit.statusEffects).toEqual(['regen']);
    });

    test('should clone correctly', () => {
      const original = new SpiritHUDState('test', 'Test', 75, 100, ['poison'], 15, 'fire', 1);
      const clone = original.clone();

      expect(clone.spiritId).toBe(original.spiritId);
      expect(clone.name).toBe(original.name);
      expect(clone.currentHP).toBe(original.currentHP);
      expect(clone.maxHP).toBe(original.maxHP);
      expect(clone.statusEffects).toEqual(original.statusEffects);
      expect(clone.level).toBe(original.level);
      expect(clone.element).toBe(original.element);
      expect(clone.position).toBe(original.position);
      expect(clone).not.toBe(original);
      expect(clone.statusEffects).not.toBe(original.statusEffects); // Deep clone
    });

    test('should create snapshots correctly', () => {
      const spirit = new SpiritHUDState('test', 'Test', 75, 100, ['poison'], 15, 'fire', 1);
      const snapshot = spirit.snapshot();

      expect(snapshot.spiritId).toBe(spirit.spiritId);
      expect(snapshot.name).toBe(spirit.name);
      expect(snapshot.currentHP).toBe(spirit.currentHP);
      expect(snapshot.maxHP).toBe(spirit.maxHP);
      expect(snapshot.statusEffects).toEqual(spirit.statusEffects);
      expect(snapshot.level).toBe(spirit.level);
      expect(snapshot.element).toBe(spirit.element);
      expect(snapshot.position).toBe(spirit.position);
      expect(snapshot.isKO).toBe(spirit.isKO);
    });

    test('should validate correctly', () => {
      const validSpirit = new SpiritHUDState('test', 'Test', 75, 100, ['poison'], 15, 'fire', 1);
      expect(validSpirit.validate()).toHaveLength(0);

      const invalidSpirit = new SpiritHUDState('', '', 150, 0, [], 0);
      const errors = invalidSpirit.validate();
      expect(errors).toContain('Spirit ID cannot be empty');
      expect(errors).toContain('Name cannot be empty');
      expect(errors).toContain('Max HP must be greater than 0');
      expect(errors).toContain('Current HP cannot exceed max HP');
      expect(errors).toContain('Level must be at least 1');
    });
  });

  describe('TurnHUDState Basic Functionality', () => {
    test('should create turn state with default values', () => {
      const turn = new TurnHUDState();
      expect(turn.phaseName).toBe('');
      expect(turn.activeSpiritId).toBeUndefined();
      expect(turn.actionPreview).toBeUndefined();
      expect(turn.turnNumber).toBeUndefined();
      expect(turn.roundNumber).toBeUndefined();
    });

    test('should create turn state with custom values', () => {
      const turn = new TurnHUDState('SelectAction', 'spirit1', 'attack -> spirit2', 1, 1);
      expect(turn.phaseName).toBe('SelectAction');
      expect(turn.activeSpiritId).toBe('spirit1');
      expect(turn.actionPreview).toBe('attack -> spirit2');
      expect(turn.turnNumber).toBe(1);
      expect(turn.roundNumber).toBe(1);
    });

    test('should generate display string correctly', () => {
      const turn1 = new TurnHUDState('SelectAction', 'spirit1', 'attack -> spirit2', 1, 1);
      const turn2 = new TurnHUDState('ResolveAction');
      const turn3 = new TurnHUDState('TurnEnd', undefined, undefined, 2);

      expect(turn1.getDisplayString()).toBe('Phase: SelectAction | Turn: 1 | Round: 1 | Active: spirit1 | Action: attack -> spirit2');
      expect(turn2.getDisplayString()).toBe('Phase: ResolveAction');
      expect(turn3.getDisplayString()).toBe('Phase: TurnEnd | Turn: 2');
    });

    test('should check phase correctly', () => {
      const turn = new TurnHUDState('SelectAction', 'spirit1');

      expect(turn.isPhase('SelectAction')).toBe(true);
      expect(turn.isPhase('selectaction')).toBe(true); // Case insensitive
      expect(turn.isPhase('ResolveAction')).toBe(false);
    });

    test('should identify action and resolution phases', () => {
      const actionTurn = new TurnHUDState('SelectAction');
      const resolveTurn = new TurnHUDState('ResolveAction');
      const otherTurn = new TurnHUDState('TurnEnd');

      expect(actionTurn.isActionPhase).toBe(true);
      expect(resolveTurn.isResolutionPhase).toBe(true);
      expect(otherTurn.isActionPhase).toBe(false);
      expect(otherTurn.isResolutionPhase).toBe(false);
    });

    test('should clone correctly', () => {
      const original = new TurnHUDState('SelectAction', 'spirit1', 'attack', 1, 1);
      const clone = original.clone();

      expect(clone.phaseName).toBe(original.phaseName);
      expect(clone.activeSpiritId).toBe(original.activeSpiritId);
      expect(clone.actionPreview).toBe(original.actionPreview);
      expect(clone.turnNumber).toBe(original.turnNumber);
      expect(clone.roundNumber).toBe(original.roundNumber);
      expect(clone).not.toBe(original);
    });

    test('should validate correctly', () => {
      const validTurn = new TurnHUDState('SelectAction', 'spirit1', 'attack', 1, 1);
      expect(validTurn.validate()).toHaveLength(0);

      const invalidTurn = new TurnHUDState('', 'spirit1', 'attack', -1, -1);
      const errors = invalidTurn.validate();
      expect(errors).toContain('Phase name cannot be empty');
      expect(errors).toContain('Turn number cannot be negative');
      expect(errors).toContain('Round number cannot be negative');
    });
  });

  describe('BattleHUDModel Basic Functionality', () => {
    let playerSpirit: SpiritHUDState;
    let opponentSpirit: SpiritHUDState;
    let turnState: TurnHUDState;
    let hudModel: BattleHUDModel;

    beforeEach(() => {
      playerSpirit = new SpiritHUDState('player1', 'Player 1', 100, 100, ['regen'], 15, 'water', 1);
      opponentSpirit = new SpiritHUDState('opponent1', 'Opponent 1', 80, 100, ['poison'], 16, 'fire', 1);
      turnState = new TurnHUDState('SelectAction', 'player1', 'attack -> opponent1', 1, 1);
      hudModel = new BattleHUDModel([playerSpirit], [opponentSpirit], turnState);
    });

    test('should create model with spirits and turn state', () => {
      expect(hudModel.player).toHaveLength(1);
      expect(hudModel.opponent).toHaveLength(1);
      expect(hudModel.turn.phaseName).toBe('SelectAction');
    });

    test('should get all spirits correctly', () => {
      const allSpirits = hudModel.allSpirits;
      expect(allSpirits).toHaveLength(2);
      expect(allSpirits[0].spiritId).toBe('player1');
      expect(allSpirits[1].spiritId).toBe('opponent1');
    });

    test('should get living and KO spirits correctly', () => {
      expect(hudModel.livingSpirits).toHaveLength(2);

      // Make opponent KO
      hudModel.opponent[0].currentHP = 0;
      expect(hudModel.livingSpirits).toHaveLength(1);
      expect(hudModel.koSpirits).toHaveLength(1);
    });

    test('should get spirit by ID correctly', () => {
      expect(hudModel.getSpirit('player1')).toBe(playerSpirit);
      expect(hudModel.getSpirit('opponent1')).toBe(opponentSpirit);
      expect(hudModel.getSpirit('nonexistent')).toBeNull();
    });

    test('should get spirits by side correctly', () => {
      const playerSpirits = hudModel.getSpiritsBySide('player');
      const opponentSpirits = hudModel.getSpiritsBySide('opponent');

      expect(playerSpirits).toHaveLength(1);
      expect(opponentSpirits).toHaveLength(1);
      expect(playerSpirits[0].spiritId).toBe('player1');
      expect(opponentSpirits[0].spiritId).toBe('opponent1');
    });

    test('should add spirits correctly', () => {
      const newSpirit = new SpiritHUDState('player2', 'Player 2', 50, 50, [], 10, 'grass', 2);
      const success = hudModel.addSpirit(newSpirit, 'player');

      expect(success).toBe(true);
      expect(hudModel.player).toHaveLength(2);
      expect(hudModel.player[1]).toBe(newSpirit);
    });

    test('should reject invalid spirits', () => {
      const invalidSpirit = new SpiritHUDState('', '', 50, 0, [], 0);
      const success = hudModel.addSpirit(invalidSpirit, 'player');

      expect(success).toBe(false);
      expect(hudModel.player).toHaveLength(1);
    });

    test('should reject duplicate spirits', () => {
      const duplicateSpirit = new SpiritHUDState('player1', 'Duplicate', 50, 50);
      const success = hudModel.addSpirit(duplicateSpirit, 'player');

      expect(success).toBe(false);
      expect(hudModel.player).toHaveLength(1);
    });

    test('should remove spirits correctly', () => {
      const removed = hudModel.removeSpirit('player1');
      expect(removed).toBe(true);
      expect(hudModel.player).toHaveLength(0);
    });

    test('should handle non-existent spirit removal', () => {
      const removed = hudModel.removeSpirit('nonexistent');
      expect(removed).toBe(false);
    });

    test('should update spirits correctly', () => {
      const success = hudModel.updateSpirit('player1', { currentHP: 80, statusEffects: ['poison'] });
      expect(success).toBe(true);
      expect(hudModel.player[0].currentHP).toBe(80);
      expect(hudModel.player[0].statusEffects).toContain('poison');
    });

    test('should reject invalid spirit updates', () => {
      const success1 = hudModel.updateSpirit('player1', { maxHP: 0 });
      const success2 = hudModel.updateSpirit('player1', { currentHP: 150 });

      expect(success1).toBe(false);
      expect(success2).toBe(false);
      expect(hudModel.player[0].maxHP).toBe(100); // Should not change
      expect(hudModel.player[0].currentHP).toBe(100); // Should not change
    });

    test('should handle non-existent spirit updates', () => {
      const success = hudModel.updateSpirit('nonexistent', { currentHP: 50 });
      expect(success).toBe(false);
    });

    test('should update turn state correctly', () => {
      hudModel.updateTurn({ phaseName: 'ResolveAction', turnNumber: 2 });
      expect(hudModel.turn.phaseName).toBe('ResolveAction');
      expect(hudModel.turn.turnNumber).toBe(2);
    });

    test('should get battle summary correctly', () => {
      const summary = hudModel.getBattleSummary();

      expect(summary.playerCount).toBe(1);
      expect(summary.opponentCount).toBe(1);
      expect(summary.playerLiving).toBe(1);
      expect(summary.opponentLiving).toBe(1);
      expect(summary.totalDamage).toBe(20); // 100-100 + 100-80
      expect(summary.battlePhase).toBe('SelectAction');
    });

    test('should determine battle status correctly', () => {
      expect(hudModel.isBattleOver).toBe(false);
      expect(hudModel.battleResult).toBe('ongoing');

      // KO opponent
      hudModel.opponent[0].currentHP = 0;
      expect(hudModel.isBattleOver).toBe(true);
      expect(hudModel.battleResult).toBe('player_win');

      // Also KO player
      hudModel.player[0].currentHP = 0;
      expect(hudModel.battleResult).toBe('opponent_win');
    });

    test('should clone correctly', () => {
      const clone = hudModel.clone();

      expect(clone.player).toHaveLength(1);
      expect(clone.opponent).toHaveLength(1);
      expect(clone.turn.phaseName).toBe(hudModel.turn.phaseName);
      expect(clone).not.toBe(hudModel);
      expect(clone.player[0]).not.toBe(hudModel.player[0]); // Deep clone
    });

    test('should create snapshots correctly', () => {
      const snapshot = hudModel.snapshot();

      expect(snapshot.player).toHaveLength(1);
      expect(snapshot.opponent).toHaveLength(1);
      expect(snapshot.turn.phaseName).toBe(hudModel.turn.phaseName);
      expect(snapshot.player[0]).not.toBeInstanceOf(SpiritHUDState); // Plain objects
    });

    test('should validate correctly', () => {
      expect(hudModel.validate()).toHaveLength(0);

      // Add invalid spirit
      const invalidSpirit = new SpiritHUDState('', '', 50, 0);
      hudModel.player.push(invalidSpirit);

      const errors = hudModel.validate();
      expect(errors).toContain('Player 1 (test): Max HP must be greater than 0');
      expect(errors).toContain('Spirit ID cannot be empty');
      expect(errors).toContain('Name cannot be empty');
    });
  });

  describe('CLIHUDRenderer Basic Functionality', () => {
    let renderer: CLIHUDRenderer;
    let hudModel: BattleHUDModel;

    beforeEach(() => {
      renderer = new CLIHUDRenderer();

      const playerSpirit = new SpiritHUDState('player1', 'Player 1', 75, 100, ['regen']);
      const opponentSpirit = new SpiritHUDState('opponent1', 'Opponent 1', 45, 80, ['poison']);
      const turnState = new TurnHUDState('SelectAction', 'player1', 'attack -> opponent1', 1, 1);

      hudModel = new BattleHUDModel([playerSpirit], [opponentSpirit], turnState);
    });

    test('should render complete HUD', () => {
      const output = renderer.render(hudModel);

      expect(output).toContain('=== Player Spirits ===');
      expect(output).toContain('=== Opponent Spirits ===');
      expect(output).toContain('Phase: SelectAction | Turn: 1 | Round: 1 | Active: player1 | Action: attack -> opponent1');
      expect(output).toContain('Player 1 (player1)');
      expect(output).toContain('Opponent 1 (opponent1)');
    });

    test('should render individual spirits', () => {
      const playerSpirit = new SpiritHUDState('test', 'Test Spirit', 15, 20, ['poison', 'regen']);
      const output = renderer.renderSpirit(playerSpirit);

      expect(output).toContain('Test Spirit (test)');
      expect(output).toContain('HP 15/20');
      expect(output).toContain('status[poison,regen]');
      expect(output).toMatch(/\[#{15}-{5}\]/); // 15/20 = 75% = 15 filled, 5 empty in 20-char bar
    });

    test('should render turn state', () => {
      const turnState = new TurnHUDState('ResolveAction', 'spirit1', 'attack -> spirit2', 2, 3);
      const output = renderer.renderTurn(turnState);

      expect(output).toBe('Phase: ResolveAction | Turn: 2 | Round: 3 | Active: spirit1 | Action: attack -> spirit2');
    });

    test('should render health bars correctly', () => {
      const fullHealth = renderer.renderHealthBar(20, 20, 10);
      const halfHealth = renderer.renderHealthBar(10, 20, 10);
      const emptyHealth = renderer.renderHealthBar(0, 20, 10);

      expect(fullHealth).toBe('[##########]');
      expect(halfHealth).toBe('[#####-----]');
      expect(emptyHealth).toBe('[----------]');
    });

    test('should handle null HUD model', () => {
      const output = renderer.render(null as any);
      expect(output).toBe('(no HUD)');
    });
  });

  describe('HUDManager Basic Functionality', () => {
    let hudManager: HUDManager;
    let updateHistory: IHUDUpdateEvent[];

    beforeEach(() => {
      const playerSpirit = new SpiritHUDState('player1', 'Player 1', 100, 100);
      const opponentSpirit = new SpiritHUDState('opponent1', 'Opponent 1', 80, 100);
      const turnState = new TurnHUDState('SelectAction', 'player1');
      const hudModel = new BattleHUDModel([playerSpirit], [opponentSpirit], turnState);
      const renderer = new CLIHUDRenderer();

      hudManager = new HUDManager(hudModel, renderer);
      updateHistory = [];

      hudManager.onUpdate((event: any) => {
        updateHistory.push(event);
      });
    });

    test('should update model correctly', () => {
      const newPlayerSpirit = new SpiritHUDState('player2', 'Player 2', 50, 50);
      const newOpponentSpirit = new SpiritHUDState('opponent2', 'Opponent 2', 60, 60);
      const newTurnState = new TurnHUDState('ResolveAction', 'player2');

      hudManager.updateModel({
        player: [newPlayerSpirit],
        opponent: [newOpponentSpirit],
        turn: newTurnState
      });

      const model = hudManager.getModel();
      expect(model.player).toHaveLength(1);
      expect(model.player[0].spiritId).toBe('player2');
      expect(model.opponent).toHaveLength(1);
      expect(model.opponent[0].spiritId).toBe('opponent2');
      expect(model.turn.phaseName).toBe('ResolveAction');
    });

    test('should render current state', () => {
      const output = hudManager.render();
      expect(output).toContain('Player 1 (player1)');
      expect(output).toContain('Opponent 1 (opponent1)');
    });

    test('should track update events', () => {
      hudManager.updateSpirit('player1', { currentHP: 80 });
      hudManager.updateTurn({ turnNumber: 2 });
      hudManager.changePhase('ResolveAction', 'player1');

      expect(updateHistory).toHaveLength(3);
      expect(updateHistory[0].type).toBe(HUDUpdateType.SPIRIT_UPDATE);
      expect(updateHistory[0].spiritId).toBe('player1');
      expect(updateHistory[1].type).toBe(HUDUpdateType.TURN_UPDATE);
      expect(updateHistory[2].type).toBe(HUDUpdateType.PHASE_CHANGE);
    });

    test('should remove update callbacks', () => {
      const callback = (event: IHUDUpdateEvent) => {
        updateHistory.push(event);
      };

      hudManager.onUpdate(callback);
      expect(updateHistory).toHaveLength(0); // Callback not called yet

      hudManager.removeUpdateCallback(callback);
      hudManager.updateSpirit('player1', { currentHP: 80 });

      expect(updateHistory).toHaveLength(0); // Callback should have been removed
    });

    test('should clear HUD', () => {
      hudManager.clear();

      const model = hudManager.getModel();
      expect(model.player).toHaveLength(0);
      expect(model.opponent).toHaveLength(0);
      expect(model.turn.phaseName).toBe(''); // Empty turn state

      expect(updateHistory).toHaveLength(1);
      expect(updateHistory[0].type).toBe(HUDUpdateType.BATTLE_END);
    });
  });

  describe('HUDPureUtils', () => {
    test('should render health bar correctly', () => {
      expect(HUDPureUtils.renderHealthBar(20, 20, 10)).toBe('[##########]');
      expect(HUDPureUtils.renderHealthBar(10, 20, 10)).toBe('[#####-----]');
      expect(HUDPureUtils.renderHealthBar(0, 20, 10)).toBe('[----------]');
      expect(HUDPureUtils.renderHealthBar(5, 20, 10)).toBe('[##--------]');
    });

    test('should create standard HUD model', () => {
      const playerSpirits = [
        { spiritId: 'p1', name: 'Player 1', currentHP: 100, maxHP: 100, statusEffects: ['regen'] }
      ];

      const opponentSpirits = [
        { spiritId: 'o1', name: 'Opponent 1', currentHP: 80, maxHP: 100, statusEffects: ['poison'] }
      ];

      const turnState = { phaseName: 'SelectAction', activeSpiritId: 'p1' };

      const hudModel = HUDPureUtils.createStandardHUD(playerSpirits, opponentSpirits, turnState);

      expect(hudModel.player).toHaveLength(1);
      expect(hudModel.opponent).toHaveLength(1);
      expect(hudModel.turn.phaseName).toBe('SelectAction');
      expect(hudModel.turn.activeSpiritId).toBe('p1');
    });

    test('should create spirit from minimal data', () => {
      const spirit = HUDPureUtils.createSpirit('test', 'Test', 75, 100, {
        statusEffects: ['poison'],
        level: 15,
        element: 'fire'
      });

      expect(spirit.spiritId).toBe('test');
      expect(spirit.name).toBe('Test');
      expect(spirit.currentHP).toBe(75);
      expect(spirit.maxHP).toBe(100);
      expect(spirit.statusEffects).toEqual(['poison']);
      expect(spirit.level).toBe(15);
      expect(spirit.element).toBe('fire');
    });

    test('should calculate health stats correctly', () => {
      const playerSpirits = [
        new SpiritHUDState('p1', 'P1', 100, 100),
        new SpiritHUDState('p2', 'P2', 50, 100)
      ];

      const opponentSpirits = [
        new SpiritHUDState('o1', 'O1', 25, 100),
        new SpiritHUDState('o2', 'O2', 75, 100)
      ];

      const hudModel = new BattleHUDModel(playerSpirits, opponentSpirits, new TurnHUDState());

      const stats = HUDPureUtils.calculateHealthStats(hudModel);

      expect(stats.playerTotal).toBe(150); // 100 + 50
      expect(stats.opponentTotal).toBe(100); // 25 + 75
      expect(stats.playerAverage).toBe(75); // (100 + 50) / 2
      expect(stats.opponentAverage).toBe(50); // (25 + 75) / 2
    });

    test('should get spirits by priority correctly', () => {
      const koSpirit = new SpiritHUDState('ko', 'KO Spirit', 0, 100);
      const criticalSpirit = new SpiritHUDState('critical', 'Critical Spirit', 10, 100);
      const lowSpirit = new SpiritHUDState('low', 'Low Spirit', 30, 100);
      const healthySpirit = new SpiritHUDState('healthy', 'Healthy Spirit', 80, 100);

      const hudModel = new BattleHUDModel(
        [healthySpirit, criticalSpirit],
        [lowSpirit, koSpirit],
        new TurnHUDState()
      );

      const priorityOrder = HUDPureUtils.getSpiritsByPriority(hudModel);

      expect(priorityOrder[0].spiritId).toBe('ko'); // KO first
      expect(priorityOrder[1].spiritId).toBe('critical'); // Lowest HP
      expect(priorityOrder[2].spiritId).toBe('low');
      expect(priorityOrder[3].spiritId).toBe('healthy'); // Highest HP
    });

    test('should validate HUD model correctly', () => {
      const validModel = new BattleHUDModel(
        [new SpiritHUDState('p1', 'Player', 100, 100)],
        [new SpiritHUDState('o1', 'Opponent', 80, 100)],
        new TurnHUDState('SelectAction')
      );

      const invalidModel = new BattleHUDModel(
        [new SpiritHUDState('', '', 50, 0)],
        [],
        new TurnHUDState('')
      );

      expect(HUDPureUtils.validateHUDModel(validModel)).toHaveLength(0);
      const errors = HUDPureUtils.validateHUDModel(invalidModel);
      expect(errors).toContain('Max HP must be greater than 0');
      expect(errors).toContain('Phase name cannot be empty');
      expect(errors).toContain('Spirit ID cannot be empty');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete battle workflow', () => {
      const playerSpirit = new SpiritHUDState('hero', 'Hero', 100, 100, [], 20);
      const enemySpirit = new SpiritHUDState('goblin', 'Goblin', 30, 30, [], 5);

      const hudModel = new BattleHUDModel([playerSpirit], [enemySpirit], new TurnHUDState('SelectAction', 'hero'));
      const renderer = new CLIHUDRenderer();
      const hudManager = new HUDManager(hudModel, renderer);

      // Initial state
      expect(hudManager.getModel().turn.phaseName).toBe('SelectAction');

      // Change to action phase
      hudManager.changePhase('ResolveAction', 'hero', 'hero attacks goblin');
      expect(hudManager.getModel().turn.phaseName).toBe('ResolveAction');

      // Deal damage
      hudManager.updateSpirit('goblin', { currentHP: 15 });

      // Add status effects
      hudManager.updateSpirit('goblin', { statusEffects: ['poison'] });
      hudManager.updateSpirit('hero', { statusEffects: ['regen'] });

      // Verify final state
      const finalModel = hudManager.getModel();
      expect(finalModel.player[0].currentHP).toBe(100);
      expect(finalModel.opponent[0].currentHP).toBe(15);
      expect(finalModel.player[0].statusEffects).toContain('regen');
      expect(finalModel.opponent[0].statusEffects).toContain('poison');
    });

    test('should handle multi-spirit battles', () => {
      const playerSpirits = [
        new SpiritHUDState('warrior', 'Warrior', 150, 150, [], 25),
        new SpiritHUDState('mage', 'Mage', 80, 80, ['shield'], 22)
      ];

      const opponentSpirits = [
        new SpiritHUDState('orc', 'Orc', 120, 120, [], 24),
        new SpiritHUDState('archer', 'Archer', 60, 60, [], 23)
      ];

      const hudModel = new BattleHUDModel(playerSpirits, opponentSpirits, new TurnHUDState('SelectAction'));
      const hudManager = new HUDManager(hudModel, new CLIHUDRenderer());

      // Verify initial setup
      expect(hudModel.allSpirits).toHaveLength(4);
      expect(hudModel.livingSpirits).toHaveLength(4);

      // Simulate damage to multiple spirits
      hudManager.updateSpirit('orc', { currentHP: 100 });
      hudManager.updateSpirit('archer', { currentHP: 30 });
      hudManager.updateSpirit('mage', { currentHP: 60 });

      const updatedModel = hudManager.getModel();
      expect(updatedModel.opponent[0].currentHP).toBe(100);
      expect(updatedModel.opponent[1].currentHP).toBe(30);
      expect(updatedModel.player[1].currentHP).toBe(60);

      // Check battle status
      expect(updatedModel.isBattleOver).toBe(false);
      expect(updatedModel.battleResult).toBe('ongoing');
    });

    test('should handle battle end conditions', () => {
      const playerSpirit = new SpiritHUDState('hero', 'Hero', 10, 100, []);
      const enemySpirit = new SpiritHUDState('boss', 'Boss', 0, 200, []);

      const hudModel = new BattleHUDModel([playerSpirit], [enemySpirit], new TurnHUDState('ResolveAction'));
      const hudManager = new HUDManager(hudModel, new CLIHUDRenderer());

      // Boss is already KO, player should win
      expect(hudModel.isBattleOver).toBe(true);
      expect(hudModel.battleResult).toBe('player_win');

      // KO the player too
      hudManager.updateSpirit('hero', { currentHP: 0 });

      const finalModel = hudManager.getModel();
      expect(finalModel.isBattleOver).toBe(true);
      expect(finalModel.battleResult).toBe('opponent_win');
    });

    test('should handle status effect interactions', () => {
      const spirit1 = new SpiritHUDState('spirit1', 'Spirit 1', 100, 100, ['regen']);
      const spirit2 = new SpiritHUDState('spirit2', 'Spirit 2', 100, 100, []);

      const hudModel = new BattleHUDModel([spirit1], [spirit2], new TurnHUDState('SelectAction'));
      const hudManager = new HUDManager(hudModel, new CLIHUDRenderer());

      // Add multiple status effects
      hudManager.updateSpirit('spirit1', {
        statusEffects: ['poison', 'burn', 'haste', 'shield']
      });

      hudManager.updateSpirit('spirit2', {
        statusEffects: ['freeze', 'stun']
      });

      const updatedModel = hudManager.getModel();

      expect(updatedModel.player[0].statusEffects).toHaveLength(4);
      expect(updatedModel.player[0].hasStatusEffect('poison')).toBe(true);
      expect(updatedModel.player[0].hasStatusEffect('burn')).toBe(true);

      expect(updatedModel.opponent[0].statusEffects).toHaveLength(2);
      expect(updatedModel.opponent[0].hasStatusEffect('freeze')).toBe(true);
      expect(updatedModel.opponent[0].hasStatusEffect('stun')).toBe(true);

      // Test removal
      hudManager.updateSpirit('spirit1', { statusEffects: ['poison', 'haste'] });
      expect(hudManager.getModel().player[0].statusEffects).toEqual(['poison', 'haste']);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many spirits efficiently', () => {
      const playerSpirits: SpiritHUDState[] = [];
      const opponentSpirits: SpiritHUDState[] = [];

      // Create many spirits
      for (let i = 0; i < 50; i++) {
        playerSpirits.push(new SpiritHUDState(`player${i}`, `Player ${i}`, 100, 100, [], 10 + i));
        opponentSpirits.push(new SpiritHUDState(`opponent${i}`, `Opponent ${i}`, 100, 100, [], 10 + i));
      }

      const hudModel = new BattleHUDModel(playerSpirits, opponentSpirits, new TurnHUDState('SelectAction'));
      const hudManager = new HUDManager(hudModel, new CLIHUDRenderer());

      const startTime = performance.now();

      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        const randomPlayer = Math.floor(Math.random() * 50);
        const randomOpponent = Math.floor(Math.random() * 50);
        const damage = Math.floor(Math.random() * 20) + 1;

        hudManager.updateSpirit(`opponent${randomOpponent}`, {
          currentHP: Math.max(0, 100 - damage)
        });
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
      expect(hudModel.allSpirits).toHaveLength(100);
    });

    test('should handle rapid updates efficiently', () => {
      const spirit = new SpiritHUDState('test', 'Test', 100, 100);
      const hudModel = new BattleHUDModel([spirit], [], new TurnHUDState());
      const hudManager = new HUDManager(hudModel, new CLIHUDRenderer());

      let updateCount = 0;
      hudManager.onUpdate(() => updateCount++);

      const startTime = performance.now();

      // Rapid updates
      for (let i = 0; i < 1000; i++) {
        hudManager.updateSpirit('test', { currentHP: 100 - i });
        hudManager.updateTurn({ turnNumber: i + 1 });
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(updateCount).toBe(2000); // 1000 HP updates + 1000 turn updates
    });

    test('should handle large health value calculations efficiently', () => {
      const spirits: SpiritHUDState[] = [];

      // Create spirits with large HP values
      for (let i = 0; i < 100; i++) {
        spirits.push(new SpiritHUDState(`spirit${i}`, `Spirit ${i}`, 10000, 10000, [], 50));
      }

      const hudModel = new BattleHUDModel(spirits, [], new TurnHUDState());

      const startTime = performance.now();

      // Multiple calculations
      for (let i = 0; i < 100; i++) {
        const stats = HUDPureUtils.calculateHealthStats(hudModel);
        const priority = HUDPureUtils.getSpiritsByPriority(hudModel);
        const healthBar = HUDPureUtils.renderHealthBar(7500, 10000, 50);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });
  });
});