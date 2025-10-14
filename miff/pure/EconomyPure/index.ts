import { StructuredLogger } from '../shared/logging/StructuredLogger';
// EconomyPure - Comprehensive economic simulation system for MIFF framework
// Schema Version: v1

export enum CurrencyType {
  GOLD = 'gold',
  SILVER = 'silver',
  COPPER = 'copper',
  CRYSTALS = 'crystals',
  TOKENS = 'tokens',
  GEMS = 'gems',
  REPUTATION = 'reputation',
  EXPERIENCE = 'experience',
  ENERGY = 'energy',
  CUSTOM = 'custom'
}

export enum MarketType {
  BLACK_MARKET = 'black_market',
  AUCTION_HOUSE = 'auction_house',
  PLAYER_MARKET = 'player_market',
  NPC_SHOP = 'npc_shop',
  GUILD_MARKET = 'guild_market',
  GLOBAL_MARKET = 'global_market'
}

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  TRADE = 'trade',
  AUCTION = 'auction',
  GIFT = 'gift',
  REWARD = 'reward',
  TAX = 'tax',
  FEE = 'fee'
}

export enum EconomicEventType {
  MARKET_CRASH = 'market_crash',
  BOOM = 'boom',
  INFLATION = 'inflation',
  DEFLATION = 'deflation',
  SHORTAGE = 'shortage',
  SURPLUS = 'surplus',
  WAR = 'war',
  PEACE = 'peace',
  FESTIVAL = 'festival',
  DISASTER = 'disaster'
}

export interface Currency {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: CurrencyType;
  symbol: string;
  value: number; // Base value in relation to gold
  supply: number;
  maxSupply?: number;
  minValue: number;
  maxValue: number;
  volatility: number; // 0-1 (stable to volatile)
  description: string;
}

export interface EconomicEntity {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'player' | 'npc' | 'guild' | 'merchant' | 'bank' | 'government';
  currencies: Map<CurrencyType, number>;
  reputation: Map<string, number>;
  credit: {
    limit: number;
    used: number;
    interestRate: number;
    paymentHistory: PaymentRecord[];
  };
  inventory: InventoryItem[];
  properties: Record<string, any>;
}

export interface InventoryItem {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: string;
  quantity: number;
  quality: number;
  value: number;
}

export interface PaymentRecord {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  amount: number;
  currency: CurrencyType;
  description: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
}

export interface Market {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: MarketType;
  location: string;
  operatingHours: {
    open: number; // 0-23
    close: number;
    timezone: string;
  };
  fees: {
    transactionFee: number; // percentage
    listingFee: number;
    withdrawalFee: number;
  };
  restrictions: MarketRestriction[];
  listings: MarketListing[];
  statistics: MarketStatistics;
  events: EconomicEvent[];
}

export interface MarketRestriction {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'level' | 'reputation' | 'license' | 'region' | 'time' | 'custom';
  requirement: any;
  description: string;
  penalty: string;
}

export interface MarketListing {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  itemId: string;
  itemName: string;
  sellerId: string;
  quantity: number;
  price: number;
  currency: CurrencyType;
  quality: number;
  condition: 'new' | 'used' | 'damaged' | 'refurbished';
  listedAt: number;
  expiresAt?: number;
  bids: Bid[];
}

export interface Bid {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  bidderId: string;
  amount: number;
  currency: CurrencyType;
  isWinning: boolean;
}

export interface MarketStatistics {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalTransactions: number;
  totalListings: number;
  activeListings: number;
  totalVolume: number;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  priceHistory: PricePoint[];
  volumeHistory: VolumePoint[];
  topItems: string[];
}

export interface PricePoint {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  price: number;
  currency: CurrencyType;
  itemId: string;
}

export interface VolumePoint {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  volume: number;
  itemId: string;
}

export interface EconomicEvent {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: EconomicEventType;
  description: string;
  startTime: number;
  endTime?: number;
  duration: number;
  effects: EconomicEffect[];
  affectedMarkets: string[];
  affectedCurrencies: CurrencyType[];
  affectedEntities: string[];
  triggeredBy?: string;
}

export interface EconomicEffect {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'price_change' | 'supply_change' | 'demand_change' | 'fee_change' | 'restriction_change' | 'bonus' | 'penalty';
  target: string; // market, currency, item, or entity
  value: number;
  duration?: number;
  conditions?: string[];
  description: string;
}

export interface Transaction {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: TransactionType;
  buyerId?: string;
  sellerId?: string;
  itemId: string;
  quantity: number;
  price: number;
  currency: CurrencyType;
  fees: number;
  taxes: number;
  marketId?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  notes?: string;
}

export interface TaxPolicy {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'sales_tax' | 'income_tax' | 'property_tax' | 'import_tax' | 'export_tax' | 'luxury_tax';
  rate: number; // percentage
  brackets?: TaxBracket[];
  exemptions: string[];
  region: string;
  effectiveFrom: number;
  effectiveTo?: number;
  description: string;
}

export interface TaxBracket {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  min: number;
  max: number;
  rate: number;
}

export interface EconomicReport {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  period: {
    start: number;
    end: number;
  };
  summary: {
    totalTransactions: number;
    totalVolume: number;
    totalRevenue: number;
    averageTransactionValue: number;
    topMarkets: string[];
    topCurrencies: string[];
    economicHealth: number; // 0-100
  };
  marketAnalysis: Map<string, MarketReport>;
  currencyAnalysis: Map<CurrencyType, CurrencyReport>;
  entityAnalysis: EntityReport[];
  recommendations: string[];
  generatedAt: number;
}

export interface MarketReport {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  marketId: string;
  totalTransactions: number;
  totalVolume: number;
  averagePrice: number;
  priceVolatility: number;
  topItems: string[];
  trends: Trend[];
}

export interface CurrencyReport {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  currency: CurrencyType;
  totalTransactions: number;
  totalVolume: number;
  averageExchangeRate: number;
  volatility: number;
  trends: Trend[];
}

export interface EntityReport {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  entityId: string;
  totalTransactions: number;
  totalSpent: number;
  totalEarned: number;
  netWorth: number;
  reputation: Map<string, number>;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Trend {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'price' | 'volume' | 'demand' | 'supply' | 'volatility';
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  timeframe: 'hour' | 'day' | 'week' | 'month';
  confidence: number; // 0-1
}

export interface EconomicSimulation {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  duration: number;
  interval: number; // simulation ticks per second
  startTime: number;
  endTime?: number;
  markets: Map<string, Market>;
  entities: Map<string, EconomicEntity>;
  currencies: Map<CurrencyType, Currency>;
  events: EconomicEvent[];
  state: 'running' | 'paused' | 'stopped' | 'completed';
  statistics: SimulationStatistics;
}

export interface SimulationStatistics {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalTransactions: number;
  totalVolume: number;
  averageMarketHealth: number;
  currencyStability: number;
  economicGrowth: number;
  inflationRate: number;
  unemploymentRate: number;
  gdp: number;
  eventsTriggered: number;
}

export interface SupplyDemandCurve {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  supply: Array<{ price: number; quantity: number }>;
  demand: Array<{ price: number; quantity: number }>;
  equilibrium: { price: number; quantity: number };
  elasticity: {
    supply: number;
    demand: number;
  };
}

export interface EconomicForecast {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  target: 'market' | 'currency' | 'entity' | 'global';
  targetId: string;
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year';
  predictions: Prediction[];
  confidence: number; // 0-1
  accuracy: number; // 0-1 (historical accuracy)
  generatedAt: number;
}

export interface Prediction {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  metric: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  probability: number; // 0-1
  factors: string[];
}

export class EconomicEngine {
  
  private entities: Map<string, EconomicEntity> = new Map();
  private markets: Map<string, Market> = new Map();
  private currencies: Map<CurrencyType, Currency> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private taxPolicies: Map<string, TaxPolicy> = new Map();
  private economicEvents: Map<string, EconomicEvent> = new Map();
  private simulations: Map<string, EconomicSimulation> = new Map();
  private supplyDemandCurves: Map<string, SupplyDemandCurve> = new Map();
  private performanceMetrics: EconomicPerformanceMetrics;
  private eventQueue: EconomicEvent[] = [];
  private transactionCounter = 0;
  private reportCounter = 0;

  constructor(...args: any[]) {
    
    this.initializeDefaultCurrencies();
    this.initializeDefaultMarkets();
    this.performanceMetrics = this.initializePerformanceMetrics();
  }

  private initializeDefaultCurrencies(): void {
    const defaultCurrencies: Currency[] = [
      {
        type: CurrencyType.GOLD,
        name: 'Gold',
        symbol: 'G',
        value: 1.0,
        supply: 1000000,
        maxSupply: 2000000,
        minValue: 0.5,
        maxValue: 2.0,
        volatility: 0.1,
        description: 'Primary currency for trade and commerce'
      },
      {
        type: CurrencyType.SILVER,
        name: 'Silver',
        symbol: 'S',
        value: 0.1,
        supply: 10000000,
        maxSupply: 50000000,
        minValue: 0.05,
        maxValue: 0.2,
        volatility: 0.2,
        description: 'Secondary currency for everyday transactions'
      },
      {
        type: CurrencyType.COPPER,
        name: 'Copper',
        symbol: 'C',
        value: 0.01,
        supply: 100000000,
        minValue: 0.005,
        maxValue: 0.02,
        volatility: 0.3,
        description: 'Basic currency for small transactions'
      },
      {
        type: CurrencyType.CRYSTALS,
        name: 'Magic Crystals',
        symbol: 'MC',
        value: 10.0,
        supply: 10000,
        maxSupply: 50000,
        minValue: 5.0,
        maxValue: 20.0,
        volatility: 0.5,
        description: 'Rare magical currency'
      }
    ];

    for (const currency of defaultCurrencies) {
      this.currencies.set(currency.type, currency);
    }
  }

  private initializeDefaultMarkets(): void {
    const defaultMarkets: Market[] = [
      {
        id: 'global_market',
        name: 'Global Marketplace',
        type: MarketType.GLOBAL_MARKET,
        location: 'global',
        operatingHours: {
          open: 0,
          close: 24,
          timezone: 'UTC'
        },
        fees: {
          transactionFee: 0.02, // 2%
          listingFee: 1,
          withdrawalFee: 0.01 // 1%
        },
        restrictions: [],
        listings: [],
        statistics: this.createEmptyMarketStatistics(),
        events: []
      },
      {
        id: 'black_market',
        name: 'Black Market',
        type: MarketType.BLACK_MARKET,
        location: 'shadow_district',
        operatingHours: {
          open: 22,
          close: 6,
          timezone: 'UTC'
        },
        fees: {
          transactionFee: 0.05, // 5%
          listingFee: 5,
          withdrawalFee: 0.02 // 2%
        },
        restrictions: [
          {
            type: 'reputation',
            requirement: { min: -50 },
            description: 'Requires negative reputation',
            penalty: 'Arrest and asset seizure'
          }
        ],
        listings: [],
        statistics: this.createEmptyMarketStatistics(),
        events: []
      }
    ];

    for (const market of defaultMarkets) {
      this.markets.set(market.id, market);
    }
  }

  private createEmptyMarketStatistics(): MarketStatistics {
    return {
      totalTransactions: 0,
      totalListings: 0,
      activeListings: 0,
      totalVolume: 0,
      averagePrice: 0,
      highestPrice: 0,
      lowestPrice: 0,
      priceHistory: [],
      volumeHistory: [],
      topItems: []
    };
  }

  private initializePerformanceMetrics(): EconomicPerformanceMetrics {
    return {
      totalTransactions: 0,
      totalVolume: 0,
      totalEntities: 0,
      totalMarkets: 0,
      totalCurrencies: 0,
      averageTransactionTime: 0,
      marketHealth: 100,
      economicStability: 100,
      inflationRate: 0,
      processedEvents: 0,
      activeSimulations: 0
    };
  }

  // Core economic functionality
  async processTransaction(transaction: Transaction): Promise<boolean> {
    try {
      // Validate transaction
      const validation = this.validateTransaction(transaction);
      if (!validation.valid) {
        console.error(`Invalid transaction: ${validation.reason}`);
        return false;
      }

      // Calculate fees and taxes
      const fees = this.calculateFees(transaction);
      const taxes = this.calculateTaxes(transaction);

      transaction.fees = fees;
      transaction.taxes = taxes;

      // Check if buyer has sufficient funds
      const buyer = this.entities.get(transaction.buyerId!);
      const totalCost = transaction.price * transaction.quantity + fees + taxes;

      if (!this.hasSufficientFunds(buyer!, transaction.currency, totalCost)) {
        console.error('Insufficient funds for transaction');
        return false;
      }

      // Execute transaction
      const success = await this.executeTransaction(transaction);

      if (success) {
        // Update statistics
        this.performanceMetrics.totalTransactions++;
        this.performanceMetrics.totalVolume += transaction.price * transaction.quantity;

        // Record transaction
        this.transactions.set(transaction.id, transaction);

        // Update market statistics
        this.updateMarketStatistics(transaction);

        // Trigger economic events if needed
        this.checkEconomicTriggers(transaction);

        console.info(`Transaction processed: ${transaction.id}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Transaction processing failed:', error);
      return false;
    }
  }

  private validateTransaction(transaction: Transaction): { valid: boolean; reason?: string } {
    if (!transaction.buyerId || !transaction.sellerId) {
      return { valid: false, reason: 'Missing buyer or seller' };
    }

    if (transaction.quantity <= 0) {
      return { valid: false, reason: 'Invalid quantity' };
    }

    if (transaction.price < 0) {
      return { valid: false, reason: 'Invalid price' };
    }

    const buyer = this.entities.get(transaction.buyerId);
    const seller = this.entities.get(transaction.sellerId);

    if (!buyer || !seller) {
      return { valid: false, reason: 'Buyer or seller not found' };
    }

    return { valid: true };
  }

  private calculateFees(transaction: Transaction): number {
    if (!transaction.marketId) return 0;

    const market = this.markets.get(transaction.marketId);
    if (!market) return 0;

    const subtotal = transaction.price * transaction.quantity;
    return subtotal * market.fees.transactionFee;
  }

  private calculateTaxes(transaction: Transaction): number {
    let totalTaxes = 0;

    for (const taxPolicy of this.taxPolicies.values()) {
      if (this.isTaxApplicable(taxPolicy, transaction)) {
        totalTaxes += this.calculateTaxAmount(taxPolicy, transaction);
      }
    }

    return totalTaxes;
  }

  private isTaxApplicable(taxPolicy: TaxPolicy, transaction: Transaction): boolean {
    // Check if tax is effective
    if (Date.now() < taxPolicy.effectiveFrom ||
        (taxPolicy.effectiveTo && Date.now() > taxPolicy.effectiveTo)) {
      return false;
    }

    // Check exemptions
    if (taxPolicy.exemptions.includes(transaction.buyerId!) ||
        taxPolicy.exemptions.includes(transaction.sellerId!)) {
      return false;
    }

    return true;
  }

  private calculateTaxAmount(taxPolicy: TaxPolicy, transaction: Transaction): number {
    const subtotal = transaction.price * transaction.quantity;

    if (taxPolicy.brackets) {
      // Progressive taxation
      let taxAmount = 0;
      let remainingAmount = subtotal;

      for (const bracket of taxPolicy.brackets) {
        if (remainingAmount <= 0) break;

        const bracketMin = bracket.min;
        const bracketMax = bracket.max;
        const bracketAmount = Math.min(remainingAmount, bracketMax - bracketMin);

        if (subtotal >= bracketMin) {
          taxAmount += bracketAmount * (bracket.rate / 100);
          remainingAmount -= bracketAmount;
        }
      }

      return taxAmount;
    } else {
      // Flat tax rate
      return subtotal * (taxPolicy.rate / 100);
    }
  }

  private hasSufficientFunds(entity: EconomicEntity, currency: CurrencyType, amount: number): boolean {
    const balance = entity.currencies.get(currency) || 0;
    return balance >= amount;
  }

  private async executeTransaction(transaction: Transaction): Promise<boolean> {
    const buyer = this.entities.get(transaction.buyerId!);
    const seller = this.entities.get(transaction.sellerId!);

    if (!buyer || !seller) return false;

    const totalCost = transaction.price * transaction.quantity + transaction.fees + transaction.taxes;

    // Deduct from buyer
    const buyerBalance = buyer.currencies.get(transaction.currency) || 0;
    buyer.currencies.set(transaction.currency, buyerBalance - totalCost);

    // Add to seller
    const sellerBalance = seller.currencies.get(transaction.currency) || 0;
    seller.currencies.set(transaction.currency, sellerBalance + (transaction.price * transaction.quantity));

    // Handle fees (go to market)
    if (transaction.marketId && transaction.fees > 0) {
      const market = this.markets.get(transaction.marketId);
      if (market) {
        // In a real implementation, fees would be distributed to market operators
      }
    }

    // Handle taxes (go to government entities)
    if (transaction.taxes > 0) {
      // Distribute taxes to appropriate entities
    }

    transaction.status = 'completed';
    return true;
  }

  private updateMarketStatistics(transaction: Transaction): void {
    if (!transaction.marketId) return;

    const market = this.markets.get(transaction.marketId);
    if (!market) return;

    market.statistics.totalTransactions++;
    market.statistics.totalVolume += transaction.price * transaction.quantity;

    // Update price history
    const pricePoint: PricePoint = {
      timestamp: Date.now(),
      price: transaction.price,
      currency: transaction.currency,
      itemId: transaction.itemId
    };

    market.statistics.priceHistory.push(pricePoint);

    // Keep only recent history (last 1000 entries)
    if (market.statistics.priceHistory.length > 1000) {
      market.statistics.priceHistory = market.statistics.priceHistory.slice(-1000);
    }

    // Update averages
    this.recalculateMarketAverages(market);
  }

  private recalculateMarketAverages(market: Market): void {
    if (market.statistics.priceHistory.length === 0) return;

    const totalPrice = market.statistics.priceHistory.reduce((sum, point) => sum + point.price, 0);
    market.statistics.averagePrice = totalPrice / market.statistics.priceHistory.length;

    market.statistics.highestPrice = Math.max(...market.statistics.priceHistory.map(p => p.price));
    market.statistics.lowestPrice = Math.min(...market.statistics.priceHistory.map(p => p.price));
  }

  private checkEconomicTriggers(transaction: Transaction): void {
    // Check for various economic triggers that might cause events
    const market = transaction.marketId ? this.markets.get(transaction.marketId) : null;

    if (market) {
      // Check for unusual price movements
      const recentPrices = market.statistics.priceHistory.slice(-10);
      if (recentPrices.length >= 10) {
        const averagePrice = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
        const currentPrice = transaction.price;
        const priceChange = Math.abs((currentPrice - averagePrice) / averagePrice);

        if (priceChange > 0.5) { // 50% price change
          this.triggerPriceEvent(market, currentPrice, averagePrice);
        }
      }
    }
  }

  private triggerPriceEvent(market: Market, currentPrice: number, averagePrice: number): void {
    // Create economic event based on price movement
    const eventType = currentPrice > averagePrice ? EconomicEventType.BOOM : EconomicEventType.MARKET_CRASH;

    const event: EconomicEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      name: `${eventType === EconomicEventType.BOOM ? 'Price Surge' : 'Market Crash'}`,
      description: `Unusual price movement detected in ${market.name}`,
      startTime: Date.now(),
      duration: 3600000, // 1 hour
      effects: [{
        type: 'price_change',
        target: market.id,
        value: eventType === EconomicEventType.BOOM ? 0.1 : -0.1, // 10% change
        description: 'Temporary price adjustment'
      }],
      affectedMarkets: [market.id],
      affectedCurrencies: [CurrencyType.GOLD],
      affectedEntities: [],
      metadata: {
        triggerPrice: currentPrice,
        averagePrice: averagePrice,
        marketId: market.id
      }
    };

    this.economicEvents.set(event.id, event);
    console.info(`Economic event triggered: ${event.name}`);
  }

  // Market operations
  createMarket(marketData: Partial<Market>): string {
    const marketId = `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const market: Market = {
      id: marketId,
      name: marketData.name || 'New Market',
      type: marketData.type || MarketType.PLAYER_MARKET,
      location: marketData.location || 'unknown',
      operatingHours: marketData.operatingHours || {
        open: 9,
        close: 17,
        timezone: 'UTC'
      },
      fees: marketData.fees || {
        transactionFee: 0.02,
        listingFee: 1,
        withdrawalFee: 0.01
      },
      restrictions: marketData.restrictions || [],
      listings: [],
      statistics: this.createEmptyMarketStatistics(),
      events: []
    };

    this.markets.set(marketId, market);
    this.performanceMetrics.totalMarkets++;

    return marketId;
  }

  listItem(listing: MarketListing): boolean {
    const market = this.markets.get(listing.id);
    if (!market) return false;

    market.listings.push(listing);
    market.statistics.totalListings++;
    market.statistics.activeListings++;

    // Update top items
    if (!market.statistics.topItems.includes(listing.itemId)) {
      market.statistics.topItems.push(listing.itemId);
      market.statistics.topItems = market.statistics.topItems.slice(0, 10); // Keep top 10
    }

    return true;
  }

  cancelListing(marketId: string, listingId: string): boolean {
    const market = this.markets.get(marketId);
    if (!market) return false;

    const listingIndex = market.listings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) return false;

    market.listings.splice(listingIndex, 1);
    market.statistics.activeListings = Math.max(0, market.statistics.activeListings - 1);

    return true;
  }

  // Economic analysis
  generateReport(period: { start: number; end: number }): EconomicReport {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const report: EconomicReport = {
      id: reportId,
      period,
      summary: {
        totalTransactions: this.performanceMetrics.totalTransactions,
        totalVolume: this.performanceMetrics.totalVolume,
        totalRevenue: this.performanceMetrics.totalVolume * 0.02, // Assuming 2% average fee
        averageTransactionValue: this.performanceMetrics.totalTransactions > 0
          ? this.performanceMetrics.totalVolume / this.performanceMetrics.totalTransactions
          : 0,
        topMarkets: Array.from(this.markets.keys()).slice(0, 5),
        topCurrencies: [CurrencyType.GOLD, CurrencyType.SILVER],
        economicHealth: this.calculateEconomicHealth()
      },
      marketAnalysis: new Map(),
      currencyAnalysis: new Map(),
      entityAnalysis: [],
      recommendations: this.generateRecommendations(),
      generatedAt: Date.now()
    };

    // Generate market analysis
    for (const [marketId, market] of this.markets) {
      const marketReport: MarketReport = {
        marketId,
        totalTransactions: market.statistics.totalTransactions,
        totalVolume: market.statistics.totalVolume,
        averagePrice: market.statistics.averagePrice,
        priceVolatility: this.calculateVolatility(market.statistics.priceHistory),
        topItems: market.statistics.topItems,
        trends: this.analyzeMarketTrends(market)
      };

      report.marketAnalysis.set(marketId, marketReport);
    }

    // Generate currency analysis
    for (const [currencyType, currency] of this.currencies) {
      const currencyReport: CurrencyReport = {
        currency: currencyType,
        totalTransactions: 0, // Would be calculated from transaction data
        totalVolume: currency.supply * currency.value,
        averageExchangeRate: currency.value,
        volatility: currency.volatility,
        trends: this.analyzeCurrencyTrends(currencyType)
      };

      report.currencyAnalysis.set(currencyType, currencyReport);
    }

    this.reportCounter++;
    return report;
  }

  private calculateEconomicHealth(): number {
    // Simple economic health calculation
    const marketHealth = Array.from(this.markets.values())
      .reduce((sum, market) => sum + (market.statistics.averagePrice > 0 ? 100 : 0), 0) / this.markets.size;

    const currencyStability = Array.from(this.currencies.values())
      .reduce((sum, currency) => sum + (100 - currency.volatility * 100), 0) / this.currencies.size;

    return (marketHealth + currencyStability) / 2;
  }

  private calculateVolatility(priceHistory: PricePoint[]): number {
    if (priceHistory.length < 2) return 0;

    const prices = priceHistory.map(p => p.price);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;

    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private analyzeMarketTrends(market: Market): Trend[] {
    const trends: Trend[] = [];

    // Analyze price trends
    const recentPrices = market.statistics.priceHistory.slice(-20);
    if (recentPrices.length >= 2) {
      const firstHalf = recentPrices.slice(0, 10);
      const secondHalf = recentPrices.slice(10);

      const firstAvg = firstHalf.reduce((sum, p) => sum + p.price, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, p) => sum + p.price, 0) / secondHalf.length;

      const change = (secondAvg - firstAvg) / firstAvg;

      trends.push({
        type: 'price',
        direction: change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'stable',
        magnitude: Math.abs(change),
        timeframe: 'day',
        confidence: 0.7
      });
    }

    return trends;
  }

  private analyzeCurrencyTrends(currencyType: CurrencyType): Trend[] {
    const currency = this.currencies.get(currencyType);
    if (!currency) return [];

    return [{
      type: 'price',
      direction: currency.volatility > 0.3 ? 'up' : 'stable',
      magnitude: currency.volatility,
      timeframe: 'day',
      confidence: 0.5
    }];
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Simple recommendations based on current state
    if (this.performanceMetrics.economicStability < 50) {
      recommendations.push('Consider implementing price controls to stabilize the economy');
    }

    if (this.performanceMetrics.inflationRate > 0.1) {
      recommendations.push('Inflation is high - consider increasing interest rates');
    }

    if (this.markets.size < 3) {
      recommendations.push('Add more markets to increase economic diversity');
    }

    return recommendations;
  }

  // Utility methods
  getEntity(entityId: string): EconomicEntity! {
    return this.entities.get(entityId);
  }

  getMarket(marketId: string): Market! {
    return this.markets.get(marketId);
  }

  getCurrency(currencyType: CurrencyType): Currency! {
    return this.currencies.get(currencyType);
  }

  getPerformanceMetrics(): EconomicPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  exportEconomyData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      entities: Array.from(this.entities.values()),
      markets: Array.from(this.markets.values()),
      currencies: Array.from(this.currencies.values()),
      transactions: Array.from(this.transactions.values()),
      statistics: this.performanceMetrics,
      timestamp: Date.now()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return this.convertToCSV(data);
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    return 'type,id,name,value\n';
  }

  reset(): void {
    this.entities.clear();
    this.markets.clear();
    this.currencies.clear();
    this.transactions.clear();
    this.taxPolicies.clear();
    this.economicEvents.clear();
    this.simulations.clear();
    this.supplyDemandCurves.clear();
    this.eventQueue = [];
    this.transactionCounter = 0;
    this.reportCounter = 0;

    this.initializeDefaultCurrencies();
    this.initializeDefaultMarkets();
    this.performanceMetrics = this.initializePerformanceMetrics();

    console.info('[EconomicEngine] Reset to initial state');
  }

  dispose(): void {
    this.reset();
    console.info('[EconomicEngine] Disposed successfully');
  }
}

// Supporting interfaces and types
export interface EconomicPerformanceMetrics {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalTransactions: number;
  totalVolume: number;
  totalEntities: number;
  totalMarkets: number;
  totalCurrencies: number;
  averageTransactionTime: number;
  marketHealth: number;
  economicStability: number;
  inflationRate: number;
  processedEvents: number;
  activeSimulations: number;
}

export interface ValidationResult {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  valid: boolean;
  reason?: string;
}