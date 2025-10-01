# SocialDeductionPure

**Version:** 1.0.0  
**Description:** SocialDeductionPure - AAA Quality Social Deduction System Advanced social gameplay mechanics with: - Role assignment and hidden identities - Voting phases and discussion rounds - Ability-driven interactions - Mobile-optimized social controls /

## Exports

- `GameRole`
- `GamePhase`
- `VoteType`
- `GamePlayer`
- `GameVote`
- `DiscussionRound`
- `GameMessage`
- `VotingResults`
- `AbilityEffect`
- `SocialDeductionPure`

## Classes

### SocialDeductionPure

SocialDeductionPure class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `eventBus: EventBus` - 
- `players: Map` - 
- `currentPhase: GamePhase` - 
- `discussionRounds: DiscussionRound` - 
- `votes: GameVote` - 
- `traitorCount: number` - 
- `detectiveCount: number` - 
- `maxPlayers: number` - 
- `minPlayers: number` - 
- `eventBus: EventBus` - 


## Interfaces

### GamePlayer

GamePlayer interface

**Properties:**


### GameVote

GameVote interface

**Properties:**


### DiscussionRound

DiscussionRound interface

**Properties:**


### GameMessage

GameMessage interface

**Properties:**


### VotingResults

VotingResults interface

**Properties:**


### AbilityEffect

AbilityEffect interface

**Properties:**



## Enums



## Functions



## CLI Commands

No CLI commands available

## Dependencies

- `EventBusPure/EventBusPure`

## Usage Example

```typescript
import { GameRole } from './miff/pure/SocialDeductionPure';

// Example usage
const instance = new GameRole();
```
