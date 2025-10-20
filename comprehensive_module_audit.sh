#!/bin/bash

# Target high-value modules from user request
MODULES=(
  "RNGPure"
  "EventBusPure"
  "StatePure"
  "SavePure"
  "SimpleGamePure"
  "AudioPure"
  "InputSystemPure"
  "PhysicsPure"
  "CollisionSystemPure"
  "InventoryPure"
  "DialoguePure"
  "QuestSystemPure"
  "CombatCorePure"
  "NPCsPure"
  "PathfindingPure"
  "ProgressionPure"
  "EquipmentPure"
  "FusionPure"
  "ModdingPure"
  "SyncPure"
  "ValidationPure"
  "LogPure"
  "SessionManifestPure"
  "PlayerStatePure"
  "PixelAnimPure"
  "RenderWorldPure"
  "SlicePure"
  "AudioMixerPure"
  "ButtonStylePure"
  "CreaturesPure"
)

echo "# COMPREHENSIVE MODULE INDEX - 30 High-Value Modules"
echo ""
echo "Generated: $(date)"
echo ""
echo "---"
echo ""

for MODULE in "${MODULES[@]}"; do
  MODULE_PATH="miff/pure/$MODULE"
  
  if [ ! -d "$MODULE_PATH" ]; then
    echo "## $MODULE"
    echo ""
    echo "**STATUS:** ❌ MODULE NOT FOUND"
    echo ""
    echo "---"
    echo ""
    continue
  fi
  
  echo "## $MODULE"
  echo ""
  
  # Description from first comment block
  if [ -f "$MODULE_PATH/index.ts" ]; then
    echo "**Description:**"
    head -30 "$MODULE_PATH/index.ts" | grep -A 10 "^/\*\*" | grep -v "^/\*\*\|^ \*\*\|^ \*/$" | sed 's/^ \* //' | head -5
    echo ""
  fi
  
  # File structure
  echo "**Structure:**"
  echo "\`\`\`"
  ls -lh "$MODULE_PATH"/*.ts 2>/dev/null | awk '{print $9, "-", $5}' | sed "s|$MODULE_PATH/||"
  echo "\`\`\`"
  echo ""
  
  # Key exports
  if [ -f "$MODULE_PATH/index.ts" ]; then
    echo "**Key Exports:**"
    grep "export class\|export interface\|export enum\|export function\|export const.*=" "$MODULE_PATH/index.ts" | head -10 | sed 's/^/- /'
    echo ""
  fi
  
  # Tests
  echo "**Tests:**"
  TESTS=$(find "$MODULE_PATH" -name "*test.ts" 2>/dev/null)
  if [ -z "$TESTS" ]; then
    echo "- ⚠️  NO TESTS"
  else
    echo "$TESTS" | while read test; do
      TEST_NAME=$(basename "$test")
      TEST_COUNT=$(grep -c "it(\|test(" "$test" 2>/dev/null || echo "0")
      echo "- $TEST_NAME ($TEST_COUNT tests)"
    done
  fi
  echo ""
  
  # Test status
  echo "**Test Status:**"
  TEST_RESULT=$(npm test -- --testPathPattern="$MODULE" --no-coverage 2>&1 | grep -E "PASS |FAIL |Tests:" | head -3)
  if echo "$TEST_RESULT" | grep -q "PASS.*FAIL"; then
    echo "- ⚠️  MIXED - Some passing, some failing"
  elif echo "$TEST_RESULT" | grep -q "PASS"; then
    echo "- ✅ PASSING"
  elif echo "$TEST_RESULT" | grep -q "FAIL"; then
    echo "- ❌ FAILING"
  else
    echo "- ❓ UNKNOWN / NO TESTS"
  fi
  echo ""
  
  # Complexity
  TOTAL_LOC=$(find "$MODULE_PATH" -name "*.ts" -not -name "*test.ts" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
  if [ -z "$TOTAL_LOC" ]; then
    TOTAL_LOC="0"
  fi
  
  COMPLEXITY="Unknown"
  if [ "$TOTAL_LOC" -lt 300 ]; then
    COMPLEXITY="Low"
  elif [ "$TOTAL_LOC" -lt 1000 ]; then
    COMPLEXITY="Medium"
  elif [ "$TOTAL_LOC" -lt 2000 ]; then
    COMPLEXITY="High"
  else
    COMPLEXITY="Very High"
  fi
  
  echo "**Complexity:** $COMPLEXITY ($TOTAL_LOC LOC)"
  echo ""
  
  echo "---"
  echo ""
done

echo ""
echo "# Analysis Complete"
