# MIFF Item Usage Tutorial System

A guided tutorial system that teaches players how to use items in both overworld and battle contexts, integrated with the OnboardingFlag system for persistent progress tracking.

## 🎯 **System Overview**

The tutorial system provides:
- **Automatic Triggering**: Tutorials activate when players first obtain usable items
- **Context Awareness**: Different content for overworld vs. battle scenarios
- **Progress Persistence**: Onboarding flags prevent repeat tutorials
- **Non-Intrusive**: Pauses gameplay only when necessary
- **Contributor-Friendly**: Easy to modify text, timing, and triggers

## 📁 **File Structure**

```
Assets/Scripts/MIFF/Tutorials/
├── OnboardingFlagManager.cs      # Flag management and persistence
├── TutorialTrigger_ItemUsage.cs  # Main tutorial trigger logic
├── TutorialTestHelper.cs         # Testing and debugging tools
└── README.md                     # This documentation
```

```
Assets/Scripts/MIFF/UI/
└── ItemUsageTutorialUI.cs       # Tutorial UI component
```

## 🔧 **Core Components**

### **OnboardingFlagManager**
- **Singleton** that manages all onboarding progress flags
- **Persistent Storage** using PlayerPrefs (ready for GameData integration)
- **Default Flags** including `ItemUsageTutorialCompleted`
- **Event System** for flag changes
- **Debug Tools** for testing and development

### **TutorialTrigger_ItemUsage**
- **Automatic Detection** of when tutorials should trigger
- **Context Determination** (overworld vs. battle)
- **Gameplay Pausing** during tutorial display
- **Integration** with InventoryManager and BattleController
- **Testing Commands** for development

### **ItemUsageTutorialUI**
- **Context-Aware Content** with different text for overworld/battle
- **Visual Highlighting** of the Bag UI button
- **Animation Effects** (pulsing, color changes)
- **Continue/Skip Options** for player choice
- **Event System** for UI state changes

## 🎮 **How It Works**

### **1. Tutorial Triggering**
```
Player obtains item → InventoryManager.OnInventoryChanged → 
TutorialTrigger checks flags → Shows tutorial if needed
```

### **2. Context Detection**
- **Overworld**: When items are added outside of battle
- **Battle**: When entering player turn with usable items

### **3. Tutorial Flow**
1. **Pause Gameplay** (Time.timeScale = 0, disable input)
2. **Show Tutorial Panel** with context-appropriate text
3. **Highlight Bag Button** with pulsing animation
4. **Wait for Player Action** (continue or skip)
5. **Set Completion Flag** and resume gameplay

### **4. Persistence**
- Flags are automatically saved to PlayerPrefs
- Tutorials won't repeat once completed
- Progress persists across game sessions

## 🚀 **Quick Start**

### **1. Setup Required Components**
```
Scene Hierarchy:
├── OnboardingFlagManager (singleton)
├── InventoryManager (from inventory system)
├── TutorialTrigger_ItemUsage
├── ItemUsageTutorialUI
└── BattleController (if using battle tutorials)
```

### **2. Configure Tutorial Trigger**
- Assign `ItemUsageTutorialUI` reference
- Set `tutorialDelay` (default: 1 second)
- Enable/disable overworld and battle triggers

### **3. Configure Tutorial UI**
- Assign UI panel, text, and button references
- Customize tutorial text for both contexts
- Set visual properties (colors, animation speed)

### **4. Test the System**
- Use `TutorialTestHelper` context menu commands
- Add items to inventory to trigger overworld tutorial
- Start battle with items to trigger battle tutorial

## 🎨 **Customization**

### **Modifying Tutorial Text**
```csharp
// In ItemUsageTutorialUI
public void SetTutorialText(string overworld, string battle)
{
    overworldText = overworld;
    battleText = battle;
}

// Usage
tutorialUI.SetTutorialText(
    "Custom overworld message!",
    "Custom battle message!"
);
```

### **Adding New Onboarding Flags**
```csharp
// In OnboardingFlagManager.InitializeFlags()
defaultFlags.Add(new OnboardingFlag
{
    flagID = "NewTutorialCompleted",
    defaultValue = false,
    description = "Description of new tutorial"
});
```

### **Custom Tutorial Triggers**
```csharp
// Create new trigger class
public class TutorialTrigger_Custom : MonoBehaviour
{
    private void Start()
    {
        // Listen for specific events
        // Check flags
        // Trigger tutorial when conditions are met
    }
}
```

## 🧪 **Testing**

### **Context Menu Commands**
- **Force Trigger Tutorial**: Immediately show tutorial
- **Reset Tutorial State**: Clear completion flag
- **Simulate Store Purchase**: Add items to trigger overworld tutorial
- **Test Battle Tutorial**: Start battle with items
- **Log System State**: Debug current system status

### **Test Scenarios**
1. **New Game**: No items → no tutorial
2. **Store Purchase**: Add healing items → overworld tutorial
3. **Battle Reward**: Get items during battle → battle tutorial
4. **Flag Persistence**: Complete tutorial → save/load → no repeat

### **Debug Information**
- Console logs for all tutorial events
- Flag state logging
- Inventory change tracking
- Battle state monitoring

## 🔗 **Integration Points**

### **With Inventory System**
- Listens to `InventoryManager.OnInventoryChanged`
- Checks for usable items before triggering
- Integrates with item filtering (battle vs. overworld)

### **With Battle System**
- Monitors `BattleController` state
- Triggers on player turn start
- Respects solo mode restrictions

### **With UI System**
- Highlights `InventoryButton` during tutorial
- Integrates with `BagUIController`
- Uses existing UI event system

### **With Save System**
- Ready for `GameData` integration
- Currently uses PlayerPrefs for persistence
- Flag changes automatically trigger saves

## 📋 **Contributor Workflow**

### **For Content Creators**
1. **Modify Tutorial Text**: Edit strings in `ItemUsageTutorialUI`
2. **Adjust Timing**: Change `tutorialDelay` in trigger component
3. **Add New Flags**: Extend `OnboardingFlagManager` with new flags
4. **Customize Visuals**: Modify colors, animation speeds, and sprites

### **For Writers**
1. **Localize Text**: Update tutorial messages for different languages
2. **Adjust Tone**: Modify text to match game's narrative style
3. **Add Context**: Create different messages for various situations

### **For UI Artists**
1. **Reskin Panels**: Modify tutorial panel appearance
2. **Custom Animations**: Replace pulsing with custom highlight effects
3. **Visual Feedback**: Add particle effects or other visual cues

### **For Designers**
1. **Tutorial Flow**: Adjust when and how tutorials trigger
2. **Progression**: Plan tutorial sequence and dependencies
3. **Player Experience**: Balance tutorial frequency and intrusiveness

## 🐛 **Troubleshooting**

### **Common Issues**
- **Tutorial not triggering**: Check flag state and item availability
- **UI not showing**: Verify component references and panel setup
- **Flags not persisting**: Check PlayerPrefs permissions
- **Battle integration failing**: Ensure BattleController references

### **Debug Steps**
1. Use `Log System State` context menu command
2. Check Console for tutorial-related messages
3. Verify flag values in `OnboardingFlagManager`
4. Test with `Force Trigger Tutorial` command

### **Performance Considerations**
- Tutorial triggers only when necessary
- UI animations use efficient InvokeRepeating
- Flag changes trigger saves automatically
- Minimal impact on gameplay performance

## 🔮 **Future Enhancements**

### **Planned Features**
- **Tutorial Sequences**: Multiple-step tutorials with progression
- **Conditional Content**: Different content based on player choices
- **Advanced Highlighting**: 3D object highlighting and camera focus
- **Voice Integration**: Audio narration for tutorials

### **Extension Points**
- **Custom Trigger Conditions**: Beyond just inventory changes
- **Tutorial Templates**: Reusable tutorial structures
- **Analytics Integration**: Track tutorial completion rates
- **Accessibility Options**: Text size, color, and input alternatives

## 📚 **API Reference**

### **OnboardingFlagManager**
```csharp
// Get flag value
bool completed = OnboardingFlagManager.Instance.GetFlag("ItemUsageTutorialCompleted");

// Set flag value
OnboardingFlagManager.Instance.SetFlag("ItemUsageTutorialCompleted", true);

// Check multiple flags
bool ready = OnboardingFlagManager.Instance.AreFlagsSet("Flag1", "Flag2");
```

### **TutorialTrigger_ItemUsage**
```csharp
// Force trigger tutorial
tutorialTrigger.ForceTriggerTutorial();

// Reset tutorial state
tutorialTrigger.ResetTutorialState();

// Check if tutorial is active
bool active = tutorialTrigger.IsTutorialActive;
```

### **ItemUsageTutorialUI**
```csharp
// Show tutorial with context
tutorialUI.ShowTutorial(TutorialContext.Battle);

// Hide tutorial
tutorialUI.HideTutorial();

// Check visibility
bool visible = tutorialUI.IsVisible;
```

---

**MIFF Framework** - Modular, remix-safe, contributor-friendly game development