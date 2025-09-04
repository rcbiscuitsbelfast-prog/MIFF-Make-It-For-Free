# DialoguePure Onboarding Pack

## 📖 Module Overview
DialoguePure provides a branching dialogue engine with support for variables, flags, conditional logic, and multi-character conversations. Built for engine-agnostic integration with MIFF scenarios.

## 🚀 CLI Usage

### Basic Commands
```bash
# Validate dialogue tree structure
npx ts-node cli/commands/dialogue.ts validate --file dialogue-tree.json

# Test dialogue flow
npx ts-node cli/commands/dialogue.ts test --tree '{"id":"test","nodes":[...]}'

# Run interactive dialogue session
npx ts-node cli/commands/dialogue.ts run --file sample-dialogue.json
```

### Orchestration Commands
```bash
# Initialize dialogue engine
npx ts-node cli/commands/dialogue.ts init --config dialogue-config.json

# Teardown dialogue session
npx ts-node cli/commands/dialogue.ts teardown --save-conversation

# Replay dialogue sequence
npx ts-node cli/commands/dialogue.ts replay --fixture fixtures/dialogue-session.json

# Export dialogue results
npx ts-node cli/commands/dialogue.ts export --format json --output conversation.json
```

## 📁 Sample Fixtures

### Basic Dialogue Tree
```json
{
  "id": "sample-conversation",
  "name": "Tutorial Dialogue",
  "version": "1.0.0",
  "variables": {
    "player_name": "Hero",
    "reputation": 0
  },
  "flags": {
    "met_npc": false,
    "quest_started": false
  },
  "nodes": [
    {
      "id": "start",
      "type": "dialogue",
      "speaker": "NPC",
      "text": "Welcome to the grove, {player_name}!",
      "conditions": [],
      "actions": [
        {"type": "set_flag", "flag": "met_npc", "value": true}
      ],
      "next": ["choice1", "choice2"]
    },
    {
      "id": "choice1",
      "type": "choice",
      "text": "Tell me about this place.",
      "conditions": [],
      "actions": [],
      "next": "info_response"
    },
    {
      "id": "choice2", 
      "type": "choice",
      "text": "I'm looking for adventure.",
      "conditions": [],
      "actions": [
        {"type": "set_flag", "flag": "quest_started", "value": true}
      ],
      "next": "quest_response"
    },
    {
      "id": "info_response",
      "type": "dialogue",
      "speaker": "NPC",
      "text": "This is the Witcher Grove, a place of ancient magic.",
      "conditions": [],
      "actions": [],
      "next": "end"
    },
    {
      "id": "quest_response",
      "type": "dialogue", 
      "speaker": "NPC",
      "text": "Excellent! I have just the quest for you.",
      "conditions": [],
      "actions": [
        {"type": "set_variable", "variable": "reputation", "value": 10}
      ],
      "next": "end"
    },
    {
      "id": "end",
      "type": "end",
      "speaker": "",
      "text": "",
      "conditions": [],
      "actions": [],
      "next": null
    }
  ]
}
```

### Dialogue Configuration
```json
{
  "autoAdvance": false,
  "typewriterSpeed": 50,
  "enableVariables": true,
  "enableFlags": true,
  "maxHistoryLength": 100,
  "validateConnections": true
}
```

## 🧪 Golden Test Walkthrough

```bash
# Run DialoguePure golden tests
npm test -- --testNamePattern="DialoguePure"

# Test dialogue tree validation
npx ts-node cli/commands/dialogue.ts validate --file miff/pure/DialoguePure/fixtures/sample-tree.json

# Run interactive test session
npx ts-node cli/commands/dialogue.ts run --file miff/pure/DialoguePure/fixtures/tutorial.json
```

## 🔄 Replay/Export Examples

### Replay Dialogue Session
```bash
# Record dialogue session
npx ts-node cli/commands/dialogue.ts replay --record --output dialogue-session.json

# Replay recorded session deterministically
npx ts-node cli/commands/dialogue.ts replay --fixture dialogue-session.json --quiet

# Export conversation history
npx ts-node cli/commands/dialogue.ts export --format transcript --output conversation.txt
```

### Export Formats
- **JSON**: Complete dialogue state and history
- **Transcript**: Human-readable conversation log
- **Variables**: Final variable and flag states
- **Metrics**: Performance and flow analytics

## 🎯 Deterministic Globals

DialoguePure ensures deterministic behavior through:
- Consistent variable evaluation order
- Deterministic choice selection in automated tests
- Reproducible random seed handling for dynamic content
- Fixed timing for typewriter effects in replay mode

## 🔗 Orchestration Patterns

### Dialogue Lifecycle
1. **Initialization** - Load tree and set initial state
2. **Conversation** - Process player choices and NPC responses
3. **Branching** - Handle conditional logic and variable updates
4. **Completion** - Save final state and conversation history
5. **Teardown** - Clean up resources and export results

### Integration Points
- Quest system integration via QuestSystemPure
- Character data from NPCsPure
- Audio cues through AudioPure
- Visual presentation via VisualReplaySystemPure
- Save/load integration with SaveLoadPure

## 📋 Quick Validation Checklist
- [ ] Dialogue tree has valid start and end nodes
- [ ] All node connections are valid
- [ ] Variables and flags are properly defined
- [ ] Conditional logic is syntactically correct
- [ ] Speaker names are consistent
- [ ] Text content is appropriate and localized