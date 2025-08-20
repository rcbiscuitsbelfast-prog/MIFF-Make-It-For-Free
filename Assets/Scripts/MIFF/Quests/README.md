# MIFF Quest System & Echoes of the Alley

A fully data-driven quest system that integrates with the evolution framework, featuring the "Echoes of the Alley" first evolution tutorial quest. Designed to be non-coder friendly and fully customizable through ScriptableObjects.

## 🎯 **System Overview**

The quest system provides:
- **Multiple Trigger Types**: Battle sync, quest flags, item collection, battle victory, spirit level
- **Evolution Integration**: Direct connection to EvolutionManager for quest-based evolution
- **Flexible Rewards**: Evolution, items, experience, and sync points
- **Onboarding Flags**: Automatic flag management for quest progression
- **Non-Coder Friendly**: All quest content editable via ScriptableObjects

## 📁 **File Structure**

```
Assets/Scripts/MIFF/Quests/
├── QuestObjective_SO.cs           # Base quest ScriptableObject
├── QuestManager.cs                 # Quest management and triggering
├── QuestContext.cs                 # Context for quest checking
├── EchoesOfTheAlley_Evolution.cs  # First evolution quest asset
└── README.md                       # This documentation
```

```
Assets/Scripts/MIFF/Items/ItemEffects/
└── MoonlightAmuletEffect.cs       # Evolution-triggering item effect
```

## 🔧 **Core Components**

### **QuestObjective_SO**
- **ScriptableObject** defining quest objectives, triggers, and rewards
- **Multiple Trigger Types**: BattleSync, QuestFlag, ItemCollected, BattleWon, SpiritLevel
- **Flexible Requirements**: All triggers or any trigger completion
- **Rich Rewards**: Evolution, items, experience, and sync points
- **Onboarding Integration**: Automatic flag management

### **QuestManager**
- **Singleton** that manages all quest logic and progression
- **Automatic Checking**: Periodic quest requirement validation
- **Event System**: Raises events for quest start, completion, and failure
- **Database Management**: Maintains quest lookup tables

### **QuestContext**
- **Context Information**: Battle stats, player progress, item collection
- **Factory Methods**: Easy context creation for different trigger types
- **Progress Tracking**: Session statistics and completion metrics

### **EchoesOfTheAlley_Evolution**
- **First Evolution Quest**: Introduces players to the evolution system
- **Dual Trigger Paths**: Battle sync OR quest flag completion
- **Evolution Reward**: Grants evolution to starter spirit
- **Item Reward**: Moonlight Amulet for future evolution triggers

## 🎮 **Quest Trigger Types**

### **1. Battle Sync**
```csharp
// Trigger when battle sync reaches threshold
var trigger = new QuestTrigger
{
    triggerType = QuestTriggerType.BattleSync,
    battleSyncThreshold = 75.0f
};
```

### **2. Quest Flag**
```csharp
// Trigger when specific quest flag is set
var trigger = new QuestTrigger
{
    triggerType = QuestTriggerType.QuestFlag,
    questFlagID = "WonDanceBattle_Stage1"
};
```

### **3. Item Collection**
```csharp
// Trigger when specific item is collected
var trigger = new QuestTrigger
{
    triggerType = QuestTriggerType.ItemCollected,
    itemID = "evolution_stone"
};
```

### **4. Battle Victory**
```csharp
// Trigger when specific battle is won
var trigger = new QuestTrigger
{
    triggerType = QuestTriggerType.BattleWon,
    battleID = "gym_leader_battle"
};
```

### **5. Spirit Level**
```csharp
// Trigger when spirit reaches level threshold
var trigger = new QuestTrigger
{
    triggerType = QuestTriggerType.SpiritLevel,
    spiritLevelThreshold = 20
};
```

## 🎁 **Quest Reward Types**

### **1. Evolution**
```csharp
// Grant evolution to specific spirit
var reward = new QuestReward
{
    rewardType = QuestRewardType.Evolution,
    evolutionTargetSpeciesID = "starter_spirit_evolved"
};
```

### **2. Item**
```csharp
// Grant item to inventory
var reward = new QuestReward
{
    rewardType = QuestRewardType.Item,
    itemID = "moonlight_amulet",
    itemAmount = 1
};
```

### **3. Experience**
```csharp
// Grant experience points
var reward = new QuestReward
{
    rewardType = QuestRewardType.Experience,
    experienceAmount = 500
};
```

### **4. Sync Points**
```csharp
// Grant sync points
var reward = new QuestReward
{
    rewardType = QuestRewardType.SyncPoints,
    syncPointsAmount = 50.0f
};
```

## 🌙 **Echoes of the Alley Quest**

### **Quest Overview**
- **Name**: Echoes of the Alley
- **Category**: Tutorial
- **Priority**: 1 (Highest)
- **Objective**: Introduce evolution system through battle or dance challenge

### **Trigger Requirements**
- **Path 1**: Reach 75% battle sync in any battle
- **Path 2**: Complete the "WonDanceBattle_Stage1" quest flag
- **Logic**: Either requirement completes the quest (OR condition)

### **Rewards**
1. **Evolution**: Starter spirit evolves to next form
2. **Moonlight Amulet**: Special item for future evolution triggers
3. **Flags**: Sets "FirstEvolutionSeen" and "EchoesOfTheAlley_Completed"

### **Quest Lore**
> "Moonlight Alley is said to be a place where spirits gather under the pale light of the moon. Those who prove their worth through battle or dance may unlock the secrets of evolution hidden within its ancient walls."

## 🔄 **Integration Points**

### **With Evolution System**
```csharp
// Quest reward automatically triggers evolution
var evolutionReward = new QuestReward
{
    rewardType = QuestRewardType.Evolution,
    evolutionTargetSpeciesID = "starter_spirit_evolved"
};

// EvolutionManager.GrantEvolutionFromQuest() is called automatically
```

### **With Inventory System**
```csharp
// Quest reward automatically adds items
var itemReward = new QuestReward
{
    rewardType = QuestRewardType.Item,
    itemID = "moonlight_amulet",
    itemAmount = 1
};

// InventoryManager.AddItem() is called automatically
```

### **With Battle System**
```csharp
// QuestManager checks battle results
QuestManager.Instance.CheckQuestBattleSync(battleID, sync, won);
QuestManager.Instance.CheckQuestBattleVictory(battleID, turns, duration);
```

### **With Onboarding System**
```csharp
// Quest completion automatically sets flags
flagsToSet.Add("FirstEvolutionSeen");
flagsToSet.Add("EchoesOfTheAlley_Completed");
```

## 🎨 **Moonlight Amulet Integration**

### **Item Effect**
- **Evolution Trigger**: Can trigger evolution for compatible spirits
- **Target Spirit**: Configurable target spirit ID
- **Flag Setting**: Automatically sets "FirstEvolutionSeen" flag
- **Integration**: Works with EvolutionManager.GrantEvolutionFromQuest()

### **Usage**
```csharp
// Moonlight Amulet automatically triggers evolution
var amuletEffect = new MoonlightAmuletEffect();
amuletEffect.Apply(playerContext, targetContext);

// This calls EvolutionManager.GrantEvolutionFromQuest()
```

## 🚀 **Quick Start**

### **1. Create Quest Asset**
1. Right-click in Project → Create → MIFF → Quests → QuestObjective
2. Set quest ID, title, and description
3. Add triggers and set requirements
4. Add rewards and set parameters
5. Configure onboarding flags

### **2. Setup Quest Manager**
1. Add `QuestManager` to a GameObject in your scene
2. Assign quest assets to the database
3. Configure auto-checking settings
4. Connect to your existing systems

### **3. Test Quest System**
1. Use "Start Test Quest" context menu
2. Use "Force Quest Check" context menu
3. Verify quest progression and completion
4. Check reward distribution

## 🧪 **Testing & Debugging**

### **Context Menu Commands**
- **Validate Quest Database**: Check for configuration issues
- **Force Quest Check**: Trigger quest validation for all active quests
- **Start Test Quest**: Begin the first quest in the database

### **Test Scenarios**
1. **Battle Sync Quest**: Fight battles until sync threshold reached
2. **Quest Flag Quest**: Complete prerequisite quests
3. **Item Collection Quest**: Collect required items
4. **Battle Victory Quest**: Win specific battles
5. **Spirit Level Quest**: Level up spirits to threshold

### **Debug Information**
- Console logs for all quest events
- Database validation warnings
- Trigger condition checking
- Reward distribution logging

## 🔗 **System Integration**

### **Event System**
```csharp
// Subscribe to quest events
QuestManager.Instance.onQuestStarted.AddListener((quest) => {
    Debug.Log($"Quest started: {quest.QuestTitle}");
});

QuestManager.Instance.onQuestCompleted.AddListener((quest) => {
    Debug.Log($"Quest completed: {quest.QuestTitle}");
});
```

### **Save System**
- Quest state is part of OnboardingFlag system
- Ready for GameData integration
- Persists across game sessions

### **UI Updates**
- Automatic UI refresh after quest completion
- Progress indicators for quest requirements
- Reward notification systems

## 📋 **Contributor Workflow**

### **For Content Creators**
1. **Create Quest Assets**: Use QuestObjective_SO ScriptableObjects
2. **Set Triggers**: Configure completion requirements
3. **Define Rewards**: Set evolution, item, and experience rewards
4. **Write Lore**: Add narrative text and descriptions

### **For Designers**
1. **Plan Quest Flow**: Design progression and dependencies
2. **Balance Requirements**: Set appropriate thresholds and conditions
3. **Create Quest Chains**: Design multi-quest storylines
4. **Plan Rewards**: Balance evolution and progression rewards

### **For Writers**
1. **Quest Narratives**: Write compelling quest descriptions
2. **Lore Integration**: Connect quests to world building
3. **Character Development**: Develop NPCs and storylines
4. **Quest Hints**: Provide helpful guidance for players

### **For Artists**
1. **Quest Icons**: Design visual representations
2. **Reward Graphics**: Create item and evolution visuals
3. **UI Elements**: Design quest interface components
4. **Visual Feedback**: Create completion animations

## 🐛 **Troubleshooting**

### **Common Issues**
- **Quest not starting**: Check prerequisites and trigger conditions
- **Rewards not granted**: Verify reward configuration and systems
- **Flags not setting**: Check OnboardingFlagManager integration
- **Evolution not triggering**: Verify EvolutionManager connection

### **Debug Steps**
1. Use "Validate Quest Database" context menu
2. Check Console for quest-related messages
3. Verify trigger conditions are met
4. Test with "Force Quest Check"

### **Performance Considerations**
- Quest checks only when relevant events occur
- Database lookups are optimized with dictionaries
- Minimal impact on gameplay performance
- Efficient flag checking and setting

## 🔮 **Future Enhancements**

### **Planned Features**
- **Quest Chains**: Multi-stage quest sequences
- **Branching Quests**: Multiple completion paths
- **Dynamic Quests**: Procedurally generated objectives
- **Quest Sharing**: Multiplayer quest collaboration

### **Extension Points**
- **Custom Triggers**: Add new quest trigger types
- **Advanced Rewards**: Complex reward combinations
- **Quest Effects**: Custom completion effects
- **Integration Hooks**: Connect with additional game systems

## 📚 **API Reference**

### **QuestManager**
```csharp
// Start quest
QuestManager.Instance.StartQuest(questID);

// Check quest status
bool isActive = QuestManager.Instance.IsQuestActive(questID);
bool isCompleted = QuestManager.Instance.IsQuestCompleted(questID);

// Trigger quest checks
QuestManager.Instance.CheckQuestBattleSync(battleID, sync, won);
QuestManager.Instance.CheckQuestItemCollection(itemID);
```

### **QuestObjective_SO**
```csharp
// Check requirements
bool canComplete = quest.CheckRequirements(context);

// Grant rewards
quest.GrantRewards(context);

// Get quest info
string description = quest.GetQuestDescription();
string requirements = quest.GetQuestRequirementsDescription();
```

### **QuestContext**
```csharp
// Create context for different trigger types
var context = QuestContext.CreateBattleSyncContext(questID, sync, won, battleID);
var context = QuestContext.CreateItemCollectionContext(questID, itemID);
var context = QuestContext.CreateBattleVictoryContext(questID, battleID, turns, duration);
```

---

**MIFF Framework** - Modular, remix-safe, contributor-friendly game development