export type Skill = { 
  id: string; 
  name: string; 
  description?: string;
  requires?: string[]; 
  cost?: number;
  category?: string;
  level?: number;
  maxLevel?: number;
  prerequisites?: string[];
  unlockConditions?: SkillUnlockCondition[];
  effects?: SkillEffect[];
  cooldown?: number;
  duration?: number;
  metadata?: Record<string, any>;
};

export type SkillUnlockCondition = {
  type: 'level' | 'achievement' | 'quest' | 'item' | 'skill' | 'time' | 'custom';
  value: any;
  description?: string;
};

export type SkillEffect = {
  type: 'stat' | 'ability' | 'passive' | 'active' | 'aura';
  target: string;
  value: number;
  duration?: number;
  description?: string;
};

export type SkillTree = {
  id: string;
  name: string;
  description?: string;
  skills: Skill[];
  categories: string[];
  maxLevel: number;
  totalCost: number;
  metadata?: Record<string, any>;
};

export type SkillProgress = {
  skillId: string;
  level: number;
  experience: number;
  maxExperience: number;
  unlocked: boolean;
  unlockDate?: number;
  lastUsed?: number;
  usageCount: number;
};

export type SkillTreeStats = {
  totalSkills: number;
  unlockedSkills: number;
  lockedSkills: number;
  totalLevels: number;
  averageLevel: number;
  totalCost: number;
  spentCost: number;
  remainingCost: number;
  categories: Record<string, number>;
  progress: SkillProgress[];
};

export type SkillTreeFilter = {
  category?: string;
  unlocked?: boolean;
  level?: number;
  minLevel?: number;
  maxLevel?: number;
  cost?: number;
  maxCost?: number;
  search?: string;
};

export type SkillTreeOutput = {
  op: string;
  status: 'ok' | 'error';
  result?: any;
  format?: string;
};

export class SkillTreeManager {
  private skills = new Map<string, Skill>();
  private unlocked = new Set<string>();
  private progress = new Map<string, SkillProgress>();
  private trees = new Map<string, SkillTree>();
  private stats: SkillTreeStats = {
    totalSkills: 0,
    unlockedSkills: 0,
    lockedSkills: 0,
    totalLevels: 0,
    averageLevel: 0,
    totalCost: 0,
    spentCost: 0,
    remainingCost: 0,
    categories: {},
    progress: []
  };

  load(skills: Skill[]): void {
    this.skills.clear();
    this.unlocked.clear();
    this.progress.clear();
    
    for (const skill of skills) {
      this.skills.set(skill.id, skill);
      this.progress.set(skill.id, {
        skillId: skill.id,
        level: 0,
        experience: 0,
        maxExperience: this.calculateMaxExperience(skill.level || 1),
        unlocked: false,
        usageCount: 0
      });
    }
    
    this.updateStats();
  }

  createTree(id: string, name: string, description?: string): SkillTree {
    const tree: SkillTree = {
      id,
      name,
      description,
      skills: Array.from(this.skills.values()),
      categories: this.getCategories(),
      maxLevel: Math.max(...Array.from(this.skills.values()).map((s: any) => s.maxLevel || 1)),
      totalCost: this.calculateTotalCost(),
      metadata: {}
    };
    
    this.trees.set(id, tree);
    return tree;
  }

  getTree(id: string): SkillTree | undefined {
    return this.trees.get(id);
  }

  listTrees(): SkillTree[] {
    return Array.from(this.trees.values());
  }

  list(): string[] {
    return Array.from(this.skills.keys());
  }

  getUnlocked(): string[] {
    return Array.from(this.unlocked.values());
  }

  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  canUnlock(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;
    
    // Check prerequisites
    if (skill.prerequisites) {
      for (const prereq of skill.prerequisites) {
        if (!this.unlocked.has(prereq)) return false;
      }
    }
    
    // Check unlock conditions
    if (skill.unlockConditions) {
      for (const condition of skill.unlockConditions) {
        if (!this.checkUnlockCondition(condition)) return false;
      }
    }
    
    return true;
  }

  unlock(id: string): boolean {
    if (!this.canUnlock(id)) return false;
    
    this.unlocked.add(id);
    const progress = this.progress.get(id);
    if (progress) {
      progress.unlocked = true;
      progress.unlockDate = Date.now();
    }
    
    this.updateStats();
    return true;
  }

  lock(id: string): boolean {
    if (!this.unlocked.has(id)) return false;
    
    this.unlocked.delete(id);
    const progress = this.progress.get(id);
    if (progress) {
      progress.unlocked = false;
      progress.unlockDate = undefined;
    }
    
    this.updateStats();
    return true;
  }

  levelUp(id: string): boolean {
    const skill = this.skills.get(id);
    const progress = this.progress.get(id);
    
    if (!skill || !progress || !progress.unlocked) return false;
    
    const maxLevel = skill.maxLevel || 1;
    if (progress.level >= maxLevel) return false;
    
    progress.level++;
    progress.experience = 0;
    progress.maxExperience = this.calculateMaxExperience(progress.level);
    
    this.updateStats();
    return true;
  }

  addExperience(id: string, amount: number): boolean {
    const progress = this.progress.get(id);
    if (!progress || !progress.unlocked) return false;
    
    progress.experience += amount;
    
    // Check for level up
    if (progress.experience >= progress.maxExperience) {
      const skill = this.skills.get(id);
      if (skill && progress.level < (skill.maxLevel || 1)) {
        progress.level++;
        progress.experience = 0;
        progress.maxExperience = this.calculateMaxExperience(progress.level);
      }
    }
    
    this.updateStats();
    return true;
  }

  useSkill(id: string): boolean {
    const progress = this.progress.get(id);
    if (!progress || !progress.unlocked) return false;
    
    progress.usageCount++;
    progress.lastUsed = Date.now();
    
    this.updateStats();
    return true;
  }

  getProgress(id: string): SkillProgress | undefined {
    return this.progress.get(id);
  }

  getAllProgress(): SkillProgress[] {
    return Array.from(this.progress.values());
  }

  getStats(): SkillTreeStats {
    return { ...this.stats };
  }

  listSkills(filter?: SkillTreeFilter): Skill[] {
    let skills = Array.from(this.skills.values());
    
    if (filter) {
      if (filter.category) {
        skills = skills.filter((s: any) => s.category === filter.category);
      }
      
      if (filter.unlocked !== undefined) {
        skills = skills.filter((s: any) => this.unlocked.has(s.id) === filter.unlocked);
      }
      
      if (filter.level !== undefined) {
        skills = skills.filter((s: any) => (s.level || 1) === filter.level);
      }
      
      if (filter.minLevel !== undefined) {
        skills = skills.filter((s: any) => (s.level || 1) >= filter.minLevel);
      }
      
      if (filter.maxLevel !== undefined) {
        skills = skills.filter((s: any) => (s.level || 1) <= filter.maxLevel);
      }
      
      if (filter.cost !== undefined) {
        skills = skills.filter((s: any) => (s.cost || 0) === filter.cost);
      }
      
      if (filter.maxCost !== undefined) {
        skills = skills.filter((s: any) => (s.cost || 0) <= filter.maxCost);
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        skills = skills.filter((s: any) => 
          s.name.toLowerCase().includes(searchLower) ||
          (s.description && s.description.toLowerCase().includes(searchLower))
        );
      }
    }
    
    return skills;
  }

  exportSkills(format: 'json' | 'csv' | 'markdown' = 'json'): string {
    const skills = this.listSkills();
    
    switch (format) {
      case 'json':
        return JSON.stringify(skills, null, 2);
      
      case 'csv':
        let csv = 'ID,Name,Description,Category,Level,Cost,Unlocked\n';
        skills.forEach((skill: any) => {
          const progress = this.progress.get(skill.id);
          csv += `${skill.id},${skill.name},${skill.description || ''},${skill.category || ''},${skill.level || 1},${skill.cost || 0},${progress?.unlocked || false}\n`;
        });
        return csv;
      
      case 'markdown':
        let md = '# Skill Tree\n\n';
        skills.forEach((skill: any) => {
          const progress = this.progress.get(skill.id);
          md += `## ${skill.name}\n`;
          md += `- **ID**: ${skill.id}\n`;
          md += `- **Level**: ${skill.level || 1}\n`;
          md += `- **Cost**: ${skill.cost || 0}\n`;
          md += `- **Unlocked**: ${progress?.unlocked ? 'Yes' : 'No'}\n`;
          if (skill.description) md += `- **Description**: ${skill.description}\n`;
          if (skill.category) md += `- **Category**: ${skill.category}\n`;
          md += '\n';
        });
        return md;
      
      default:
        return JSON.stringify(skills, null, 2);
    }
  }

  reset(): void {
    this.skills.clear();
    this.unlocked.clear();
    this.progress.clear();
    this.trees.clear();
    this.stats = {
      totalSkills: 0,
      unlockedSkills: 0,
      lockedSkills: 0,
      totalLevels: 0,
      averageLevel: 0,
      totalCost: 0,
      spentCost: 0,
      remainingCost: 0,
      categories: {},
      progress: []
    };
  }

  private checkUnlockCondition(condition: SkillUnlockCondition): boolean {
    switch (condition.type) {
      case 'level':
        return this.stats.averageLevel >= condition.value;
      case 'achievement':
        // This would need to be integrated with an achievement system
        return true;
      case 'quest':
        // This would need to be integrated with a quest system
        return true;
      case 'item':
        // This would need to be integrated with an inventory system
        return true;
      case 'skill':
        return this.unlocked.has(condition.value);
      case 'time':
        return Date.now() >= condition.value;
      case 'custom':
        // Custom conditions would need to be implemented by the game
        return true;
      default:
        return false;
    }
  }

  private calculateMaxExperience(level: number): number {
    // Simple exponential curve: 100 * level^2
    return 100 * level * level;
  }

  private calculateTotalCost(): number {
    return Array.from(this.skills.values()).reduce((total, skill) => total + (skill.cost || 0), 0);
  }

  private getCategories(): string[] {
    const categories = new Set<string>();
    this.skills.forEach((skill: any) => {
      if (skill.category) {
        categories.add(skill.category);
      }
    });
    return Array.from(categories);
  }

  private updateStats(): void {
    const skills = Array.from(this.skills.values());
    const progress = Array.from(this.progress.values());
    
    this.stats.totalSkills = skills.length;
    this.stats.unlockedSkills = this.unlocked.size;
    this.stats.lockedSkills = skills.length - this.unlocked.size;
    this.stats.totalLevels = progress.reduce((sum, p) => sum + p.level, 0);
    this.stats.averageLevel = progress.length > 0 ? this.stats.totalLevels / progress.length : 0;
    this.stats.totalCost = this.calculateTotalCost();
    this.stats.spentCost = progress.reduce((sum, p) => sum + (p.unlocked ? (this.skills.get(p.skillId)?.cost || 0) : 0), 0);
    this.stats.remainingCost = this.stats.totalCost - this.stats.spentCost;
    
    // Update categories
    this.stats.categories = {};
    skills.forEach((skill: any) => {
      if (skill.category) {
        this.stats.categories[skill.category] = (this.stats.categories[skill.category] || 0) + 1;
      }
    });
    
    this.stats.progress = progress;
  }
}