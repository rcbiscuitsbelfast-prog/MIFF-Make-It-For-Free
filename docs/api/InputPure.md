# InputPure

**Version:** 1.0.0  
**Description:** InputPure - Input Management System A lightweight input management system for handling input actions, key bindings, and input profiles. Supports remappable inputs and category-based organization for modular gameplay systems. /

## Exports

- `IInputAction`
- `InputAction`
- `InputProfile`
- `InputMapper`
- `InputCategories`
- `InputTokens`
- `InputUtils`
- `defaultInputProfile`
- `defaultInputMapper`

## Classes

### InputProfile

Register an input action

**Methods:**
- `registerAction()` - registerAction method

**Properties:**
- `action: InputAction` - 

### InputMapper

InputMapper class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `_profile: InputProfile` - 


## Interfaces

### IInputAction

Unique identifier for the action

**Properties:**



## Enums



## Functions



## CLI Commands

- `help`
- `h`
- `actions`
- `list`
- `bindings`
- `binds`
- `rebind`
- `bind`
- `test`
- `t`
- `add`
- `remove`
- `rem`
- `category`
- `cat`
- `load`
- `preset`
- `standard`
- `movement`
- `combat`
- `ui`
- `debug`
- `clear`
- `demo`
- `quit`
- `exit`
- `q`

## Dependencies



## Usage Example

```typescript
import { IInputAction } from './miff/pure/InputPure';

// Example usage
const instance = new IInputAction();
```
