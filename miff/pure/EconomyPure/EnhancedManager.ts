/**
 * EconomyPure Enhanced Manager
 * 
 * Advanced economic system including market simulation, price dynamics,
 * supply and demand, inflation, currency exchange, and economic events.
 */

export interface EconomyConfig {
  baseInflationRate: number; // Annual inflation rate
  marketVolatility: number; // 0-1, affects price fluctuations
  supplyDemandSensitivity: number; // How much supply/demand affects prices
  globalMarketEnabled: boolean; // Enable cross-vendor market dynamics
  currencyExchangeEnabled: boolean; // Enable multi-currency support
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  exchangeRate: number; // Relative to base currency
  stability: number; // 0-1, affects exchange rate volatility
  inflationRate: number; // Currency-specific inflation
}

export interface PriceRule {
  id: string;
  itemId: string;
  basePrice: number;
  currency: string; // Currency ID
  modifiers?: PriceModifier[];
  category: string; // Item category for market analysis
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  metadata?: Record<string, any>;
}

export interface PriceModifier {
  key: string;
  value: number;
  type: 'fixed' | 'percentage' | 'multiplier';
  condition?: ModifierCondition;
}

export interface ModifierCondition {
  type: 'time' | 'stock' | 'reputation' | 'event' | 'demand';
  operator: 'equals' | 'greater' | 'less' | 'between';
  value: any;
}

export interface VendorState {
  id: string;
  name: string;
  type: 'general' | 'specialist' | 'black_market' | 'auction_house';
  inventory: Record<string, VendorInventoryItem>;
  markup: number; // Base markup percentage
  markdown: number; // Base markdown percentage
  location: string; // Location affects prices
  reputation: number; // 0-100, affects pricing
  specialties: string[]; // Item categories with discounts
  currency: string; // Primary currency
  acceptedCurrencies: string[]; // Additional currencies
  marketShare: number; // 0-1, affects market dynamics
  operatingHours: { open: number; close: number };
  metadata?: Record<string, any>;
}

export interface VendorInventoryItem {
  quantity: number;
  maxStock: number;
  restockRate: number; // Items per hour
  lastRestock: number;
  demand: number; // 0-1, affects pricing
  supply: number; // 0-1, affects availability
}

export interface MarketData {
  itemId: string;
  category: string;
  averagePrice: number;
  priceHistory: Array<{ timestamp: number; price: number; volume: number }>;
  volatility: number;
  trend: 'rising' | 'falling' | 'stable';
  totalVolume: number;
  topVendors: Array<{ vendorId: string; marketShare: number }>;
}

export interface EconomicEvent {
  id: string;
  name: string;
  type: 'inflation' | 'deflation' | 'shortage' | 'surplus' | 'crisis' | 'boom';
  description: string;
  duration: number; // hours
  startTime: number;
  effects: Array<{
    target: 'category' | 'vendor' | 'currency' | 'global';
    targetId?: string;
    modifier: number;
    type: 'price' | 'demand' | 'supply' | 'exchange_rate';
  }>;
  metadata?: Record<string, any>;
}

export interface PriceResult {
  itemId: string;
  vendorId: string;
  currency: string;
  basePrice: number;
  finalPrice: number;
  buyPrice: number;
  sellPrice: number;
  modifiers: Array<{ source: string; effect: number; type: string }>;
  marketFactors: {
    demand: number;
    supply: number;
    volatility: number;
    trend: string;
  };
  availability: boolean;
  quantity: number;
}

export interface EconomyStats {
  totalVendors: number;
  totalItems: number;
  totalCurrencies: number;
  activeEvents: number;
  averageInflation: number;
  marketVolume: number;
  priceVolatility: number;
  topCategories: Array<{ category: string; volume: number; avgPrice: number }>;
  topVendors: Array<{ vendorId: string; revenue: number; marketShare: number }>;
  economicHealth: number; // 0-100 score
}

export interface TradeTransaction {
  id: string;
  vendorId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  timestamp: number;
  type: 'buy' | 'sell';
  playerId?: string;
}

export interface EconomyOutput {
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: Array<{ code: string; message: string }>;
}

export class EnhancedEconomyManager {
  private config: EconomyConfig;
  private currencies: Map<string, Currency> = new Map();
  private rules: Map<string, PriceRule> = new Map();
  private vendors: Map<string, VendorState> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private economicEvents: Map<string, EconomicEvent> = new Map();
  private transactions: TradeTransaction[] = [];
  private lastMarketUpdate: number = Date.now();

  constructor(config?: Partial<EconomyConfig>) {
    this.config = {
      baseInflationRate: 0.02, // 2% annual
      marketVolatility: 0.1,
      supplyDemandSensitivity: 0.3,
      globalMarketEnabled: true,
      currencyExchangeEnabled: true,
      ...config
    };

    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    // Default currencies
    const defaultCurrencies: Currency[] = [
      {
        id: 'gold',
        name: 'Gold Coins',
        symbol: 'G',
        exchangeRate: 1.0,
        stability: 0.9,
        inflationRate: 0.02
      },
      {
        id: 'silver',
        name: 'Silver Coins',
        symbol: 'S',
        exchangeRate: 0.1,
        stability: 0.8,
        inflationRate: 0.03
      },
      {
        id: 'gems',
        name: 'Precious Gems',
        symbol: 'GEM',
        exchangeRate: 10.0,
        stability: 0.7,
        inflationRate: 0.01
      }
    ];

    defaultCurrencies.forEach((currency: any) => this.currencies.set(currency.id, currency));

    // Default price rules
    const defaultRules: PriceRule[] = [
      {
        id: 'health_potion_rule',
        itemId: 'health_potion',
        basePrice: 50,
        currency: 'gold',
        category: 'consumables',
        rarity: 'common',
        modifiers: [
          { key: 'bulk_discount', value: -0.1, type: 'percentage' },
          { key: 'high_demand', value: 0.2, type: 'percentage' }
        ]
      },
      {
        id: 'iron_sword_rule',
        itemId: 'iron_sword',
        basePrice: 150,
        currency: 'gold',
        category: 'weapons',
        rarity: 'common'
      },
      {
        id: 'magic_scroll_rule',
        itemId: 'magic_scroll',
        basePrice: 200,
        currency: 'gold',
        category: 'magic',
        rarity: 'uncommon'
      }
    ];

    defaultRules.forEach((rule: any) => this.rules.set(rule.id, rule));

    // Default vendors
    const defaultVendors: VendorState[] = [
      {
        id: 'general_store',
        name: 'General Store',
        type: 'general',
        inventory: {
          'health_potion': { quantity: 50, maxStock: 100, restockRate: 10, lastRestock: new Date(), demand: 0.7, supply: 0.8 },
          'iron_sword': { quantity: 5, maxStock: 20, restockRate: 2, lastRestock: new Date(), demand: 0.5, supply: 0.6 }
        },
        markup: 0.2,
        markdown: 0.1,
        location: 'town_center',
        reputation: 75,
        specialties: ['consumables'],
        currency: 'gold',
        acceptedCurrencies: ['gold', 'silver'],
        marketShare: 0.3,
        operatingHours: { open: 6, close: 22 }
      },
      {
        id: 'magic_emporium',
        name: 'Magic Emporium',
        type: 'specialist',
        inventory: {
          'magic_scroll': { quantity: 20, maxStock: 50, restockRate: 5, lastRestock: new Date(), demand: 0.8, supply: 0.4 }
        },
        markup: 0.5,
        markdown: 0.2,
        location: 'mage_quarter',
        reputation: 90,
        specialties: ['magic', 'enchantments'],
        currency: 'gold',
        acceptedCurrencies: ['gold', 'gems'],
        marketShare: 0.1,
        operatingHours: { open: 10, close: 18 }
      }
    ];

    defaultVendors.forEach((vendor: any) => this.vendors.set(vendor.id, vendor));

    // Initialize market data
    this.updateMarketData();
  }

  /**
   * Create a new price rule
   */
  createRule(rule: PriceRule): EconomyOutput {
    if (this.rules.has(rule.id)) {
      return {
        op: 'create_rule',
        status: 'error',
        issues: [{ code: 'duplicate', message: `Price rule ${rule.id} already exists` }]
      };
    }

    this.rules.set(rule.id, rule);
    this.updateMarketData();

    return {
      op: 'create_rule',
      status: 'ok',
      result: rule
    };
  }

  /**
   * Create a new vendor
   */
  createVendor(vendor: VendorState): EconomyOutput {
    if (this.vendors.has(vendor.id)) {
      return {
        op: 'create_vendor',
        status: 'error',
        issues: [{ code: 'duplicate', message: `Vendor ${vendor.id} already exists` }]
      };
    }

    this.vendors.set(vendor.id, vendor);
    this.updateMarketData();

    return {
      op: 'create_vendor',
      status: 'ok',
      result: vendor
    };
  }

  /**
   * Calculate item price with all market factors
   */
  calculatePrice(vendorId: string, itemId: string, quantity: number = 1): EconomyOutput {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      return {
        op: 'calculate_price',
        status: 'error',
        issues: [{ code: 'not_found', message: `Vendor ${vendorId} not found` }]
      };
    }

    const rule = Array.from(this.rules.values()).find(r => r.itemId === itemId);
    if (!rule) {
      return {
        op: 'calculate_price',
        status: 'error',
        issues: [{ code: 'not_found', message: `Price rule for item ${itemId} not found` }]
      };
    }

    const inventoryItem = vendor.inventory[itemId];
    if (!inventoryItem) {
      return {
        op: 'calculate_price',
        status: 'error',
        issues: [{ code: 'not_available', message: `Item ${itemId} not available at vendor ${vendorId}` }]
      };
    }

    // Check availability
    const available = inventoryItem.quantity >= quantity;
    const availableQuantity = Math.min(quantity, inventoryItem.quantity);

    // Base price calculation
    let basePrice = rule.basePrice;
    const modifiers: Array<{ source: string; effect: number; type: string }> = [];

    // Apply vendor markup
    const markupEffect = basePrice * vendor.markup;
    modifiers.push({ source: 'vendor_markup', effect: markupEffect, type: 'fixed' });
    basePrice += markupEffect;

    // Apply supply and demand
    const demandEffect = basePrice * (inventoryItem.demand - 0.5) * this.config.supplyDemandSensitivity;
    const supplyEffect = basePrice * (0.5 - inventoryItem.supply) * this.config.supplyDemandSensitivity;
    modifiers.push({ source: 'demand', effect: demandEffect, type: 'fixed' });
    modifiers.push({ source: 'supply', effect: supplyEffect, type: 'fixed' });
    basePrice += demandEffect + supplyEffect;

    // Apply vendor reputation
    const reputationDiscount = basePrice * (vendor.reputation - 50) / 100 * 0.1;
    modifiers.push({ source: 'reputation', effect: -reputationDiscount, type: 'fixed' });
    basePrice -= reputationDiscount;

    // Apply specialty discount
    if (vendor.specialties.includes(rule.category)) {
      const specialtyDiscount = basePrice * 0.1;
      modifiers.push({ source: 'specialty', effect: -specialtyDiscount, type: 'fixed' });
      basePrice -= specialtyDiscount;
    }

    // Apply rule modifiers
    if (rule.modifiers) {
      for (const modifier of rule.modifiers) {
        let modifierValue = 0;
        
        switch (modifier.type) {
          case 'fixed':
            modifierValue = modifier.value;
            break;
          case 'percentage':
            modifierValue = basePrice * modifier.value;
            break;
          case 'multiplier':
            modifierValue = basePrice * (modifier.value - 1);
            break;
        }

        modifiers.push({ source: modifier.key, effect: modifierValue, type: modifier.type });
        basePrice += modifierValue;
      }
    }

    // Apply economic events
    for (const event of this.economicEvents.values()) {
      if (this.isEventActive(event)) {
        for (const effect of event.effects) {
          if (this.eventAffectsItem(effect, rule, vendor)) {
            const eventEffect = basePrice * effect.modifier;
            modifiers.push({ source: `event_${event?.id}`, effect: eventEffect, type: 'percentage' });
            basePrice += eventEffect;
          }
        }
      }
    }

    // Apply inflation
    const inflationEffect = this.calculateInflation(rule.currency);
    const inflationAdjustment = basePrice * inflationEffect;
    modifiers.push({ source: 'inflation', effect: inflationAdjustment, type: 'percentage' });
    basePrice += inflationAdjustment;

    // Calculate final prices
    const finalPrice = Math.max(1, Math.round(basePrice));
    const buyPrice = finalPrice;
    const sellPrice = Math.round(finalPrice * (1 - vendor.markdown));

    // Get market data
    const marketData = this.marketData.get(itemId);
    const marketFactors = {
      demand: inventoryItem.demand,
      supply: inventoryItem.supply,
      volatility: marketData?.volatility || 0,
      trend: marketData?.trend || 'stable'
    };

    const result: PriceResult = {
      itemId,
      vendorId,
      currency: rule.currency,
      basePrice: rule.basePrice,
      finalPrice,
      buyPrice,
      sellPrice,
      modifiers,
      marketFactors,
      availability: available,
      quantity: availableQuantity
    };

    return {
      op: 'calculate_price',
      status: 'ok',
      result
    };
  }

  /**
   * Execute a trade transaction
   */
  executeTrade(vendorId: string, itemId: string, quantity: number, type: 'buy' | 'sell', playerId?: string): EconomyOutput {
    const priceResult = this.calculatePrice(vendorId, itemId, quantity);
    if (priceResult.status === 'error') {
      return priceResult;
    }

    const price = priceResult.result as PriceResult;
    const vendor = this.vendors.get(vendorId)!;
    const inventoryItem = vendor.inventory[itemId];

    if (type === 'buy') {
      if (!price.availability) {
        return {
          op: 'execute_trade',
          status: 'error',
          issues: [{ code: 'insufficient_stock', message: `Not enough stock for ${itemId}` }]
        };
      }

      // Update inventory
      inventoryItem.quantity -= quantity;
      inventoryItem.demand = Math.min(1, inventoryItem.demand + 0.1);
    } else {
      // Selling to vendor
      inventoryItem.quantity += quantity;
      inventoryItem.supply = Math.min(1, inventoryItem.supply + 0.1);
    }

    // Create transaction record
    const transaction: TradeTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vendorId,
      itemId,
      quantity,
      unitPrice: type === 'buy' ? price.buyPrice : price.sellPrice,
      totalPrice: (type === 'buy' ? price.buyPrice : price.sellPrice) * quantity,
      currency: price.currency,
      timestamp: new Date(),
      type,
      playerId
    };

    this.transactions.push(transaction);
    this.vendors.set(vendorId, vendor);
    this.updateMarketData();

    return {
      op: 'execute_trade',
      status: 'ok',
      result: { transaction, price }
    };
  }

  /**
   * Create economic event
   */
  createEconomicEvent(event: EconomicEvent): EconomyOutput {
    if (this.economicEvents.has(event?.id)) {
      return {
        op: 'create_event',
        status: 'error',
        issues: [{ code: 'duplicate', message: `Economic event ${event?.id} already exists` }]
      };
    }

    this.economicEvents.set(event?.id, event);
    return {
      op: 'create_event',
      status: 'ok',
      result: event
    };
  }

  /**
   * Get market data for item
   */
  getMarketData(itemId: string): EconomyOutput {
    const marketData = this.marketData.get(itemId);
    if (!marketData) {
      return {
        op: 'get_market_data',
        status: 'error',
        issues: [{ code: 'not_found', message: `Market data for ${itemId} not found` }]
      };
    }

    return {
      op: 'get_market_data',
      status: 'ok',
      result: marketData
    };
  }

  /**
   * Get economy statistics
   */
  getEconomyStats(): EconomyOutput {
    const vendors = Array.from(this.vendors.values());
    const rules = Array.from(this.rules.values());
    const currencies = Array.from(this.currencies.values());
    const activeEvents = Array.from(this.economicEvents.values()).filter((e: any) => this.isEventActive(e));

    // Calculate market volume
    const marketVolume = this.transactions
      .filter((tx: any) => tx.timestamp > Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      .reduce((sum, tx) => sum + tx.totalPrice, 0);

    // Calculate category statistics
    const categoryStats = new Map<string, { volume: number; totalPrice: number; count: number }>();
    
    for (const rule of rules) {
      if (!categoryStats.has(rule.category)) {
        categoryStats.set(rule.category, { volume: 0, totalPrice: 0, count: 0 });
      }
      
      const categoryTransactions = this.transactions.filter((tx: any) => tx.itemId === rule.itemId);
      const volume = categoryTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
      const totalPrice = categoryTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0);
      
      const stats = categoryStats.get(rule.category)!;
      stats.volume += volume;
      stats.totalPrice += totalPrice;
      stats.count++;
    }

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        volume: stats.volume,
        avgPrice: stats.count > 0 ? stats.totalPrice / stats.count : 0
      }))
      .sort((a: any, b: any) => b.volume - a.volume)
      .slice(0, 5);

    // Calculate vendor statistics
    const vendorStats = vendors.map((vendor: any) => {
      const vendorTransactions = this.transactions.filter((tx: any) => tx.vendorId === vendor.id);
      const revenue = vendorTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0);
      return {
        vendorId: vendor.id,
        revenue,
        marketShare: vendor.marketShare
      };
    }).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5);

    // Calculate economic health (0-100)
    const averageInflation = currencies.reduce((sum, c) => sum + c.inflationRate, 0) / currencies.length;
    const priceVolatility = Array.from(this.marketData.values()).reduce((sum, m) => sum + m.volatility, 0) / this.marketData.size;
    const economicHealth = Math.max(0, Math.min(100, 
      100 - (averageInflation * 1000) - (priceVolatility * 100) - (activeEvents.length * 5)
    ));

    const stats: EconomyStats = {
      totalVendors: vendors.length,
      totalItems: rules.length,
      totalCurrencies: currencies.length,
      activeEvents: activeEvents.length,
      averageInflation,
      marketVolume,
      priceVolatility,
      topCategories,
      topVendors: vendorStats,
      economicHealth
    };

    return {
      op: 'get_economy_stats',
      status: 'ok',
      result: stats
    };
  }

  /**
   * Update market data
   */
  private updateMarketData(): void {
    const now = Date.now();
    
    for (const rule of this.rules.values()) {
      let marketData = this.marketData.get(rule.itemId);
      
      if (!marketData) {
        marketData = {
          itemId: rule.itemId,
          category: rule.category,
          averagePrice: rule.basePrice,
          priceHistory: [],
          volatility: 0,
          trend: 'stable',
          totalVolume: 0,
          topVendors: []
        };
      }

      // Calculate average price from recent transactions
      const recentTransactions = this.transactions
        .filter((tx: any) => tx.itemId === rule.itemId && tx.timestamp > now - 24 * 60 * 60 * 1000)
        .slice(-20); // Last 20 transactions

      if (recentTransactions.length > 0) {
        const avgPrice = recentTransactions.reduce((sum, tx) => sum + tx.unitPrice, 0) / recentTransactions.length;
        marketData.averagePrice = avgPrice;

        // Update price history
        marketData.priceHistory.push({
          timestamp: now,
          price: avgPrice,
          volume: recentTransactions.reduce((sum, tx) => sum + tx.quantity, 0)
        });

        // Keep only last 100 entries
        if (marketData.priceHistory.length > 100) {
          marketData.priceHistory = marketData.priceHistory.slice(-100);
        }

        // Calculate volatility and trend
        if (marketData.priceHistory.length >= 2) {
          const prices = marketData.priceHistory.map((h: any) => h.price);
          const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
          const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
          marketData.volatility = Math.sqrt(variance) / mean;

          // Determine trend
          const recentPrices = prices.slice(-5);
          const oldPrices = prices.slice(-10, -5);
          if (recentPrices.length >= 3 && oldPrices.length >= 3) {
            const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
            const oldAvg = oldPrices.reduce((sum, p) => sum + p, 0) / oldPrices.length;
            const change = (recentAvg - oldAvg) / oldAvg;
            
            if (change > 0.05) marketData.trend = 'rising';
            else if (change < -0.05) marketData.trend = 'falling';
            else marketData.trend = 'stable';
          }
        }

        // Calculate total volume
        marketData.totalVolume = this.transactions
          .filter((tx: any) => tx.itemId === rule.itemId)
          .reduce((sum, tx) => sum + tx.quantity, 0);

        // Calculate top vendors
        const vendorVolumes = new Map<string, number>();
        recentTransactions.forEach((tx: any) => {
          vendorVolumes.set(tx.vendorId, (vendorVolumes.get(tx.vendorId) || 0) + tx.quantity);
        });

        marketData.topVendors = Array.from(vendorVolumes.entries())
          .map(([vendorId, volume]) => ({
            vendorId,
            marketShare: volume / marketData!.totalVolume
          }))
          .sort((a: any, b: any) => b.marketShare - a.marketShare)
          .slice(0, 5);
      }

      this.marketData.set(rule.itemId, marketData);
    }

    this.lastMarketUpdate = now;
  }

  /**
   * Calculate inflation effect for currency
   */
  private calculateInflation(currencyId: string): number {
    const currency = this.currencies.get(currencyId);
    if (!currency) return 0;

    const timeSinceLastUpdate = (Date.now() - this.lastMarketUpdate) / (1000 * 60 * 60 * 24 * 365); // Years
    return currency.inflationRate * timeSinceLastUpdate;
  }

  /**
   * Check if economic event is currently active
   */
  private isEventActive(event: EconomicEvent): boolean {
    const now = Date.now();
    const endTime = event.startTime + (event.duration * 60 * 60 * 1000); // Convert hours to ms
    return now >= event.startTime && now <= endTime;
  }

  /**
   * Check if event effect applies to item/vendor
   */
  private eventAffectsItem(effect: any, rule: PriceRule, vendor: VendorState): boolean {
    switch (effect.target) {
      case 'category':
        return rule.category === effect.targetId;
      case 'vendor':
        return vendor.id === effect.targetId;
      case 'currency':
        return rule.currency === effect.targetId;
      case 'global':
        return true;
      default:
        return false;
    }
  }

  /**
   * Get all price rules
   */
  listRules(): EconomyOutput {
    return {
      op: 'list_rules',
      status: 'ok',
      result: Array.from(this.rules.values())
    };
  }

  /**
   * Get all vendors
   */
  listVendors(): EconomyOutput {
    return {
      op: 'list_vendors',
      status: 'ok',
      result: Array.from(this.vendors.values())
    };
  }

  /**
   * Get all currencies
   */
  listCurrencies(): EconomyOutput {
    return {
      op: 'list_currencies',
      status: 'ok',
      result: Array.from(this.currencies.values())
    };
  }

  /**
   * Export economy data
   */
  exportEconomy(format: 'json' | 'manifest' | 'summary' | 'transactions' = 'json'): EconomyOutput {
    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {
            config: this.config,
            currencies: Array.from(this.currencies.values()),
            rules: Array.from(this.rules.values()),
            vendors: Array.from(this.vendors.values()),
            marketData: Array.from(this.marketData.values()),
            events: Array.from(this.economicEvents.values()),
            transactions: this.transactions.slice(-100) // Last 100 transactions
          }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.economy.export.v1',
            exportedAt: new Date().toISOString(),
            config: this.config,
            summary: {
              totalVendors: this.vendors.size,
              totalItems: this.rules.size,
              totalCurrencies: this.currencies.size,
              totalTransactions: this.transactions.length
            },
            data: {
              currencies: Array.from(this.currencies.values()),
              rules: Array.from(this.rules.values()),
              vendors: Array.from(this.vendors.values()),
              marketData: Array.from(this.marketData.values())
            }
          }
        };
      
      case 'summary':
        const stats = this.getEconomyStats();
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: stats.result,
            recentTransactions: this.transactions.slice(-20)
          }
        };
      
      case 'transactions':
        return {
          op: 'export',
          status: 'ok',
          result: {
            transactions: this.transactions,
            total: this.transactions.length
          }
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [{ code: 'invalid_format', message: `Unknown export format: ${format}` }]
        };
    }
  }

  /**
   * Reset economy to default state
   */
  resetEconomy(): EconomyOutput {
    this.currencies.clear();
    this.rules.clear();
    this.vendors.clear();
    this.marketData.clear();
    this.economicEvents.clear();
    this.transactions = [];
    this.lastMarketUpdate = Date.now();
    
    this.initializeDefaultData();

    return {
      op: 'reset',
      status: 'ok',
      result: { message: 'Economy reset to default state' }
    };
  }
}