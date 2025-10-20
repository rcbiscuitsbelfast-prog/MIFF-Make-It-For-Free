#!/bin/bash
# Quick scan to find modules close to passing

modules=(
  "ButtonStylePure"
  "SlicePure"
  "AudioMixerPure"
  "RenderWorldPure"
  "TimelineSystemPure"
  "MountSystemPure"
  "ClueSystemPure"
  "ChatSystemPure"
  "StorySystemPure"
)

for mod in "${modules[@]}"; do
  echo "Testing $mod..."
  npm test -- --testPathPattern="$mod" --no-coverage 2>&1 | grep -E "PASS|FAIL" | head -3
done
