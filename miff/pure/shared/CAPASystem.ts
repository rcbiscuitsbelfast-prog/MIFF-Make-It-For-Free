/**
 * CAPA (Corrective and Preventive Actions) System for MIFF
 * 
 * Tracks architectural flaws, corrective fixes, and preventive strategies
 * to ensure continuous improvement and regression prevention.
 */

export interface CAPAEntry {
  id: string;
  title: string;
  description: string;
  category: CAPACategory;
  severity: CAPASeverity;
  status: CAPAStatus;
  discoveredAt: Date;
  discoveredBy: string;
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  resolution?: string;
  correctiveActions: CAPAAction[];
  preventiveActions: CAPAAction[];
  impact: CAPAImpact;
  tags: string[];
  relatedModules: string[];
  ciBlocking: boolean;
  prRequired: boolean;
}

export enum CAPACategory {
  SCHEMA_DRIFT = 'schema_drift',
  MANAGER_MISWIRING = 'manager_miswiring',
  STUBBED_LOGIC = 'stubbed_logic',
  SKIPPED_TESTS = 'skipped_tests',
  ASSET_PIPELINE = 'asset_pipeline',
  MIGRATION_GAPS = 'migration_gaps',
  INTERFACE_SAFETY = 'interface_safety',
  RUNTIME_FIDELITY = 'runtime_fidelity',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  DOCUMENTATION = 'documentation'
}

export enum CAPASeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum CAPAStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  DEFERRED = 'deferred'
}

export interface CAPAAction {
  id: string;
  description: string;
  type: 'corrective' | 'preventive';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo: string;
  dueDate: Date;
  completedAt?: Date;
  evidence?: string[];
  verification?: string;
}

export interface CAPAImpact {
  modulesAffected: string[];
  usersAffected: string[];
  businessImpact: string;
  technicalDebt: number; // 1-10 scale
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CAPARegistry {
  entries: Map<string, CAPAEntry>;
  metrics: CAPAMetrics;
  policies: CAPAPolicies;
}

export interface CAPAMetrics {
  totalEntries: number;
  openEntries: number;
  resolvedEntries: number;
  averageResolutionTime: number; // days
  criticalOpen: number;
  highOpen: number;
  mediumOpen: number;
  lowOpen: number;
  preventionCoverage: number; // percentage
  regressionRate: number; // percentage
}

export interface CAPAPolicies {
  autoCreate: boolean;
  ciBlocking: boolean;
  prRequired: boolean;
  escalationRules: CAPAEscalationRule[];
  notificationChannels: string[];
}

export interface CAPAEscalationRule {
  condition: string;
  action: string;
  timeframe: number; // hours
}

export class CAPAManager {
  private registry: CAPARegistry;
  private eventBus: any;

  constructor(eventBus: any) {
    this.registry = {
      entries: new Map(),
      metrics: this.initializeMetrics(),
      policies: this.initializePolicies()
    };
    this.eventBus = eventBus;
  }

  /**
   * Create a new CAPA entry
   */
  createEntry(): CAPAEntry {
    const id = this.generateId();
    const capaEntry: CAPAEntry = {
      ...entry,
      id,
      discoveredAt: new Date(),
      status: CAPAStatus.OPEN
    };

    this.registry.entries.set(id, capaEntry);
    this.updateMetrics();
    this.eventBus.emit('capa:created', capaEntry);

    return capaEntry;
  }

  /**
   * Update CAPA entry status
   */
  updateStatus(): boolean {
    const entry = this.registry.entries.get(id);
    if (!entry) return false;

    entry.status = status;
    if (status === CAPAStatus.RESOLVED || status === CAPAStatus.CLOSED) {
      entry.resolvedAt = new Date();
      entry.resolution = resolution;
    }

    this.registry.entries.set(id, entry);
    this.updateMetrics();
    this.eventBus.emit('capa:updated', entry);

    return true;
  }

  /**
   * Add corrective or preventive action
   */
  addAction(): boolean {
    const entry = this.registry.entries.get(capaId);
    if (!entry) return false;

    const actionId = this.generateId();
    const newAction: CAPAAction = {
      ...action,
      id: actionId
    };

    if (action.type === 'corrective') {
      entry.correctiveActions.push(newAction);
    } else {
      entry.preventiveActions.push(newAction);
    }

    this.registry.entries.set(capaId, entry);
    this.eventBus.emit('capa:action_added', { capaId, action: newAction });

    return true;
  }

  /**
   * Get CAPA entries by criteria
   */
  getEntries(filter?: {
    category?: CAPACategory;
    severity?: CAPASeverity;
    status?: CAPAStatus;
    module?: string;
    assignedTo?: string;
  }): CAPAEntry[] {
    let entries = Array.from(this.registry.entries.values());

    if (filter) {
      entries = entries.filter(entry => {
        if (filter.category && entry.category !== filter.category) return false;
        if (filter.severity && entry.severity !== filter.severity) return false;
        if (filter.status && entry.status !== filter.status) return false;
        if (filter.module && !entry.relatedModules.includes(filter.module)) return false;
        if (filter.assignedTo && entry.assignedTo !== filter.assignedTo) return false;
        return true;
      });
    }

    return entries;
  }

  /**
   * Get CAPA metrics
   */
  getMetrics(): CAPAMetrics {
    return { ...this.registry.metrics };
  }

  /**
   * Check if PR should be blocked based on CAPA entries
   */
  shouldBlockPR(module: string, changes: string[]): { blocked: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const openEntries = this.getEntries({ status: CAPAStatus.OPEN, module });

    for (const entry of openEntries) {
      if (entry.ciBlocking && entry.severity === CAPASeverity.CRITICAL) {
        reasons.push(`Critical CAPA ${entry.id}: ${entry.title}`);
      }
    }

    return {
      blocked: reasons.length > 0,
      reasons
    };
  }

  /**
   * Generate CAPA impact statement for PR
   */
  generateImpactStatement(): string {
    const relatedEntries = this.getEntries({ module });
    const openEntries = relatedEntries.filter(e => e.status === CAPAStatus.OPEN);

    if (openEntries.length === 0) {
      return 'No open CAPA entries for this module.';
    }

    let statement = `## CAPA Impact Statement\n\n`;
    statement += `**Module:** ${module}\n`;
    statement += `**Open CAPA Entries:** ${openEntries.length}\n\n`;

    for (const entry of openEntries) {
      statement += `### ${entry.id}: ${entry.title}\n`;
      statement += `- **Severity:** ${entry.severity}\n`;
      statement += `- **Status:** ${entry.status}\n`;
      statement += `- **Impact:** ${entry.impact.businessImpact}\n\n`;
    }

    return statement;
  }

  private generateId(): string {
    return `CAPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMetrics(): CAPAMetrics {
    return {
      totalEntries: 0,
      openEntries: 0,
      resolvedEntries: 0,
      averageResolutionTime: 0,
      criticalOpen: 0,
      highOpen: 0,
      mediumOpen: 0,
      lowOpen: 0,
      preventionCoverage: 0,
      regressionRate: 0
    };
  }

  private initializePolicies(): CAPAPolicies {
    return {
      autoCreate: true,
      ciBlocking: true,
      prRequired: true,
      escalationRules: [
        {
          condition: 'critical_open > 3',
          action: 'notify_leadership',
          timeframe: 2
        },
        {
          condition: 'resolution_time > 30',
          action: 'escalate_assignment',
          timeframe: 24
        }
      ],
      notificationChannels: ['#miff-dev', '#miff-alerts']
    };
  }

  private updateMetrics(): void {
    const entries = Array.from(this.registry.entries.values());
    
    this.registry.metrics.totalEntries = entries.length;
    this.registry.metrics.openEntries = entries.filter(e => e.status === CAPAStatus.OPEN).length;
    this.registry.metrics.resolvedEntries = entries.filter(e => e.status === CAPAStatus.RESOLVED).length;
    
    const criticalOpen = entries.filter(e => e.severity === CAPASeverity.CRITICAL && e.status === CAPAStatus.OPEN).length;
    const highOpen = entries.filter(e => e.severity === CAPASeverity.HIGH && e.status === CAPAStatus.OPEN).length;
    const mediumOpen = entries.filter(e => e.severity === CAPASeverity.MEDIUM && e.status === CAPAStatus.OPEN).length;
    const lowOpen = entries.filter(e => e.severity === CAPASeverity.LOW && e.status === CAPAStatus.OPEN).length;
    
    this.registry.metrics.criticalOpen = criticalOpen;
    this.registry.metrics.highOpen = highOpen;
    this.registry.metrics.mediumOpen = mediumOpen;
    this.registry.metrics.lowOpen = lowOpen;

    // Calculate average resolution time
    const resolvedEntries = entries.filter(e => e.resolvedAt);
    if (resolvedEntries.length > 0) {
      const totalTime = resolvedEntries.reduce((sum, entry) => {
        const resolutionTime = entry.resolvedAt?.getTime() - entry.discoveredAt.getTime();
        return sum + (resolutionTime / (1000 * 60 * 60 * 24)); // Convert to days
      }, 0);
      this.registry.metrics.averageResolutionTime = totalTime / resolvedEntries.length;
    }

    // Calculate prevention coverage
    const entriesWithPrevention = entries.filter(e => e.preventiveActions.length > 0);
    this.registry.metrics.preventionCoverage = entries.length > 0 ? (entriesWithPrevention.length / entries.length) * 100 : 0;
  }
}

export default CAPAManager;