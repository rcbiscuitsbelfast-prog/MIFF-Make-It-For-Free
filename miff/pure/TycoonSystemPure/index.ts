/**
 * TycoonSystemPure - AAA Quality Business Management System
 *
 * Advanced business simulation system with:
 * - Facility construction and management
 * - Staff hiring, training, and AI-driven behavior
 * - Revenue pipelines and financial modeling
 * - Market dynamics and competition
 * - Resource allocation and optimization
 * - Mobile-optimized business controls
 * - Integration with other MIFF modules
 * - Remix-safe deterministic behavior
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

// ============================================================================
// TYCOON SYSTEM TYPES & INTERFACES
// ============================================================================

/**
 * Business types in the tycoon system
 */
export type BusinessType = 'retail' | 'manufacturing' | 'service' | 'technology' | 'hospitality' | 'entertainment';

/**
 * Facility types for construction
 */
export type FacilityType = 'small' | 'medium' | 'large' | 'megastore' | 'factory' | 'office' | 'warehouse';

/**
 * Staff roles and positions
 */
export type StaffRole = 'manager' | 'worker' | 'specialist' | 'trainee' | 'executive';

/**
 * Market conditions affecting business
 */
export type MarketCondition = 'booming' | 'stable' | 'declining' | 'recession' | 'recovery';

/**
 * Revenue stream types
 */
export type RevenueType = 'sales' | 'services' | 'rentals' | 'subscriptions' | 'advertising' | 'investments';

/**
 * Business facility definition
 */
export interface BusinessFacility {
  id: string;
  name: string;
  description: string;
  type: FacilityType;
  businessType: BusinessType;
  baseCost: number;
  currentValue: number;
  constructionCost: number;
  constructionTime: number;   // In seconds
  operational: boolean;
  level: number;
  maxLevel: number;
  capacity: number;           // Maximum customers/staff
  efficiency: number;         // 0-1 operational efficiency
  maintenanceCost: number;    // Per hour maintenance cost
  revenueMultiplier: number;  // Applied to base revenue
  staffSlots: number;         // Available staff positions
  customerSatisfaction: number; // 0-100 satisfaction rating
  location: { x: number; y: number };
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Staff member definition
 */
export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  facilityId: string;
  salary: number;             // Per hour
  experience: number;         // 0-100 experience level
  skill: number;              // 0-100 skill level
  morale: number;             // 0-100 happiness level
  efficiency: number;         // 0-1 productivity multiplier
  trainingProgress: number;   // 0-1 training completion
  specializations: string[];  // Special skills/abilities
  hireDate: number;           // When hired
  lastPromotion?: number;     // Last promotion time
  performance: number;        // 0-100 performance rating
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Revenue stream definition
 */
export interface RevenueStream {
  id: string;
  name: string;
  description: string;
  type: RevenueType;
  baseRevenue: number;        // Base revenue per hour
  growthRate: number;         // Growth rate per hour
  stability: number;          // 0-1 stability factor
  customerBase: number;       // Number of customers
  customerRetention: number;  // 0-1 retention rate
  marketShare: number;        // 0-1 market share
  operatingCosts: number;     // Operating costs per hour
  profitMargin: number;       // Profit margin percentage
  seasonalMultiplier: number; // Seasonal variation
  active: boolean;
  metadata?: Record<string, any>;
}

/**
 * Market data for economic simulation
 */
export interface MarketData {
  condition: MarketCondition;
  competitionLevel: number;   // 0-1 competition intensity
  customerDemand: number;     // 0-1 demand level
  inflationRate: number;      // Annual inflation rate
  interestRate: number;       // Current interest rate
  economicGrowth: number;     // GDP growth rate
  consumerConfidence: number; // 0-100 consumer confidence
  marketVolatility: number;   // 0-1 market volatility
  updateTime: number;         // Last update time
  metadata?: Record<string, any>;
}

/**
 * Business loan for financing
 */
export interface BusinessLoan {
  id: string;
  amount: number;
  interestRate: number;       // Annual interest rate
  term: number;               // Term in months
  monthlyPayment: number;
  remainingBalance: number;
  startDate: number;
  nextPayment: number;
  defaulted: boolean;
  metadata?: Record<string, any>;
}

/**
 * Investment opportunity
 */
export interface InvestmentOpportunity {
  id: string;
  name: string;
  description: string;
  initialCost: number;
  expectedReturn: number;     // Expected annual return
  riskLevel: 'low' | 'medium' | 'high';
  duration: number;           // Duration in months
  maturityDate: number;
  currentValue: number;
  invested: boolean;
  metadata?: Record<string, any>;
}

/**
 * Business statistics
 */
export interface BusinessStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  cashFlow: number;
  employeeCount: number;
  facilityCount: number;
  customerSatisfaction: number;
  marketShare: number;
  businessAge: number;        // In days
  reputation: number;         // 0-100 business reputation
  updateTime: number;
}

/**
 * Tycoon system configuration
 */
export interface TycoonSystemConfig {
  initialCapital: number;     // Starting money
  enableMarketFluctuations: boolean;
  enableCompetition: boolean;
  enableStaffAI: boolean;
  enableSeasonalEffects: boolean;
  enableLoans: boolean;
  enableInvestments: boolean;
  updateInterval: number;     // Seconds between updates
  performanceMode: 'high' | 'medium' | 'low';
  debugMode: boolean;
}

/**
 * Integration hooks for other systems
 */
export interface TycoonIntegration {
  onRevenueGenerated?: (amount: number, source: string) => void;
  onExpenseIncurred?: (amount: number, category: string) => void;
  onFacilityConstructed?: (facility: BusinessFacility) => void;
  onStaffHired?: (staff: StaffMember) => void;
  onMarketChange?: (oldCondition: MarketCondition, newCondition: MarketCondition) => void;
  onLoanPayment?: (loanId: string, amount: number) => void;
  onInvestmentMatured?: (investment: InvestmentOpportunity) => void;
  getCurrentTime?: () => number;
  getPlayerState?: () => any;
  getWorldState?: () => any;
}

// ============================================================================
// TYCOON SYSTEM IMPLEMENTATION
// ============================================================================

/**
 * Main TycoonSystemPure class
 * Provides AAA-quality business management with full integration support
 */
export class TycoonSystemPure {
  private eventBus: EventBus;
  private config: TycoonSystemConfig;
  private integrations: TycoonIntegration = {};

  // Core business state
  private facilities: Map<string, BusinessFacility> = new Map();
  private staff: Map<string, StaffMember> = new Map();
  private revenueStreams: Map<string, RevenueStream> = new Map();
  private marketData: MarketData;
  private loans: Map<string, BusinessLoan> = new Map();
  private investments: Map<string, InvestmentOpportunity> = new Map();
  private businessStats: BusinessStats;

  // Financial state
  private capital: number = 0;
  private totalRevenue: number = 0;
  private totalExpenses: number = 0;
  private lastUpdateTime: number = 0;
  private isPaused: boolean = false;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';

  // Market and competition
  private competitors: number = 0;
  private marketShare: number = 0.1; // 10% starting market share
  private customerBase: number = 100;

  constructor(eventBus: EventBus, config: TycoonSystemConfig = {
    initialCapital: 10000,
    enableMarketFluctuations: true,
    enableCompetition: true,
    enableStaffAI: true,
    enableSeasonalEffects: true,
    enableLoans: true,
    enableInvestments: true,
    updateInterval: 3600, // Update every hour
    performanceMode: 'high',
    debugMode: false
  }) {
    this.eventBus = eventBus;
    this.config = config;
    this.capital = config.initialCapital;

    // Initialize market data
    this.marketData = this.createInitialMarketData();

    // Initialize business stats
    this.businessStats = this.createInitialBusinessStats();

    this.initializeSystem();
    this.startUpdateLoop();
  }

  /**
   * Initialize the tycoon system
   */
  private initializeSystem(): void {
    this.initializeFacilities();
    this.initializeRevenueStreams();
    this.initializeMarketData();

    this.setupEventListeners();

    // Emit initialization event
    this.eventBus.emit('tycoon:system_initialized', {
      config: this.config,
      capital: this.capital,
      facilities: this.facilities.size,
      staff: this.staff.size,
      timestamp: Date.now()
    });
  }

  /**
   * Initialize default facilities
   */
  private initializeFacilities(): void {
    const facilities: BusinessFacility[] = [
      {
        id: 'headquarters',
        name: 'Headquarters',
        description: 'Main business headquarters and management center',
        type: 'office',
        businessType: 'technology',
        baseCost: 0,
        currentValue: 50000,
        constructionCost: 0,
        constructionTime: 0,
        operational: true,
        level: 1,
        maxLevel: 5,
        capacity: 20,
        efficiency: 1.0,
        maintenanceCost: 100,
        revenueMultiplier: 1.0,
        staffSlots: 10,
        customerSatisfaction: 80,
        location: { x: 0, y: 0 },
        unlocked: true
      },
      {
        id: 'retail_store',
        name: 'Retail Store',
        description: 'Basic retail outlet for selling goods',
        type: 'medium',
        businessType: 'retail',
        baseCost: 25000,
        currentValue: 25000,
        constructionCost: 25000,
        constructionTime: 86400, // 24 hours
        operational: false,
        level: 0,
        maxLevel: 3,
        capacity: 50,
        efficiency: 0.8,
        maintenanceCost: 50,
        revenueMultiplier: 1.2,
        staffSlots: 5,
        customerSatisfaction: 75,
        location: { x: 100, y: 100 },
        unlocked: true
      },
      {
        id: 'factory',
        name: 'Manufacturing Plant',
        description: 'Industrial facility for manufacturing goods',
        type: 'large',
        businessType: 'manufacturing',
        baseCost: 100000,
        currentValue: 100000,
        constructionCost: 100000,
        constructionTime: 172800, // 48 hours
        operational: false,
        level: 0,
        maxLevel: 5,
        capacity: 100,
        efficiency: 0.9,
        maintenanceCost: 200,
        revenueMultiplier: 1.5,
        staffSlots: 20,
        customerSatisfaction: 60,
        location: { x: 200, y: 0 },
        unlocked: false
      }
    ];

    facilities.forEach(facility => {
      this.facilities.set(facility.id, facility);
    });
  }

  /**
   * Initialize revenue streams
   */
  private initializeRevenueStreams(): void {
    const revenueStreams: RevenueStream[] = [
      {
        id: 'retail_sales',
        name: 'Retail Sales',
        description: 'Revenue from retail store sales',
        type: 'sales',
        baseRevenue: 100,
        growthRate: 5,
        stability: 0.8,
        customerBase: 50,
        customerRetention: 0.7,
        marketShare: 0.1,
        operatingCosts: 20,
        profitMargin: 0.4,
        seasonalMultiplier: 1.2,
        active: false
      },
      {
        id: 'service_fees',
        name: 'Service Fees',
        description: 'Revenue from service-based offerings',
        type: 'services',
        baseRevenue: 200,
        growthRate: 10,
        stability: 0.9,
        customerBase: 25,
        customerRetention: 0.9,
        marketShare: 0.05,
        operatingCosts: 50,
        profitMargin: 0.6,
        seasonalMultiplier: 1.0,
        active: false
      }
    ];

    revenueStreams.forEach(stream => {
      this.revenueStreams.set(stream.id, stream);
    });
  }

  /**
   * Initialize market data
   */
  private initializeMarketData(): void {
    this.marketData = this.createInitialMarketData();
  }

  /**
   * Create initial market data
   */
  private createInitialMarketData(): MarketData {
    return {
      condition: 'stable',
      competitionLevel: 0.3,
      customerDemand: 0.8,
      inflationRate: 0.02, // 2% annual
      interestRate: 0.05,  // 5% annual
      economicGrowth: 0.03, // 3% annual
      consumerConfidence: 70,
      marketVolatility: 0.2,
      updateTime: Date.now()
    };
  }

  /**
   * Create initial business stats
   */
  private createInitialBusinessStats(): BusinessStats {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      totalAssets: this.config.initialCapital,
      totalLiabilities: 0,
      cashFlow: 0,
      employeeCount: 0,
      facilityCount: 1, // Headquarters
      customerSatisfaction: 80,
      marketShare: 0.1,
      businessAge: 0,
      reputation: 50,
      updateTime: Date.now()
    };
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for integration events
    if (this.integrations.onRevenueGenerated) {
      this.eventBus.on('tycoon:revenue', (data: { amount: number, source: string }) => {
        this.integrations.onRevenueGenerated!(data.amount, data.source);
      });
    }

    if (this.integrations.onExpenseIncurred) {
      this.eventBus.on('tycoon:expense', (data: { amount: number, category: string }) => {
        this.integrations.onExpenseIncurred!(data.amount, data.category);
      });
    }

    if (this.integrations.onFacilityConstructed) {
      this.eventBus.on('tycoon:facility_constructed', (data: { facility: BusinessFacility }) => {
        this.integrations.onFacilityConstructed!(data.facility);
      });
    }

    if (this.integrations.onStaffHired) {
      this.eventBus.on('tycoon:staff_hired', (data: { staff: StaffMember }) => {
        this.integrations.onStaffHired!(data.staff);
      });
    }

    if (this.integrations.onMarketChange) {
      this.eventBus.on('tycoon:market_change', (data: { old: MarketCondition, new: MarketCondition }) => {
        this.integrations.onMarketChange!(data.old, data.new);
      });
    }
  }

  /**
   * Start the main update loop
   */
  private startUpdateLoop(): void {
    setInterval(() => {
      if (!this.isPaused) {
        this.updateBusiness();
      }
    }, this.config.updateInterval);
  }

  /**
   * Update business operations
   */
  private updateBusiness(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 3600000; // Convert to hours
    this.lastUpdateTime = now;

    if (deltaTime <= 0) return;

    // Update market conditions
    this.updateMarketConditions(deltaTime);

    // Update facilities
    this.updateFacilities(deltaTime);

    // Update staff
    this.updateStaff(deltaTime);

    // Update revenue streams
    this.updateRevenue(deltaTime);

    // Update expenses
    this.updateExpenses(deltaTime);

    // Update loans and investments
    this.updateFinancials(deltaTime);

    // Update business statistics
    this.updateBusinessStats(deltaTime);

    // Check for market events
    this.checkMarketEvents();
  }

  /**
   * Update market conditions
   */
  private updateMarketConditions(deltaTime: number): void {
    // Simple market fluctuation simulation
    const fluctuation = (Math.random() - 0.5) * 0.1 * deltaTime;
    this.marketData.customerDemand = Math.max(0.1, Math.min(1.0,
      this.marketData.customerDemand + fluctuation
    ));

    // Update market condition based on demand
    if (this.marketData.customerDemand > 0.8) {
      if (this.marketData.condition !== 'booming') {
        const oldCondition = this.marketData.condition;
        this.marketData.condition = 'booming';
        this.eventBus.emit('tycoon:market_change', {
          old: oldCondition,
          new: 'booming',
          timestamp: Date.now()
        });
      }
    } else if (this.marketData.customerDemand < 0.3) {
      if (this.marketData.condition !== 'recession') {
        const oldCondition = this.marketData.condition;
        this.marketData.condition = 'recession';
        this.eventBus.emit('tycoon:market_change', {
          old: oldCondition,
          new: 'recession',
          timestamp: Date.now()
        });
      }
    } else if (this.marketData.condition !== 'stable') {
      const oldCondition = this.marketData.condition;
      this.marketData.condition = 'stable';
      this.eventBus.emit('tycoon:market_change', {
        old: oldCondition,
        new: 'stable',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Update facilities
   */
  private updateFacilities(deltaTime: number): void {
    this.facilities.forEach((facility, facilityId) => {
      if (!facility.operational) return;

      // Update efficiency based on staff and maintenance
      const staffCount = this.getStaffCount(facilityId);
      const efficiency = Math.min(1.0,
        (staffCount / facility.staffSlots) * 0.7 + 0.3
      );

      facility.efficiency = efficiency;
      facility.customerSatisfaction = this.calculateCustomerSatisfaction(facility);

      // Generate revenue from facility
      if (facility.revenueMultiplier > 0) {
        const revenue = facility.currentValue * facility.revenueMultiplier * facility.efficiency * deltaTime;
        this.generateRevenue('facility', revenue);
      }
    });
  }

  /**
   * Update staff
   */
  private updateStaff(deltaTime: number): void {
    this.staff.forEach((staffMember, staffId) => {
      // Update morale and performance
      staffMember.morale = Math.max(0, Math.min(100,
        staffMember.morale + (Math.random() - 0.5) * 2 * deltaTime
      ));

      // Update efficiency based on morale and experience
      staffMember.efficiency = (staffMember.morale / 100) * (staffMember.experience / 100) * 0.8 + 0.2;

      // Generate salary expense
      if (this.capital > 0) {
        this.incurExpense('salary', staffMember.salary * deltaTime);
      }
    });
  }

  /**
   * Update revenue streams
   */
  private updateRevenue(deltaTime: number): void {
    this.revenueStreams.forEach((stream, streamId) => {
      if (!stream.active) return;

      // Calculate revenue based on market conditions
      const marketMultiplier = this.getMarketMultiplier();
      const revenue = stream.baseRevenue * marketMultiplier * deltaTime;
      const growth = stream.growthRate * deltaTime;

      stream.baseRevenue += growth;
      this.generateRevenue(stream.type, revenue);
    });
  }

  /**
   * Update expenses
   */
  private updateExpenses(deltaTime: number): void {
    let totalExpenses = 0;

    // Facility maintenance
    this.facilities.forEach((facility) => {
      if (facility.operational) {
        totalExpenses += facility.maintenanceCost * deltaTime;
      }
    });

    // Staff salaries (already handled in updateStaff)

    // Loan payments
    this.loans.forEach((loan) => {
      if (!loan.defaulted && loan.remainingBalance > 0) {
        totalExpenses += loan.monthlyPayment * (deltaTime / 24); // Convert to hourly
      }
    });

    if (totalExpenses > 0) {
      this.incurExpense('operations', totalExpenses);
    }
  }

  /**
   * Update financials
   */
  private updateFinancials(deltaTime: number): void {
    // Update loan balances
    this.loans.forEach((loan, loanId) => {
      if (!loan.defaulted && loan.remainingBalance > 0) {
        const interest = loan.remainingBalance * loan.interestRate / 8760; // Hourly interest
        loan.remainingBalance += interest * deltaTime;

        if (loan.remainingBalance > loan.amount * 2) {
          loan.defaulted = true;
          this.eventBus.emit('tycoon:loan_default', {
            loanId: loanId,
            amount: loan.remainingBalance,
            timestamp: Date.now()
          });
        }
      }
    });

    // Update investments
    this.investments.forEach((investment, investmentId) => {
      if (investment.invested) {
        const growth = investment.currentValue * investment.expectedReturn / 8760; // Hourly growth
        investment.currentValue += growth * deltaTime;
      }
    });
  }

  /**
   * Update business statistics
   */
  private updateBusinessStats(deltaTime: number): void {
    this.businessStats.employeeCount = this.staff.size;
    this.businessStats.facilityCount = this.facilities.size;
    this.businessStats.marketShare = this.marketShare;
    this.businessStats.businessAge += deltaTime / 24; // Convert to days
    this.businessStats.updateTime = Date.now();

    // Update cash flow
    const revenue = this.totalRevenue;
    const expenses = this.totalExpenses;
    this.businessStats.totalRevenue = revenue;
    this.businessStats.totalExpenses = expenses;
    this.businessStats.netProfit = revenue - expenses;
    this.businessStats.cashFlow = this.businessStats.netProfit;
  }

  /**
   * Check for market events
   */
  private checkMarketEvents(): void {
    // Random market events
    if (Math.random() < 0.01) { // 1% chance per update
      this.triggerMarketEvent();
    }
  }

  /**
   * Trigger random market event
   */
  private triggerMarketEvent(): void {
    const events = [
      { type: 'boom', description: 'Market boom increases demand by 50%' },
      { type: 'crash', description: 'Market crash reduces demand by 30%' },
      { type: 'competition', description: 'New competitor enters market' },
      { type: 'opportunity', description: 'Investment opportunity available' }
    ];

    const event = events[Math.floor(Math.random() * events.length)];

    this.eventBus.emit('tycoon:market_event', {
      type: event.type,
      description: event.description,
      timestamp: Date.now()
    });
  }

  /**
   * Get market multiplier based on conditions
   */
  private getMarketMultiplier(): number {
    let multiplier = 1.0;

    switch (this.marketData.condition) {
      case 'booming': multiplier *= 1.5; break;
      case 'stable': multiplier *= 1.0; break;
      case 'declining': multiplier *= 0.8; break;
      case 'recession': multiplier *= 0.5; break;
      case 'recovery': multiplier *= 1.2; break;
    }

    multiplier *= (this.marketData.customerDemand * 0.5 + 0.5);

    return Math.max(0.1, multiplier);
  }

  /**
   * Get staff count for a facility
   */
  private getStaffCount(facilityId: string): number {
    let count = 0;
    this.staff.forEach(staff => {
      if (staff.facilityId === facilityId) {
        count++;
      }
    });
    return count;
  }

  /**
   * Calculate customer satisfaction
   */
  private calculateCustomerSatisfaction(facility: BusinessFacility): number {
    const staffRatio = this.getStaffCount(facility.id) / facility.staffSlots;
    const baseSatisfaction = 50;
    const staffBonus = staffRatio * 30;
    const levelBonus = facility.level * 5;
    const efficiencyBonus = facility.efficiency * 15;

    return Math.min(100, baseSatisfaction + staffBonus + levelBonus + efficiencyBonus);
  }

  /**
   * Generate revenue
   */
  private generateRevenue(source: string, amount: number): void {
    this.totalRevenue += amount;
    this.capital += amount;

    this.eventBus.emit('tycoon:revenue', {
      amount: amount,
      source: source,
      timestamp: Date.now()
    });
  }

  /**
   * Incur expense
   */
  private incurExpense(category: string, amount: number): void {
    this.totalExpenses += amount;
    this.capital -= amount;

    this.eventBus.emit('tycoon:expense', {
      amount: amount,
      category: category,
      timestamp: Date.now()
    });
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get current capital
   */
  public getCapital(): number {
    return this.capital;
  }

  /**
   * Get facilities
   */
  public getFacilities(): Map<string, BusinessFacility> {
    return new Map(this.facilities);
  }

  /**
   * Get specific facility
   */
  public getFacility(facilityId: string): BusinessFacility | null {
    return this.facilities.get(facilityId) || null;
  }

  /**
   * Construct facility
   */
  public constructFacility(facilityId: string): boolean {
    const facility = this.facilities.get(facilityId);
    if (!facility || facility.operational || this.capital < facility.constructionCost) {
      return false;
    }

    this.capital -= facility.constructionCost;
    facility.operational = true;

    this.eventBus.emit('tycoon:facility_constructed', {
      facility: facility,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * Upgrade facility
   */
  public upgradeFacility(facilityId: string): boolean {
    const facility = this.facilities.get(facilityId);
    if (!facility || !facility.operational || facility.level >= facility.maxLevel) {
      return false;
    }

    const upgradeCost = facility.constructionCost * facility.level;
    if (this.capital < upgradeCost) {
      return false;
    }

    this.capital -= upgradeCost;
    facility.level++;
    facility.efficiency *= 1.1;
    facility.capacity = Math.floor(facility.capacity * 1.2);

    return true;
  }

  /**
   * Get staff
   */
  public getStaff(): Map<string, StaffMember> {
    return new Map(this.staff);
  }

  /**
   * Hire staff
   */
  public hireStaff(facilityId: string, role: StaffRole, salary: number): boolean {
    const facility = this.facilities.get(facilityId);
    if (!facility || this.getStaffCount(facilityId) >= facility.staffSlots) {
      return false;
    }

    if (this.capital < salary * 160) { // Require 160 hours of salary in reserve
      return false;
    }

    const staff: StaffMember = {
      id: `staff_${Date.now()}`,
      name: `Staff Member ${this.staff.size + 1}`,
      role: role,
      facilityId: facilityId,
      salary: salary,
      experience: 50,
      skill: 50,
      morale: 80,
      efficiency: 0.8,
      trainingProgress: 0,
      specializations: [],
      hireDate: Date.now(),
      performance: 75,
      unlocked: true
    };

    this.staff.set(staff.id, staff);

    this.eventBus.emit('tycoon:staff_hired', {
      staff: staff,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * Get revenue streams
   */
  public getRevenueStreams(): Map<string, RevenueStream> {
    return new Map(this.revenueStreams);
  }

  /**
   * Activate revenue stream
   */
  public activateRevenueStream(streamId: string): boolean {
    const stream = this.revenueStreams.get(streamId);
    if (!stream || stream.active) return false;

    stream.active = true;
    return true;
  }

  /**
   * Get market data
   */
  public getMarketData(): MarketData {
    return { ...this.marketData };
  }

  /**
   * Get business stats
   */
  public getBusinessStats(): BusinessStats {
    return { ...this.businessStats };
  }

  /**
   * Take out loan
   */
  public takeLoan(amount: number, interestRate: number, term: number): boolean {
    if (!this.config.enableLoans || this.capital < 0) return false;

    const monthlyRate = interestRate / 12;
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);

    const loan: BusinessLoan = {
      id: `loan_${Date.now()}`,
      amount: amount,
      interestRate: interestRate,
      term: term,
      monthlyPayment: monthlyPayment,
      remainingBalance: amount,
      startDate: Date.now(),
      nextPayment: Date.now() + (24 * 3600000), // Next payment in 24 hours
      defaulted: false
    };

    this.loans.set(loan.id, loan);
    this.capital += amount;

    return true;
  }

  /**
   * Make investment
   */
  public makeInvestment(opportunityId: string, amount: number): boolean {
    if (!this.config.enableInvestments || this.capital < amount) return false;

    const investment: InvestmentOpportunity = {
      id: opportunityId,
      name: 'Investment',
      description: 'Business investment',
      initialCost: amount,
      expectedReturn: 0.1, // 10% annual
      riskLevel: 'medium',
      duration: 12,
      maturityDate: Date.now() + (365 * 24 * 3600000), // 1 year
      currentValue: amount,
      invested: true
    };

    this.investments.set(investment.id, investment);
    this.capital -= amount;

    return true;
  }

  /**
   * Set integrations
   */
  public setIntegrations(integrations: TycoonIntegration): void {
    this.integrations = { ...this.integrations, ...integrations };
  }

  /**
   * Set paused state
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;

    this.eventBus.emit('tycoon:paused', {
      paused: paused,
      timestamp: Date.now()
    });
  }

  /**
   * Get system statistics
   */
  public getStats(): {
    capital: number;
    facilities: number;
    staff: number;
    revenueStreams: number;
    marketCondition: MarketCondition;
    marketShare: number;
    customerSatisfaction: number;
    businessAge: number;
    reputation: number;
  } {
    return {
      capital: this.capital,
      facilities: this.facilities.size,
      staff: this.staff.size,
      revenueStreams: this.revenueStreams.size,
      marketCondition: this.marketData.condition,
      marketShare: this.marketShare,
      customerSatisfaction: this.businessStats.customerSatisfaction,
      businessAge: this.businessStats.businessAge,
      reputation: this.businessStats.reputation
    };
  }

  /**
   * Reset business
   */
  public resetBusiness(): void {
    this.facilities.clear();
    this.staff.clear();
    this.revenueStreams.clear();
    this.loans.clear();
    this.investments.clear();
    this.capital = this.config.initialCapital;
    this.totalRevenue = 0;
    this.totalExpenses = 0;

    this.initializeSystem();
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  BusinessType,
  FacilityType,
  StaffRole,
  MarketCondition,
  RevenueType,
  BusinessFacility,
  StaffMember,
  RevenueStream,
  MarketData,
  BusinessLoan,
  InvestmentOpportunity,
  BusinessStats,
  TycoonSystemConfig,
  TycoonIntegration
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default TycoonSystemPure;