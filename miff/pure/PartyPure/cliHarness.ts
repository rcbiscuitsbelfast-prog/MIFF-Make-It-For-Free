#!/usr/bin/env node

/**
 * PartyPure CLI Harness
 *
 * Interactive CLI for testing PartyPure functionality.
 * Supports party management, member operations, KO handling, and status tracking.
 */

import * as readline from 'readline';
import { PartyManager, PartySlot, KOHandler, PartyUtils, IPartyMember } from './index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface CLIState {
  party: PartyManager;
  koHandler: KOHandler;
  selectedSlot: number;
}

function printHelp(): void {
  this.logger.info(`
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
  this.logger.info('\n🏰 Party Status:');
  this.logger.info(`Size: ${party.memberCount}/${party.maxSize}`);
  this.logger.info(`Active: ${party.activeMemberCount}`);
  this.logger.info(`KO: ${party.hasKOMembers() ? 'Yes' : 'No'}`);

  const summary = party.getStatusSummary();
  this.logger.info(`Total HP: ${summary.totalHP}/${summary.totalMaxHP}`);
  this.logger.info(`Average HP: ${summary.averageHPPercent.toFixed(1)}%`);

  if (summary.totalMembers === 0) {
    this.logger.info('  Party is empty');
  }
}

function printMembers(party: PartyManager): void {
  this.logger.info('\n👥 Party Members:');
  const members = party.getActiveMembers();

  if (members.length === 0) {
    this.logger.info('  No active members');
    return;
  }

  members.forEach((member, index) => {
    const hpPercent = ((member.currentHP / member.maxHP) * 100).toFixed(1);
    const status = member.currentHP <= 0 ? '💀 KO' : `❤️ ${member.currentHP}/${member.maxHP} (${hpPercent}%)`;
    this.logger.info(`  ${index}. ${member.name} [${member.id}] - ${status}`);
  });
}

function printSlots(party: PartyManager): void {
  this.logger.info('\n🎒 Party Slots:');
  party.slots.forEach((slot, index) => {
    if (slot.isEmpty) {
      this.logger.info(`  ${index}. [Empty]`);
    } else {
      const member = slot.member!;
      const hpPercent = ((member.currentHP / member.maxHP) * 100).toFixed(1);
      const status = slot.isKO ? '💀 KO' : `❤️ ${member.currentHP}/${member.maxHP} (${hpPercent}%)`;
      this.logger.info(`  ${index}. ${member.name} [${member.id}] - ${status}`);
    }
  });
}

function createDemoParty(): PartyManager {
  this.logger.info('🎮 Creating demo party...');

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

  this.logger.info('✅ Demo party created with 4 members');
  return party;
}

function runDemo(party: PartyManager, koHandler: KOHandler): void {
  this.logger.info('🎯 Running PartyPure Demo...\n');

  // Show initial state
  printPartyStatus(party);
  printMembers(party);

  // Simulate combat damage
  this.logger.info('\n⚔️  Simulating combat damage...');
  party.getMemberAt(0)!.currentHP = 25; // Hero takes damage
  party.getMemberAt(1)!.currentHP = 0;  // Mage gets KO'd

  this.logger.info('Mage has been knocked out!');
  koHandler.markKO('2');

  printPartyStatus(party);
  printMembers(party);

  // Heal party
  this.logger.info('\n🩹 Healing party...');
  const revivedMembers = party.healAll();
  revivedMembers.forEach(member => {
    koHandler.revive(member.id.toString());
    this.logger.info(`${member.name} has been revived!`);
  });

  printPartyStatus(party);
  printMembers(party);

  // Show utility functions
  this.logger.info('\n📊 Party Analysis:');
  const effectiveness = PartyUtils.calculateEffectiveness(party);
  this.logger.info(`Combat Effectiveness: ${effectiveness.toFixed(1)}%`);

  const lowest = PartyUtils.findLowestHPMember(party);
  if (lowest) {
    this.logger.info(`Lowest HP: ${lowest.name} (${((lowest.currentHP / lowest.maxHP) * 100).toFixed(1)}%)`);
  }

  const healable = PartyUtils.getHealableMembers(party);
  this.logger.info(`Members that can be healed: ${healable.length}`);

  const critical = PartyUtils.getCriticalMembers(party);
  this.logger.info(`Critical members: ${critical.length}`);

  // Demonstrate sorting
  this.logger.info('\n📋 Members by HP (ascending):');
  const sortedByHP = PartyUtils.getMembersByHP(party, true);
  sortedByHP.forEach(member => {
    const percent = ((member.currentHP / member.maxHP) * 100).toFixed(1);
    this.logger.info(`  ${member.name}: ${percent}%`);
  });
}

async function runCLI(): Promise<void> {
  const state: CLIState = {
    party: new PartyManager(6),
    koHandler: new KOHandler(),
    selectedSlot: 0
  };

  this.logger.info('🎮 PartyPure CLI - Type "help" for commands or "demo" to see party management in action\n');

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
          this.logger.info('❌ Usage: add <name> <maxHP> [currentHP]');
        } else {
          const name = args[0];
          const maxHP = parseInt(args[1]);
          const currentHP = args[2] ? parseInt(args[2]) : maxHP;

          if (isNaN(maxHP) || maxHP <= 0) {
            this.logger.info('❌ Max HP must be a positive number');
          } else {
            const member = PartyUtils.createPartyMember(Date.now().toString(), name, maxHP, currentHP);
            const success = state.party.addMember(member);
            this.logger.info(success ? '✅ Member added' : '❌ Party is full');
          }
        }
        break;

      case 'remove':
      case 'rem':
        if (args.length === 0) {
          this.logger.info('❌ Usage: remove <id>');
        } else {
          const memberId = args[0];
          const success = state.party.removeMember(memberId);
          this.logger.info(success ? '✅ Member removed' : '❌ Member not found');
        }
        break;

      case 'swap':
        if (args.length < 2) {
          this.logger.info('❌ Usage: swap <slot1> <slot2>');
        } else {
          const slotA = parseInt(args[0]);
          const slotB = parseInt(args[1]);

          if (isNaN(slotA) || isNaN(slotB)) {
            this.logger.info('❌ Slot indices must be numbers');
          } else {
            const success = state.party.swapMembers(slotA, slotB);
            this.logger.info(success ? '✅ Members swapped' : '❌ Invalid slots');
          }
        }
        break;

      case 'move':
        if (args.length < 2) {
          this.logger.info('❌ Usage: move <fromSlot> <toSlot>');
        } else {
          const fromSlot = parseInt(args[0]);
          const toSlot = parseInt(args[1]);

          if (isNaN(fromSlot) || isNaN(toSlot)) {
            this.logger.info('❌ Slot indices must be numbers');
          } else {
            const success = state.party.moveMember(fromSlot, toSlot);
            this.logger.info(success ? '✅ Member moved' : '❌ Cannot move to occupied slot');
          }
        }
        break;

      case 'heal':
        if (args.length === 0) {
          this.logger.info('❌ Usage: heal <id>');
        } else {
          const memberId = args[0];
          const member = state.party.getMemberAt(state.selectedSlot);
          if (member && (member.id.toString() === memberId || member.spiritId === memberId)) {
            const wasKO = member.currentHP <= 0;
            member.currentHP = member.maxHP;
            if (wasKO) {
              state.koHandler.revive(memberId);
              this.logger.info('✅ Member healed and revived!');
            } else {
              this.logger.info('✅ Member healed to full HP');
            }
          } else {
            this.logger.info('❌ Member not found or not in selected slot');
          }
        }
        break;

      case 'damage':
      case 'dmg':
        if (args.length < 2) {
          this.logger.info('❌ Usage: damage <id> <amount>');
        } else {
          const memberId = args[0];
          const amount = parseInt(args[1]);

          if (isNaN(amount) || amount <= 0) {
            this.logger.info('❌ Damage amount must be a positive number');
          } else {
            const member = state.party.getMemberAt(state.selectedSlot);
            if (member && (member.id.toString() === memberId || member.spiritId === memberId)) {
              const wasKO = member.currentHP > 0;
              member.currentHP = Math.max(0, member.currentHP - amount);
              if (wasKO && member.currentHP <= 0) {
                state.koHandler.markKO(memberId);
                this.logger.info('💀 Member knocked out!');
              } else {
                this.logger.info('✅ Damage dealt');
              }
            } else {
              this.logger.info('❌ Member not found or not in selected slot');
            }
          }
        }
        break;

      case 'ko':
        if (args.length === 0) {
          this.logger.info('❌ Usage: ko <id>');
        } else {
          const memberId = args[0];
          const success = state.koHandler.markKO(memberId);
          if (success) {
            state.party.handleKO(memberId);
            this.logger.info('💀 Member marked as KO');
          } else {
            this.logger.info('❌ Member not found or already KO');
          }
        }
        break;

      case 'revive':
        if (args.length === 0) {
          this.logger.info('❌ Usage: revive <id>');
        } else {
          const memberId = args[0];
          const success = state.koHandler.revive(memberId);
          if (success) {
            // Also heal the member
            const member = state.party.getMemberAt(state.selectedSlot);
            if (member && (member.id.toString() === memberId || member.spiritId === memberId)) {
              member.currentHP = member.maxHP;
            }
            this.logger.info('💚 Member revived!');
          } else {
            this.logger.info('❌ Member not found or not fainted');
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
        this.logger.info('\n📊 Party Summary:');
        this.logger.info(`Members: ${summary.totalMembers}/${state.party.maxSize}`);
        this.logger.info(`Active: ${summary.activeMembers}`);
        this.logger.info(`KO: ${summary.koMembers}`);
        this.logger.info(`Total HP: ${summary.totalHP}/${summary.totalMaxHP}`);
        this.logger.info(`Average HP: ${summary.averageHPPercent.toFixed(1)}%`);

        const effectiveness = PartyUtils.calculateEffectiveness(state.party);
        this.logger.info(`Combat Effectiveness: ${effectiveness.toFixed(1)}%`);
        break;

      case 'select':
        if (args.length === 0) {
          this.logger.info(`Current slot: ${state.selectedSlot}`);
        } else {
          const slot = parseInt(args[0]);
          if (isNaN(slot) || slot < 0 || slot >= state.party.maxSize) {
            this.logger.info(`❌ Invalid slot. Must be 0-${state.party.maxSize - 1}`);
          } else {
            state.selectedSlot = slot;
            this.logger.info(`Selected slot: ${slot}`);
          }
        }
        break;

      case 'clear':
        state.party.clear();
        state.koHandler.clear();
        this.logger.info('✅ Party cleared');
        break;

      case 'demo':
        state.party = createDemoParty();
        runDemo(state.party, state.koHandler);
        break;

      case 'quit':
      case 'exit':
      case 'q':
        this.logger.info('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          this.logger.info(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    this.logger.info('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch(error => {
    this.logger.error('❌ CLI Error:', error);
    process.exit(1);
  });
}