# EventsPure

**Version:** 1.0.0  
**Description:** EventsPure - Event bus system for modular gameplay A lightweight event bus providing publish/subscribe functionality with string topic routing and disposable subscriptions. /

## Exports

- `IEventListener`
- `IAsyncEventListener`
- `EventBus`
- `EventListener`
- `AsyncEventListener`
- `createEventBus`
- `defaultEventBus`
- `EventUtils`

## Classes

### EventBus

Publish an event to all subscribers of the topic (synchronous)

**Methods:**
- `publish()` - publish method
- `if()` - if method
- `for()` - for method
- `if()` - if method

**Properties:**
- `topic: string` - 


## Interfaces



## Enums



## Functions

### createEventBus

createEventBus function

**Parameters:**   
**Returns:** any


## CLI Commands

- `help`
- `h`
- `publish`
- `pub`
- `subscribe`
- `sub`
- `unsubscribe`
- `unsub`
- `list`
- `ls`
- `stats`
- `clear`
- `demo`
- `quit`
- `exit`
- `q`

## Dependencies



## Usage Example

```typescript
import { IEventListener } from './miff/pure/EventsPure';

// Example usage
const instance = new IEventListener();
```
