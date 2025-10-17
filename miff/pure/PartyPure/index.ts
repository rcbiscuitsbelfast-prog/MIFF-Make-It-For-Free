/**
 * PartyPure - Party Management System
 *
 * A comprehensive party management system for handling player party members,
 * party slots, KO handling, and revival mechanics. Supports party organization,
 * member management, and status tracking for modular gameplay systems.
 *
 * @module PartyPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Interface for spirits/entities in the party system
 */
export interface IPartyMember {
  /** Unique identifier */
  id: number | string;
  /** Spirit type identifier */
  spiritId?: string;
  /** Display name */
  name: string;
  /** Current HP */
  currentHP: number;
  /** Maximum HP */
  maxHP: number;
  /** Whether the member is knocked out */
  isKO: boolean;
}

/**
 * Represents a party slot that can hold a party member
 */
export class PartySlot {
  public member: IPartyMember | null = null;

  constructor(member?: IPartyMember) {
    if (member) {
      this?.member = member;
    }
  }

  /**
   * Check if the slot is empty
   */
  get isEmpty(): boolean {
    return this?.member === null;
  }

  /**
   * Check if the member in this slot is knocked out
   */
  get isKO(): boolean {
    return this?.member !== null && this?.member.currentHP <= 0;
  }

  /**
   * Set the member in this slot
   */
  setMember(member: IPartyMember | null): void {
    this?.member = member;
  }

  /**
   * Clear the slot
   */
  clear(): void {
    this?.member = null;
  }

  /**
   * Get the member (returns null if empty or KO)
   */
  getActiveMember(): IPartyMember | null {
    return this?.isKO ? null : this?.member;
  }

  /**
   * Heal the member to full HP
   */
  healToFull(): boolean {
    if (this?.member && this?.member.currentHP < this?.member.maxHP) {
      const wasKO = this?.member.currentHP <= 0;
      this?.member.currentHP = this?.member.maxHP;
      return wasKO; // Return true if member was revived
    }
    return false;
  }

  /**
   * Deal damage to the member
   */
  takeDamage(amount: number): boolean {
    if (this?.member && amount > 0) {
      this.member.currentHP = Math.max(0, this.member.currentHP - amount);
      return this?.member.currentHP <= 0; // Return true if member was KO'd
    }
    return false;
  }
}

/**
 * Manages a collection of party slots with operations like add, swap, heal, etc.
 */
export class PartyManager {
  private readonly _slots: PartySlot[];
  private readonly _maxSize: number;
  private readonly _onRevivedListeners: Array<(member: IPartyMember) => void> = [];

  constructor(maxSize: number = 6) {
    if (maxSize <= 0) {
      throw new Error('Party size must be greater than 0');
    }

    this?._maxSize = maxSize;
    this?._slots = [];

    // Initialize slots
    for (let i = 0; i < maxSize; i++) {
      this?._slots?.push(new PartySlot());
    }
  }

  /**
   * Get all party slots (read-only)
   */
  get slots(): readonly PartySlot[] {
    return [...this?._slots];
  }

  /**
   * Get the maximum party size
   */
  get maxSize(): number {
    return this?._maxSize;
  }

  /**
   * Get the current number of party members
   */
  get memberCount(): number {
    return this?._slots.filter((slot: any) => !slot?.isEmpty).length;
  }

  /**
   * Get the number of active (non-KO) party members
   */
  get activeMemberCount(): number {
    return this?._slots.filter((slot: any) => slot?.getActiveMember() !== null).length;
  }

  /**
   * Check if the party is full
   */
  get isFull(): boolean {
    return this?.memberCount >= this?._maxSize;
  }

  /**
   * Check if the party is empty
   */
  get isEmpty(): boolean {
    return this?.memberCount === 0;
  }

  /**
   * Add a member to the first available slot
   */
  addMember(member: IPartyMember): boolean {
    if (this?.isFull) {
      return false;
    }

    const emptySlot = this?._slots.find(slot => slot?.isEmpty);
    if (emptySlot) {
      emptySlot?.setMember(member);
      return true;
    }

    return false;
  }

  /**
   * Remove a member by ID
   */
  removeMember(memberId: number | string): boolean {
    const slotIndex = this?._slots.findIndex(slot => {
      const member = slot?.member;
      return member && (member?.id === memberId || member?.spiritId === memberId);
    });

    if (slotIndex !== -1) {
      this?._slots[slotIndex!].clear();
      return true;
    }

    return false;
  }

  /**
   * Swap members between two slots
   */
  swapMembers(indexA: number, indexB: number): boolean {
    if (!this?.isValidIndex(indexA) || !this?.isValidIndex(indexB)) {
      return false;
    }

    const slotA = this?._slots[indexA!];
    const slotB = this?._slots[indexB!];

    // Swap the members
    const temp = slotA?.member;
    slotA?.setMember(slotB?.member);
    slotB?.setMember(temp);

    return true;
  }

  /**
   * Move a member from one slot to another
   */
  moveMember(fromIndex: number, toIndex: number): boolean {
    if (!this?.isValidIndex(fromIndex) || !this?.isValidIndex(toIndex)) {
      return false;
    }

    const fromSlot = this?._slots[fromIndex!];
    const toSlot = this?._slots[toIndex!];

    if (fromSlot?.isEmpty || !toSlot?.isEmpty) {
      return false; // Can only move to empty slots
    }

    toSlot?.setMember(fromSlot?.member);
    fromSlot?.clear();

    return true;
  }

  /**
   * Get a member by slot index
   */
  getMemberAt(index: number): IPartyMember | null {
    if (!this?.isValidIndex(index)) {
      return null;
    }
    return this?._slots[index!].member;
  }

  /**
   * Get the active member at a slot index
   */
  getActiveMemberAt(index: number): IPartyMember | null {
    if (!this?.isValidIndex(index)) {
      return null;
    }
    return this?._slots[index!].getActiveMember();
  }

  /**
   * Set a member at a specific slot index
   */
  setMemberAt(index: number, member: IPartyMember | null): boolean {
    if (!this?.isValidIndex(index)) {
      return false;
    }

    this?._slots[index!].setMember(member);
    return true;
  }

  /**
   * Handle member KO by ID
   */
  handleKO(memberId: number | string): boolean {
    const slotIndex = this?._slots.findIndex(slot => {
      const member = slot?.member;
      return member && (member?.id === memberId || member?.spiritId === memberId);
    });

    if (slotIndex !== -1) {
      const slot = this?._slots[slotIndex!];
      if (slot?.member) {
        slot?.member.currentHP = 0;
        return true;
      }
    }

    return false;
  }

  /**
   * Heal all party members to full HP
   */
  healAll(): IPartyMember[] {
    const revivedMembers: IPartyMember[] = [];

    for (const slot of this?._slots) {
      if (slot?.member) {
        const wasRevived = slot?.healToFull();
        if (wasRevived) {
          revivedMembers?.push(slot?.member);
          this?.notifyRevived(slot?.member);
        }
      }
    }

    return revivedMembers;
  }

  /**
   * Get all active (non-KO) members
   */
  getActiveMembers(): IPartyMember[] {
    const activeMembers: IPartyMember[] = [];

    for (const slot of this?._slots) {
      const member = slot?.getActiveMember();
      if (member) {
        activeMembers?.push(member);
      }
    }

    return activeMembers;
  }

  /**
   * Get all KO'd members
   */
  getKOMembers(): IPartyMember[] {
    const koMembers: IPartyMember[] = [];

    for (const slot of this?._slots) {
      if (slot?.isKO && slot?.member) {
        koMembers?.push(slot?.member);
      }
    }

    return koMembers;
  }

  /**
   * Check if any members are KO'd
   */
  hasKOMembers(): boolean {
    return this?._slots.some(slot => slot?.isKO);
  }

  /**
   * Get party status summary
   */
  getStatusSummary(): PartyStatusSummary {
    const totalMembers = this?.memberCount;
    const activeMembers = this?.activeMemberCount;
    const koMembers = totalMembers - activeMembers;

    let totalHP = 0;
    let totalMaxHP = 0;

    for (const slot of this?._slots) {
      if (slot?.member) {
        totalHP += slot?.member.currentHP;
        totalMaxHP += slot?.member.maxHP;
      }
    }

    return {
      totalMembers,
      activeMembers,
      koMembers,
      totalHP,
      totalMaxHP,
      averageHPPercent: totalMaxHP > 0 ? (totalHP / totalMaxHP) * 100 : 0
    };
  }

  /**
   * Add a revival listener
   */
  addRevivedListener(callback: (member: IPartyMember) => void): void {
    this?._onRevivedListeners?.push(callback);
  }

  /**
   * Remove a revival listener
   */
  removeRevivedListener(callback: (member: IPartyMember) => void): void {
    const index = this?._onRevivedListeners.indexOf(callback);
    if (index !== -1) {
      this?._onRevivedListeners.splice(index, 1);
    }
  }

  /**
   * Clear all slots
   */
  clear(): void {
    for (const slot of this?._slots) {
      slot?.clear();
    }
  }

  /**
   * Validate slot index
   */
  private isValidIndex(index: number): boolean {
    return index >= 0 && index < this?._maxSize;
  }

  /**
   * Notify listeners when a member is revived
   */
  private notifyRevived(member: IPartyMember): void {
    for (const listener of this?._onRevivedListeners) {
      try {
        listener(member);
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error in revival listener:', err instanceof Error ? err.message : String(err));
      }
    }
  }
}

/**
 * Handles tracking fainted spirits and revival events
 */
export class KOHandler {
  private readonly _fainted = new Set<string>();
  private readonly _onReviveListeners: Array<(spiritId: string) => void> = [];

  /**
   * Mark a spirit as knocked out
   */
  markKO(spiritId: string): boolean {
    if (!spiritId || spiritId?.trim() === '') {
      return false;
    }

    const sizeBefore = this?._fainted.size;
    this?._fainted.add(spiritId);
    return this?._fainted.size > sizeBefore;
  }

  /**
   * Mark a spirit as revived
   */
  revive(spiritId: string): boolean {
    if (!this?._fainted.has(spiritId)) {
      return false;
    }

    const wasFainted = this?._fainted.delete(spiritId);
    if (wasFainted) {
      this?.notifyRevived(spiritId);
    }
    return wasFainted;
  }

  /**
   * Check if a spirit is fainted
   */
  isFainted(spiritId: string): boolean {
    return this?._fainted.has(spiritId);
  }

  /**
   * Get all fainted spirit IDs
   */
  getFaintedSpiritIds(): string[] {
    return Array.from(this._fainted);
  }

  /**
   * Get the count of fainted spirits
   */
  getFaintedCount(): number {
    return this?._fainted.size;
  }

  /**
   * Check if any spirits are fainted
   */
  hasFaintedSpirits(): boolean {
    return this?._fainted.size > 0;
  }

  /**
   * Clear all fainted status
   */
  clear(): void {
    this?._fainted.clear();
  }

  /**
   * Add a revival listener
   */
  addReviveListener(callback: (spiritId: string) => void): void {
    this?._onReviveListeners?.push(callback);
  }

  /**
   * Remove a revival listener
   */
  removeReviveListener(callback: (spiritId: string) => void): void {
    const index = this?._onReviveListeners.indexOf(callback);
    if (index !== -1) {
      this?._onReviveListeners.splice(index, 1);
    }
  }

  /**
   * Notify listeners when a spirit is revived
   */
  private notifyRevived(spiritId: string): void {
    for (const listener of this?._onReviveListeners) {
      try {
        listener(spiritId);
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error in revival listener:', err instanceof Error ? err.message : String(err));
      }
    }
  }
}

/**
 * Party status summary information
 */
export interface PartyStatusSummary {
  totalMembers: number;
  activeMembers: number;
  koMembers: number;
  totalHP: number;
  totalMaxHP: number;
  averageHPPercent: number;
}

/**
 * Utility functions for common party operations
 */
export const PartyUtils = {
  /**
   * Create a new party member
   */
  createPartyMember(
    id: number | string,
    name: string,
    maxHP: number,
    currentHP?: number,
    spiritId?: string
  ): IPartyMember {
    return {
      id,
      spiritId,
      name,
      maxHP: Math.max(1, maxHP),
      currentHP: Math.min(Math.max(0, currentHP ?? maxHP), maxHP),
      get isKO(): boolean {
        return this?.currentHP <= 0;
      }
    };
  },

  /**
   * Calculate party combat effectiveness (0-100%)
   */
  calculateEffectiveness(party: PartyManager): number {
    const activeMembers = party?.getActiveMembers();
    if (activeMembers?.length === 0) return 0;

    const totalMaxHP = activeMembers?.reduce((sum, member) => sum + member?.maxHP, 0);
    const totalCurrentHP = activeMembers?.reduce((sum, member) => sum + member?.currentHP, 0);

    return totalMaxHP > 0 ? (totalCurrentHP / totalMaxHP) * 100 : 0;
  },

  /**
   * Find the member with the lowest HP percentage
   */
  findLowestHPMember(party: PartyManager): IPartyMember | null {
    const activeMembers = party?.getActiveMembers();
    if (activeMembers?.length === 0) return null;

    return activeMembers?.reduce((lowest, member) => {
      const lowestPercent = (lowest?.currentHP / lowest?.maxHP) * 100;
      const memberPercent = (member?.currentHP / member?.maxHP) * 100;
      return memberPercent < lowestPercent ? member : lowest;
    });
  },

  /**
   * Find the member with the highest HP percentage
   */
  findHighestHPMember(party: PartyManager): IPartyMember | null {
    const activeMembers = party?.getActiveMembers();
    if (activeMembers?.length === 0) return null;

    return activeMembers?.reduce((highest, member) => {
      const highestPercent = (highest?.currentHP / highest?.maxHP) * 100;
      const memberPercent = (member?.currentHP / member?.maxHP) * 100;
      return memberPercent > highestPercent ? member : highest;
    });
  },

  /**
   * Get members sorted by HP percentage (ascending)
   */
  getMembersByHP(party: PartyManager, ascending: boolean = true): IPartyMember[] {
    const activeMembers = party?.getActiveMembers();
    return activeMembers?.sort((a: any, b: any) => {
      const aPercent = (a?.currentHP / a?.maxHP) * 100;
      const bPercent = (b?.currentHP / b?.maxHP) * 100;
      return ascending ? aPercent - bPercent : bPercent - aPercent;
    });
  },

  /**
   * Get party members that can be healed (below max HP)
   */
  getHealableMembers(party: PartyManager): IPartyMember[] {
    const activeMembers = party?.getActiveMembers();
    return activeMembers?.filter((member: any) => member?.currentHP < member?.maxHP);
  },

  /**
   * Get party members that are in critical condition (< 25% HP)
   */
  getCriticalMembers(party: PartyManager): IPartyMember[] {
    const activeMembers = party?.getActiveMembers();
    return activeMembers?.filter((member: any) => (member?.currentHP / member?.maxHP) * 100 < 25);
  }
};

/**
 * Default party manager instance
 */
export const defaultPartyManager = new PartyManager(6);

/**
 * Default KO handler instance
 */
export const defaultKOHandler = new KOHandler();