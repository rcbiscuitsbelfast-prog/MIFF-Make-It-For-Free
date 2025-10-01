# EconomyPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `CurrencyType`
- `MarketType`
- `TransactionType`
- `EconomicEventType`
- `Currency`
- `EconomicEntity`
- `InventoryItem`
- `PaymentRecord`
- `Market`
- `MarketRestriction`
- `MarketListing`
- `Bid`
- `MarketStatistics`
- `PricePoint`
- `VolumePoint`
- `EconomicEvent`
- `EconomicEffect`
- `Transaction`
- `TaxPolicy`
- `TaxBracket`
- `EconomicReport`
- `MarketReport`
- `CurrencyReport`
- `EntityReport`
- `Trend`
- `EconomicSimulation`
- `SimulationStatistics`
- `SupplyDemandCurve`
- `EconomicForecast`
- `Prediction`
- `EconomicEngine`
- `EconomicPerformanceMetrics`
- `ValidationResult`

## Classes

### EconomicEngine

EconomicEngine class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `entities: Map` - 
- `markets: Map` - 
- `currencies: Map` - 
- `transactions: Map` - 
- `taxPolicies: Map` - 
- `economicEvents: Map` - 
- `simulations: Map` - 
- `supplyDemandCurves: Map` - 
- `performanceMetrics: EconomicPerformanceMetrics` - 
- `eventQueue: EconomicEvent` - 


## Interfaces

### Currency

Currency interface

**Properties:**


### EconomicEntity

EconomicEntity interface

**Properties:**


### InventoryItem

InventoryItem interface

**Properties:**


### PaymentRecord

PaymentRecord interface

**Properties:**


### Market

Market interface

**Properties:**


### MarketRestriction

MarketRestriction interface

**Properties:**


### MarketListing

MarketListing interface

**Properties:**


### Bid

Bid interface

**Properties:**


### MarketStatistics

MarketStatistics interface

**Properties:**


### PricePoint

PricePoint interface

**Properties:**


### VolumePoint

VolumePoint interface

**Properties:**


### EconomicEvent

EconomicEvent interface

**Properties:**


### EconomicEffect

EconomicEffect interface

**Properties:**


### Transaction

Transaction interface

**Properties:**


### TaxPolicy

TaxPolicy interface

**Properties:**


### TaxBracket

TaxBracket interface

**Properties:**


### EconomicReport

EconomicReport interface

**Properties:**


### MarketReport

MarketReport interface

**Properties:**


### CurrencyReport

CurrencyReport interface

**Properties:**


### EntityReport

EntityReport interface

**Properties:**


### Trend

Trend interface

**Properties:**


### EconomicSimulation

EconomicSimulation interface

**Properties:**


### SimulationStatistics

SimulationStatistics interface

**Properties:**


### SupplyDemandCurve

SupplyDemandCurve interface

**Properties:**


### EconomicForecast

EconomicForecast interface

**Properties:**


### Prediction

Prediction interface

**Properties:**


### EconomicPerformanceMetrics

EconomicPerformanceMetrics interface

**Properties:**


### ValidationResult

ValidationResult interface

**Properties:**



## Enums

### CurrencyType

CurrencyType enum

**Values:**
- `GOLD = 'gold'`
- `SILVER = 'silver'`
- `COPPER = 'copper'`
- `CRYSTALS = 'crystals'`
- `TOKENS = 'tokens'`
- `GEMS = 'gems'`
- `REPUTATION = 'reputation'`
- `EXPERIENCE = 'experience'`
- `ENERGY = 'energy'`
- `CUSTOM = 'custom'`

### MarketType

MarketType enum

**Values:**
- `BLACK_MARKET = 'black_market'`
- `AUCTION_HOUSE = 'auction_house'`
- `PLAYER_MARKET = 'player_market'`
- `NPC_SHOP = 'npc_shop'`
- `GUILD_MARKET = 'guild_market'`
- `GLOBAL_MARKET = 'global_market'`

### TransactionType

TransactionType enum

**Values:**
- `BUY = 'buy'`
- `SELL = 'sell'`
- `TRADE = 'trade'`
- `AUCTION = 'auction'`
- `GIFT = 'gift'`
- `REWARD = 'reward'`
- `TAX = 'tax'`
- `FEE = 'fee'`

### EconomicEventType

EconomicEventType enum

**Values:**
- `MARKET_CRASH = 'market_crash'`
- `BOOM = 'boom'`
- `INFLATION = 'inflation'`
- `DEFLATION = 'deflation'`
- `SHORTAGE = 'shortage'`
- `SURPLUS = 'surplus'`
- `WAR = 'war'`
- `PEACE = 'peace'`
- `FESTIVAL = 'festival'`
- `DISASTER = 'disaster'`


## Functions



## CLI Commands

- `create-rule`
- `create-vendor`
- `create-event`
- `calculate-price`
- `execute-trade`
- `get-market-data`
- `export`
- `create-rule`
- `create-vendor`
- `create-currency`
- `create-event`
- `calculate-price`
- `execute-trade`
- `get-market-data`
- `get-stats`
- `list-rules`
- `list-vendors`
- `list-currencies`
- `export`
- `reset`
- `demo`
- `dump`
- `create-rule`
- `create-vendor`
- `create-currency`
- `create-event`
- `calculate-price`
- `execute-trade`
- `get-market-data`
- `get-stats`
- `list-rules`
- `list-vendors`
- `list-currencies`
- `export`
- `reset`
- `demo`
- `dump`

## Dependencies



## Usage Example

```typescript
import { CurrencyType } from './miff/pure/EconomyPure';

// Example usage
const instance = new CurrencyType();
```
