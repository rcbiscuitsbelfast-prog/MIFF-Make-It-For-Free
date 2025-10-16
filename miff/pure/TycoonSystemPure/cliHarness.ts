#!/usr/bin/env tsx

/**
 * TycoonSystemPure CLI Harness
 *
 * AAA-quality CLI interface for TycoonSystemPure with:
 * - Interactive business management
 * - Real-time financial monitoring
 * - Facility and staff management
 * - Market analysis and competition
 * - Strategic planning tools
 * - Performance monitoring
 * - Mobile-friendly interface
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';
import TycoonSystemPure from './index.js';
import TycoonManagerPure from './Manager.js';
import * as fs from 'fs';

// ============================================================================
// CLI HARNESS CONFIGURATION
// ============================================================================

interface CLIOptions {
  mode: 'interactive' | 'simulate' | 'manage' | 'test' | 'benchmark';
  initialCapital?: number;
  autoManagement?: boolean;
  simulationDays?: number;
  verbose?: boolean;
}

interface BusinessState {
  capital: number;
  facilities: Record<string, any>;
  staff: Record<string, any>;
  marketCondition: string;
  businessAge: number;
  reputation: number;
}

// ============================================================================
// CLI HARNESS IMPLEMENTATION
// ============================================================================

export class TycoonSystemCLI {
  private tycoonSystem: TycoonSystemPure;
  private tycoonManager: TycoonManagerPure;
  private eventBus: EventBus;
  private options: CLIOptions;
  private businessState: BusinessState;
  private isRunning: boolean = false;
  private startTime: number = 0;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 3600000; // 1 hour
  private autoManagement: boolean = false;

  // CLI state
  private readline: any;
  private isInteractive: boolean = false;

  constructor(options: CLIOptions) {
    this.options = options;
    this.eventBus = new EventBus();
    this.tycoonSystem = new TycoonSystemPure(this.eventBus, {
      initialCapital: options.initialCapital || 100000,
      enableMarketFluctuations: true,
      enableCompetition: true,
      enableStaffAI: true,
      enableSeasonalEffects: true,
      enableLoans: true,
      enableInvestments: true,
      updateInterval: 3600,
      performanceMode: 'high',
      debugMode: options.verbose || false
    });

    this.tycoonManager = new TycoonManagerPure(this.eventBus, {
      enableAutoManagement: options.autoManagement || false,
      managementInterval: 3600,
      enableAnalytics: true,
      enableOptimization: true,
      enableMarketAnalysis: true,
      riskTolerance: 'medium',
      performanceMode: 'high',
      debugMode: options.verbose || false
    });

    this.businessState = this.initializeBusinessState();
    this.setupEventHandlers();
    this.initializeInterface();

    if (options.autoManagement) {
      this.autoManagement = true;
    }
  }

  private initializeBusinessState(): BusinessState {
    return {
      capital: this.options.initialCapital || 100000,
      facilities: {},
      staff: {},
      marketCondition: 'stable',
      businessAge: 0,
      reputation: 50
    };
  }

  private setupEventHandlers(): void {
    this.eventBus.on('tycoon:revenue', (data) => {
      this.businessState.capital += data.amount;

      if (this.options.verbose) {
        this.log(`💰 Revenue: +${data.amount.toFixed(2)} from ${data.source}`);
      }
    });

    this.eventBus.on('tycoon:expense', (data) => {
      this.businessState.capital -= data.amount;

      if (this.options.verbose) {
        this.log(`💸 Expense: -${data.amount.toFixed(2)} for ${data.category}`);
      }
    });

    this.eventBus.on('tycoon:facility_constructed', (data) => {
      this.businessState.facilities[data.facility.id] = data.facility;

      if (this.options.verbose) {
        this.log(`🏭 Constructed: ${data.facility.name} (${data.facility.type})`);
      }
    });

    this.eventBus.on('tycoon:staff_hired', (data) => {
      this.businessState.staff[data.staff.id] = data.staff;

      if (this.options.verbose) {
        this.log(`👥 Hired: ${data.staff.name} (${data.staff.role})`);
      }
    });

    this.eventBus.on('tycoon:market_change', (data) => {
      this.businessState.marketCondition = data.new;

      if (this.options.verbose) {
        this.log(`📈 Market changed: ${data.old} → ${data.new}`);
      }
    });
  }

  private initializeInterface(): void {
    if (typeof window === 'undefined') {
      this.readline = require('readline');
      this.setupReadline();
    } else {
      this.isInteractive = false;
    }
  }

  private setupReadline(): void {
    const rl = this.readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Tycoon> '
    });

    rl.on('line', (line: string) => {
      this.processCommand(line.trim());
      rl.prompt();
    });

    rl.on('SIGINT', () => {
      this.log('\n🛑 Shutting down tycoon system...');
      this.shutdown();
    });

    this.isInteractive = true;
  }

  private processCommand(command: string): void {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'status':
      case 's':
        this.showStatus();
        break;

      case 'build':
        this.buildFacility(args);
        break;

      case 'hire':
        this.hireStaff(args);
        break;

      case 'upgrade':
      case 'up':
        this.upgradeFacility(args);
        break;

      case 'loan':
        this.takeLoan(args);
        break;

      case 'invest':
        this.makeInvestment(args);
        break;

      case 'market':
      case 'm':
        this.showMarket();
        break;

      case 'manage':
        this.runManagement();
        break;

      case 'auto':
        this.toggleAutoManagement();
        break;

      case 'simulate':
        this.runSimulation();
        break;

      case 'stats':
        this.showStats();
        break;

      case 'valuation':
        this.showValuation();
        break;

      case 'risk':
        this.showRiskAssessment();
        break;

      case 'save':
        this.saveGame();
        break;

      case 'load':
        this.loadGame();
        break;

      case 'reset':
        this.resetBusiness();
        break;

      case 'export':
        this.exportData(args[0]);
        break;

      case 'quit':
      case 'q':
      case 'exit':
        this.shutdown();
        break;

      default:
        this.showHelp();
    }
  }

  private showStatus(): void {
    const capital = this.tycoonSystem.getCapital();
    const facilities = this.tycoonSystem.getFacilities();
    const staff = this.tycoonSystem.getStaff();
    const marketData = this.tycoonSystem.getMarketData();
    const stats = this.tycoonSystem.getBusinessStats();

    this.log('\n=== BUSINESS STATUS ===');
    this.log(`💰 Capital: $${capital.toFixed(2)}`);
    this.log(`📈 Market Condition: ${marketData.condition}`);
    this.log(`🏭 Facilities: ${facilities.size}`);
    this.log(`👥 Staff: ${staff.size}`);
    this.log(`📊 Customer Satisfaction: ${stats.customerSatisfaction.toFixed(1)}%`);
    this.log(`🏆 Reputation: ${stats.reputation.toFixed(1)}`);
    this.log(`📅 Business Age: ${stats.businessAge.toFixed(1)} days`);

    this.log('\n🏭 FACILITIES:');
    facilities.forEach((facility, id) => {
      const status = facility.operational ? '✅' : '🚧';
      this.log(`   ${status} ${facility.name} (${facility.type}) - Level ${facility.level}/${facility.maxLevel}`);
      this.log(`      Efficiency: ${(facility.efficiency * 100).toFixed(1)}%`);
      this.log(`      Staff: ${this.getStaffCount(id)}/${facility.staffSlots}`);
    });

    this.log('\n👥 STAFF:');
    staff.forEach((employee, id) => {
      this.log(`   👤 ${employee.name} (${employee.role}) - Efficiency: ${(employee.efficiency * 100).toFixed(1)}%`);
      this.log(`      Salary: $${employee.salary}/hr, Morale: ${employee.morale.toFixed(1)}`);
    });

    this.log('');
  }

  private buildFacility(args: string[]): void {
    if (args.length === 0) {
      this.log('❌ Usage: build <facility>');
      this.log('   Available: retail_store, factory');
      return;
    }

    const facilityId = args[0];
    const facilities = this.tycoonSystem.getFacilities();

    if (!facilities.has(facilityId)) {
      this.log('❌ Facility not found or not unlocked');
      return;
    }

    const facility = facilities.get(facilityId)!;

    if (this.tycoonSystem.getCapital() < facility.constructionCost) {
      this.log('❌ Insufficient capital for construction');
      return;
    }

    const success = this.tycoonSystem.constructFacility(facilityId);

    if (success) {
      this.log(`✅ Started construction: ${facility.name}`);
      this.log(`   Cost: $${facility.constructionCost.toFixed(2)}`);
      this.log(`   Time: ${facility.constructionTime / 3600} hours`);
    } else {
      this.log('❌ Cannot construct facility');
    }
  }

  private hireStaff(args: string[]): void {
    if (args.length < 2) {
      this.log('❌ Usage: hire <facility> <role> [salary!]');
      this.log('   Roles: manager, worker, specialist, trainee');
      return;
    }

    const facilityId = args[0];
    const role = args[1] as any;
    const salary = args[2] ? parseFloat(args[2]) : 20; // Default 0/hour

    const success = this.tycoonSystem.hireStaff(facilityId, role, salary);

    if (success) {
      this.log(`✅ Hired ${role} for ${facilityId} at $${salary}/hr`);
    } else {
      this.log('❌ Cannot hire staff (insufficient funds or no slots available)');
    }
  }

  private upgradeFacility(args: string[]): void {
    if (args.length === 0) {
      this.log('❌ Usage: upgrade <facility>');
      return;
    }

    const facilityId = args[0];
    const success = this.tycoonSystem.upgradeFacility(facilityId);

    if (success) {
      this.log(`✅ Upgraded ${facilityId}`);
    } else {
      this.log('❌ Cannot upgrade facility (insufficient funds, max level, or not operational)');
    }
  }

  private takeLoan(args: string[]): void {
    if (args.length < 3) {
      this.log('❌ Usage: loan <amount> <interest_rate> <term_months>');
      this.log('   Example: loan 100000 0.05 24');
      return;
    }

    const amount = parseFloat(args[0]);
    const interestRate = parseFloat(args[1]);
    const term = parseInt(args[2]);

    if (isNaN(amount) || isNaN(interestRate) || isNaN(term)) {
      this.log('❌ Invalid loan parameters');
      return;
    }

    const success = this.tycoonSystem.takeLoan(amount, interestRate, term);

    if (success) {
      this.log(`✅ Loan approved: $${amount} at ${(interestRate * 100).toFixed(1)}% for ${term} months`);
    } else {
      this.log('❌ Loan denied (insufficient capital or loans disabled)');
    }
  }

  private makeInvestment(args: string[]): void {
    if (args.length < 2) {
      this.log('❌ Usage: invest <opportunity_id> <amount>');
      this.log('   Example: invest tech_startup 50000');
      return;
    }

    const opportunityId = args[0];
    const amount = parseFloat(args[1]);

    if (isNaN(amount)) {
      this.log('❌ Invalid investment amount');
      return;
    }

    const success = this.tycoonSystem.makeInvestment(opportunityId, amount);

    if (success) {
      this.log(`✅ Invested $${amount} in ${opportunityId}`);
    } else {
      this.log('❌ Investment failed (insufficient capital or investments disabled)');
    }
  }

  private showMarket(): void {
    const marketData = this.tycoonSystem.getMarketData();
    const stats = this.tycoonSystem.getBusinessStats();

    this.log('\n=== MARKET ANALYSIS ===');
    this.log(`📈 Condition: ${marketData.condition}`);
    this.log(`🏢 Competition Level: ${(marketData.competitionLevel * 100).toFixed(1)}%`);
    this.log(`👥 Customer Demand: ${(marketData.customerDemand * 100).toFixed(1)}%`);
    this.log(`💰 Market Share: ${(stats.marketShare * 100).toFixed(1)}%`);
    this.log(`📊 Consumer Confidence: ${marketData.consumerConfidence.toFixed(1)}`);
    this.log(`💹 Economic Growth: ${(marketData.economicGrowth * 100).toFixed(1)}%`);
    this.log(`🏦 Interest Rate: ${(marketData.interestRate * 100).toFixed(1)}%`);
    this.log(`📉 Volatility: ${(marketData.marketVolatility * 100).toFixed(1)}%`);
    this.log('');
  }

  private runManagement(): void {
    this.log('🔧 Running business management...');

    // Get optimization recommendations
    const valuation = this.tycoonManager.getBusinessValuation();
    const cashFlow = this.tycoonManager.getCashFlowProjection(30); // 30 days
    const marketTrends = this.tycoonManager.getMarketTrends();
    const competitiveAdvantage = this.tycoonManager.getCompetitiveAdvantage();

    this.log(`   💰 Business Valuation: $${valuation.toFixed(2)}`);
    this.log(`   💵 30-Day Cash Flow: $${cashFlow.netCashFlow.toFixed(2)}`);
    this.log(`   📈 Market Trends: ${marketTrends.length} opportunities identified`);
    this.log(`   🏆 Competitive Score: ${competitiveAdvantage.score.toFixed(1)}/10`);

    // Auto-optimize
    this.optimizeBusiness();

    this.log('✅ Management complete');
  }

  private optimizeBusiness(): void {
    this.log('🔧 Optimizing business operations...');

    // Get recommendations
    const facilityPriorities = this.tycoonManager.getFacilityUpgradePriority();
    const hiringPriorities = this.tycoonManager.getHiringPriority();
    const investmentOpportunities = this.tycoonManager.getInvestmentOpportunities();

    this.log(`   📋 Facility upgrades needed: ${facilityPriorities.length}`);
    this.log(`   👥 Staff hiring needed: ${hiringPriorities.reduce((sum, p) => sum + p.count, 0)}`);
    this.log(`   💼 Investment opportunities: ${investmentOpportunities.length}`);

    // Apply optimizations
    if (facilityPriorities.length > 0) {
      this.tycoonSystem.upgradeFacility(facilityPriorities[0]);
    }

    if (hiringPriorities.length > 0) {
      const priority = hiringPriorities[0];
      this.tycoonSystem.hireStaff(priority.facilityId, priority.role, 25);
    }
  }

  private toggleAutoManagement(): void {
    this.autoManagement = !this.autoManagement;
    this.log(`🔄 Auto-management ${this.autoManagement ? 'enabled' : 'disabled'}`);
  }

  private runSimulation(): void {
    const days = this.options.simulationDays || 30;
    const hours = days * 24;
    this.log(`🚀 Starting business simulation (${days} days)...`);

    this.startTime = Date.now();
    this.isRunning = true;

    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      const elapsedHours = Math.floor((Date.now() - this.startTime) / 3600000);

      if (elapsedHours >= hours) {
        this.log(`✅ Simulation complete!`);
        this.log(`   Final Capital: $${this.businessState.capital.toFixed(2)}`);
        this.log(`   Business Age: ${(elapsedHours / 24).toFixed(1)} days`);
        this.isRunning = false;
        clearInterval(interval);
        this.showStats();
        this.shutdown();
        return;
      }

      // Run management every 24 hours
      if (elapsedHours % 24 === 0 && this.autoManagement) {
        this.runManagement();
      }

      // Update display every 6 hours
      if (elapsedHours % 6 === 0) {
        const capital = this.businessState.capital;
        this.log(`⏰ Day ${(elapsedHours / 24).toFixed(1)}: $${capital.toFixed(2)} capital`);
      }
    }, 3600000); // Update every hour
  }

  private showStats(): void {
    const stats = this.tycoonManager.getStats();
    const valuation = this.tycoonManager.getBusinessValuation();
    const cashFlow = this.tycoonManager.getCashFlowProjection(30);

    this.log('\n=== BUSINESS STATISTICS ===');
    this.log(`💰 Capital: $${stats.capital.toFixed(2)}`);
    this.log(`🏢 Business Valuation: $${valuation.toFixed(2)}`);
    this.log(`📈 Market Share: ${(stats.marketShare * 100).toFixed(1)}%`);
    this.log(`🏭 Facilities: ${stats.facilities}`);
    this.log(`👥 Staff: ${stats.staff}`);
    this.log(`📅 Business Age: ${stats.businessAge.toFixed(1)} days`);
    this.log(`🏆 Reputation: ${stats.reputation.toFixed(1)}`);
    this.log(`⚠️  Risk Level: ${stats.riskLevel}`);
    this.log(`💵 30-Day Cash Flow: $${cashFlow.netCashFlow.toFixed(2)}`);
    this.log(`📊 Analytics: ${stats.analyticsEnabled ? 'Enabled' : 'Disabled'}`);
    this.log(`🔧 Optimization: ${stats.optimizationEnabled ? 'Enabled' : 'Disabled'}`);
    this.log('');
  }

  private showValuation(): void {
    const valuation = this.tycoonManager.getBusinessValuation();
    const stats = this.tycoonSystem.getBusinessStats();

    this.log('\n=== BUSINESS VALUATION ===');
    this.log(`💰 Current Valuation: $${valuation.toFixed(2)}`);
    this.log(`📈 Total Assets: $${stats.totalAssets.toFixed(2)}`);
    this.log(`📉 Total Liabilities: $${stats.totalLiabilities.toFixed(2)}`);
    this.log(`💵 Net Worth: $${(stats.totalAssets - stats.totalLiabilities).toFixed(2)}`);
    this.log(`🏢 Asset Value: $${valuation.toFixed(2)}`);
    this.log('');
  }

  private showRiskAssessment(): void {
    const riskAssessment = this.tycoonManager.getCashFlowProjection(30); // Using this as proxy for risk
    const competitiveAdvantage = this.tycoonManager.getCompetitiveAdvantage();

    this.log('\n=== RISK ASSESSMENT ===');
    this.log(`⚠️  Overall Risk: ${riskAssessment.confidence < 0.5 ? 'High' : riskAssessment.confidence < 0.8 ? 'Medium' : 'Low'}`);
    this.log(`🏆 Competitive Score: ${competitiveAdvantage.score.toFixed(1)}/10`);
    this.log(`💪 Strengths: ${competitiveAdvantage.strengths.slice(0, 2).join(', ')}`);
    this.log(`⚠️  Weaknesses: ${competitiveAdvantage.weaknesses.slice(0, 2).join(', ')}`);
    this.log(`📈 Opportunities: ${competitiveAdvantage.opportunities.slice(0, 2).join(', ')}`);
    this.log(`⚠️  Threats: ${competitiveAdvantage.threats.slice(0, 2).join(', ')}`);
    this.log('');
  }

  private saveGame(): void {
    this.tycoonManager.saveGame();
    this.log('💾 Business saved');
  }

  private loadGame(): void {
    this.tycoonManager.loadGame();
    this.updateBusinessState();
    this.log('📂 Business loaded');
  }

  private resetBusiness(): void {
    this.tycoonManager.resetGame();
    this.businessState = this.initializeBusinessState();
    this.log('🔄 Business reset');
  }

  private exportData(filename?: string): void {
    const data = {
      businessState: this.businessState,
      stats: this.tycoonManager.getStats(),
      facilities: Array.from(this.tycoonSystem.getFacilities().entries()),
      staff: Array.from(this.tycoonSystem.getStaff().entries()),
      timestamp: Date.now()
    };

    const outputFile = filename || `tycoon_export_${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

    this.log(`💾 Business data exported to: ${outputFile}`);
  }

  private updateBusinessState(): void {
    this.businessState.capital = this.tycoonSystem.getCapital();
    this.businessState.marketCondition = this.tycoonSystem.getMarketData().condition;
    this.businessState.businessAge = this.tycoonSystem.getBusinessStats().businessAge;
    this.businessState.reputation = this.tycoonSystem.getBusinessStats().reputation;
  }

  private getStaffCount(facilityId: string): number {
    const staff = this.tycoonSystem.getStaff();
    let count = 0;

    staff.forEach((employee: any) => {
      if (employee.facilityId === facilityId) {
        count++;
      }
    });

    return count;
  }

  private showHelp(): void {
    this.log('\n=== TYCOON SYSTEM CLI COMMANDS ===');
    this.log('📊 status/s              - Show business status');
    this.log('🏭 build <facility>      - Construct facility');
    this.log('👥 hire <fac> <role> [sal!]- Hire staff');
    this.log('⬆️  upgrade/up <facility> - Upgrade facility');
    this.log('💰 loan <amt> <rate> <term>- Take business loan');
    this.log('💼 invest <id> <amount>  - Make investment');
    this.log('📈 market/m              - Show market analysis');
    this.log('🔧 manage                - Run business management');
    this.log('🔄 auto                  - Toggle auto-management');
    this.log('🚀 simulate              - Run business simulation');
    this.log('📈 stats                 - Show business statistics');
    this.log('💰 valuation             - Show business valuation');
    this.log('⚠️  risk                  - Show risk assessment');
    this.log('💾 save                  - Save business');
    this.log('📂 load                  - Load business');
    this.log('🔄 reset                 - Reset business');
    this.log('💾 export <file>         - Export business data');
    this.log('❓ help/h                - Show this help');
    this.log('👋 quit/q/exit           - Exit CLI');
    this.log('');
    this.log('🏭 Facilities: retail_store, factory');
    this.log('👥 Roles: manager, worker, specialist, trainee');
    this.log('💼 Investments: tech_startup, real_estate');
    this.log('');
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
  }

  private shutdown(): void {
    this.log('👋 Shutting down TycoonSystem CLI...');
    if (this.isInteractive) {
      this.readline.close();
    }
    process.exit(0);
  }

  // Public API methods
  public async run(): Promise<void> {
    this.log('🏢 TycoonSystemPure CLI Harness v1.0.0');
    this.log('💡 Type "help" for available commands');
    this.log('');

    if (this.options.mode === 'interactive') {
      if (this.isInteractive) {
        this.readline.prompt();
      } else {
        this.log('❌ Interactive mode not available in browser environment');
        this.shutdown();
      }
    } else if (this.options.mode === 'simulate') {
      await this.runSimulation();
      this.shutdown();
    } else if (this.options.mode === 'manage') {
      this.log('🤖 Management mode - running optimization loop...');
      this.startAutoMode();
    } else {
      this.log(`❌ Unsupported mode: ${this.options.mode}`);
      this.shutdown();
    }
  }

  private startAutoMode(): void {
    this.isRunning = true;
    this.autoManagement = true;

    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      this.runManagement();
      this.showStatus();

      // Stop after 7 days
      const elapsedHours = Math.floor((Date.now() - this.startTime) / 3600000);
      if (elapsedHours >= 168) { // 7 days
        this.log('⏰ Auto mode complete');
        this.isRunning = false;
        clearInterval(interval);
        this.showStats();
        this.shutdown();
      }
    }, 3600000); // Manage every hour
  }
}

// CLI entry point
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    mode: 'interactive',
    initialCapital: 100000,
    autoManagement: false,
    simulationDays: 30,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i!]) {
      case '--mode':
      case '-m':
        options.mode = args[++i] as CLIOptions['mode'];
        break;
      case '--capital':
      case '-c':
        options.initialCapital = parseFloat(args[++i]);
        break;
      case '--auto':
      case '-a':
        options.autoManagement = true;
        break;
      case '--days':
      case '-d':
        options.simulationDays = parseInt(args[++i]);
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        console.log('TycoonSystemPure CLI Harness');
        console.log('Usage: tsx cliHarness.ts [options!]');
        console.log('Options:');
        console.log('  --mode, -m <mode>          Mode: interactive, simulate, manage');
        console.log('  --capital, -c <amount>     Initial capital amount');
        console.log('  --auto, -a                 Enable auto-management mode');
        console.log('  --days, -d <days>          Simulation duration in days');
        console.log('  --verbose, -v              Enable verbose output');
        console.log('  --help, -h                 Show this help');
        console.log('');
        process.exit(0);
    }
  }

  const cli = new TycoonSystemCLI(options);
  await cli.run();
}

if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TycoonSystemCLI;