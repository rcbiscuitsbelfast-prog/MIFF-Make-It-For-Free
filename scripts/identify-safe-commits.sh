#!/bin/bash

# Identify Safe Commits for Cherry-Picking
# Purpose: Find safe commits from Oct 8-13 that can be restored
# Usage: ./scripts/identify-safe-commits.sh

set -e

echo "🔍 Identifying Safe Commits for Cherry-Pick Recovery"
echo "=================================================="
echo ""

# Define date range (before the breaking commit)
START_DATE="2025-10-08"
END_DATE="2025-10-14"
BREAKING_COMMIT="8420c953"

# Output files
SAFE_COMMITS_FILE="safe_commits_for_cherry_pick.txt"
UNSAFE_COMMITS_FILE="unsafe_commits_to_avoid.txt"
ALL_COMMITS_FILE="all_commits_oct8_to_14.txt"

echo "📅 Date Range: $START_DATE to $END_DATE (before breaking commit)"
echo ""

# Get all commits in the range
echo "1️⃣ Fetching all commits from both branches..."
{
    git log --oneline --after="$START_DATE" --before="$END_DATE" origin/cursor/investigate-aipure-recovery-plan-8e9e
    git log --oneline --after="$START_DATE" --before="$END_DATE" origin/emergency-rollback
} | sort -u > "$ALL_COMMITS_FILE"

TOTAL_COMMITS=$(wc -l < "$ALL_COMMITS_FILE")
echo "   Found $TOTAL_COMMITS unique commits"
echo ""

# Identify UNSAFE commits
echo "2️⃣ Identifying UNSAFE commits (DO NOT cherry-pick)..."
> "$UNSAFE_COMMITS_FILE"

# Unsafe patterns
UNSAFE_PATTERNS=(
    "96%.*[Rr]eduction"
    "26,020.*errors"
    "[Bb]atch.*fix"
    "[Aa]utomated.*fix"
    "error.*reduction"
    "MASSIVE.*SUCCESS"
)

while IFS= read -r commit_line; do
    commit_sha=$(echo "$commit_line" | awk '{print $1}')
    commit_msg=$(echo "$commit_line" | cut -d' ' -f2-)
    
    # Check if commit matches unsafe patterns
    is_unsafe=false
    for pattern in "${UNSAFE_PATTERNS[@]}"; do
        if echo "$commit_msg" | grep -qiE "$pattern"; then
            is_unsafe=true
            break
        fi
    done
    
    # Check file count (>50 files = suspicious)
    file_count=$(git show "$commit_sha" --stat --oneline 2>/dev/null | wc -l || echo 0)
    if [ "$file_count" -gt 50 ]; then
        is_unsafe=true
    fi
    
    # Check for batch_fix_script.ts
    if git show "$commit_sha" --name-only 2>/dev/null | grep -q "batch_fix_script.ts"; then
        is_unsafe=true
    fi
    
    if [ "$is_unsafe" = true ]; then
        echo "❌ $commit_line" >> "$UNSAFE_COMMITS_FILE"
    fi
done < "$ALL_COMMITS_FILE"

UNSAFE_COUNT=$(wc -l < "$UNSAFE_COMMITS_FILE" 2>/dev/null || echo 0)
echo "   Found $UNSAFE_COUNT UNSAFE commits"
echo ""

# Identify SAFE commits
echo "3️⃣ Identifying potentially SAFE commits..."
> "$SAFE_COMMITS_FILE"

while IFS= read -r commit_line; do
    commit_sha=$(echo "$commit_line" | awk '{print $1}')
    
    # Skip if in unsafe list
    if grep -q "$commit_sha" "$UNSAFE_COMMITS_FILE" 2>/dev/null; then
        continue
    fi
    
    commit_msg=$(echo "$commit_line" | cut -d' ' -f2-)
    
    # Check for safe patterns
    is_safe=false
    safety_reason=""
    
    # Documentation commits
    if echo "$commit_msg" | grep -qiE "^docs?:|^documentation|\.md|audit|report|plan"; then
        is_safe=true
        safety_reason="[DOCS]"
    fi
    
    # New feature commits (if small)
    if echo "$commit_msg" | grep -qiE "^feat:|^feature:"; then
        file_count=$(git show "$commit_sha" --stat --oneline 2>/dev/null | wc -l || echo 0)
        if [ "$file_count" -lt 20 ]; then
            is_safe=true
            safety_reason="[FEAT-SMALL]"
        fi
    fi
    
    # Config/workflow improvements
    if echo "$commit_msg" | grep -qiE "workflow|config|\.yml|\.yaml"; then
        file_count=$(git show "$commit_sha" --stat --oneline 2>/dev/null | wc -l || echo 0)
        if [ "$file_count" -lt 10 ]; then
            is_safe=true
            safety_reason="[CONFIG]"
        fi
    fi
    
    # Test additions
    if echo "$commit_msg" | grep -qiE "^test:|\.test\.ts|spec\.ts"; then
        is_safe=true
        safety_reason="[TEST]"
    fi
    
    if [ "$is_safe" = true ]; then
        echo "$safety_reason $commit_line" >> "$SAFE_COMMITS_FILE"
    fi
done < "$ALL_COMMITS_FILE"

SAFE_COUNT=$(wc -l < "$SAFE_COMMITS_FILE" 2>/dev/null || echo 0)
echo "   Found $SAFE_COUNT potentially safe commits"
echo ""

# Categorize safe commits
echo "4️⃣ Categorizing SAFE commits..."
echo ""

echo "📝 Documentation commits:"
grep "\[DOCS\]" "$SAFE_COMMITS_FILE" 2>/dev/null | head -10 || echo "   None found"
DOCS_COUNT=$(grep -c "\[DOCS\]" "$SAFE_COMMITS_FILE" 2>/dev/null || echo 0)
echo "   Total: $DOCS_COUNT"
echo ""

echo "🆕 New feature commits (small):"
grep "\[FEAT-SMALL\]" "$SAFE_COMMITS_FILE" 2>/dev/null | head -10 || echo "   None found"
FEAT_COUNT=$(grep -c "\[FEAT-SMALL\]" "$SAFE_COMMITS_FILE" 2>/dev/null || echo 0)
echo "   Total: $FEAT_COUNT"
echo ""

echo "🔧 Config/workflow commits:"
grep "\[CONFIG\]" "$SAFE_COMMITS_FILE" 2>/dev/null | head -10 || echo "   None found"
CONFIG_COUNT=$(grep -c "\[CONFIG\]" "$SAFE_COMMITS_FILE" 2>/dev/null || echo 0)
echo "   Total: $CONFIG_COUNT"
echo ""

echo "✅ Test commits:"
grep "\[TEST\]" "$SAFE_COMMITS_FILE" 2>/dev/null | head -10 || echo "   None found"
TEST_COUNT=$(grep -c "\[TEST\]" "$SAFE_COMMITS_FILE" 2>/dev/null || echo 0)
echo "   Total: $TEST_COUNT"
echo ""

# Summary
echo "=================================================="
echo "📊 SUMMARY"
echo "=================================================="
echo ""
echo "Total commits in range:     $TOTAL_COMMITS"
echo "UNSAFE commits (avoid):     $UNSAFE_COUNT"
echo "Potentially SAFE commits:   $SAFE_COUNT"
echo "Needs manual review:        $((TOTAL_COMMITS - UNSAFE_COUNT - SAFE_COUNT))"
echo ""
echo "Output Files:"
echo "  📄 All commits:        $ALL_COMMITS_FILE"
echo "  ✅ Safe commits:       $SAFE_COMMITS_FILE"
echo "  ❌ Unsafe commits:     $UNSAFE_COMMITS_FILE"
echo ""
echo "=================================================="
echo "⚠️  IMPORTANT: Always review commits manually"
echo "⚠️  Test after EACH cherry-pick"
echo "⚠️  Abort if tests fail"
echo "=================================================="
echo ""

# Show unsafe commits
if [ "$UNSAFE_COUNT" -gt 0 ]; then
    echo "🚨 UNSAFE COMMITS TO AVOID:"
    echo "-------------------------"
    cat "$UNSAFE_COMMITS_FILE"
    echo ""
fi

# Next steps
echo "📋 NEXT STEPS:"
echo ""
echo "1. Review safe commits:"
echo "   cat $SAFE_COMMITS_FILE"
echo ""
echo "2. Create recovery branch:"
echo "   git checkout -b recovery-cherry-pick origin/master"
echo ""
echo "3. Cherry-pick safe commits (one at a time):"
echo "   git cherry-pick <commit-sha>"
echo ""
echo "4. Test after EACH cherry-pick:"
echo "   npm test"
echo ""
echo "5. If test fails, abort:"
echo "   git cherry-pick --abort"
echo ""
echo "6. Track your progress in a recovery log"
echo ""
echo "✅ Ready to begin selective restoration!"
