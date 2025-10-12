/**
 * CAPA Registry Implementation
 * 
 * Centralized registry for managing CAPA entries across the MIFF framework.
 * Provides persistence, querying, and reporting capabilities.
 */

import { CAPAEntry, CAPACategory, CAPASeverity, CAPAStatus, CAPARegistry, CAPAMetrics } from './CAPASystem';
import { EventBus } from '../EventBusPure/index';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

export class CAPARegistryManager {
  private logger: StructuredLogger;
  private registry: CAPARegistry;
  private eventBus: EventBus;
  private dataPath: string;
  private isInitialized: boolean = false;

  constructor(eventBus: EventBus, dataPath: string = 'data/capa') {
    this.logger = new StructuredLogger({ module: 'CAPARegistryManager' });
    this.eventBus = eventBus;
    this.dataPath = dataPath;
    this.registry = {
      entries: new Map(),
      metrics: this.initializeMetrics(),
      policies: this.initializePolicies()
    };
  }

  /**
   * Initialize the CAPA registry
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.logger.info('🛡️ Initializing CAPA Registry...');

    // Ensure data directory exists
    await this.ensureDataDirectory();

    // Load existing CAPA entries
    await this.loadCAPAEntries();

    // Initialize from audit findings if no entries exist
    if (this.registry.entries.size === 0) {
      await this.initializeFromAuditFindings();
    }

    this.isInitialized = true;
    this.logger.info(`✅ CAPA Registry initialized with ${this.registry.entries.size} entries`);
  }

  /**
   * Create a new CAPA entry
   */
  async createEntry(entry: Omit<CAPAEntry, 'id' | 'discoveredAt' | 'status'>): Promise<CAPAEntry> {
    const id = this.generateId();
    const capaEntry: CAPAEntry = {
      ...entry,
      id,
      discoveredAt: new Date(),
      status: CAPAStatus.OPEN
    };

    this.registry.entries.set(id, capaEntry);
    await this.saveCAPAEntry(capaEntry);
    this.updateMetrics();
    
    this.eventBus.emit('capa:created', capaEntry);
    this.logger.info(`📝 Created CAPA entry: ${id} - ${capaEntry.title}`);

    return capaEntry;
  }

  /**
   * Update CAPA entry status
   */
  async updateStatus(id: string, status: CAPAStatus, resolution?: string): Promise<boolean> {
    const entry = this.registry.entries.get(id);
    if (!entry) {
      this.logger.warn(`⚠️ CAPA entry not found: ${id}`);
      return false;
    }

    const previousStatus = entry.status;
    entry.status = status;
    
    if (status === CAPAStatus.RESOLVED || status === CAPAStatus.CLOSED) {
      entry.resolvedAt = new Date();
      entry.resolution = resolution;
    }

    this.registry.entries.set(id, entry);
    await this.saveCAPAEntry(entry);
    this.updateMetrics();
    
    this.eventBus.emit('capa:updated', { entry, previousStatus });
    this.logger.info(`📝 Updated CAPA entry: ${id} - ${previousStatus} → ${status}`);

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

    return entries.sort((a, b) => {
      // Sort by severity (critical first), then by discovery date
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.discoveredAt.getTime() - a.discoveredAt.getTime();
    });
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
  generateImpactStatement(module: string, changes: string[]): string {
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

  /**
   * Generate CAPA report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const entries = this.getEntries();
    
    let report = '# CAPA System Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Entries:** ${metrics.totalEntries}\n`;
    report += `**Open Entries:** ${metrics.openEntries}\n`;
    report += `**Resolved Entries:** ${metrics.resolvedEntries}\n`;
    report += `**Average Resolution Time:** ${metrics.averageResolutionTime.toFixed(1)} days\n\n`;

    // Severity breakdown
    report += `## Severity Breakdown\n`;
    report += `- **Critical:** ${metrics.criticalOpen} open\n`;
    report += `- **High:** ${metrics.highOpen} open\n`;
    report += `- **Medium:** ${metrics.mediumOpen} open\n`;
    report += `- **Low:** ${metrics.lowOpen} open\n\n`;

    // Open entries by category
    const openEntries = entries.filter(e => e.status === CAPAStatus.OPEN);
    const categoryCounts = new Map<CAPACategory, number>();
    
    for (const entry of openEntries) {
      const count = categoryCounts.get(entry.category) || 0;
      categoryCounts.set(entry.category, count + 1);
    }

    report += `## Open Entries by Category\n`;
    for (const [category, count] of categoryCounts) {
      report += `- **${category}:** ${count} entries\n`;
    }
    report += `\n`;

    // Recent entries
    const recentEntries = entries
      .filter(e => e.status === CAPAStatus.OPEN)
      .slice(0, 10);

    if (recentEntries.length > 0) {
      report += `## Recent Open Entries\n`;
      for (const entry of recentEntries) {
        report += `### ${entry.id}: ${entry.title}\n`;
        report += `- **Severity:** ${entry.severity}\n`;
        report += `- **Category:** ${entry.category}\n`;
        report += `- **Modules:** ${entry.relatedModules.join(', ')}\n`;
        report += `- **Discovered:** ${entry.discoveredAt.toISOString()}\n\n`;
      }
    }

    return report;
  }

  private async ensureDataDirectory(): Promise<void> {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  private async loadCAPAEntries(): Promise<void> {
    const entriesPath = path.join(this.dataPath, 'entries.json');
    
    if (fs.existsSync(entriesPath)) {
      try {
        const data = SafeJSONParser.parse(fs.readFileSync(entriesPath, 'utf-8'));
        for (const entry of data.entries || []) {
          // Convert date strings back to Date objects
          entry.discoveredAt = new Date(entry.discoveredAt);
          if (entry.resolvedAt) {
            entry.resolvedAt = new Date(entry.resolvedAt);
          }
          this.registry.entries.set(entry.id, entry);
        }
        this.logger.info(`📂 Loaded ${this.registry.entries.size} CAPA entries from storage`);
      } catch (error) {
        this.logger.warn('⚠️ Failed to load CAPA entries:', error);
      }
    }
  }

  private async saveCAPAEntry(entry: CAPAEntry): Promise<void> {
    const entriesPath = path.join(this.dataPath, 'entries.json');
    const allEntries = Array.from(this.registry.entries.values());
    
    try {
      fs.writeFileSync(entriesPath, JSON.stringify({ entries: allEntries }, null, 2));
    } catch (error) {
      this.logger.error('❌ Failed to save CAPA entry:', error);
    }
  }

  private async initializeFromAuditFindings(): Promise<void> {
    this.logger.info('📋 Initializing CAPA entries from audit findings...');

    // Schema Drift (Critical)
    await this.createEntry({
      title: 'Schema Drift Across Modules',
      description: '177+ schema references across modules with potential conflicts between BridgeSchemaPure, SharedSchemaPure, and module-specific schemas',
      category: CAPACategory.SCHEMA_DRIFT,
      severity: CAPASeverity.CRITICAL,
      discoveredBy: 'Comprehensive Audit',
      impact: {
        modulesAffected: ['BridgeSchemaPure', 'SharedSchemaPure', 'AvatarSystemPure'],
        usersAffected: ['All Contributors'],
        businessImpact: 'Data integrity issues, validation inconsistencies, potential runtime failures',
        technicalDebt: 9,
        riskLevel: 'critical'
      },
      tags: ['schema', 'validation', 'data-integrity'],
      relatedModules: ['BridgeSchemaPure', 'SharedSchemaPure', 'AvatarSystemPure'],
      ciBlocking: true,
      prRequired: true,
      correctiveActions: [],
      preventiveActions: []
    });

    // Migration Gaps (Critical)
    await this.createEntry({
      title: 'Migration System Gaps',
      description: '357+ migration references found with no centralized migration system, scattered module-specific migration logic',
      category: CAPACategory.MIGRATION_GAPS,
      severity: CAPASeverity.CRITICAL,
      discoveredBy: 'Comprehensive Audit',
      impact: {
        modulesAffected: ['All Modules'],
        usersAffected: ['All Contributors'],
        businessImpact: 'Data loss risk, version incompatibility, no systematic migration process',
        technicalDebt: 8,
        riskLevel: 'critical'
      },
      tags: ['migration', 'data-loss', 'versioning'],
      relatedModules: ['All Modules'],
      ciBlocking: true,
      prRequired: true,
      correctiveActions: [],
      preventiveActions: []
    });

    // Test Mock Overuse (High)
    await this.createEntry({
      title: 'Excessive Test Mock Usage',
      description: '1,350+ mock/stub instances across codebase masking real behavior and creating false test confidence',
      category: CAPACategory.STUBBED_LOGIC,
      severity: CAPASeverity.HIGH,
      discoveredBy: 'Comprehensive Audit',
      impact: {
        modulesAffected: ['EffectsPure', 'MagicSystemPure', 'FusionPure'],
        usersAffected: ['All Contributors'],
        businessImpact: 'False test confidence, integration gaps, production failures',
        technicalDebt: 7,
        riskLevel: 'high'
      },
      tags: ['testing', 'mocks', 'quality'],
      relatedModules: ['EffectsPure', 'MagicSystemPure', 'FusionPure'],
      ciBlocking: false,
      prRequired: true,
      correctiveActions: [],
      preventiveActions: []
    });

    // Asset Pipeline (High)
    await this.createEntry({
      title: 'Asset Pipeline Validation Gaps',
      description: '711+ asset references without existence validation, potential broken pipelines and missing assets',
      category: CAPACategory.ASSET_PIPELINE,
      severity: CAPASeverity.HIGH,
      discoveredBy: 'Comprehensive Audit',
      impact: {
        modulesAffected: ['UnityBridgePure', 'GodotBridgePure', 'UnrealBridgePure'],
        usersAffected: ['All Contributors'],
        businessImpact: 'Missing assets, broken pipelines, version mismatches',
        technicalDebt: 6,
        riskLevel: 'high'
      },
      tags: ['assets', 'pipeline', 'validation'],
      relatedModules: ['UnityBridgePure', 'GodotBridgePure', 'UnrealBridgePure'],
      ciBlocking: false,
      prRequired: true,
      correctiveActions: [],
      preventiveActions: []
    });

    // Interface Safety (Medium)
    await this.createEntry({
      title: 'Mixed Interface Safety',
      description: 'Inconsistent interface patterns, mixed safety levels, documentation gaps across modules',
      category: CAPACategory.INTERFACE_SAFETY,
      severity: CAPASeverity.MEDIUM,
      discoveredBy: 'Comprehensive Audit',
      impact: {
        modulesAffected: ['All CLI Harnesses'],
        usersAffected: ['All Contributors'],
        businessImpact: 'Contributor confusion, silent failures, inconsistent error reporting',
        technicalDebt: 5,
        riskLevel: 'medium'
      },
      tags: ['interfaces', 'safety', 'consistency'],
      relatedModules: ['All CLI Harnesses'],
      ciBlocking: false,
      prRequired: false,
      correctiveActions: [],
      preventiveActions: []
    });

    // Runtime Fidelity (Medium)
    await this.createEntry({
      title: 'Mixed Runtime Fidelity',
      description: '99+ lifecycle/transport references with mock implementations, simulation vs reality gaps',
      category: CAPACategory.RUNTIME_FIDELITY,
      severity: CAPASeverity.MEDIUM,
      discoveredBy: 'Comprehensive Audit',
      impact: {
        modulesAffected: ['NetworkBridgePure', 'UnityBridgePure', 'GodotBridgePure'],
        usersAffected: ['All Contributors'],
        businessImpact: 'Integration failures, performance issues, production scaling problems',
        technicalDebt: 4,
        riskLevel: 'medium'
      },
      tags: ['runtime', 'fidelity', 'performance'],
      relatedModules: ['NetworkBridgePure', 'UnityBridgePure', 'GodotBridgePure'],
      ciBlocking: false,
      prRequired: false,
      correctiveActions: [],
      preventiveActions: []
    });

    this.logger.info(`✅ Created ${this.registry.entries.size} CAPA entries from audit findings`);
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

  private initializePolicies(): any {
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
        const resolutionTime = entry.resolvedAt!.getTime() - entry.discoveredAt.getTime();
        return sum + (resolutionTime / (1000 * 60 * 60 * 24)); // Convert to days
      }, 0);
      this.registry.metrics.averageResolutionTime = totalTime / resolvedEntries.length;
    }

    // Calculate prevention coverage
    const entriesWithPrevention = entries.filter(e => e.preventiveActions.length > 0);
    this.registry.metrics.preventionCoverage = entries.length > 0 ? (entriesWithPrevention.length / entries.length) * 100 : 0;
  }
}

export default CAPARegistryManager;