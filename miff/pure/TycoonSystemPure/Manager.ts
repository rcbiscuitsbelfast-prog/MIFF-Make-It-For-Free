/**
 * TycoonSystemPure Manager - Advanced Business Management
 *
 * Comprehensive business management system including:
 * - Facility optimization and resource allocation
 * - Staff management and AI-driven decisions
 * - Financial analysis and investment strategies
 * - Market analysis and competitive intelligence
 * - Performance monitoring and analytics
 * - Strategic planning and decision support
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';
// Types are defined in this file to avoid circular imports

// ============================================================================
// TYCOON MANAGER INTERFACES
// ============================================================================

export enum BusinessType {
  RESTAURANT = 'restaurant',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  TECH = 'tech',
  FINANCE = 'finance',
  REAL_ESTATE = 'real_estate',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  TRANSPORTATION = 'transportation'
}

export enum FacilityType {
  HEADQUARTERS = 'headquarters',
  BRANCH = 'branch',
  WAREHOUSE = 'warehouse',
  FACTORY = 'factory',
  STORE = 'store',
  OFFICE = 'office',
  LAB = 'lab',
  STUDIO = 'studio'
}

export enum StaffRole {
  CEO = 'ceo',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  SPECIALIST = 'specialist',
  CONSULTANT = 'consultant',
  INTERN = 'intern'
}

export enum MarketCondition {
  BOOM = 'boom',
  GROWTH = 'growth',
  STABLE = 'stable',
  DECLINE = 'decline',
  RECESSION = 'recession'
}

export enum RevenueType {
  SALES = 'sales',
  SUBSCRIPTION = 'subscription',
  LICENSING = 'licensing',
  ADVERTISING = 'advertising',
  COMMISSION = 'commission',
  RENTAL = 'rental'
}

export interface BusinessFacility {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  capacity: number;
  efficiency: number;
  maintenanceCost: number;
  upgradeCost: number;
  level: number;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  salary: number;
  productivity: number;
  satisfaction: number;
  experience: number;
  skills: string[];
  isActive: boolean;
}

export interface RevenueStream {
  id: string;
  type: RevenueType;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  growthRate: number;
  isActive: boolean;
}

export interface MarketData {
  condition: MarketCondition;
  demand: number;
  competition: number;
  trends: string[];
  opportunities: string[];
  threats: string[];
  lastUpdated: Date;
}

export interface BusinessStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  growthRate: number;
  marketShare: number;
  customerSatisfaction: number;
  employeeSatisfaction: number;
  efficiency: number;
  lastUpdated: Date;
}

export interface TycoonIntegration {
  systemId: string;
  enabled: boolean;
  priority: number;
  callbacks: {
    onRevenueChange?: (revenue: number) => void;
    onExpenseChange?: (expense: number) => void;
    onMarketChange?: (marketData: MarketData) => void;
  };
}

/**
 * Tycoon manager configuration
 */
export interface TycoonManagerConfig {
  enableAutoManagement: boolean;
  managementInterval: number;
  enableAnalytics: boolean;
  enableOptimization: boolean;
  enableMarketAnalysis: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
  performanceMode: 'high' | 'medium' | 'low';
  debugMode: boolean;
}

/**
 * Facility manager for construction and optimization
 */
export interface FacilityManager {
  getOptimalFacilityLocation: (type: BusinessType) => { x: number; y: number };
  calculateFacilityROI: (facilityId: string) => number;
  optimizeFacilityLayout: () => void;
  getFacilityUpgradePriority: () => string[];
  predictFacilityRevenue: (facilityId: string, timeframe: number) => number;
  getExpansionOpportunities: () => FacilityExpansion[];
}

/**
 * Staff manager for HR and personnel
 */
export interface StaffManager {
  getOptimalStaffingLevels: () => Map<string, number>;
  calculateStaffEfficiency: (facilityId: string) => number;
  optimizeStaffAllocation: () => void;
  getTrainingRecommendations: () => string[];
  predictStaffTurnover: (timeframe: number) => number;
  getHiringPriority: () => { facilityId: string; role: StaffRole; count: number }[];
}

/**
 * Financial manager for business finance
 */
export interface FinancialManager {
  calculateBusinessValuation: () => number;
  getInvestmentOpportunities: () => InvestmentOpportunity[];
  optimizeLoanStrategy: () => LoanStrategy;
  predictCashFlow: (timeframe: number) => CashFlowProjection;
  getRiskAssessment: () => RiskAssessment;
  optimizeTaxStrategy: () => TaxStrategy;
}

/**
 * Market manager for competitive analysis
 */
export interface MarketManager {
  analyzeMarketTrends: () => MarketTrend[];
  predictCompetitorActions: () => CompetitorAction[];
  getMarketOpportunities: () => MarketOpportunity[];
  calculateMarketShare: (businessType: BusinessType) => number;
  getCompetitiveAdvantage: () => CompetitiveAdvantage;
  optimizePricingStrategy: () => PricingStrategy;
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface FacilityExpansion {
  type: BusinessType;
  location: { x: number; y: number };
  expectedROI: number;
  constructionCost: number;
  timeframe: number;
  risk: 'low' | 'medium' | 'high';
}

export interface InvestmentOpportunity {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'real_estate' | 'business';
  initialInvestment: number;
  expectedReturn: number;
  risk: 'low' | 'medium' | 'high';
  duration: number;
  description: string;
}

export interface LoanStrategy {
  recommendedLoans: number;
  totalAmount: number;
  averageInterest: number;
  monthlyPayment: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CashFlowProjection {
  timeframe: number;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  confidence: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  riskScore: number;
  recommendations: string[];
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  probability: number;
  impact: number;
  mitigation: string;
}

export interface TaxStrategy {
  effectiveRate: number;
  deductions: number;
  credits: number;
  totalSavings: number;
  recommendations: string[];
}

export interface MarketTrend {
  type: BusinessType;
  trend: 'up' | 'down' | 'stable';
  magnitude: number;
  timeframe: number;
  confidence: number;
  description: string;
}

export interface CompetitorAction {
  type: 'price_change' | 'expansion' | 'new_product' | 'marketing';
  probability: number;
  potentialImpact: number;
  timeframe: number;
  response: string;
}

export interface MarketOpportunity {
  type: BusinessType;
  potentialRevenue: number;
  investmentRequired: number;
  timeframe: number;
  successProbability: number;
  description: string;
}

export interface CompetitiveAdvantage {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  score: number;
}

export interface PricingStrategy {
  optimalPrice: number;
  priceRange: { min: number; max: number };
  competitorPrices: number[];
  recommendedAction: 'increase' | 'decrease' | 'maintain';
  expectedImpact: number;
}

// ============================================================================
// TYCOON MANAGER IMPLEMENTATION
// ============================================================================

/**
 * TycoonManagerPure - Advanced Business Management System
 * Provides comprehensive business management and strategic planning
 */
export class TycoonManagerPure {
  private tycoonSystem: TycoonSystemPure;
  private eventBus: EventBus;
  private config: TycoonManagerConfig;
  private facilityManager: FacilityManager;
  private staffManager: StaffManager;
  private financialManager: FinancialManager;
  private marketManager: MarketManager;
  private integrations: TycoonIntegration = {};
  private isInitialized: boolean = false;
  private analyticsData: any[] = [];
  private lastAnalyticsUpdate: number = 0;
  private decisionHistory: any[] = [];

  constructor(eventBus: EventBus, config: TycoonManagerConfig = {
    enableAutoManagement: true,
    managementInterval: 3600, // 1 hour
    enableAnalytics: true,
    enableOptimization: true,
    enableMarketAnalysis: true,
    riskTolerance: 'medium',
    performanceMode: 'high',
    debugMode: false
  }) {
    this.eventBus = eventBus;
    this.config = config;
    this.tycoonSystem = new TycoonSystemPure(eventBus, {
      initialCapital: 100000,
      enableMarketFluctuations: true,
      enableCompetition: true,
      enableStaffAI: true,
      enableSeasonalEffects: true,
      enableLoans: true,
      enableInvestments: true,
      updateInterval: 3600,
      performanceMode: config.performanceMode,
      debugMode: config.debugMode
    });

    this.initializeManagers();
    this.setupEventListeners();
    this.initialize();
  }

  /**
   * Initialize managers
   */
  private initializeManagers(): void {
    this.facilityManager = this.createFacilityManager();
    this.staffManager = this.createStaffManager();
    this.financialManager = this.createFinancialManager();
    this.marketManager = this.createMarketManager();
  }

  /**
   * Create facility manager
   */
  private createFacilityManager(): FacilityManager {
    return {
      getOptimalFacilityLocation: (type: BusinessType) => {
        // Simplified location optimization
        const locations = [
          { x: 100, y: 100 },
          { x: 200, y: 150 },
          { x: 150, y: 200 },
          { x: 250, y: 100 },
          { x: 300, y: 200 }
        ];

        return locations[Math.floor(Math.random() * locations.length)];
      },

      calculateFacilityROI: (facilityId: string) => {
        const facility = this.tycoonSystem.getFacility(facilityId);
        if (!facility || !facility.operational) return 0;

        const revenue = facility.currentValue * facility.revenueMultiplier * 24; // Daily revenue
        const costs = facility.maintenanceCost * 24; // Daily maintenance
        const netIncome = revenue - costs;
        const investment = facility.constructionCost;

        return investment > 0 ? (netIncome / investment) * 365 : 0; // Annual ROI
      },

      optimizeFacilityLayout: () => {
        // Optimize facility placement and resource allocation
        this.eventBus.emit('tycoon:facility_optimization', {
          timestamp: Date.now()
        });
      },

      getFacilityUpgradePriority: () => {
        const facilities = this.tycoonSystem.getFacilities();
        return Array.from(facilities.keys())
          .filter(id => {
            const facility = facilities.get(id)!;
            return facility.operational && facility.level < facility.maxLevel;
          })
          .sort((a, b) => {
            const roiA = this.facilityManager.calculateFacilityROI(a);
            const roiB = this.facilityManager.calculateFacilityROI(b);
            return roiB - roiA;
          });
      },

      predictFacilityRevenue: (facilityId: string, timeframe: number) => {
        const facility = this.tycoonSystem.getFacility(facilityId);
        if (!facility || !facility.operational) return 0;

        const dailyRevenue = facility.currentValue * facility.revenueMultiplier;
        return dailyRevenue * (timeframe / 24); // Convert to timeframe
      },

      getExpansionOpportunities: () => {
        const opportunities: FacilityExpansion[] = [
          {
            type: 'retail',
            location: this.facilityManager.getOptimalFacilityLocation('retail'),
            expectedROI: 0.25,
            constructionCost: 50000,
            timeframe: 48, // 2 days
            risk: 'medium'
          },
          {
            type: 'manufacturing',
            location: this.facilityManager.getOptimalFacilityLocation('manufacturing'),
            expectedROI: 0.35,
            constructionCost: 200000,
            timeframe: 120, // 5 days
            risk: 'high'
          }
        ];

        return opportunities.filter(opp => {
          const capital = this.tycoonSystem.getCapital();
          return capital >= opp.constructionCost;
        });
      }
    };
  }

  /**
   * Create staff manager
   */
  private createStaffManager(): StaffManager {
    return {
      getOptimalStaffingLevels: () => {
        const optimalLevels = new Map<string, number>();
        const facilities = this.tycoonSystem.getFacilities();

        facilities.forEach((facility, facilityId) => {
          if (facility.operational) {
            const currentStaff = this.getStaffCount(facilityId);
            const optimalStaff = Math.floor(facility.capacity * 0.8); // 80% capacity
            optimalLevels.set(facilityId, Math.max(0, optimalStaff - currentStaff));
          }
        });

        return optimalLevels;
      },

      calculateStaffEfficiency: (facilityId: string) => {
        const facility = this.tycoonSystem.getFacility(facilityId);
        if (!facility) return 0;

        const currentStaff = this.getStaffCount(facilityId);
        const optimalStaff = facility.capacity * 0.8;

        if (optimalStaff === 0) return 1.0;

        const efficiency = Math.min(1.0, currentStaff / optimalStaff);
        return efficiency;
      },

      optimizeStaffAllocation: () => {
        // Reallocate staff based on facility needs
        this.eventBus.emit('tycoon:staff_optimization', {
          timestamp: Date.now()
        });
      },

      getTrainingRecommendations: () => {
        const staff = this.tycoonSystem.getStaff();
        const recommendations: string[] = [];

        staff.forEach((employee, employeeId) => {
          if (employee.skill < 80 || employee.experience < 80) {
            recommendations.push(employeeId);
          }
        });

        return recommendations;
      },

      predictStaffTurnover: (timeframe: number) => {
        const staff = this.tycoonSystem.getStaff();
        let totalTurnoverRisk = 0;

        staff.forEach(employee => {
          const moraleFactor = (100 - employee.morale) / 100;
          const experienceFactor = employee.experience < 50 ? 0.3 : 0.1;
          totalTurnoverRisk += moraleFactor * experienceFactor;
        });

        return Math.min(1.0, totalTurnoverRisk * (timeframe / 30)); // Monthly turnover rate
      },

      getHiringPriority: () => {
        const priorities: { facilityId: string; role: StaffRole; count: number }[] = [];
        const facilities = this.tycoonSystem.getFacilities();

        facilities.forEach((facility, facilityId) => {
          if (!facility.operational) return;

          const currentStaff = this.getStaffCount(facilityId);
          const neededStaff = Math.max(0, facility.staffSlots - currentStaff);

          if (neededStaff > 0) {
            priorities.push({
              facilityId: facilityId,
              role: 'worker', // Default role
              count: neededStaff
            });
          }
        });

        return priorities.sort((a, b) => b.count - a.count);
      }
    };
  }

  /**
   * Create financial manager
   */
  private createFinancialManager(): FinancialManager {
    return {
      calculateBusinessValuation: () => {
        const stats = this.tycoonSystem.getBusinessStats();
        const facilities = this.tycoonSystem.getFacilities();

        let totalValue = stats.totalAssets;

        // Add facility values
        facilities.forEach(facility => {
          totalValue += facility.currentValue;
        });

        // Add market conditions multiplier
        const marketData = this.tycoonSystem.getMarketData();
        const marketMultiplier = marketData.condition === 'booming' ? 1.2 :
                                marketData.condition === 'recession' ? 0.8 : 1.0;

        return totalValue * marketMultiplier;
      },

      getInvestmentOpportunities: () => {
        return [
          {
            id: 'tech_startup',
            name: 'Tech Startup Investment',
            type: 'stock',
            initialInvestment: 50000,
            expectedReturn: 0.15,
            risk: 'high',
            duration: 24,
            description: 'Invest in promising technology startup'
          },
          {
            id: 'real_estate',
            name: 'Commercial Real Estate',
            type: 'real_estate',
            initialInvestment: 200000,
            expectedReturn: 0.08,
            risk: 'low',
            duration: 60,
            description: 'Invest in commercial property'
          }
        ];
      },

      optimizeLoanStrategy: () => {
        const capital = this.tycoonSystem.getCapital();
        const maxLoanAmount = capital * 2; // 2x current capital

        return {
          recommendedLoans: capital > 100000 ? 2 : 1,
          totalAmount: maxLoanAmount * 0.3,
          averageInterest: 0.05, // 5% average
          monthlyPayment: maxLoanAmount * 0.3 * 0.05 / 12,
          riskLevel: 'medium'
        };
      },

      predictCashFlow: (timeframe: number) => {
        const stats = this.tycoonSystem.getBusinessStats();
        const facilities = this.tycoonSystem.getFacilities();

        let projectedIncome = stats.totalRevenue * (timeframe / 30); // Monthly projection
        let projectedExpenses = stats.totalExpenses * (timeframe / 30);

        // Add facility revenue
        facilities.forEach(facility => {
          if (facility.operational) {
            projectedIncome += facility.currentValue * facility.revenueMultiplier * (timeframe / 24);
          }
        });

        return {
          timeframe: timeframe,
          projectedIncome: projectedIncome,
          projectedExpenses: projectedExpenses,
          netCashFlow: projectedIncome - projectedExpenses,
          confidence: 0.8
        };
      },

      getRiskAssessment: () => {
        const risks: RiskFactor[] = [
          {
            type: 'market_volatility',
            severity: 'medium',
            probability: 0.6,
            impact: 0.3,
            mitigation: 'Diversify business types'
          },
          {
            type: 'staff_turnover',
            severity: 'low',
            probability: 0.2,
            impact: 0.1,
            mitigation: 'Improve employee satisfaction'
          }
        ];

        const riskScore = risks.reduce((score, risk) => {
          return score + (risk.probability * risk.impact);
        }, 0);

        return {
          overallRisk: riskScore > 0.5 ? 'high' : riskScore > 0.2 ? 'medium' : 'low',
          riskFactors: risks,
          riskScore: riskScore,
          recommendations: [
            'Maintain adequate cash reserves',
            'Monitor market conditions regularly',
            'Invest in staff training'
          ]
        };
      },

      optimizeTaxStrategy: () => {
        return {
          effectiveRate: 0.25, // 25% effective tax rate
          deductions: 50000,
          credits: 10000,
          totalSavings: 15000,
          recommendations: [
            'Maximize business expense deductions',
            'Take advantage of tax credits',
            'Consider tax-advantaged investments'
          ]
        };
      }
    };
  }

  /**
   * Create market manager
   */
  private createMarketManager(): MarketManager {
    return {
      analyzeMarketTrends: () => {
        return [
          {
            type: 'retail',
            trend: 'up',
            magnitude: 0.15,
            timeframe: 30,
            confidence: 0.8,
            description: 'Retail sector showing strong growth'
          },
          {
            type: 'manufacturing',
            trend: 'stable',
            magnitude: 0.05,
            timeframe: 60,
            confidence: 0.9,
            description: 'Manufacturing sector remains stable'
          }
        ];
      },

      predictCompetitorActions: () => {
        return [
          {
            type: 'price_change',
            probability: 0.7,
            potentialImpact: 0.2,
            timeframe: 7,
            response: 'Monitor and adjust pricing accordingly'
          },
          {
            type: 'expansion',
            probability: 0.4,
            potentialImpact: 0.3,
            timeframe: 30,
            response: 'Consider preemptive expansion'
          }
        ];
      },

      getMarketOpportunities: () => {
        return [
          {
            type: 'retail',
            potentialRevenue: 100000,
            investmentRequired: 50000,
            timeframe: 90,
            successProbability: 0.75,
            description: 'Expand into online retail market'
          },
          {
            type: 'technology',
            potentialRevenue: 200000,
            investmentRequired: 100000,
            timeframe: 180,
            successProbability: 0.6,
            description: 'Invest in technology sector'
          }
        ];
      },

      calculateMarketShare: (businessType: BusinessType) => {
        const stats = this.tycoonSystem.getBusinessStats();
        return stats.marketShare * 0.8; // Simplified calculation
      },

      getCompetitiveAdvantage: () => {
        return {
          strengths: ['Strong management', 'Good location', 'Quality products'],
          weaknesses: ['Limited marketing', 'High costs'],
          opportunities: ['Market expansion', 'Technology adoption'],
          threats: ['Competition', 'Economic downturn'],
          score: 7.5
        };
      },

      optimizePricingStrategy: () => {
        return {
          optimalPrice: 100,
          priceRange: { min: 80, max: 120 },
          competitorPrices: [90, 95, 105, 110],
          recommendedAction: 'increase',
          expectedImpact: 0.15
        };
      }
    };
  }

  /**
   * Initialize the manager
   */
  private async initialize(): Promise<void> {
    try {
      // Start analytics if enabled
      if (this.config.enableAnalytics) {
        this.startAnalytics();
      }

      // Start optimization if enabled
      if (this.config.enableOptimization) {
        this.startOptimization();
      }

      this.isInitialized = true;

      this.eventBus.emit('tycoon:manager_initialized', {
        config: this.config,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('TycoonManager initialization failed:', error);
      throw new Error(`TycoonManager initialization failed: ${error}`);
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.on('tycoon:revenue', (data) => {
      if (this.config.enableAnalytics) {
        this.recordAnalytics('revenue', data);
      }
    });

    this.eventBus.on('tycoon:expense', (data) => {
      if (this.config.enableAnalytics) {
        this.recordAnalytics('expense', data);
      }
    });

    this.eventBus.on('tycoon:facility_constructed', (data) => {
      if (this.config.enableAnalytics) {
        this.recordAnalytics('facility_constructed', data);
      }
    });
  }

  /**
   * Start analytics tracking
   */
  private startAnalytics(): void {
    setInterval(() => {
      this.updateAnalytics();
    }, 60000); // Update every minute
  }

  /**
   * Start optimization
   */
  private startOptimization(): void {
    setInterval(() => {
      this.runOptimizations();
    }, this.config.managementInterval);
  }

  /**
   * Record analytics data
   */
  private recordAnalytics(event: string, data: any): void {
    this.analyticsData.push({
      event: event,
      data: data,
      timestamp: Date.now()
    });

    // Keep only last 1000 entries
    if (this.analyticsData.length > 1000) {
      this.analyticsData = this.analyticsData.slice(-1000);
    }
  }

  /**
   * Update analytics
   */
  private updateAnalytics(): void {
    const stats = this.tycoonSystem.getBusinessStats();
    const now = Date.now();

    if (now - this.lastAnalyticsUpdate > 60000) {
      this.eventBus.emit('tycoon:analytics_update', {
        stats: stats,
        timestamp: now
      });

      this.lastAnalyticsUpdate = now;
    }
  }

  /**
   * Run optimizations
   */
  private runOptimizations(): void {
    if (!this.config.enableOptimization) return;

    // Optimize facility layout
    this.facilityManager.optimizeFacilityLayout();

    // Optimize staff allocation
    this.staffManager.optimizeStaffAllocation();

    // Record optimization decision
    this.recordDecision('optimization', 'system_optimization', {
      timestamp: Date.now(),
      description: 'Automated system optimization completed'
    });
  }

  /**
   * Record management decision
   */
  private recordDecision(type: string, action: string, data: any): void {
    this.decisionHistory.push({
      type: type,
      action: action,
      data: data,
      timestamp: Date.now()
    });

    // Keep only last 100 decisions
    if (this.decisionHistory.length > 100) {
      this.decisionHistory = this.decisionHistory.slice(-100);
    }
  }

  /**
   * Get staff count for facility
   */
  private getStaffCount(facilityId: string): number {
    const staff = this.tycoonSystem.getStaff();
    let count = 0;

    staff.forEach(employee => {
      if (employee.facilityId === facilityId) {
        count++;
      }
    });

    return count;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get tycoon system instance
   */
  public getTycoonSystem(): TycoonSystemPure {
    return this.tycoonSystem;
  }

  /**
   * Set integrations
   */
  public setIntegrations(integrations: TycoonIntegration): void {
    this.integrations = { ...this.integrations, ...integrations };
    this.tycoonSystem.setIntegrations(integrations);
  }

  /**
   * Get optimal facility location
   */
  public getOptimalFacilityLocation(type: BusinessType): { x: number; y: number } {
    return this.facilityManager.getOptimalFacilityLocation(type);
  }

  /**
   * Get facility upgrade priority
   */
  public getFacilityUpgradePriority(): string[] {
    return this.facilityManager.getFacilityUpgradePriority();
  }

  /**
   * Get optimal staffing levels
   */
  public getOptimalStaffingLevels(): Map<string, number> {
    return this.staffManager.getOptimalStaffingLevels();
  }

  /**
   * Get hiring priority
   */
  public getHiringPriority(): { facilityId: string; role: StaffRole; count: number }[] {
    return this.staffManager.getHiringPriority();
  }

  /**
   * Get business valuation
   */
  public getBusinessValuation(): number {
    return this.financialManager.calculateBusinessValuation();
  }

  /**
   * Get investment opportunities
   */
  public getInvestmentOpportunities(): InvestmentOpportunity[] {
    return this.financialManager.getInvestmentOpportunities();
  }

  /**
   * Get cash flow projection
   */
  public getCashFlowProjection(timeframe: number): CashFlowProjection {
    return this.financialManager.predictCashFlow(timeframe);
  }

  /**
   * Get market trends
   */
  public getMarketTrends(): MarketTrend[] {
    return this.marketManager.analyzeMarketTrends();
  }

  /**
   * Get competitive advantage analysis
   */
  public getCompetitiveAdvantage(): CompetitiveAdvantage {
    return this.marketManager.getCompetitiveAdvantage();
  }

  /**
   * Optimize pricing strategy
   */
  public optimizePricing(): PricingStrategy {
    return this.marketManager.optimizePricingStrategy();
  }

  /**
   * Get system statistics
   */
  public getStats(): {
    isInitialized: boolean;
    capital: number;
    facilities: number;
    staff: number;
    businessValuation: number;
    marketShare: number;
    riskLevel: string;
    analyticsEnabled: boolean;
    optimizationEnabled: boolean;
  } {
    const tycoonStats = this.tycoonSystem.getStats();
    const valuation = this.financialManager.calculateBusinessValuation();
    const riskAssessment = this.financialManager.getRiskAssessment();

    return {
      ...tycoonStats,
      isInitialized: this.isInitialized,
      businessValuation: valuation,
      riskLevel: riskAssessment.overallRisk,
      analyticsEnabled: this.config.enableAnalytics,
      optimizationEnabled: this.config.enableOptimization
    };
  }

  /**
   * Get analytics data
   */
  public getAnalyticsData(): any[] {
    return [...this.analyticsData];
  }

  /**
   * Get decision history
   */
  public getDecisionHistory(): any[] {
    return [...this.decisionHistory];
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;
    this.tycoonSystem.setIntegrations({} as any); // Trigger update
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.analyticsData = [];
    this.decisionHistory = [];
    this.tycoonSystem.setPaused(true);
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default TycoonManagerPure;