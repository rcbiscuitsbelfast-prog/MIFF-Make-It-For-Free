import { describe, test, expect } from '@jest/globals';
import { runCLICommand } from '../../shared/testUtils';

describe('EconomyPure CLI Harness', () => {
  const CLI_PATH = './miff/pure/EconomyPure/cliHarness.ts';

  test('create-rule operation', async () => {
    const rule = {
      id: 'test_rule',
      itemId: 'test_item',
      basePrice: 100,
      currency: 'gold',
      category: 'test',
      rarity: 'common'
    };

    const result = await runCLICommand(CLI_PATH, ['create-rule', JSON.stringify(rule)]);
    
    expect(result.op).toBe('create-rule');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('rule_created');
    expect(result.result.rule.id).toBe('test_rule');
    expect(result.result.success).toBe(true);
  });

  test('create-vendor operation', async () => {
    const vendor = {
      id: 'test_vendor',
      name: 'Test Vendor',
      type: 'general',
      inventory: {
        'test_item': {
          quantity: 10,
          maxStock: 20,
          restockRate: 1,
          lastRestock: new Date(),
          demand: 0.5,
          supply: 0.5
        }
      },
      markup: 0.2,
      markdown: 0.1,
      location: 'test_location',
      reputation: 50,
      specialties: ['test'],
      currency: 'gold',
      acceptedCurrencies: ['gold'],
      marketShare: 0.1,
      operatingHours: { open: 8, close: 20 }
    };

    const result = await runCLICommand(CLI_PATH, ['create-vendor', JSON.stringify(vendor)]);
    
    expect(result.op).toBe('create-vendor');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('vendor_created');
    expect(result.result.vendor.id).toBe('test_vendor');
    expect(result.result.success).toBe(true);
  });

  test('calculate-price operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['calculate-price', 'general_store', 'health_potion', '3']);
    
    expect(result.op).toBe('calculate-price');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('price_calculated');
    expect(result.result.vendorId).toBe('general_store');
    expect(result.result.itemId).toBe('health_potion');
    expect(result.result.quantity).toBe(3);
    expect(result.result.success).toBe(true);
    expect(result.result.priceData).toBeDefined();
    expect(result.result.priceData.buyPrice).toBeGreaterThan(0);
    expect(result.result.priceData.sellPrice).toBeGreaterThan(0);
  });

  test('execute-trade operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['execute-trade', 'general_store', 'health_potion', '2', 'buy', 'player_test']);
    
    expect(result.op).toBe('execute-trade');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('trade_executed');
    expect(result.result.vendorId).toBe('general_store');
    expect(result.result.itemId).toBe('health_potion');
    expect(result.result.quantity).toBe(2);
    expect(result.result.type).toBe('buy');
    expect(result.result.playerId).toBe('player_test');
    expect(result.result.success).toBe(true);
    expect(result.result.tradeData).toBeDefined();
    expect(result.result.tradeData.transaction).toBeDefined();
    expect(result.result.tradeData.transaction.id).toBeDefined();
  });

  test('get-market-data operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['get-market-data', 'health_potion']);
    
    expect(result.op).toBe('get-market-data');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('market_data_retrieved');
    expect(result.result.itemId).toBe('health_potion');
    expect(result.result.success).toBe(true);
    expect(result.result.marketData).toBeDefined();
    expect(result.result.marketData.itemId).toBe('health_potion');
    expect(result.result.marketData.category).toBeDefined();
    expect(result.result.marketData.averagePrice).toBeGreaterThan(0);
  });

  test('get-stats operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['get-stats']);
    
    expect(result.op).toBe('get-stats');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('stats_retrieved');
    expect(result.result.success).toBe(true);
    expect(result.result.stats).toBeDefined();
    expect(result.result.stats.totalVendors).toBeGreaterThan(0);
    expect(result.result.stats.totalItems).toBeGreaterThan(0);
    expect(result.result.stats.totalCurrencies).toBeGreaterThan(0);
    expect(result.result.stats.economicHealth).toBeGreaterThanOrEqual(0);
    expect(result.result.stats.economicHealth).toBeLessThanOrEqual(100);
  });

  test('list-rules operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['list-rules']);
    
    expect(result.op).toBe('list-rules');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('rules_listed');
    expect(result.result.success).toBe(true);
    expect(Array.isArray(result.result.rules)).toBe(true);
    expect(result.result.count).toBeGreaterThan(0);
    expect(result.result.rules[0!]).toHaveProperty('id');
    expect(result.result.rules[0!]).toHaveProperty('itemId');
    expect(result.result.rules[0!]).toHaveProperty('basePrice');
  });

  test('list-vendors operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['list-vendors']);
    
    expect(result.op).toBe('list-vendors');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('vendors_listed');
    expect(result.result.success).toBe(true);
    expect(Array.isArray(result.result.vendors)).toBe(true);
    expect(result.result.count).toBeGreaterThan(0);
    expect(result.result.vendors[0!]).toHaveProperty('id');
    expect(result.result.vendors[0!]).toHaveProperty('name');
    expect(result.result.vendors[0!]).toHaveProperty('type');
  });

  test('list-currencies operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['list-currencies']);
    
    expect(result.op).toBe('list-currencies');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('currencies_listed');
    expect(result.result.success).toBe(true);
    expect(Array.isArray(result.result.currencies)).toBe(true);
    expect(result.result.count).toBeGreaterThan(0);
    expect(result.result.currencies[0!]).toHaveProperty('id');
    expect(result.result.currencies[0!]).toHaveProperty('name');
    expect(result.result.currencies[0!]).toHaveProperty('symbol');
  });

  test('export operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['export', 'summary']);
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('economy_exported');
    expect(result.result.format).toBe('summary');
    expect(result.result.success).toBe(true);
    expect(result.result.data).toBeDefined();
    expect(result.result.data.summary).toBeDefined();
  });

  test('reset operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['reset']);
    
    expect(result.op).toBe('reset');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('economy_reset');
    expect(result.result.success).toBe(true);
    expect(result.result.message).toBeDefined();
  });

  test('demo operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['demo']);
    
    expect(result.op).toBe('demo');
    expect(result.status).toBe('ok');
    expect(result.result.demo).toBeDefined();
    expect(result.result.demo.configuration).toBeDefined();
    expect(result.result.demo.customContent).toBeDefined();
    expect(result.result.demo.trades).toBeDefined();
    expect(Array.isArray(result.result.demo.trades)).toBe(true);
    expect(result.result.demo.analysis).toBeDefined();
    expect(result.result.demo.summary).toBeDefined();
    expect(result.result.demo.summary.totalVendors).toBeGreaterThan(0);
    expect(result.result.demo.summary.economicHealth).toBeGreaterThanOrEqual(0);
  });

  test('dump operation', async () => {
    const result = await runCLICommand(CLI_PATH, ['dump']);
    
    expect(result.op).toBe('dump');
    expect(result.status).toBe('ok');
    expect(Array.isArray(result.result.operations)).toBe(true);
    expect(result.result.description).toContain('EconomyPure');
    expect(Array.isArray(result.result.features)).toBe(true);
    expect(Array.isArray(result.result.currencies)).toBe(true);
    expect(Array.isArray(result.result.vendorTypes)).toBe(true);
    expect(Array.isArray(result.result.categories)).toBe(true);
    expect(Array.isArray(result.result.rarities)).toBe(true);
    expect(Array.isArray(result.result.exportFormats)).toBe(true);
    expect(Array.isArray(result.result.eventTypes)).toBe(true);
    expect(result.result.operations).toContain('create-rule');
    expect(result.result.operations).toContain('calculate-price');
    expect(result.result.operations).toContain('execute-trade');
  });

  test('create-event operation', async () => {
    const event = {
      id: 'test_event',
      name: 'Test Economic Event',
      type: 'boom',
      description: 'A test economic boom',
      duration: 1, // 1 hour
      startTime: new Date(),
      effects: [
        {
          target: 'global',
          modifier: 0.1, // 10% price increase
          type: 'price'
        }
      ]
    };

    const result = await runCLICommand(CLI_PATH, ['create-event', JSON.stringify(event)]);
    
    expect(result.op).toBe('create-event');
    expect(result.status).toBe('ok');
    expect(result.result.action).toBe('event_created');
    expect(result.result.event?.id).toBe('test_event');
    expect(result.result.success).toBe(true);
  });

  test('error handling - invalid vendor', async () => {
    const result = await runCLICommand(CLI_PATH, ['calculate-price', 'nonexistent_vendor', 'health_potion']);
    
    expect(result.op).toBe('calculate-price');
    expect(result.status).toBe('ok');
    expect(result.result.success).toBe(false);
    expect(result.result.issues).toBeDefined();
    expect(result.result.issues.length).toBeGreaterThan(0);
  });

  test('error handling - invalid item', async () => {
    const result = await runCLICommand(CLI_PATH, ['calculate-price', 'general_store', 'nonexistent_item']);
    
    expect(result.op).toBe('calculate-price');
    expect(result.status).toBe('ok');
    expect(result.result.success).toBe(false);
    expect(result.result.issues).toBeDefined();
    expect(result.result.issues.length).toBeGreaterThan(0);
  });

  test('error handling - insufficient stock', async () => {
    // First try to buy more than available
    const result = await runCLICommand(CLI_PATH, ['execute-trade', 'general_store', 'health_potion', '1000', 'buy']);
    
    expect(result.op).toBe('execute-trade');
    expect(result.status).toBe('ok');
    expect(result.result.success).toBe(false);
    expect(result.result.issues).toBeDefined();
    expect(result.result.issues.length).toBeGreaterThan(0);
  });
});