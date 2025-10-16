#!/usr/bin/env tsx

import { 
  EconomyManager, 
  EconomyConfig, 
  Currency,
  PriceRule,
  VendorState,
  EconomicEvent,
  TradeTransaction,
  EconomyOutput
} from './Manager';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface EconomyOperation {
  op: 'create-rule' | 'create-vendor' | 'create-currency' | 'create-event' | 'calculate-price' | 
      'execute-trade' | 'get-market-data' | 'get-stats' | 'list-rules' | 'list-vendors' | 
      'list-currencies' | 'export' | 'reset' | 'demo' | 'dump';
  rule?: PriceRule;
  vendor?: VendorState;
  currency?: Currency;
  event?: EconomicEvent;
  vendorId?: string;
  itemId?: string;
  quantity?: number;
  type?: 'buy' | 'sell';
  playerId?: string;
  format?: string;
  config?: Partial<EconomyConfig>;
  exportFormat?: string;
}

async function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: EconomyOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as EconomyOperation;
    } else {
      // Legacy compatibility: allow "op,arg1,arg2,..." packed in first token
      if (first.includes(',')) {
        const parts = first.split(',');
        const op = parts[0];
        const rest = parts.slice(1);
        switch (op) {
          case 'create-rule':
            operation = { op: 'create-rule', rule: JSON.parse(rest.join(',')) };
            break;
          case 'create-vendor':
            operation = { op: 'create-vendor', vendor: JSON.parse(rest.join(',')) };
            break;
          case 'create-event':
            operation = { op: 'create-event', event: JSON.parse(rest.join(',')) };
            break;
          case 'calculate-price':
            operation = { op: 'calculate-price', vendorId: rest[0], itemId: rest[1], quantity: rest[2] ? parseInt(rest[2]) : 1 };
            break;
          case 'execute-trade':
            operation = { op: 'execute-trade', vendorId: rest[0], itemId: rest[1], quantity: parseInt(rest[2]||'1'), type: rest[3] as any, playerId: rest[4] };
            break;
          case 'get-market-data':
            operation = { op: 'get-market-data', itemId: rest[0] };
            break;
          case 'export':
            operation = { op: 'export', exportFormat: rest[0] };
            break;
          default:
            throw new Error(`Unknown command: ${first}`);
        }
      } else {
      // Parse subcommand
      switch (first) {
        case 'create-rule':
          if (!argv[1]) throw new Error('create-rule requires rule JSON');
          operation = { op: 'create-rule', rule: JSON.parse(argv[1]) };
          break;
        case 'create-vendor':
          if (!argv[1]) throw new Error('create-vendor requires vendor JSON');
          operation = { op: 'create-vendor', vendor: JSON.parse(argv[1]) };
          break;
        case 'create-currency':
          if (!argv[1]) throw new Error('create-currency requires currency JSON');
          operation = { op: 'create-currency', currency: JSON.parse(argv[1]) };
          break;
        case 'create-event':
          if (!argv[1]) throw new Error('create-event requires event JSON');
          operation = { op: 'create-event', event: JSON.parse(argv[1]) };
          break;
        case 'calculate-price':
          if (!argv[1] || !argv[2]) throw new Error('calculate-price requires vendorId and itemId');
          operation = { 
            op: 'calculate-price', 
            vendorId: argv[1], 
            itemId: argv[2],
            quantity: argv[3] ? parseInt(argv[3]) : 1
          };
          break;
        case 'execute-trade':
          if (!argv[1] || !argv[2] || !argv[3] || !argv[4]) {
            throw new Error('execute-trade requires vendorId, itemId, quantity, and type (buy/sell)');
          }
          operation = { 
            op: 'execute-trade', 
            vendorId: argv[1], 
            itemId: argv[2],
            quantity: parseInt(argv[3]),
            type: argv[4] as 'buy' | 'sell',
            playerId: argv[5]
          };
          break;
        case 'get-market-data':
          if (!argv[1]) throw new Error('get-market-data requires itemId');
          operation = { op: 'get-market-data', itemId: argv[1] };
          break;
        case 'get-stats':
          operation = { op: 'get-stats' };
          break;
        case 'list-rules':
          operation = { op: 'list-rules' };
          break;
        case 'list-vendors':
          operation = { op: 'list-vendors' };
          break;
        case 'list-currencies':
          operation = { op: 'list-currencies' };
          break;
        case 'export':
          const exportFormat = argv[1] || 'json';
          operation = { op: 'export', exportFormat };
          break;
        case 'reset':
          operation = { op: 'reset' };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
      }
    }

    // Create economy manager instance
    const economyManager = new EconomyManager(operation.config);
    let result: any;

    switch (operation.op) {
      case 'create-rule':
        const ruleResult = economyManager.createRule(operation.rule!);
        result = {
          action: 'rule_created',
          rule: operation.rule,
          success: ruleResult.status === 'ok',
          issues: ruleResult.issues || []
        };
        break;

      case 'create-vendor':
        const vendorResult = economyManager.createVendor(operation.vendor!);
        result = {
          action: 'vendor_created',
          vendor: operation.vendor,
          success: vendorResult.status === 'ok',
          issues: vendorResult.issues || []
        };
        break;

      case 'create-currency':
        // Note: Currency creation would need to be added to EnhancedManager
        result = {
          action: 'currency_created',
          currency: operation.currency,
          success: true,
          note: 'Currency creation not yet implemented in manager'
        };
        break;

      case 'create-event':
        const eventResult = economyManager.createEconomicEvent(operation.event!);
        result = {
          action: 'event_created',
          event: operation.event,
          success: eventResult.status === 'ok',
          issues: eventResult.issues || []
        };
        break;

      case 'calculate-price':
        const priceResult = economyManager.calculatePrice(
          operation.vendorId!, 
          operation.itemId!, 
          operation.quantity || 1
        );
        result = {
          action: 'price_calculated',
          vendorId: operation.vendorId,
          itemId: operation.itemId,
          quantity: operation.quantity || 1,
          success: priceResult.status === 'ok',
          priceData: priceResult.result,
          issues: priceResult.issues || []
        };
        break;

      case 'execute-trade':
        const tradeResult = economyManager.executeTrade(
          operation.vendorId!,
          operation.itemId!,
          operation.quantity!,
          operation.type!,
          operation.playerId
        );
        result = {
          action: 'trade_executed',
          vendorId: operation.vendorId,
          itemId: operation.itemId,
          quantity: operation.quantity,
          type: operation.type,
          playerId: operation.playerId,
          success: tradeResult.status === 'ok',
          tradeData: tradeResult.result,
          issues: tradeResult.issues || []
        };
        break;

      case 'get-market-data':
        const marketResult = economyManager.getMarketData(operation.itemId!);
        result = {
          action: 'market_data_retrieved',
          itemId: operation.itemId,
          success: marketResult.status === 'ok',
          marketData: marketResult.result,
          issues: marketResult.issues || []
        };
        break;

      case 'get-stats':
        const statsResult = economyManager.getEconomyStats();
        result = {
          action: 'stats_retrieved',
          success: statsResult.status === 'ok',
          stats: statsResult.result,
          issues: statsResult.issues || []
        };
        break;

      case 'list-rules':
        const rulesResult = economyManager.listRules();
        result = {
          action: 'rules_listed',
          success: rulesResult.status === 'ok',
          rules: rulesResult.result,
          count: Array.isArray(rulesResult.result) ? rulesResult.result.length : 0,
          issues: rulesResult.issues || []
        };
        break;

      case 'list-vendors':
        const vendorsResult = economyManager.listVendors();
        result = {
          action: 'vendors_listed',
          success: vendorsResult.status === 'ok',
          vendors: vendorsResult.result,
          count: Array.isArray(vendorsResult.result) ? vendorsResult.result.length : 0,
          issues: vendorsResult.issues || []
        };
        break;

      case 'list-currencies':
        const currenciesResult = economyManager.listCurrencies();
        result = {
          action: 'currencies_listed',
          success: currenciesResult.status === 'ok',
          currencies: currenciesResult.result,
          count: Array.isArray(currenciesResult.result) ? currenciesResult.result.length : 0,
          issues: currenciesResult.issues || []
        };
        break;

      case 'export':
        const exportResult = economyManager.exportEconomy(operation.exportFormat as any);
        result = {
          action: 'economy_exported',
          format: operation.exportFormat,
          success: exportResult.status === 'ok',
          data: exportResult.result,
          issues: exportResult.issues || []
        };
        break;

      case 'reset':
        const resetResult = economyManager.resetEconomy();
        result = {
          action: 'economy_reset',
          success: resetResult.status === 'ok',
          message: resetResult.result?.message,
          issues: resetResult.issues || []
        };
        break;

      case 'demo':
        // Create a comprehensive economy demo
        const demoManager = new EconomyManager({
          baseInflationRate: 0.03,
          marketVolatility: 0.15,
          supplyDemandSensitivity: 0.4,
          globalMarketEnabled: true,
          currencyExchangeEnabled: true
        });

        // Add custom items and vendors
        const customRule: PriceRule = {
          id: 'rare_gem_rule',
          itemId: 'rare_gem',
          basePrice: 1000,
          currency: 'gold',
          category: 'gems',
          rarity: 'rare',
          modifiers: [
            { key: 'rarity_bonus', value: 0.5, type: 'percentage' },
            { key: 'scarcity', value: 0.3, type: 'percentage' }
          ]
        };

        const customVendor: VendorState = {
          id: 'black_market',
          name: 'Black Market Trader',
          type: 'black_market',
          inventory: {
            'rare_gem': { 
              quantity: 2, 
              maxStock: 5, 
              restockRate: 0.5, 
              lastRestock: Date.now(), 
              demand: 0.9, 
              supply: 0.2 
            }
          },
          markup: 0.8,
          markdown: 0.3,
          location: 'underground',
          reputation: 30,
          specialties: ['gems', 'black_market'],
          currency: 'gold',
          acceptedCurrencies: ['gold', 'gems'],
          marketShare: 0.05,
          operatingHours: { open: 20, close: 4 }
        };

        const economicEvent: EconomicEvent = {
          id: 'gem_shortage',
          name: 'Rare Gem Shortage',
          type: 'shortage',
          description: 'A mining accident has caused a shortage of rare gems',
          duration: 24, // 24 hours
          startTime: Date.now(),
          effects: [
            {
              target: 'category',
              targetId: 'gems',
              modifier: 0.5, // 50% price increase
              type: 'price'
            }
          ]
        };

        demoManager.createRule(customRule);
        demoManager.createVendor(customVendor);
        demoManager.createEconomicEvent(economicEvent);

        // Execute some trades
        const trade1 = demoManager.executeTrade('general_store', 'health_potion', 5, 'buy', 'player_1');
        const trade2 = demoManager.executeTrade('black_market', 'rare_gem', 1, 'buy', 'player_1');
        const trade3 = demoManager.executeTrade('magic_emporium', 'magic_scroll', 2, 'buy', 'player_2');

        // Get comprehensive data
        const demoStats = demoManager.getEconomyStats();
        const marketData = demoManager.getMarketData('rare_gem');
        const exportData = demoManager.exportEconomy('summary');

        result = {
          demo: {
            configuration: {
              baseInflationRate: 0.03,
              marketVolatility: 0.15,
              supplyDemandSensitivity: 0.4,
              globalMarketEnabled: true,
              currencyExchangeEnabled: true
            },
            customContent: {
              rule: customRule,
              vendor: customVendor,
              event: economicEvent
            },
            trades: [
              { 
                description: 'Buy 5 health potions from general store',
                result: trade1.result,
                success: trade1.status === 'ok'
              },
              { 
                description: 'Buy 1 rare gem from black market',
                result: trade2.result,
                success: trade2.status === 'ok'
              },
              { 
                description: 'Buy 2 magic scrolls from magic emporium',
                result: trade3.result,
                success: trade3.status === 'ok'
              }
            ],
            analysis: {
              stats: demoStats.result,
              rareGemMarket: marketData.result,
              exportSample: exportData.result
            },
            summary: {
              totalVendors: demoStats.result?.totalVendors || 0,
              totalItems: demoStats.result?.totalItems || 0,
              totalCurrencies: demoStats.result?.totalCurrencies || 0,
              economicHealth: demoStats.result?.economicHealth || 0,
              marketVolume: demoStats.result?.marketVolume || 0,
              activeEvents: demoStats.result?.activeEvents || 0
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: [
            'create-rule', 'create-vendor', 'create-currency', 'create-event',
            'calculate-price', 'execute-trade', 'get-market-data', 'get-stats',
            'list-rules', 'list-vendors', 'list-currencies', 'export', 'reset', 'demo', 'dump'
          ],
          description: 'EconomyPure - Advanced economic system with market simulation',
          features: [
            'Multi-currency support with exchange rates',
            'Dynamic pricing with supply and demand',
            'Vendor reputation and specialties',
            'Economic events and market volatility',
            'Inflation and market trends tracking',
            'Transaction history and analytics',
            'Market data and statistics',
            'Advanced pricing modifiers'
          ],
          currencies: ['gold', 'silver', 'gems'],
          vendorTypes: ['general', 'specialist', 'black_market', 'auction_house'],
          categories: ['consumables', 'weapons', 'magic', 'gems', 'enchantments'],
          rarities: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
          exportFormats: ['json', 'manifest', 'summary', 'transactions'],
          eventTypes: ['inflation', 'deflation', 'shortage', 'surplus', 'crisis', 'boom']
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html', 'yaml', 'xml'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'EconomyPure Export',
      'Advanced economic system data and analytics'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}