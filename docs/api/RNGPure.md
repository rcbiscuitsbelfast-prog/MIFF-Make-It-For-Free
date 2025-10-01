# RNGPure

**Version:** 1.0.0  
**Description:** RNGPure - Deterministic, seedable random number generation This module provides deterministic, seedable random number generation for modular gameplay systems. Pure TypeScript implementation with no external dependencies. /

## Exports

- `IRNGProvider`
- `RNGProvider`
- `createRNGProvider`
- `defaultRNG`
- `RNGUtils`

## Classes



## Interfaces

### IRNGProvider

Returns the next integer in [min, max) using deterministic sequence.

**Properties:**



## Enums



## Functions

### createRNGProvider

createRNGProvider function

**Parameters:**   
**Returns:** any


## CLI Commands

No CLI commands available

## Dependencies



## Usage Example

```typescript
import { IRNGProvider } from './miff/pure/RNGPure';

// Example usage
const instance = new IRNGProvider();
```
