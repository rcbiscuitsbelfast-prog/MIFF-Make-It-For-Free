export type ExternalRefMaps = {
  quests?: Record<string, true>;
  items?: Record<string, true>;
  zones?: Record<string, true>;
  npcs?: Record<string, true>;
  equipment?: Record<string, true>;
  placements?: Record<string, true>;
  skills?: Record<string, true>;
  achievements?: Record<string, true>;
  events?: Record<string, true>;
};

export type LinkInput = {
  npcs?: { id: string; quest?: string; dialog?: string; skill?: string }[];
  equipment?: { id: string; itemId: string; enchantment?: string }[];
  placements?: { id: string; zoneId: string; npcId?: string }[];
  skills?: { id: string; prerequisite?: string; unlockCondition?: string }[];
  achievements?: { id: string; requirement?: string; reward?: string }[];
  events?: { id: string; trigger?: string; target?: string }[];
};

export type LinkIssue = {
  code: string;
  message: string;
  ref?: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  suggestions?: string[];
};

export type ResolveOutput = {
  op: 'resolveRefs';
  status: 'ok' | 'error' | 'warning';
  issues: LinkIssue[];
  resolvedRefs: Record<string, { ok: boolean; target?: string; type?: string }>;
  statistics: {

    total: number;
    resolved: number;
    unresolved: number;
    byCategory: Record<string, number>;
  


  }
  };

export type DumpLinksOutput = {
  op: 'dumpLinks';
  status: 'ok';
  issues: [];
  resolvedRefs: Record<string, { ok: boolean; target?: string; type?: string }>;
  statistics: {

    total: number;
    resolved: number;
    unresolved: number;
    byCategory: Record<string, number>;
  


  }
  };

export type ValidationResult = {
  isValid: boolean;
  issues: LinkIssue[];
  score: number;
  recommendations: string[];
};

export type LinkerStats = {
  totalResolutions: number;
  successfulResolutions: number;
  failedResolutions: number;
  averageResolutionTime: number;
  mostCommonIssues: Array<{ code: string; count: number;
    }>;
  resolutionHistory: Array<{
    timestamp: number;
    operation: string;
    success: boolean;
    duration: number;
  }>;
};

export class EntityLinkerManager {
  private extern: ExternalRefMaps = {};
  private resolved: Record<string, { ok: boolean; target?: string; type?: string }> = {};
  private stats: LinkerStats = {
    totalResolutions: 0,
    successfulResolutions: 0,
    failedResolutions: 0,
    averageResolutionTime: 0,
    mostCommonIssues: [],
    resolutionHistory: []
  };
  private startTime: number = 0;

  inject(extern: ExternalRefMaps): void {
    this.extern = extern;
  }

  resolve(input: LinkInput): ResolveOutput {
    this.startTime = performance.now();
    const issues: LinkIssue[] = [];
    this.resolved = {};
    const statistics = {
      total: 0,
      resolved: 0,
      unresolved: 0,
      byCategory: {} as Record<string, number>
    };

    // NPCs->Quests, Dialogs, Skills
    for (const n of input.npcs || []) {
      if (n.quest) {
        const ok = !!this.extern.quests?.[n.quest];
        this.resolved[`npc:${n.id}:quest`] = { ok, target: ok ? n.quest : undefined, type: 'quest' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_quest',
            message: `NPC ${n.id} references missing quest ${n.quest}`,
            ref: n.quest,
            severity: 'error',
            category: 'npc',
            suggestions: ['Check quest ID spelling', 'Verify quest exists in quest system']
          });
        }
        statistics.byCategory.npc = (statistics.byCategory.npc || 0) + 1;
      }

      if (n.dialog) {
        const ok = !!this.extern.npcs?.[n.dialog];
        this.resolved[`npc:${n.id}:dialog`] = { ok, target: ok ? n.dialog : undefined, type: 'dialog' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_dialog',
            message: `NPC ${n.id} references missing dialog ${n.dialog}`,
            ref: n.dialog,
            severity: 'warning',
            category: 'npc',
            suggestions: ['Check dialog ID spelling', 'Verify dialog exists in dialog system']
          });
        }
        statistics.byCategory.npc = (statistics.byCategory.npc || 0) + 1;
      }

      if (n.skill) {
        const ok = !!this.extern.skills?.[n.skill];
        this.resolved[`npc:${n.id}:skill`] = { ok, target: ok ? n.skill : undefined, type: 'skill' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_skill',
            message: `NPC ${n.id} references missing skill ${n.skill}`,
            ref: n.skill,
            severity: 'warning',
            category: 'npc',
            suggestions: ['Check skill ID spelling', 'Verify skill exists in skill system']
          });
        }
        statistics.byCategory.npc = (statistics.byCategory.npc || 0) + 1;
      }
    }

    // Equipment->Items, Enchantments
    for (const e of input.equipment || []) {
      const ok = !!this.extern.items?.[e.itemId];
      this.resolved[`equip:${e.id}:item`] = { ok, target: ok ? e.itemId : undefined, type: 'item' };
      statistics.total++;
      if (ok) statistics.resolved++;
      else {
        statistics.unresolved++;
        issues.push({
          code: 'missing_item',
          message: `Equipment ${e.id} references missing item ${e.itemId}`,
          ref: e.itemId,
          severity: 'error',
          category: 'equipment',
          suggestions: ['Check item ID spelling', 'Verify item exists in item system']
        });
      }
      statistics.byCategory.equipment = (statistics.byCategory.equipment || 0) + 1;

      if (e.enchantment) {
        const ok = !!this.extern.items?.[e.enchantment];
        this.resolved[`equip:${e.id}:enchantment`] = { ok, target: ok ? e.enchantment : undefined, type: 'enchantment' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_enchantment',
            message: `Equipment ${e.id} references missing enchantment ${e.enchantment}`,
            ref: e.enchantment,
            severity: 'warning',
            category: 'equipment',
            suggestions: ['Check enchantment ID spelling', 'Verify enchantment exists in enchantment system']
          });
        }
        statistics.byCategory.equipment = (statistics.byCategory.equipment || 0) + 1;
      }
    }

    // Placements->Zones, NPCs
    for (const p of input.placements || []) {
      const ok = !!this.extern.zones?.[p.zoneId];
      this.resolved[`place:${p.id}:zone`] = { ok, target: ok ? p.zoneId : undefined, type: 'zone' };
      statistics.total++;
      if (ok) statistics.resolved++;
      else {
        statistics.unresolved++;
        issues.push({
          code: 'missing_zone',
          message: `Placement ${p.id} references missing zone ${p.zoneId}`,
          ref: p.zoneId,
          severity: 'error',
          category: 'placement',
          suggestions: ['Check zone ID spelling', 'Verify zone exists in zone system']
        });
      }
      statistics.byCategory.placement = (statistics.byCategory.placement || 0) + 1;

      if (p.npcId) {
        const ok = !!this.extern.npcs?.[p.npcId];
        this.resolved[`place:${p.id}:npc`] = { ok, target: ok ? p.npcId : undefined, type: 'npc' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_npc',
            message: `Placement ${p.id} references missing NPC ${p.npcId}`,
            ref: p.npcId,
            severity: 'warning',
            category: 'placement',
            suggestions: ['Check NPC ID spelling', 'Verify NPC exists in NPC system']
          });
        }
        statistics.byCategory.placement = (statistics.byCategory.placement || 0) + 1;
      }
    }

    // Skills->Prerequisites, Unlock Conditions
    for (const s of input.skills || []) {
      if (s.prerequisite) {
        const ok = !!this.extern.skills?.[s.prerequisite];
        this.resolved[`skill:${s.id}:prerequisite`] = { ok, target: ok ? s.prerequisite : undefined, type: 'skill' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_prerequisite',
            message: `Skill ${s.id} references missing prerequisite ${s.prerequisite}`,
            ref: s.prerequisite,
            severity: 'error',
            category: 'skill',
            suggestions: ['Check prerequisite ID spelling', 'Verify prerequisite exists in skill system']
          });
        }
        statistics.byCategory.skill = (statistics.byCategory.skill || 0) + 1;
      }

      if (s.unlockCondition) {
        const ok = !!this.extern.achievements?.[s.unlockCondition];
        this.resolved[`skill:${s.id}:unlock`] = { ok, target: ok ? s.unlockCondition : undefined, type: 'achievement' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_unlock_condition',
            message: `Skill ${s.id} references missing unlock condition ${s.unlockCondition}`,
            ref: s.unlockCondition,
            severity: 'warning',
            category: 'skill',
            suggestions: ['Check unlock condition ID spelling', 'Verify unlock condition exists in achievement system']
          });
        }
        statistics.byCategory.skill = (statistics.byCategory.skill || 0) + 1;
      }
    }

    // Achievements->Requirements, Rewards
    for (const a of input.achievements || []) {
      if (a.requirement) {
        const ok = !!this.extern.achievements?.[a.requirement];
        this.resolved[`achievement:${a.id}:requirement`] = { ok, target: ok ? a.requirement : undefined, type: 'achievement' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_requirement',
            message: `Achievement ${a.id} references missing requirement ${a.requirement}`,
            ref: a.requirement,
            severity: 'error',
            category: 'achievement',
            suggestions: ['Check requirement ID spelling', 'Verify requirement exists in achievement system']
          });
        }
        statistics.byCategory.achievement = (statistics.byCategory.achievement || 0) + 1;
      }

      if (a.reward) {
        const ok = !!this.extern.items?.[a.reward];
        this.resolved[`achievement:${a.id}:reward`] = { ok, target: ok ? a.reward : undefined, type: 'item' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_reward',
            message: `Achievement ${a.id} references missing reward ${a.reward}`,
            ref: a.reward,
            severity: 'warning',
            category: 'achievement',
            suggestions: ['Check reward ID spelling', 'Verify reward exists in item system']
          });
        }
        statistics.byCategory.achievement = (statistics.byCategory.achievement || 0) + 1;
      }
    }

    // Events->Triggers, Targets
    for (const e of input.events || []) {
      if (e.trigger) {
        const ok = !!this.extern.events?.[e.trigger];
        this.resolved[`event:${e.id}:trigger`] = { ok, target: ok ? e.trigger : undefined, type: 'event' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_trigger',
            message: `Event ${e.id} references missing trigger ${e.trigger}`,
            ref: e.trigger,
            severity: 'error',
            category: 'event',
            suggestions: ['Check trigger ID spelling', 'Verify trigger exists in event system']
          });
        }
        statistics.byCategory.event = (statistics.byCategory.event || 0) + 1;
      }

      if (e.target) {
        const ok = !!this.extern.npcs?.[e.target] || !!this.extern.items?.[e.target] || !!this.extern.zones?.[e.target];
        this.resolved[`event:${e.id}:target`] = { ok, target: ok ? e.target : undefined, type: 'target' };
        statistics.total++;
        if (ok) statistics.resolved++;
        else {
          statistics.unresolved++;
          issues.push({
            code: 'missing_target',
            message: `Event ${e.id} references missing target ${e.target}`,
            ref: e.target,
            severity: 'warning',
            category: 'event',
            suggestions: ['Check target ID spelling', 'Verify target exists in appropriate system']
          });
        }
        statistics.byCategory.event = (statistics.byCategory.event || 0) + 1;
      }
    }

    // Update statistics
    const duration = performance.now() - this.startTime;
    this.stats.totalResolutions++;
    this.stats.averageResolutionTime = (this.stats.averageResolutionTime + duration) / 2;
    this.stats.resolutionHistory.push({
      timestamp: Date.now(),
      operation: 'resolve',
      success: issues.length === 0,
      duration
    });

    if (issues.length === 0) {
      this.stats.successfulResolutions++;
    } else {
      this.stats.failedResolutions++;
    }

    // Update most common issues
    const issueCounts = new Map<string, number>();
    issues.forEach(issue => {
      const count = issueCounts.get(issue.code) || 0;
      issueCounts.set(issue.code, count + 1);
    });
    this.stats.mostCommonIssues = Array.from(issueCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const status = issues.some(i => i.severity === 'error') ? 'error' : 
                  issues.some(i => i.severity === 'warning') ? 'warning' : 'ok';

    return { 
      op: 'resolveRefs', 
      status, 
      issues, 
      resolvedRefs: this.resolved,
      statistics
    };
  }

  dumpLinks(): DumpLinksOutput {
    const statistics = {
      total: Object.keys(this.resolved).length,
      resolved: Object.values(this.resolved).filter(r => r.ok).length,
      unresolved: Object.values(this.resolved).filter(r => !r.ok).length,
      byCategory: {} as Record<string, number>
    };

    // Calculate category statistics
    Object.values(this.resolved).forEach(ref => {
      if (ref.type) {
        statistics.byCategory[ref.type] = (statistics.byCategory[ref.type] || 0) + 1;
      }
    });

    return { 
      op: 'dumpLinks', 
      status: 'ok', 
      issues: [], 
      resolvedRefs: this.resolved,
      statistics
    };
  }

  validate(input: LinkInput): ValidationResult {
    const result = this.resolve(input);
    const score = result.statistics.total > 0 ? 
      (result.statistics.resolved / result.statistics.total) * 100 : 100;
    
    const recommendations: string[] = [];
    if (score < 100) {
      recommendations.push('Fix unresolved references to improve link integrity');
    }
    if (result.issues.some(i => i.severity === 'error')) {
      recommendations.push('Address critical errors before deployment');
    }
    if (result.issues.some(i => i.severity === 'warning')) {
      recommendations.push('Review warnings to improve system robustness');
    }
    if (result.statistics.byCategory.npc && result.statistics.byCategory.npc > 0) {
      recommendations.push('Consider implementing NPC validation system');
    }
    if (result.statistics.byCategory.equipment && result.statistics.byCategory.equipment > 0) {
      recommendations.push('Consider implementing equipment validation system');
    }

    return {
      isValid: result.status === 'ok',
      issues: result.issues,
      score,
      recommendations
    };
  }

  getStats(): LinkerStats {
    return { ...this.stats };
  }

  reset(): void {
    this.resolved = {};
    this.stats = {
      totalResolutions: 0,
      successfulResolutions: 0,
      failedResolutions: 0,
      averageResolutionTime: 0,
      mostCommonIssues: [],
      resolutionHistory: []
    };
  }

  exportLinks(format: 'json' | 'csv' | 'markdown' = 'json'): string {
    const data = this.dumpLinks();
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'csv':
        let csv = 'Reference,Status,Target,Type\n';
        Object.entries(data.resolvedRefs).forEach(([ref, info]) => {
          csv += `${ref},${info.ok ? 'OK' : 'FAILED'},${info.target || ''},${info.type || ''}\n`;
        });
        return csv;
      
      case 'markdown':
        let md = '# Entity Linker Report\n\n';
        md += `## Statistics\n`;
        md += `- Total References: ${data.statistics.total}\n`;
        md += `- Resolved: ${data.statistics.resolved}\n`;
        md += `- Unresolved: ${data.statistics.unresolved}\n\n`;
        md += `## References\n\n`;
        Object.entries(data.resolvedRefs).forEach(([ref, info]) => {
          md += `- **${ref}**: ${info.ok ? '✅' : '❌'} ${info.target || 'Missing'}\n`;
        });
        return md;
      
      default:
        return JSON.stringify(data, null, 2);
    }
  }
}