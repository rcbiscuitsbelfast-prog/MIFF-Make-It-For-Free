/**
 * PartyPure Golden Tests
 *
 * Comprehensive tests for the PartyPure party management system.
 * Tests cover party operations, KO handling, status tracking, and edge cases.
 */

import { PartyManager, PartySlot, KOHandler, PartyUtils, IPartyMember } from '../index';

describe('PartyPure Golden Tests', () => {
  let party: PartyManager;
  let koHandler: KOHandler;

  beforeEach(() => {
    party = new PartyManager(6);
    koHandler = new KOHandler();
  });

  describe('PartySlot Basic Functionality', () => {
    test('should create empty slot correctly', () => {
      const slot = new PartySlot();
      expect(slot.isEmpty).toBe(true);
      expect(slot.isKO).toBe(false);
      expect(slot.member).toBeNull();
      expect(slot.getActiveMember()).toBeNull();
    });

    test('should handle member assignment', () => {
      const member: IPartyMember = {
        id: 1,
        name: 'Test',
        maxHP: 100,
        currentHP: 80,
        isKO: false
      };

      const slot = new PartySlot();
      slot.setMember(member);

      expect(slot.isEmpty).toBe(false);
      expect(slot.isKO).toBe(false);
      expect(slot.member).toBe(member);
      expect(slot.getActiveMember()).toBe(member);
    });

    test('should handle KO member', () => {
      const member: IPartyMember = {
        id: 1,
        name: 'Test',
        maxHP: 100,
        currentHP: 0,
        isKO: true
      };

      const slot = new PartySlot(member);
      expect(slot.isEmpty).toBe(false);
      expect(slot.isKO).toBe(true);
      expect(slot.getActiveMember()).toBeNull();
    });

    test('should handle healing to full', () => {
      const member: IPartyMember = {
        id: 1,
        name: 'Test',
        maxHP: 100,
        currentHP: 50,
        isKO: false
      };

      const slot = new PartySlot(member);
      const wasRevived = slot.healToFull();

      expect(wasRevived).toBe(false);
      expect(member.currentHP).toBe(100);
    });

    test('should handle damage', () => {
      const member: IPartyMember = {
        id: 1,
        name: 'Test',
        maxHP: 100,
        currentHP: 80,
        isKO: false
      };

      const slot = new PartySlot(member);
      const wasKO = slot.takeDamage(90);

      expect(wasKO).toBe(true);
      expect(member.currentHP).toBe(0);
    });
  });

  describe('PartyManager Basic Operations', () => {
    test('should create party with correct size', () => {
      const smallParty = new PartyManager(3);
      expect(smallParty.maxSize).toBe(3);
      expect(smallParty.slots).toHaveLength(3);
      expect(smallParty.memberCount).toBe(0);
      expect(smallParty.isEmpty).toBe(true);
    });

    test('should add members correctly', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 80,
        isKO: false
      };

      expect(party.addMember(member1)).toBe(true);
      expect(party.memberCount).toBe(1);
      expect(party.isEmpty).toBe(false);

      expect(party.addMember(member2)).toBe(true);
      expect(party.memberCount).toBe(2);

      expect(party.getMemberAt(0)).toBe(member1);
      expect(party.getMemberAt(1)).toBe(member2);
    });

    test('should reject adding to full party', () => {
      const fullParty = new PartyManager(1);

      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 80,
        isKO: false
      };

      expect(fullParty.addMember(member1)).toBe(true);
      expect(fullParty.isFull).toBe(true);

      expect(fullParty.addMember(member2)).toBe(false);
      expect(fullParty.memberCount).toBe(1);
    });

    test('should remove members correctly', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 'mage_2',
        name: 'Mage',
        maxHP: 80,
        currentHP: 80,
        isKO: false
      };

      party.addMember(member1);
      party.addMember(member2);

      expect(party.removeMember(1)).toBe(true);
      expect(party.memberCount).toBe(1);
      expect(party.getMemberAt(0)).toBeNull();

      expect(party.removeMember('mage_2')).toBe(true);
      expect(party.memberCount).toBe(0);
      expect(party.getMemberAt(1)).toBeNull();
    });
  });

  describe('Party Member Operations', () => {
    beforeEach(() => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 80,
        isKO: false
      };

      const member3: IPartyMember = {
        id: 3,
        name: 'Warrior',
        maxHP: 120,
        currentHP: 120,
        isKO: false
      };

      party.addMember(member1);
      party.addMember(member2);
      party.addMember(member3);
    });

    test('should swap members correctly', () => {
      const hero = party.getMemberAt(0);
      const mage = party.getMemberAt(1);

      expect(party.swapMembers(0, 1)).toBe(true);

      expect(party.getMemberAt(0)).toBe(mage);
      expect(party.getMemberAt(1)).toBe(hero);
    });

    test('should move members correctly', () => {
      expect(party.moveMember(0, 3)).toBe(true); // Move hero to empty slot 3
      expect(party.getMemberAt(0)).toBeNull();
      expect(party.getMemberAt(3)).not.toBeNull();
      expect(party.getMemberAt(3)?.name).toBe('Hero');
    });

    test('should handle KO operations', () => {
      expect(party.handleKO(1)).toBe(true);
      expect(party.getMemberAt(0)?.currentHP).toBe(0);
      expect(party.activeMemberCount).toBe(2);
    });

    test('should heal all members', () => {
      // Damage some members
      const hero = party.getMemberAt(0)!;
      const mage = party.getMemberAt(1)!;
      hero.currentHP = 25;
      mage.currentHP = 0;

      const revived = party.healAll();
      expect(revived).toHaveLength(1); // Mage was revived
      expect(hero.currentHP).toBe(100);
      expect(mage.currentHP).toBe(80);
      expect(party.activeMemberCount).toBe(3);
    });
  });

  describe('Party Status and Queries', () => {
    test('should provide correct status summary', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 75,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 40,
        isKO: false
      };

      const member3: IPartyMember = {
        id: 3,
        name: 'Warrior',
        maxHP: 120,
        currentHP: 0,
        isKO: true
      };

      party.addMember(member1);
      party.addMember(member2);
      party.addMember(member3);

      const summary = party.getStatusSummary();
      expect(summary.totalMembers).toBe(3);
      expect(summary.activeMembers).toBe(2);
      expect(summary.koMembers).toBe(1);
      expect(summary.totalHP).toBe(115); // 75 + 40 + 0
      expect(summary.totalMaxHP).toBe(300); // 100 + 80 + 120
      expect(summary.averageHPPercent).toBeCloseTo(38.33); // 115/300 * 100
    });

    test('should get active and KO members', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 0,
        isKO: true
      };

      party.addMember(member1);
      party.addMember(member2);

      const active = party.getActiveMembers();
      const ko = party.getKOMembers();

      expect(active).toHaveLength(1);
      expect(active[0!].name).toBe('Hero');

      expect(ko).toHaveLength(1);
      expect(ko[0!].name).toBe('Mage');

      expect(party.hasKOMembers()).toBe(true);
    });

    test('should calculate combat effectiveness', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 40,
        isKO: false
      };

      party.addMember(member1);
      party.addMember(member2);

      const effectiveness = PartyUtils.calculateEffectiveness(party);
      expect(effectiveness).toBeCloseTo(77.78); // (140/180) * 100
    });
  });

  describe('KOHandler Functionality', () => {
    test('should track KO spirits correctly', () => {
      expect(koHandler.isFainted('spirit1')).toBe(false);
      expect(koHandler.getFaintedCount()).toBe(0);

      const marked = koHandler.markKO('spirit1');
      expect(marked).toBe(true);
      expect(koHandler.isFainted('spirit1')).toBe(true);
      expect(koHandler.getFaintedCount()).toBe(1);
    });

    test('should handle revival correctly', () => {
      koHandler.markKO('spirit1');
      koHandler.markKO('spirit2');

      expect(koHandler.getFaintedCount()).toBe(2);

      const revived = koHandler.revive('spirit1');
      expect(revived).toBe(true);
      expect(koHandler.isFainted('spirit1')).toBe(false);
      expect(koHandler.getFaintedCount()).toBe(1);
    });

    test('should handle duplicate KO marking', () => {
      koHandler.markKO('spirit1');
      const duplicateMark = koHandler.markKO('spirit1');

      expect(duplicateMark).toBe(false); // No new KO added
      expect(koHandler.getFaintedCount()).toBe(1);
    });

    test('should handle revival of non-fainted spirit', () => {
      const revived = koHandler.revive('spirit1');
      expect(revived).toBe(false);
      expect(koHandler.getFaintedCount()).toBe(0);
    });

    test('should provide fainted spirit lists', () => {
      koHandler.markKO('spirit1');
      koHandler.markKO('spirit2');
      koHandler.markKO('spirit3');

      const faintedIds = koHandler.getFaintedSpiritIds();
      expect(faintedIds).toHaveLength(3);
      expect(faintedIds).toContain('spirit1');
      expect(faintedIds).toContain('spirit2');
      expect(faintedIds).toContain('spirit3');

      expect(koHandler.hasFaintedSpirits()).toBe(true);
    });
  });

  describe('Event Handling', () => {
    test('should handle revival events', () => {
      const revivedMembers: IPartyMember[] = [];

      party.addRevivedListener((member) => {
        revivedMembers.push(member);
      });

      const member: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 0,
        isKO: true
      };

      party.addMember(member);
      party.healAll();

      expect(revivedMembers).toHaveLength(1);
      expect(revivedMembers[0!].name).toBe('Hero');
    });

    test('should handle KO handler revival events', () => {
      const revivedIds: string[] = [];

      koHandler.addReviveListener((spiritId) => {
        revivedIds.push(spiritId);
      });

      koHandler.markKO('spirit1');
      koHandler.revive('spirit1');

      expect(revivedIds).toHaveLength(1);
      expect(revivedIds[0!]).toBe('spirit1');
    });
  });

  describe('Utility Functions', () => {
    test('should create party members correctly', () => {
      const member = PartyUtils.createPartyMember(1, 'Test', 100, 75, 'spirit_test');

      expect(member.id).toBe(1);
      expect(member.name).toBe('Test');
      expect(member.maxHP).toBe(100);
      expect(member.currentHP).toBe(75);
      expect(member.spiritId).toBe('spirit_test');
      expect(member.isKO).toBe(false);
    });

    test('should create KO member', () => {
      const member = PartyUtils.createPartyMember(1, 'Test', 100, 0);

      expect(member.currentHP).toBe(0);
      expect(member.isKO).toBe(true);
    });

    test('should find lowest HP member', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 50,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 20,
        isKO: false
      };

      const member3: IPartyMember = {
        id: 3,
        name: 'Warrior',
        maxHP: 120,
        currentHP: 90,
        isKO: false
      };

      party.addMember(member1);
      party.addMember(member2);
      party.addMember(member3);

      const lowest = PartyUtils.findLowestHPMember(party);
      expect(lowest?.name).toBe('Mage'); // 20/80 = 25%
    });

    test('should find highest HP member', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 50,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 80,
        isKO: false
      };

      party.addMember(member1);
      party.addMember(member2);

      const highest = PartyUtils.findHighestHPMember(party);
      expect(highest?.name).toBe('Mage'); // 80/80 = 100%
    });

    test('should sort members by HP', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Low HP',
        maxHP: 100,
        currentHP: 25,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'High HP',
        maxHP: 100,
        currentHP: 75,
        isKO: false
      };

      party.addMember(member1);
      party.addMember(member2);

      const sortedAsc = PartyUtils.getMembersByHP(party, true);
      expect(sortedAsc[0!].name).toBe('Low HP');
      expect(sortedAsc[1!].name).toBe('High HP');

      const sortedDesc = PartyUtils.getMembersByHP(party, false);
      expect(sortedDesc[0!].name).toBe('High HP');
      expect(sortedDesc[1!].name).toBe('Low HP');
    });

    test('should get healable members', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Full HP',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Half HP',
        maxHP: 100,
        currentHP: 50,
        isKO: false
      };

      const member3: IPartyMember = {
        id: 3,
        name: 'KO',
        maxHP: 100,
        currentHP: 0,
        isKO: true
      };

      party.addMember(member1);
      party.addMember(member2);
      party.addMember(member3);

      const healable = PartyUtils.getHealableMembers(party);
      expect(healable).toHaveLength(1);
      expect(healable[0!].name).toBe('Half HP');
    });

    test('should get critical members', () => {
      const member1: IPartyMember = {
        id: 1,
        name: 'Safe',
        maxHP: 100,
        currentHP: 50,
        isKO: false
      };

      const member2: IPartyMember = {
        id: 2,
        name: 'Critical',
        maxHP: 100,
        currentHP: 20,
        isKO: false
      };

      party.addMember(member1);
      party.addMember(member2);

      const critical = PartyUtils.getCriticalMembers(party);
      expect(critical).toHaveLength(1);
      expect(critical[0!].name).toBe('Critical');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid party size', () => {
      expect(() => new PartyManager(0)).toThrow('Party size must be greater than 0');
      expect(() => new PartyManager(-1)).toThrow('Party size must be greater than 0');
    });

    test('should handle empty party operations', () => {
      expect(party.memberCount).toBe(0);
      expect(party.activeMemberCount).toBe(0);
      expect(party.isEmpty).toBe(true);
      expect(party.hasKOMembers()).toBe(false);

      const active = party.getActiveMembers();
      const ko = party.getKOMembers();
      expect(active).toHaveLength(0);
      expect(ko).toHaveLength(0);

      party.healAll(); // Should not throw
    });

    test('should handle invalid slot indices', () => {
      expect(party.getMemberAt(-1)).toBeNull();
      expect(party.getMemberAt(100)).toBeNull();
      expect(party.getActiveMemberAt(-1)).toBeNull();
      expect(party.setMemberAt(-1, null)).toBe(false);
      expect(party.setMemberAt(100, null)).toBe(false);
    });

    test('should handle KO of non-existent members', () => {
      const result = party.handleKO('nonexistent');
      expect(result).toBe(false);
    });

    test('should handle revival of non-fainted members', () => {
      const result = koHandler.revive('nonexistent');
      expect(result).toBe(false);
    });

    test('should handle empty string spirit IDs', () => {
      const result = koHandler.markKO('');
      expect(result).toBe(false);
      expect(koHandler.getFaintedCount()).toBe(0);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle large parties efficiently', () => {
      const largeParty = new PartyManager(20);

      // Add many members
      for (let i = 0; i < 20; i++) {
        const member: IPartyMember = {
          id: i,
          name: `Member ${i}`,
          maxHP: 100,
          currentHP: 100,
          isKO: false
        };
        largeParty.addMember(member);
      }

      expect(largeParty.memberCount).toBe(20);
      expect(largeParty.activeMemberCount).toBe(20);

      // Operations should still be fast
      const startTime = performance.now();
      largeParty.getStatusSummary();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });

    test('should handle frequent member changes', () => {
      const member: IPartyMember = {
        id: 1,
        name: 'Test',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      // Rapid add/remove operations
      for (let i = 0; i < 100; i++) {
        party.addMember(member);
        party.removeMember(1);
      }

      expect(party.memberCount).toBe(0);
    });
  });

  describe('Integration Scenarios', () => {
    test('should work with KO handler integration', () => {
      const member: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      party.addMember(member);

      // Mark as KO
      member.currentHP = 0;
      koHandler.markKO('1');

      expect(koHandler.isFainted('1')).toBe(true);
      expect(party.hasKOMembers()).toBe(true);

      // Revive
      member.currentHP = 100;
      koHandler.revive('1');

      expect(koHandler.isFainted('1')).toBe(false);
      expect(party.hasKOMembers()).toBe(false);
    });

    test('should handle multiple revival listeners', () => {
      const revivalLog: string[] = [];

      // Add multiple listeners
      party.addRevivedListener((member) => {
        revivalLog.push(`Listener1: ${member.name}`);
      });

      party.addRevivedListener((member) => {
        revivalLog.push(`Listener2: ${member.name}`);
      });

      const member: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 0,
        isKO: true
      };

      party.addMember(member);
      party.healAll();

      expect(revivalLog).toHaveLength(2);
      expect(revivalLog).toContain('Listener1: Hero');
      expect(revivalLog).toContain('Listener2: Hero');
    });

    test('should handle party with mixed KO states', () => {
      const hero: IPartyMember = {
        id: 1,
        name: 'Hero',
        maxHP: 100,
        currentHP: 100,
        isKO: false
      };

      const mage: IPartyMember = {
        id: 2,
        name: 'Mage',
        maxHP: 80,
        currentHP: 0,
        isKO: true
      };

      const warrior: IPartyMember = {
        id: 3,
        name: 'Warrior',
        maxHP: 120,
        currentHP: 60,
        isKO: false
      };

      party.addMember(hero);
      party.addMember(mage);
      party.addMember(warrior);

      expect(party.memberCount).toBe(3);
      expect(party.activeMemberCount).toBe(2);
      expect(party.hasKOMembers()).toBe(true);

      const summary = party.getStatusSummary();
      expect(summary.totalMembers).toBe(3);
      expect(summary.activeMembers).toBe(2);
      expect(summary.koMembers).toBe(1);
      expect(summary.totalHP).toBe(160); // 100 + 0 + 60
    });
  });
});