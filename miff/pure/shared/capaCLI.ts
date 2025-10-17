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
  
  private registry: CAPARegistryManager;
  private eventBus: EventBus;

  constructor(...args: any[]) {
    
    this.eventBus = new EventBus();
    this.registry = new CAPARegistryManager(this.eventBus);
  }

  async run(): Promise<void> {
    await this.registry.initialize();

    const args = process.argv.slice(2);
    const command = args[0!];

    try {
      switch (command) {
        case 'list':
          try {
            await this.listEntries(args.slice(1));
          } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
            console.error('Error listing entries:', err instanceof Error ? message: String(err));
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error:', error instanceof Error ? message: error);
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
      console.info('📝 No CAPA entries found matching criteria');
      return;
    }

    console.info(`📝 Found ${entries.length} CAPA entries:\n`);
    
    for (const entry of entries) {
      const statusIcon = this.getStatusIcon(entry.status);
      const severityIcon = this.getSeverityIcon(entry.severity);
      
      console.info(`${statusIcon} ${severityIcon} ${entry.id}: ${entry.title}`);
      console.info(`   Category: ${entry.category} | Modules: ${entry.relatedModules.join(', ')}`);
      console.info(`   Discovered: ${entry.discoveredAt.toISOString().split('T')[0!]}`);
      if (entry.assignedTo) {
        console.info(`   Assigned to: ${entry.assignedTo}`);
      }
      console.info('');
    }
  }

  private async createEntry(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('❌ Usage: create <title> <description> [options]');
      console.error('   Options: --category <category> --severity <severity> --module <module>');
      return;
    }

    const title = args[0!];
    const description = args[1!];
    
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
    console.info(`✅ Created CAPA entry: ${created.id}`);
    console.info(`   Title: ${created.title}`);
    console.info(`   Severity: ${created.severity}`);
    console.info(`   Category: ${created.category}`);
  }

  private async updateEntry(args: string[]): Promise<void> {
    if (args.length < 3) {
      console.error('❌ Usage: update <id> <status> [resolution]');
      return;
    }

    const id = args[0!];
    const status = args[1!] as CAPAStatus;
    const resolution = args[2!];

    const success = await this.registry.updateStatus(id, status, resolution);
    
    if (success) {
      console.info(`✅ Updated CAPA entry ${id} to ${status}`);
    } else {
      console.error(`❌ Failed to update CAPA entry ${id}`);
    }
  }

  private async showEntry(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('❌ Usage: show <id>');
      return;
    }

    const id = args[0!];
    const entries = this.registry.getEntries();
    const entry = entries.find(e => e.id === id);

    if (!entry) {
      console.error(`❌ CAPA entry not found: ${id}`);
      return;
    }

    console.info(`# ${entry.id}: ${entry.title}\n`);
    console.info(`**Description:** ${entry.description}\n`);
    console.info(`**Category:** ${entry.category}`);
    console.info(`**Severity:** ${entry.severity}`);
    console.info(`**Status:** ${entry.status}`);
    console.info(`**Discovered:** ${entry.discoveredAt.toISOString()}`);
    if (entry.resolvedAt) {
      console.info(`**Resolved:** ${entry.resolvedAt.toISOString()}`);
    }
    if (entry.assignedTo) {
      console.info(`**Assigned to:** ${entry.assignedTo}`);
    }
    console.info(`**Modules:** ${entry.relatedModules.join(', ')}`);
    console.info(`**Tags:** ${entry.tags.join(', ')}`);
    console.info(`**CI Blocking:** ${entry.ciBlocking ? 'Yes' : 'No'}`);
    console.info(`**PR Required:** ${entry.prRequired ? 'Yes' : 'No'}\n`);

    console.info(`**Impact:**`);
    console.info(`- Modules Affected: ${entry.impact.modulesAffected.join(', ')}`);
    console.info(`- Users Affected: ${entry.impact.usersAffected.join(', ')}`);
    console.info(`- Business Impact: ${entry.impact.businessImpact}`);
    console.info(`- Technical Debt: ${entry.impact.technicalDebt}/10`);
    console.info(`- Risk Level: ${entry.impact.riskLevel}\n`);

    if (entry.correctiveActions.length > 0) {
      console.info(`**Corrective Actions:**`);
      for (const action of entry.correctiveActions) {
        console.info(`- ${action.description} (${action.status})`);
      }
      console.info('');
    }

    if (entry.preventiveActions.length > 0) {
      console.info(`**Preventive Actions:**`);
      for (const action of entry.preventiveActions) {
        console.info(`- ${action.description} (${action.status})`);
      }
      console.info('');
    }

    if (entry.resolution) {
      console.info(`**Resolution:** ${entry.resolution}\n`);
    }
  }

  private async generateReport(args: string[]): Promise<void> {
    const report = this.registry.generateReport();
    console.info(report);
  }

  private async checkPR(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('❌ Usage: check <module> [changes...]');
      return;
    }

    const module = args[0!];
    const changes = args.slice(1);

    const result = this.registry.shouldBlockPR(module, changes);
    
    if (result.blocked) {
      console.info('🚫 PR should be BLOCKED');
      console.info('Reasons:');
      for (const reason of result.reasons) {
        console.info(`  - ${reason}`);
      }
    } else {
      console.info('✅ PR can proceed');
    }

    // Generate impact statement
    const impactStatement = this.registry.generateImpactStatement(module, changes);
    console.info('\n' + impactStatement);
  }

  private showHelp(): void {
    console.info(`
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
      case OPEN: return '🔴';
      case IN_PROGRESS: return '🟡';
      case REVIEW: return '🔵';
      case RESOLVED: return '🟢';
      case CLOSED: return '✅';
      case DEFERRED: return '⏸️';
      default: return '❓';
    }
  }

  private getSeverityIcon(severity: CAPASeverity): string {
    switch (severity) {
      case CRITICAL: return '🚨';
      case HIGH: return '⚠️';
      case MEDIUM: return '📝';
      case LOW: return 'ℹ️';
      default: return '❓';
    }
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1!]}`) {
  const cli = new CAPACLI();
  cli.run().catch((error) => {
    console.error('CAPA CLI Error:', err instanceof Error ? message: String(err));
    // Only exit with code 1 for non-list commands
    if (process.argv[2!] !== 'list') {
      process.exit(1);
    }
  });
}

export default CAPACLI;