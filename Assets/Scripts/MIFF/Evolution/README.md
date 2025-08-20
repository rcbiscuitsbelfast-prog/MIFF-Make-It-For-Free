# MIFF Spirit Evolution System

A modular evolution system that supports multiple triggers including sync thresholds, quest flags, item usage, and special battle conditions. Integrates seamlessly with the existing MIFF framework.

## 🎯 **System Overview**

The evolution system provides:
- **Multiple Trigger Types**: Sync, quest, item, and battle-based evolution
- **Modular Design**: Easy to extend with new trigger types
- **Visual Cutscenes**: Engaging evolution animations with lore text
- **Integration Ready**: Connects with InventoryManager, QuestManager, and BattleController
- **Contributor-Friendly**: Non-coders can create evolution entries via ScriptableObjects

## 📁 **File Structure**

```
Assets/Scripts/MIFF/Evolution/
├── SpiritEvolution_SO.cs      # Evolution data and requirements
├── EvolutionManager.cs         # Core evolution logic and triggers
├── EvolutionContext.cs         # Context for evolution checks
└── README.md                   # This documentation
```

```
Assets/Scripts/MIFF/Spirits/
├── SpiritInstance.cs           # Individual spirit with evolution support
└── SpiritSpecies.cs            # Base species data and stats
```

```
Assets/Scripts/MIFF/UI/
└── EvolutionCutsceneUI.cs      # Evolution cutscene display
```

## 🔧 **Core Components**

### **SpiritEvolution_SO**
- **ScriptableObject** defining evolution requirements and triggers
- **Multiple Trigger Types**: SyncThreshold, QuestFlag, ItemUse, BattleCondition
- **Rich Metadata**: Lore text, audio, visual effects, and duration
- **Validation**: Automatic requirement validation in editor

### **EvolutionManager**
- **Singleton** that manages all evolution logic
- **Automatic Triggering**: Checks evolution conditions at appropriate times
- **Event System**: Raises events for evolution completion
- **Database Management**: Maintains evolution lookup tables

### **SpiritInstance**
- **Runtime Spirit Data**: Stats, sync, level, and evolution stage
- **Evolution Support**: Methods for evolving and updating stages
- **Stat Management**: HP, attack, defense, speed, and special stats
- **Move System**: Learning, equipping, and managing moves

### **SpiritSpecies**
- **Base Species Data**: Stats, types, weaknesses, and resistances
- **Growth Information**: Experience curves and sync growth rates
- **Move Learning**: Level-based move acquisition
- **Type System**: 18 different spirit types with effectiveness

## 🎮 **Evolution Triggers**

### **1. Sync Threshold**
```csharp
// Evolve when spirit reaches 50% sync
var evolution = ScriptableObject.CreateInstance<SpiritEvolution_SO>();
evolution.triggerType = EvolutionTrigger.SyncThreshold;
evolution.requiredSync = 50.0f;
```

### **2. Quest Flag**
```csharp
// Evolve when quest "defeat_gym_leader" is completed
evolution.triggerType = EvolutionTrigger.QuestFlag;
evolution.requiredFlag = "defeat_gym_leader";
```

### **3. Item Use**
```csharp
// Evolve when "evolution_stone" item is used
evolution.triggerType = EvolutionTrigger.ItemUse;
evolution.requiredItemID = "evolution_stone";
```

### **4. Battle Condition**
```csharp
// Evolve when winning without taking damage
evolution.triggerType = EvolutionTrigger.BattleCondition;
evolution.battleConditionID = "win_without_damage";
```

## 🔄 **Integration Points**

### **With Inventory System**
```csharp
// In BagUIController after item use
if (item.ItemID == "evolution_stone")
{
    EvolutionManager.Instance.CheckEvolutionAfterItemUse(item.ItemID);
}
```

### **With Battle System**
```csharp
// In BattleController after battle ends
var conditionID = DetermineBattleCondition(won, noDamage, turns, duration);
EvolutionManager.Instance.CheckEvolutionAfterBattle(conditionID, won, noDamage, turns, duration);
```

### **With Quest System**
```csharp
// In QuestManager after quest completion
EvolutionManager.Instance.CheckEvolutionAfterQuest(completedQuestID);
```

### **With Sync System**
```csharp
// After gaining sync points
spirit.GainSync(syncAmount);
EvolutionManager.Instance.CheckEvolutionAfterSync(spirit);
```

## 🎨 **Evolution Cutscenes**

### **Visual Features**
- **Morph Animation**: Smooth transition between before/after sprites
- **Particle Effects**: Configurable particle systems
- **Glow Effects**: Dynamic color changes during evolution
- **Audio Integration**: SFX and music support

### **Customization**
- **Duration Control**: Adjustable animation timing
- **Curve Editing**: Custom animation curves for morphing
- **Color Themes**: Evolution-specific color schemes
- **Lore Text**: Rich narrative descriptions

## 🚀 **Quick Start**

### **1. Create Evolution Entry**
1. Right-click in Project → Create → MIFF → Spirits → SpiritEvolution
2. Set base and evolved spirit IDs
3. Choose trigger type and set requirements
4. Add lore text and visual effects
5. Assign to EvolutionManager database

### **2. Setup Evolution Manager**
1. Add `EvolutionManager` to a GameObject in your scene
2. Assign evolution entries to the database
3. Configure settings (enable evolution, show cutscenes)
4. Connect to your existing systems

### **3. Setup Cutscene UI**
1. Create UI panel with before/after sprites
2. Add `EvolutionCutsceneUI` component
3. Assign UI references and audio sources
4. Customize animation parameters

### **4. Test Evolution**
1. Use context menu "Force Evolution Check"
2. Create test spirits and trigger conditions
3. Verify cutscene plays correctly
4. Check that evolution persists

## 🧪 **Testing & Debugging**

### **Context Menu Commands**
- **Validate Evolution Database**: Check for configuration issues
- **Force Evolution Check**: Trigger evolution for all spirits
- **Force Show Evolution**: Test cutscene display
- **Force Hide Evolution**: Test cutscene hiding

### **Test Scenarios**
1. **Sync Evolution**: Gain sync until threshold reached
2. **Quest Evolution**: Complete required quest
3. **Item Evolution**: Use evolution item
4. **Battle Evolution**: Meet battle conditions

### **Debug Information**
- Console logs for all evolution events
- Database validation warnings
- Trigger condition checking
- Cutscene state monitoring

## 🔗 **System Integration**

### **Event System**
```csharp
// Subscribe to evolution events
EvolutionManager.Instance.onSpiritEvolved.AddListener((spirit, evolution) => {
    Debug.Log($"{spirit.Nickname} evolved!");
    // Update UI, save data, etc.
});
```

### **Save System**
- Evolution state is part of SpiritInstance data
- Ready for GameData integration
- Persists across game sessions

### **UI Updates**
- Automatic UI refresh after evolution
- Cutscene integration with pause systems
- Progress indicators for evolution requirements

## 📋 **Contributor Workflow**

### **For Content Creators**
1. **Create Evolution Assets**: Use SpiritEvolution_SO ScriptableObjects
2. **Set Requirements**: Configure trigger conditions and thresholds
3. **Write Lore**: Add narrative text for evolution cutscenes
4. **Assign References**: Link to evolved SpiritSpecies

### **For Designers**
1. **Plan Evolution Paths**: Design progression trees
2. **Balance Requirements**: Set appropriate sync thresholds
3. **Create Quests**: Design evolution-triggering quests
4. **Plan Battle Conditions**: Design special evolution challenges

### **For Writers**
1. **Evolution Lore**: Write compelling evolution descriptions
2. **Quest Integration**: Create evolution-triggering narratives
3. **Character Development**: Develop spirit personalities through evolution

### **For Artists**
1. **Sprite Creation**: Design before/after evolution sprites
2. **Particle Effects**: Create evolution visual effects
3. **UI Design**: Design evolution cutscene layouts
4. **Audio Design**: Create evolution sound effects

## 🐛 **Troubleshooting**

### **Common Issues**
- **Evolution not triggering**: Check requirements and trigger conditions
- **Cutscene not showing**: Verify UI references and component setup
- **Stats not updating**: Check evolution bonus application
- **Database errors**: Validate evolution entries

### **Debug Steps**
1. Use "Validate Evolution Database" context menu
2. Check Console for evolution-related messages
3. Verify trigger conditions are met
4. Test with "Force Evolution Check"

### **Performance Considerations**
- Evolution checks only when relevant events occur
- Cutscene animations use efficient coroutines
- Database lookups are optimized with dictionaries
- Minimal impact on gameplay performance

## 🔮 **Future Enhancements**

### **Planned Features**
- **Evolution Chains**: Multi-stage evolution sequences
- **Branching Evolution**: Multiple evolution paths based on conditions
- **Mega Evolution**: Special temporary evolution states
- **Evolution Items**: Special items that modify evolution

### **Extension Points**
- **Custom Triggers**: Add new evolution trigger types
- **Advanced Conditions**: Complex multi-factor requirements
- **Evolution Effects**: Custom stat and ability changes
- **Integration Hooks**: Connect with additional game systems

## 📚 **API Reference**

### **EvolutionManager**
```csharp
// Check evolution after sync gain
EvolutionManager.Instance.CheckEvolutionAfterSync(spirit);

// Check evolution after quest completion
EvolutionManager.Instance.CheckEvolutionAfterQuest(questID);

// Check evolution after item use
EvolutionManager.Instance.CheckEvolutionAfterItemUse(itemID);

// Check evolution after battle
EvolutionManager.Instance.CheckEvolutionAfterBattle(conditionID, won, noDamage, turns, duration);
```

### **SpiritInstance**
```csharp
// Gain sync points
spirit.GainSync(25.0f);

// Evolve to new species
spirit.Evolve("evolved_species_id");

// Set evolution stage
spirit.SetEvolutionStage("second_stage");
```

### **SpiritEvolution_SO**
```csharp
// Check if requirements are met
bool canEvolve = evolution.CheckRequirements(spirit, context);

// Get requirement description
string description = evolution.GetRequirementDescription();

// Get evolution display name
string displayName = evolution.GetEvolutionDisplayName();
```

---

**MIFF Framework** - Modular, remix-safe, contributor-friendly game development