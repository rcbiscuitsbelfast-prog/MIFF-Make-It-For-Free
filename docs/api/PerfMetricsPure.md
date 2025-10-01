# PerfMetricsPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `PerfSample`
- `PerfSnapshot`
- `PerfMetrics`
- `PerfAlert`
- `PerfTrend`
- `PerfConfig`
- `PerfStats`
- `PerfMetricsPure`

## Classes

### PerfMetricsPure

PerfMetricsPure class

**Methods:**


**Properties:**
- `samples: PerfSample` - 
- `history: PerfSnapshot` - 
- `alerts: PerfAlert` - 
- `trends: PerfTrend` - 
- `config: PerfConfig` - 
- `startTime: number` - 
- `lastSnapshotTime: number` - 
- `config: Partial` - 


## Interfaces

### PerfSample

PerfSample interface

**Properties:**


### PerfSnapshot

PerfSnapshot interface

**Properties:**


### PerfMetrics

PerfMetrics interface

**Properties:**


### PerfAlert

PerfAlert interface

**Properties:**


### PerfTrend

PerfTrend interface

**Properties:**


### PerfConfig

PerfConfig interface

**Properties:**


### PerfStats

PerfStats interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `record`
- `snapshot`
- `getMetrics`
- `getStats`
- `export`
- `reset`
- `updateConfig`
- `demo`
- `help`

## Dependencies



## Usage Example

```typescript
import { PerfSample } from './miff/pure/PerfMetricsPure';

// Example usage
const instance = new PerfSample();
```
