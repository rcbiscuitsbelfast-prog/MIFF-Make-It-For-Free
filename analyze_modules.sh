#!/bin/bash
echo "ANALYZING 22 FAILING MODULES"
echo "============================="
echo ""

modules=(
  "SavePure"
  "SimpleGamePure"
  "AudioPure"
  "InputSystemPure"
  "PhysicsPure"
  "InventoryPure"
  "DialoguePure"
  "CombatCorePure"
  "NPCsPure"
  "PathfindingPure"
  "ProgressionPure"
  "EquipmentPure"
  "FusionPure"
  "ModdingPure"
  "SyncPure"
  "LogPure"
  "SessionManifestPure"
  "RenderWorldPure"
  "SlicePure"
  "AudioMixerPure"
  "ButtonStylePure"
  "CreaturesPure"
)

for module in "${modules[@]}"; do
  echo "### $module"
  
  # Check if module has Manager
  if [ -f "miff/pure/$module/Manager.ts" ]; then
    echo "  Structure: Manager pattern"
    grep -c "export.*Manager" "miff/pure/$module/Manager.ts" 2>/dev/null || echo "  0"
  fi
  
  # Check index exports
  if [ -f "miff/pure/$module/index.ts" ]; then
    echo "  Exports:"
    grep "export" "miff/pure/$module/index.ts" | head -3
  fi
  
  # Check test type
  test_files=$(find "miff/pure/$module" -name "*test.ts" -o -name "*test.ts" 2>/dev/null | wc -l)
  echo "  Test files: $test_files"
  
  echo ""
done
