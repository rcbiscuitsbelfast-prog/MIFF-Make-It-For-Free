# PerfPure

**Version:** 1.0.0  
**Description:** PerfPure - Performance Monitoring System A lightweight performance monitoring system for measuring execution time, profiling code sections, and analyzing performance bottlenecks in modular gameplay systems. /

## Exports

- `PerfResult`
- `PerfTimer`
- `HighResPerfTimer`
- `PerfProfiler`
- `PerfSummary`
- `PerfUtils`
- `defaultProfiler`
- `measure`

## Classes

### HighResPerfTimer

HighResPerfTimer class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `_markName: string` - 
- `label: string` - 

### PerfProfiler

Enable or disable profiling

**Methods:**
- `enabled()` - enabled method

**Properties:**
- `_results: PerfResult` - 
- `value: boolean` - 


## Interfaces

### PerfResult

Label/identifier for the measurement

**Properties:**


### PerfSummary

PerfSummary interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `help`
- `h`
- `timer`
- `time`
- `benchmark`
- `bench`
- `profile`
- `start`
- `stop`
- `end`
- `results`
- `list`
- `summary`
- `stats`
- `clear`
- `demo`
- `test`
- `quit`
- `exit`
- `q`

## Dependencies



## Usage Example

```typescript
import { PerfResult } from './miff/pure/PerfPure';

// Example usage
const instance = new PerfResult();
```
