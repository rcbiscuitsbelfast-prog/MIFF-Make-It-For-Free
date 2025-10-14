#!/usr/bin/env node

/**
 * PartyPure CLI Harness
 *
 * Interactive CLI for testing PartyPure functionality.
 * Supports party management, member operations, KO handling, and status tracking.
 */

import * as readline from 'readline';
import { PartyManager, KOHandler, PartyUtils } from './index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface CLIState {
  // Auto-added common properties
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
  party: PartyManager;
  koHandler: KOHandler;
  selectedSlot: number;
}

function printHelp(): void {
  console.info(`
PartyPure CLI - Party Management Testing
========================================

Commands:
  help                    Show this help
  status                  Show party status
  add <name> <hp>         Add member to party
  remove <id>             Remove member from party
  swap <slot1> <slot2>    Swap members between slots
  move <from> <to>        Move member to another slot
  heal <id>               Heal member to full HP
  damage <id> <amount>    Deal damage to member
  ko <id>                 Mark member as KO
  revive <id>             Revive fainted member
  members                 List all party members
  slots                   Show slot information
  summary                 Show party statistics
  select <slot>           Select slot for operations
  clear                   Clear party
  demo                    Run comprehensive demo
  quit                    Exit CLI

Examples:
  add "Hero" 100
  add "Mage" 80
  status
  damage 0 25
  heal 0
  ko 1
  revive 1
  demo
`);
}

function printPartyStatus(party: PartyManager): void {
  console.info('\n🏰 Party Status:');
  console.info(`Size: ${party.memberCount}/${party.maxSize}`);
  console.info(`Active: ${party.activeMemberCount}`);
  console.info(`KO: ${party.hasKOMembers() ? 'Yes' : 'No'}`);

  const summary = party.getStatusSummary();
  console.info(`Total HP: ${summary.totalHP}/${summary.totalMaxHP}`);
  console.info(`Average HP: ${summary.averageHPPercent.toFixed(1)}%`);

  if (summary.totalMembers === 0) {
    console.info('  Party is empty');
  }
}

function printMembers(party: PartyManager): void {
  console.info('\n👥 Party Members:');
  const members = party.getActiveMembers();

  if (members.length === 0) {
    console.info('  No active members');
    return;
  }

  members.forEach((member, index) => {
    const hpPercent = ((member.currentHP / member.maxHP) * 100).toFixed(1);
    const status = member.currentHP <= 0 ? '💀 KO' : `❤️ ${member.currentHP}/${member.maxHP} (${hpPercent}%)`;
    console.info(`  ${index}. ${member.name} [${member.id}] - ${status}`);
  });
}

function printSlots(party: PartyManager): void {
  console.info('\n🎒 Party Slots:');
  party.slots.forEach((slot, index) => {
    if (slot.isEmpty) {
      console.info(`  ${index}. [Empty]`);
    } else {
      const member = slot.member!;
      const hpPercent = ((member.currentHP / member.maxHP) * 100).toFixed(1);
      const status = slot.isKO ? '💀 KO' : `❤️ ${member.currentHP}/${member.maxHP} (${hpPercent}%)`;
      console.info(`  ${index}. ${member.name} [${member.id}] - ${status}`);
    }
  });
}

function createDemoParty(): PartyManager {
  console.info('🎮 Creating demo party...');

  const party = new PartyManager(6);

  // Add some demo members
  const hero = PartyUtils.createPartyMember(1, 'Hero', 100, 85);
  const mage = PartyUtils.createPartyMember(2, 'Mage', 80, 60);
  const warrior = PartyUtils.createPartyMember(3, 'Warrior', 120, 120);
  const healer = PartyUtils.createPartyMember(4, 'Healer', 90, 45);

  party.addMember(hero);
  party.addMember(mage);
  party.addMember(warrior);
  party.addMember(healer);

  console.info('✅ Demo party created with 4 members');
  return party;
}

function runDemo(party: PartyManager, koHandler: KOHandler): void {
  console.info('🎯 Running PartyPure Demo...\n');

  // Show initial state
  printPartyStatus(party);
  printMembers(party);

  // Simulate combat damage
  console.info('\n⚔️  Simulating combat damage...');
  party.getMemberAt(0)?.currentHP = 25; // Hero takes damage
  party.getMemberAt(1)?.currentHP = 0;  // Mage gets KO'd

  console.info('Mage has been knocked out!');
  koHandler.markKO('2');

  printPartyStatus(party);
  printMembers(party);

  // Heal party
  console.info('\n🩹 Healing party...');
  const revivedMembers = party.healAll();
  revivedMembers.forEach(member => {
    koHandler.revive(member.id.toString());
    console.info(`${member.name} has been revived!`);
  });

  printPartyStatus(party);
  printMembers(party);

  // Show utility functions
  console.info('\n📊 Party Analysis:');
  const effectiveness = PartyUtils.calculateEffectiveness(party);
  console.info(`Combat Effectiveness: ${effectiveness.toFixed(1)}%`);

  const lowest = PartyUtils.findLowestHPMember(party);
  if (lowest) {
    console.info(`Lowest HP: ${lowest.name} (${((lowest.currentHP / lowest.maxHP) * 100).toFixed(1)}%)`);
  }

  const healable = PartyUtils.getHealableMembers(party);
  console.info(`Members that can be healed: ${healable.length}`);

  const critical = PartyUtils.getCriticalMembers(party);
  console.info(`Critical members: ${critical.length}`);

  // Demonstrate sorting
  console.info('\n📋 Members by HP (ascending):');
  const sortedByHP = PartyUtils.getMembersByHP(party, true);
  sortedByHP.forEach(member => {
    const percent = ((member.currentHP / member.maxHP) * 100).toFixed(1);
    console.info(`  ${member.name}: ${percent}%`);
  });
}

async function runCLI(): Promise<void> {
  const state: CLIState = {
    party: new PartyManager(6),
    koHandler: new KOHandler(),
    selectedSlot: 0
  };

  console.info('🎮 PartyPure CLI - Type "help" for commands or "demo" to see party management in action\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'party> '
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0]?.toLowerCase() || '';
    const args = parts.slice(1);

    switch (command) {
      case 'help':
      case 'h':
        printHelp();
        break;

      case 'status':
        printPartyStatus(state.party);
        break;

      case 'add':
        if (args.length < 2) {
          console.info('❌ Usage: add <name> <maxHP> [currentHP]');
        } else {
          const name = args[0];
          const maxHP = parseInt(args[1]);
          const currentHP = args[2] ? parseInt(args[2]) : maxHP;

          if (isNaN(maxHP) || maxHP <= 0) {
            console.info('❌ Max HP must be a positive number');
          } else {
            const member = PartyUtils.createPartyMember(Date.now().toString(), name, maxHP, currentHP);
            const success = state.party.addMember(member);
            console.info(success ? '✅ Member added' : '❌ Party is full');
          }
        }
        break;

      case 'remove':
      case 'rem':
        if (args.length === 0) {
          console.info('❌ Usage: remove <id>');
        } else {
          const memberId = args[0];
          const success = state.party.removeMember(memberId);
          console.info(success ? '✅ Member removed' : '❌ Member not found');
        }
        break;

      case 'swap':
        if (args.length < 2) {
          console.info('❌ Usage: swap <slot1> <slot2>');
        } else {
          const slotA = parseInt(args[0]);
          const slotB = parseInt(args[1]);

          if (isNaN(slotA) || isNaN(slotB)) {
            console.info('❌ Slot indices must be numbers');
          } else {
            const success = state.party.swapMembers(slotA, slotB);
            console.info(success ? '✅ Members swapped' : '❌ Invalid slots');
          }
        }
        break;

      case 'move':
        if (args.length < 2) {
          console.info('❌ Usage: move <fromSlot> <toSlot>');
        } else {
          const fromSlot = parseInt(args[0]);
          const toSlot = parseInt(args[1]);

          if (isNaN(fromSlot) || isNaN(toSlot)) {
            console.info('❌ Slot indices must be numbers');
          } else {
            const success = state.party.moveMember(fromSlot, toSlot);
            console.info(success ? '✅ Member moved' : '❌ Cannot move to occupied slot');
          }
        }
        break;

      case 'heal':
        if (args.length === 0) {
          console.info('❌ Usage: heal <id>');
        } else {
          const memberId = args[0];
          const member = state.party.getMemberAt(state.selectedSlot);
          if (member && (member.id.toString() === memberId || member.spiritId === memberId)) {
            const wasKO = member.currentHP <= 0;
            member.currentHP = member.maxHP;
            if (wasKO) {
              state.koHandler.revive(memberId);
              console.info('✅ Member healed and revived!');
            } else {
              console.info('✅ Member healed to full HP');
            }
          } else {
            console.info('❌ Member not found or not in selected slot');
          }
        }
        break;

      case 'damage':
      case 'dmg':
        if (args.length < 2) {
          console.info('❌ Usage: damage <id> <amount>');
        } else {
          const memberId = args[0];
          const amount = parseInt(args[1]);

          if (isNaN(amount) || amount <= 0) {
            console.info('❌ Damage amount must be a positive number');
          } else {
            const member = state.party.getMemberAt(state.selectedSlot);
            if (member && (member.id.toString() === memberId || member.spiritId === memberId)) {
              const wasKO = member.currentHP > 0;
              member.currentHP = Math.max(0, member.currentHP - amount);
              if (wasKO && member.currentHP <= 0) {
                state.koHandler.markKO(memberId);
                console.info('💀 Member knocked out!');
              } else {
                console.info('✅ Damage dealt');
              }
            } else {
              console.info('❌ Member not found or not in selected slot');
            }
          }
        }
        break;

      case 'ko':
        if (args.length === 0) {
          console.info('❌ Usage: ko <id>');
        } else {
          const memberId = args[0];
          const success = state.koHandler.markKO(memberId);
          if (success) {
            state.party.handleKO(memberId);
            console.info('💀 Member marked as KO');
          } else {
            console.info('❌ Member not found or already KO');
          }
        }
        break;

      case 'revive':
        if (args.length === 0) {
          console.info('❌ Usage: revive <id>');
        } else {
          const memberId = args[0];
          const success = state.koHandler.revive(memberId);
          if (success) {
            // Also heal the member
            const member = state.party.getMemberAt(state.selectedSlot);
            if (member && (member.id.toString() === memberId || member.spiritId === memberId)) {
              member.currentHP = member.maxHP;
            }
            console.info('💚 Member revived!');
          } else {
            console.info('❌ Member not found or not fainted');
          }
        }
        break;

      case 'members':
        printMembers(state.party);
        break;

      case 'slots':
        printSlots(state.party);
        break;

      case 'summary':
        const summary = state.party.getStatusSummary();
        console.info('\n📊 Party Summary:');
        console.info(`Members: ${summary.totalMembers}/${state.party.maxSize}`);
        console.info(`Active: ${summary.activeMembers}`);
        console.info(`KO: ${summary.koMembers}`);
        console.info(`Total HP: ${summary.totalHP}/${summary.totalMaxHP}`);
        console.info(`Average HP: ${summary.averageHPPercent.toFixed(1)}%`);

        const effectiveness = PartyUtils.calculateEffectiveness(state.party);
        console.info(`Combat Effectiveness: ${effectiveness.toFixed(1)}%`);
        break;

      case 'select':
        if (args.length === 0) {
          console.info(`Current slot: ${state.selectedSlot}`);
        } else {
          const slot = parseInt(args[0]);
          if (isNaN(slot) || slot < 0 || slot >= state.party.maxSize) {
            console.info(`❌ Invalid slot. Must be 0-${state.party.maxSize - 1}`);
          } else {
            state.selectedSlot = slot;
            console.info(`Selected slot: ${slot}`);
          }
        }
        break;

      case 'clear':
        state.party.clear();
        state.koHandler.clear();
        console.info('✅ Party cleared');
        break;

      case 'demo':
        state.party = createDemoParty();
        runDemo(state.party, state.koHandler);
        break;

      case 'quit':
      case 'exit':
      case 'q':
        console.info('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          console.info(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.info('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}