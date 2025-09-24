/**
 * LorePure - Lore and Story Management System
 * 
 * Manages game lore, story elements, character backgrounds,
 * and narrative content for immersive storytelling.
 */

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'character' | 'location' | 'event' | 'item' | 'concept';
  tags: string[];
  unlockConditions: string[];
  isUnlocked: boolean;
  discoveredAt?: number;
  metadata: Record<string, any>;
}

export interface LoreCollection {
  entries: Map<string, LoreEntry>;
  unlockedCount: number;
  totalCount: number;
  categories: Map<string, number>;
}

export class LoreManager {
  private collection: LoreCollection;
  private unlockedEntries: Set<string>;

  constructor() {
    this.collection = {
      entries: new Map(),
      unlockedCount: 0,
      totalCount: 0,
      categories: new Map()
    };
    this.unlockedEntries = new Set();
  }

  /**
   * Add a lore entry
   */
  addEntry(entry: LoreEntry): void {
    this.collection.entries.set(entry.id, entry);
    this.collection.totalCount++;
    
    const categoryCount = this.collection.categories.get(entry.category) || 0;
    this.collection.categories.set(entry.category, categoryCount + 1);
  }

  /**
   * Unlock a lore entry
   */
  unlockEntry(entryId: string): boolean {
    const entry = this.collection.entries.get(entryId);
    if (!entry || this.unlockedEntries.has(entryId)) {
      return false;
    }

    entry.isUnlocked = true;
    entry.discoveredAt = Date.now();
    this.unlockedEntries.add(entryId);
    this.collection.unlockedCount++;
    return true;
  }

  /**
   * Get lore entry by ID
   */
  getEntry(entryId: string): LoreEntry | undefined {
    return this.collection.entries.get(entryId);
  }

  /**
   * Get all unlocked entries
   */
  getUnlockedEntries(): LoreEntry[] {
    return Array.from(this.unlockedEntries)
      .map(id => this.collection.entries.get(id))
      .filter(entry => entry !== undefined) as LoreEntry[];
  }

  /**
   * Get entries by category
   */
  getEntriesByCategory(category: string): LoreEntry[] {
    return Array.from(this.collection.entries.values())
      .filter(entry => entry.category === category);
  }

  /**
   * Search entries by tags
   */
  searchByTags(tags: string[]): LoreEntry[] {
    return Array.from(this.collection.entries.values())
      .filter(entry => tags.some(tag => entry.tags.includes(tag)));
  }

  /**
   * Get collection statistics
   */
  getStats(): LoreCollection {
    return { ...this.collection };
  }

  /**
   * Check if entry is unlocked
   */
  isUnlocked(entryId: string): boolean {
    return this.unlockedEntries.has(entryId);
  }

  /**
   * Get unlock progress percentage
   */
  getUnlockProgress(): number {
    if (this.collection.totalCount === 0) return 0;
    return (this.collection.unlockedCount / this.collection.totalCount) * 100;
  }
}

// Export default instance
export const defaultLoreManager = new LoreManager();
export { LoreManager as default };
