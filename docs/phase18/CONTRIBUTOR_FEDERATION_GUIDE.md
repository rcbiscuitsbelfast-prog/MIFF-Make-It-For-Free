# Contributor Federation Guide

## 🤝 Adding Federation Support to MIFF Modules

This guide helps contributors add federation hooks to existing MIFF modules, enabling multi-module orchestration and persistent scenario replay.

## 🔗 Federation Integration Steps

### 1. Add Federation Interface to Your Module

```typescript
// Add to your module's main file (e.g., YourModulePure.ts)
import { FederationEvent, FederationResponse, ModuleFederationHooks } from '../shared/federationTypes';

export interface YourModuleFederationHooks extends ModuleFederationHooks {
  onModuleSpecificEvent?: (event: YourModuleEvent) => void;
}

export const yourModuleFederationHooks: YourModuleFederationHooks = {
  onFederationEvent: (event: FederationEvent) => {
    switch (event.eventType) {
      case 'state_change':
        return handleStateChange(event);
      case 'request':
        return handleRequest(event);
      default:
        return { success: false, reason: 'Unhandled event type' };
    }
  },
  
  onFederationInit: (config) => {
    console.log(`Initializing ${config.moduleId} for federation`);
  },
  
  onFederationTeardown: () => {
    return {
      moduleId: 'YourModulePure',
      finalState: getCurrentState(),
      events: getEventHistory(),
      metadata: getModuleMetadata()
    };
  }
};
```

### 2. Update CLI Harness for Federation

```typescript
// Add to your module's cliHarness.ts
import { yourModuleFederationHooks } from './YourModulePure';

// Add federation command support
const federationCommands = {
  'federate': (args: string[]) => {
    const [targetModule, eventType, ...payload] = args;
    
    const event: FederationEvent = {
      id: `federation-${Date.now()}`,
      timestamp: Date.now(),
      sourceModule: 'YourModulePure',
      targetModule,
      eventType: eventType as any,
      payload: payload.join(' '),
      metadata: {
        sessionId: 'cli-session',
        frame: 0,
        priority: 1
      }
    };
    
    return yourModuleFederationHooks.onFederationEvent?.(event);
  }
};
```

### 3. Create Federation Test Cases

```typescript
// Add to your module's test file
describe('YourModulePure Federation', () => {
  test('should handle federation events', () => {
    const event: FederationEvent = {
      id: 'test-event',
      timestamp: Date.now(),
      sourceModule: 'TestModule',
      targetModule: 'YourModulePure',
      eventType: 'state_change',
      payload: { test: 'data' },
      metadata: {
        sessionId: 'test-session',
        frame: 1,
        priority: 1
      }
    };
    
    const response = yourModuleFederationHooks.onFederationEvent?.(event);
    expect(response?.success).toBe(true);
  });
  
  test('should export federation state', () => {
    const state = yourModuleFederationHooks.onFederationTeardown?.();
    expect(state).toHaveProperty('moduleId');
    expect(state).toHaveProperty('finalState');
  });
});
```

## 🎯 Federation Event Patterns

### 1. State Synchronization
```typescript
// Example: Inventory → Combat integration
const inventoryCombatHook = {
  name: 'inventory_combat_sync',
  source: 'InventoryPure',
  target: 'CombatPure',
  events: {
    'item_equipped': (event) => ({
      target: 'CombatPure',
      action: 'updateWeaponStats',
      data: event.payload.weaponStats
    }),
    'item_used': (event) => ({
      target: 'CombatPure', 
      action: 'applyItemEffect',
      data: event.payload.itemEffect
    })
  }
};
```

### 2. Event Cascading
```typescript
// Example: Quest → Dialogue → Audio chain
const questDialogueAudioChain = {
  name: 'quest_dialogue_audio_chain',
  participants: ['QuestSystemPure', 'DialoguePure', 'AudioPure'],
  cascade: {
    'quest_started': [
      {target: 'DialoguePure', action: 'enableQuestDialogue'},
      {target: 'AudioPure', action: 'playQuestMusic'}
    ],
    'dialogue_choice_made': [
      {target: 'QuestSystemPure', action: 'updateProgress'},
      {target: 'AudioPure', action: 'playChoiceSound'}
    ],
    'quest_completed': [
      {target: 'DialoguePure', action: 'showCompletionDialogue'},
      {target: 'AudioPure', action: 'playVictoryMusic'}
    ]
  }
};
```

### 3. Persistent Replay Integration
```typescript
// Example: Multi-module replay scenario
const persistentReplayScenario = {
  scenarioId: 'grove_complete_playthrough',
  description: 'Complete Witcher Grove experience with all systems',
  federationChain: [
    {
      module: 'DialoguePure',
      fixture: 'fixtures/grove-arrival-dialogue.json',
      duration: 15000,
      outputs: ['npc_relationship', 'quest_flags']
    },
    {
      module: 'QuestSystemPure',
      inputs: ['quest_flags'],
      fixture: 'fixtures/grove-quest-start.json', 
      duration: 5000,
      outputs: ['active_quests', 'inventory_rewards']
    },
    {
      module: 'InventoryPure',
      inputs: ['inventory_rewards'],
      fixture: 'fixtures/grove-item-management.json',
      duration: 8000,
      outputs: ['final_inventory']
    },
    {
      module: 'AudioPure',
      fixture: 'fixtures/grove-audio-sequence.json',
      duration: 28000, // Runs parallel with other modules
      parallel: true
    }
  ]
};
```

## 📚 Best Practices for Federation

### 1. Event Design
- **Specific**: Events should have clear, specific purposes
- **Lightweight**: Minimize payload size for performance
- **Versioned**: Include version info for backward compatibility
- **Documented**: Clear documentation for all event types

### 2. State Management
- **Immutable**: Don't modify shared state directly
- **Atomic**: State changes should be atomic and reversible
- **Traceable**: All state changes should be auditable
- **Deterministic**: Same inputs should produce same outputs

### 3. Error Handling
- **Graceful**: Handle missing modules gracefully
- **Recoverable**: Provide recovery mechanisms for failed events
- **Logged**: Log all federation errors for debugging
- **Isolated**: Module failures shouldn't cascade

### 4. Performance Considerations
- **Async**: Use async patterns for non-blocking federation
- **Batched**: Batch related events for efficiency
- **Cached**: Cache frequently accessed federation data
- **Monitored**: Track federation performance impact

## 🧪 Testing Your Federation Implementation

### 1. Unit Tests
```bash
# Test your module's federation hooks
npm test -- --testNamePattern="YourModulePure.*Federation"
```

### 2. Integration Tests
```bash
# Test with other modules
npm run test:federation -- --modules YourModulePure,DialoguePure
```

### 3. Orchestration Tests
```bash
# Test multi-module scenarios
npx ts-node cli/commands/federation.ts orchestrate --scenario test-scenario.json
```

### 4. Replay Validation
```bash
# Test deterministic replay
npx ts-node cli/commands/federation.ts replay --fixture federation-session.json --validate
```

## 📋 Federation Checklist

Before submitting your federation-enabled module:

- [ ] Federation interface implemented correctly
- [ ] CLI harness supports federation commands
- [ ] Unit tests cover all federation hooks
- [ ] Integration tests pass with other Phase 17 modules
- [ ] Deterministic replay works correctly
- [ ] Performance impact is minimal (< 5% overhead)
- [ ] Documentation is complete and clear
- [ ] Sample scenarios demonstrate federation capabilities

## 🎯 Common Federation Patterns

### Pattern 1: State Broadcasting
Use when multiple modules need to know about state changes:
```typescript
// Broadcast player level up to all interested modules
broadcastEvent({
  eventType: 'state_change',
  payload: { playerLevel: newLevel, experience: totalXP }
});
```

### Pattern 2: Request/Response
Use for module-to-module data requests:
```typescript
// Request inventory data from InventoryPure
const response = await sendRequest('InventoryPure', {
  action: 'getPlayerInventory',
  playerId: 'player-1'
});
```

### Pattern 3: Event Chaining
Use for sequential module operations:
```typescript
// Chain: Dialogue → Quest → Inventory
const chain = [
  { module: 'DialoguePure', action: 'completeConversation' },
  { module: 'QuestSystemPure', action: 'updateProgress' },
  { module: 'InventoryPure', action: 'addReward' }
];
```

## 🚀 Next Steps

1. Choose a module to add federation support to
2. Review existing Phase 17 federation implementations
3. Implement federation hooks following the patterns above
4. Test thoroughly with integration and orchestration tests
5. Submit PR with federation documentation
6. Celebrate contributing to Phase 18! 🎉