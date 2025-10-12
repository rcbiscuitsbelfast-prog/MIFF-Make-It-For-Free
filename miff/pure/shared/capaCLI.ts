#!/usr/bin/env tsx

/**
 * CAPA CLI Tool
 * 
 * Command-line interface for managing CAPA entries and generating reports.
 * Provides CRUD operations, filtering, and reporting capabilities.
 */

import { CAPARegistryManager } from './CAPARegistry';
import { EventBus } from '../EventBusPure/index';
import { CAPACategory, CAPASeverity, CAPAStatus } from './CAPASystem';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class CAPACLI {
  private logger: StructuredLogger;
  private registry: CAPARegistryManager;
  private eventBus: EventBus;

  constructor() {
    this.logger = new StructuredLogger({ module: 'CAPACLI' });
    this.eventBus = new EventBus();
    this.registry = new CAPARegistryManager(this.eventBus);
  }

  async run(): Promise<void> {
    await this.registry.initialize();

    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'list':
          try {
            await this.listEntries(args.slice(1));
          } catch (error) {
            this.logger.error('Error listing entries:', error);
            // Don't exit with error for list command
          }
          break;
        case 'create':
          await this.createEntry(args.slice(1));
          break;
        case 'update':
          await this.updateEntry(args.slice(1));
          break;
        case 'show':
          await this.showEntry(args.slice(1));
          break;
        case 'report':
          await this.generateReport(args.slice(1));
          break;
        case 'check':
          await this.checkPR(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      this.logger.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async listEntries(args: string[]): Promise<void> {
    const filter: any = {};
    
    // Parse filter arguments
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      
      switch (key) {
        case '--category':
          filter.category = value as CAPACategory;
          break;
        case '--severity':
          filter.severity = value as CAPASeverity;
          break;
        case '--status':
          filter.status = value as CAPAStatus;
          break;
        case '--module':
          filter.module = value;
          break;
        case '--assigned-to':
          filter.assignedTo = value;
          break;
      }
    }

    const entries = this.registry.getEntries(filter);
    
    if (entries.length === 0) {
      this.logger.info('📝 No CAPA entries found matching criteria');
      return;
    }

    this.logger.info(`📝 Found ${entries.length} CAPA entries:\n`);
    
    for (const entry of entries) {
      const statusIcon = this.getStatusIcon(entry.status);
      const severityIcon = this.getSeverityIcon(entry.severity);
      
      this.logger.info(`${statusIcon} ${severityIcon} ${entry.id}: ${entry.title}`);
      this.logger.info(`   Category: ${entry.category} | Modules: ${entry.relatedModules.join(', ')}`);
      this.logger.info(`   Discovered: ${entry.discoveredAt.toISOString().split('T')[0]}`);
      if (entry.assignedTo) {
        this.logger.info(`   Assigned to: ${entry.assignedTo}`);
      }
      this.logger.info('');
    }
  }

  private async createEntry(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.error('❌ Usage: create <title> <description> [options]');
      this.logger.error('   Options: --category <category> --severity <severity> --module <module>');
      return;
    }

    const title = args[0];
    const description = args[1];
    
    const entry: any = {
      title,
      description,
      category: CAPACategory.SCHEMA_DRIFT,
      severity: CAPASeverity.MEDIUM,
      impact: {
        modulesAffected: [],
        usersAffected: ['Contributors'],
        businessImpact: 'To be determined',
        technicalDebt: 5,
        riskLevel: 'medium'
      },
      tags: [],
      relatedModules: [],
      ciBlocking: false,
      prRequired: false,
      correctiveActions: [],
      preventiveActions: []
    };

    // Parse options
    for (let i = 2; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      
      switch (key) {
        case '--category':
          entry.category = value as CAPACategory;
          break;
        case '--severity':
          entry.severity = value as CAPASeverity;
          break;
        case '--module':
          entry.relatedModules.push(value);
          break;
        case '--tag':
          entry.tags.push(value);
          break;
        case '--ci-blocking':
          entry.ciBlocking = true;
          i--; // No value for this flag
          break;
        case '--pr-required':
          entry.prRequired = true;
          i--; // No value for this flag
          break;
      }
    }

    const created = await this.registry.createEntry(entry);
    this.logger.info(`✅ Created CAPA entry: ${created.id}`);
    this.logger.info(`   Title: ${created.title}`);
    this.logger.info(`   Severity: ${created.severity}`);
    this.logger.info(`   Category: ${created.category}`);
  }

  private async updateEntry(args: string[]): Promise<void> {
    if (args.length < 3) {
      this.logger.error('❌ Usage: update <id> <status> [resolution]');
      return;
    }

    const id = args[0];
    const status = args[1] as CAPAStatus;
    const resolution = args[2];

    const success = await this.registry.updateStatus(id, status, resolution);
    
    if (success) {
      this.logger.info(`✅ Updated CAPA entry ${id} to ${status}`);
    } else {
      this.logger.error(`❌ Failed to update CAPA entry ${id}`);
    }
  }

  private async showEntry(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.error('❌ Usage: show <id>');
      return;
    }

    const id = args[0];
    const entries = this.registry.getEntries();
    const entry = entries.find(e => e.id === id);

    if (!entry) {
      this.logger.error(`❌ CAPA entry not found: ${id}`);
      return;
    }

    this.logger.info(`# ${entry.id}: ${entry.title}\n`);
    this.logger.info(`**Description:** ${entry.description}\n`);
    this.logger.info(`**Category:** ${entry.category}`);
    this.logger.info(`**Severity:** ${entry.severity}`);
    this.logger.info(`**Status:** ${entry.status}`);
    this.logger.info(`**Discovered:** ${entry.discoveredAt.toISOString()}`);
    if (entry.resolvedAt) {
      this.logger.info(`**Resolved:** ${entry.resolvedAt.toISOString()}`);
    }
    if (entry.assignedTo) {
      this.logger.info(`**Assigned to:** ${entry.assignedTo}`);
    }
    this.logger.info(`**Modules:** ${entry.relatedModules.join(', ')}`);
    this.logger.info(`**Tags:** ${entry.tags.join(', ')}`);
    this.logger.info(`**CI Blocking:** ${entry.ciBlocking ? 'Yes' : 'No'}`);
    this.logger.info(`**PR Required:** ${entry.prRequired ? 'Yes' : 'No'}\n`);

    this.logger.info(`**Impact:**`);
    this.logger.info(`- Modules Affected: ${entry.impact.modulesAffected.join(', ')}`);
    this.logger.info(`- Users Affected: ${entry.impact.usersAffected.join(', ')}`);
    this.logger.info(`- Business Impact: ${entry.impact.businessImpact}`);
    this.logger.info(`- Technical Debt: ${entry.impact.technicalDebt}/10`);
    this.logger.info(`- Risk Level: ${entry.impact.riskLevel}\n`);

    if (entry.correctiveActions.length > 0) {
      this.logger.info(`**Corrective Actions:**`);
      for (const action of entry.correctiveActions) {
        this.logger.info(`- ${action.description} (${action.status})`);
      }
      this.logger.info('');
    }

    if (entry.preventiveActions.length > 0) {
      this.logger.info(`**Preventive Actions:**`);
      for (const action of entry.preventiveActions) {
        this.logger.info(`- ${action.description} (${action.status})`);
      }
      this.logger.info('');
    }

    if (entry.resolution) {
      this.logger.info(`**Resolution:** ${entry.resolution}\n`);
    }
  }

  private async generateReport(args: string[]): Promise<void> {
    const report = this.registry.generateReport();
    this.logger.info(report);
  }

  private async checkPR(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.error('❌ Usage: check <module> [changes...]');
      return;
    }

    const module = args[0];
    const changes = args.slice(1);

    const result = this.registry.shouldBlockPR(module, changes);
    
    if (result.blocked) {
      this.logger.info('🚫 PR should be BLOCKED');
      this.logger.info('Reasons:');
      for (const reason of result.reasons) {
        this.logger.info(`  - ${reason}`);
      }
    } else {
      this.logger.info('✅ PR can proceed');
    }

    // Generate impact statement
    const impactStatement = this.registry.generateImpactStatement(module, changes);
    this.logger.info('\n' + impactStatement);
  }

  private showHelp(): void {
    this.logger.info(`
🛡️ CAPA CLI Tool

Usage: tsx capaCLI.ts <command> [options]

Commands:
  list                    List CAPA entries
    --category <cat>      Filter by category
    --severity <sev>      Filter by severity
    --status <status>     Filter by status
    --module <module>     Filter by module
    --assigned-to <user>  Filter by assignee

  create <title> <desc>   Create new CAPA entry
    --category <cat>      Set category
    --severity <sev>      Set severity
    --module <module>     Add affected module
    --tag <tag>           Add tag
    --ci-blocking         Mark as CI blocking
    --pr-required         Mark as PR required

  update <id> <status>    Update CAPA entry status
    [resolution]          Optional resolution text

  show <id>               Show detailed CAPA entry

  report                  Generate CAPA report

  check <module>          Check if PR should be blocked
    [changes...]          List of changed files

  help                    Show this help

Categories: schema_drift, manager_miswiring, stubbed_logic, skipped_tests, 
           asset_pipeline, migration_gaps, interface_safety, runtime_fidelity, 
           performance, security, documentation

Severities: critical, high, medium, low

Statuses: open, in_progress, review, resolved, closed, deferred

Examples:
  tsx capaCLI.ts list --severity critical
  tsx capaCLI.ts create "Test Issue" "Description" --severity high --module TestPure
  tsx capaCLI.ts update CAPA-123 resolved "Fixed in PR #456"
  tsx capaCLI.ts check UnityBridgePure src/UnityBridgePure/index.ts
`);
  }

  private getStatusIcon(status: CAPAStatus): string {
    switch (status) {
      case CAPAStatus.OPEN: return '🔴';
      case CAPAStatus.IN_PROGRESS: return '🟡';
      case CAPAStatus.REVIEW: return '🔵';
      case CAPAStatus.RESOLVED: return '🟢';
      case CAPAStatus.CLOSED: return '✅';
      case CAPAStatus.DEFERRED: return '⏸️';
      default: return '❓';
    }
  }

  private getSeverityIcon(severity: CAPASeverity): string {
    switch (severity) {
      case CAPASeverity.CRITICAL: return '🚨';
      case CAPASeverity.HIGH: return '⚠️';
      case CAPASeverity.MEDIUM: return '📝';
      case CAPASeverity.LOW: return 'ℹ️';
      default: return '❓';
    }
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new CAPACLI();
  cli.run().catch((error) => {
    this.logger.error('CAPA CLI Error:', error);
    // Only exit with code 1 for non-list commands
    if (process.argv[2] !== 'list') {
      process.exit(1);
    }
  });
}

export default CAPACLI;