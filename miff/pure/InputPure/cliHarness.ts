#!/usr/bin/env node

/**
 * InputPure CLI Harness
 *
 * Interactive CLI for testing InputPure functionality.
 * Supports input profile management, action registration, and binding testing.
 */

import * as readline from 'readline';
import { InputProfile, InputAction, InputMapper, InputUtils, InputCategories, InputTokens } from './index';

interface CLIState {
  profile: InputProfile;
  mapper: InputMapper;
  currentCategory: string;
}

function printHelp(): void {
  console.log(`
InputPure CLI - Input Management Testing
========================================

Commands:
  help                    Show this help
  actions [category!]      List actions (optionally by category)
  bindings                Show current input bindings
  rebind <action> <input> Rebind an action to a new input
  test <input>            Test what action an input triggers
  add <id> <input> <cat>  Add new action (id, default_input, category)
  remove <id>             Remove an action
  category <cat>          Set current category for new actions
  load <preset>           Load preset action set
  clear                   Clear all bindings and actions
  demo                    Run demo sequence
  quit                    Exit CLI

Presets: standard, movement, combat, ui, debug

Examples:
  load standard
  actions movement
  rebind move_up w
  test w
  add custom_action space general
  demo
`);
}

function printActions(profile: InputProfile, category?: string): void {
  console.log('\n📋 Registered Actions:');
  const actions = category
    ? profile.getActionsByCategory(category)
    : Array.from(profile.getActions().values());

  if (actions.length === 0) {
    console.log('  No actions registered');
    return;
  }

  const categories = new Set(actions.map((a: any) => a.category));
  for (const cat of Array.from(categories).sort()) {
    console.log(`\n  ${cat.toUpperCase()}:`);
    const catActions = actions.filter((a: any) => a.category === cat);
    catActions.forEach((action: any) => {
      const bindings = Array.from(profile.getBindings().entries())
        .filter(([_, actionId]) => actionId === action.actionId)
        .map(([input, _]) => input);

      console.log(`    ${action.actionId}: ${action.defaultInput} (remappable: ${action.remappable})`);
      if (bindings.length > 0) {
        console.log(`      → ${bindings.join(', ')}`);
      }
    });
  }
}

function printBindings(profile: InputProfile): void {
  console.log('\n🔗 Current Bindings:');
  const bindings = profile.getBindings();

  if (bindings.size === 0) {
    console.log('  No bindings configured');
    return;
  }

  const sortedBindings = Array.from(bindings.entries()).sort(([a!], [b!]) => a.localeCompare(b));

  for (const [input, actionId] of sortedBindings) {
    const action = profile.getAction(actionId);
    console.log(`  ${input} → ${actionId}${action ? ` (${action.category})` : ''}`);
  }
}

function createDemoProfile(): InputProfile {
  console.log('🎮 Creating demo input profile...');

  const profile = new InputProfile();

  // Movement actions
  profile.registerAction(new InputAction('move_up', 'w', true, InputCategories.MOVEMENT));
  profile.registerAction(new InputAction('move_down', 's', true, InputCategories.MOVEMENT));
  profile.registerAction(new InputAction('move_left', 'a', true, InputCategories.MOVEMENT));
  profile.registerAction(new InputAction('move_right', 'd', true, InputCategories.MOVEMENT));
  profile.registerAction(new InputAction('jump', ' ', true, InputCategories.MOVEMENT));
  profile.registerAction(new InputAction('run', 'Shift', true, InputCategories.MOVEMENT));

  // Combat actions
  profile.registerAction(new InputAction('attack', 'MouseLeft', true, InputCategories.COMBAT));
  profile.registerAction(new InputAction('block', 'MouseRight', true, InputCategories.COMBAT));
  profile.registerAction(new InputAction('dodge', 'Space', true, InputCategories.COMBAT));
  profile.registerAction(new InputAction('use_item', '1', true, InputCategories.COMBAT));

  // UI actions
  profile.registerAction(new InputAction('interact', 'Enter', true, InputCategories.UI));
  profile.registerAction(new InputAction('cancel', 'Escape', true, InputCategories.UI));
  profile.registerAction(new InputAction('menu', 'Tab', true, InputCategories.UI));

  // Debug actions (some non-remappable)
  profile.registerAction(new InputAction('toggle_debug', 'F3', true, InputCategories.DEBUG));
  profile.registerAction(new InputAction('console', '`', true, InputCategories.DEBUG));
  profile.registerAction(new InputAction('god_mode', 'F2', false, InputCategories.DEBUG));

  console.log('✅ Demo profile created with actions in multiple categories');
  return profile;
}

function runDemo(profile: InputProfile): void {
  console.log('🎯 Running InputPure Demo...');

  // Show initial state
  printActions(profile);
  printBindings(profile);

  // Demonstrate rebinding
  console.log('\n🔄 Testing rebinding...');
  const success1 = profile.rebind('move_up', 'ArrowUp');
  console.log(`Rebind move_up to ArrowUp: ${success1 ? '✅ Success' : '❌ Failed'}`);

  const success2 = profile.rebind('god_mode', 'F1'); // Should fail (not remappable)
  console.log(`Rebind god_mode to F1: ${success2 ? '✅ Success' : '❌ Failed (expected)'}`);

  printBindings(profile);

  // Demonstrate input testing
  console.log('\n🧪 Testing inputs...');
  const testInputs = ['w', 'ArrowUp', 'd', 'F3', 'unknown_input'];

  testInputs.forEach((input: any) => {
    const action = profile.getActionForInput(input);
    console.log(`Input '${input}' → ${action ? action.actionId : 'no action'}`);
  });
}

async function runCLI(): Promise<void> {
  const state: CLIState = {
    profile: new InputProfile(),
    mapper: new InputMapper(new InputProfile()),
    currentCategory: InputCategories.GENERAL
  };

  console.log('🎮 InputPure CLI - Type "help" for commands or "demo" to see it in action\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'input> '
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0!]?.toLowerCase() || '';
    const args = parts.slice(1);

    switch (command) {
      case 'help':
      case 'h':
        printHelp();
        break;

      case 'actions':
      case 'list':
        const category = args[0!];
        printActions(state.profile, category);
        break;

      case 'bindings':
      case 'binds':
        printBindings(state.profile);
        break;

      case 'rebind':
      case 'bind':
        if (args.length < 2) {
          console.log('❌ Usage: rebind <action> <input>');
        } else {
          const [actionId, newInput] = args;
          const success = state.profile.rebind(actionId, newInput);
          console.log(`Rebind ${actionId} to ${newInput}: ${success ? '✅ Success' : '❌ Failed'}`);
        }
        break;

      case 'test':
      case 't':
        if (args.length === 0) {
          console.log('❌ Usage: test <input>');
        } else {
          const input = args[0!];
          const action = state.profile.getActionForInput(input);
          console.log(`Input '${input}' → ${action ? action.actionId + ' (' + action.category + ')' : 'no action'}`);
        }
        break;

      case 'add':
        if (args.length < 2) {
          console.log('❌ Usage: add <id> <input> [category!]');
        } else {
          const [actionId, defaultInput, category = state.currentCategory] = args;
          const action = new InputAction(actionId, defaultInput, true, category);
          state.profile.registerAction(action);
          console.log(`✅ Added action: ${actionId} (${category})`);
        }
        break;

      case 'remove':
      case 'rem':
        if (args.length === 0) {
          console.log('❌ Usage: remove <id>');
        } else {
          const actionId = args[0!];
          const success = state.profile.removeAction(actionId);
          console.log(`Remove ${actionId}: ${success ? '✅ Success' : '❌ Not found'}`);
        }
        break;

      case 'category':
      case 'cat':
        if (args.length === 0) {
          console.log(`Current category: ${state.currentCategory}`);
        } else {
          state.currentCategory = args[0!];
          console.log(`Set current category to: ${state.currentCategory}`);
        }
        break;

      case 'load':
      case 'preset':
        if (args.length === 0) {
          console.log('❌ Usage: load <preset>');
          console.log('Available presets: standard, movement, combat, ui, debug');
        } else {
          const preset = args[0!];
          state.profile.clear();

          switch (preset) {
            case 'standard':
              state.profile = InputUtils.createStandardProfile();
              console.log('✅ Loaded standard preset');
              break;
            case 'movement':
              InputUtils.createMovementActions().forEach((action: any) => state.profile.registerAction(action));
              console.log('✅ Loaded movement preset');
              break;
            case 'combat':
              InputUtils.createCombatActions().forEach((action: any) => state.profile.registerAction(action));
              console.log('✅ Loaded combat preset');
              break;
            case 'ui':
              InputUtils.createUIActions().forEach((action: any) => state.profile.registerAction(action));
              console.log('✅ Loaded UI preset');
              break;
            case 'debug':
              InputUtils.createDebugActions().forEach((action: any) => state.profile.registerAction(action));
              console.log('✅ Loaded debug preset');
              break;
            default:
              console.log(`❌ Unknown preset: ${preset}`);
          }

          state.mapper = new InputMapper(state.profile);
        }
        break;

      case 'clear':
        state.profile.clear();
        console.log('✅ Cleared all actions and bindings');
        break;

      case 'demo':
        state.profile = createDemoProfile();
        state.mapper = new InputMapper(state.profile);
        runDemo(state.profile);
        break;

      case 'quit':
      case 'exit':
      case 'q':
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  runCLI().catch(error => {
    console.error('❌ CLI Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}