# **🛡️ CAPA Workflow Guide for Contributors**

## **📋 Overview**

CAPA (Corrective and Preventive Actions) is a systematic approach to tracking and resolving architectural flaws in the MIFF framework. This guide explains how contributors should interact with the CAPA system.

---

## **🎯 What is CAPA?**

CAPA helps us:
- **Track** architectural issues systematically
- **Prevent** regressions through CI integration
- **Document** both corrective fixes and preventive strategies
- **Measure** improvement over time

---

## **🔍 CAPA Entry Lifecycle**

```
🔴 OPEN → 🟡 IN_PROGRESS → 🔵 REVIEW → 🟢 RESOLVED → ✅ CLOSED
   ↓
⏸️ DEFERRED (if not immediately actionable)
```

### **Status Definitions**
- **🔴 OPEN:** Newly discovered issue, needs investigation
- **🟡 IN_PROGRESS:** Work has begun on the issue
- **🔵 REVIEW:** Solution implemented, needs review
- **🟢 RESOLVED:** Issue fixed, solution verified
- **✅ CLOSED:** Issue completely resolved and documented
- **⏸️ DEFERRED:** Issue acknowledged but not immediately actionable

---

## **📝 Creating CAPA Entries**

### **When to Create a CAPA Entry**
- Discover architectural flaws during development
- Find inconsistencies in module interfaces
- Identify missing test coverage
- Notice performance or security issues
- Encounter integration problems

### **How to Create a CAPA Entry**

#### **Using the CLI Tool**
```bash
# Basic creation
tsx miff/pure/shared/capaCLI.ts create "Issue Title" "Detailed description"

# With options
tsx miff/pure/shared/capaCLI.ts create "Schema Validation Issue" \
  "Module X uses different schema than expected" \
  --category schema_drift \
  --severity high \
  --module ModuleX \
  --tag validation \
  --ci-blocking
```

#### **Required Information**
- **Title:** Clear, concise description
- **Description:** Detailed explanation of the issue
- **Category:** Choose from predefined categories
- **Severity:** Critical, High, Medium, or Low
- **Modules:** Affected modules
- **Impact:** Business and technical impact

---

## **🔧 Working with CAPA Entries**

### **Viewing CAPA Entries**

```bash
# List all entries
tsx miff/pure/shared/capaCLI.ts list

# Filter by severity
tsx miff/pure/shared/capaCLI.ts list --severity critical

# Filter by module
tsx miff/pure/shared/capaCLI.ts list --module UnityBridgePure

# Show detailed entry
tsx miff/pure/shared/capaCLI.ts show CAPA-1234567890-abcdef
```

### **Updating CAPA Entries**

```bash
# Update status
tsx miff/pure/shared/capaCLI.ts update CAPA-1234567890-abcdef resolved "Fixed in PR #456"

# Add corrective action (via API)
# Add preventive action (via API)
```

---

## **🚫 CI Integration and PR Blocking**

### **How PR Blocking Works**
- Critical CAPA entries can block PRs that affect related modules
- CI checks run automatically on every PR
- PRs are blocked if they touch modules with critical open CAPA entries

### **Checking PR Impact**
```bash
# Check if your changes will be blocked
tsx miff/pure/shared/capaCLI.ts check UnityBridgePure src/UnityBridgePure/index.ts

# This will show:
# - Whether PR should be blocked
# - Which CAPA entries are affected
# - Impact statement for PR description
```

### **CAPA Impact Statement in PRs**
When creating a PR that affects modules with open CAPA entries, include the generated impact statement:

```markdown
## CAPA Impact Statement

**Module:** UnityBridgePure
**Open CAPA Entries:** 2

### CAPA-123: Asset Pipeline Validation Gaps
- **Severity:** high
- **Status:** open
- **Impact:** Missing assets, broken pipelines, version mismatches
```

---

## **📊 CAPA Categories**

| Category | Description | Examples |
|----------|-------------|----------|
| `schema_drift` | Schema inconsistencies | Different validation rules, version conflicts |
| `manager_miswiring` | Manager interface issues | Wrong method calls, missing implementations |
| `stubbed_logic` | Placeholder implementations | Mock returns, TODO comments, empty functions |
| `skipped_tests` | Test coverage gaps | `test.skip()`, missing test cases |
| `asset_pipeline` | Asset management issues | Missing files, broken references |
| `migration_gaps` | Data migration problems | No migration path, version incompatibility |
| `interface_safety` | API safety concerns | Inconsistent error handling, missing validation |
| `runtime_fidelity` | Runtime vs simulation gaps | Mock implementations, performance issues |
| `performance` | Performance problems | Slow operations, memory leaks |
| `security` | Security vulnerabilities | Unsafe operations, data exposure |
| `documentation` | Documentation issues | Missing docs, outdated examples |

---

## **⚡ Severity Guidelines**

### **🚨 Critical**
- **Blocks PRs:** Yes
- **Resolution Time:** 24-48 hours
- **Examples:** Data loss risk, security vulnerabilities, breaking changes

### **⚠️ High**
- **Blocks PRs:** No (but requires impact statement)
- **Resolution Time:** 1-2 weeks
- **Examples:** Performance issues, integration failures, missing features

### **📝 Medium**
- **Blocks PRs:** No
- **Resolution Time:** 2-4 weeks
- **Examples:** Code quality issues, documentation gaps, minor inconsistencies

### **ℹ️ Low**
- **Blocks PRs:** No
- **Resolution Time:** 1-2 months
- **Examples:** Minor improvements, cosmetic issues, nice-to-have features

---

## **🔄 Best Practices**

### **Creating CAPA Entries**
1. **Be Specific:** Provide clear, actionable descriptions
2. **Include Context:** Explain the impact and affected modules
3. **Set Appropriate Severity:** Use guidelines above
4. **Add Tags:** Help with categorization and searching
5. **Assign Ownership:** If you know who should handle it

### **Working on CAPA Entries**
1. **Update Status:** Keep status current as you work
2. **Document Progress:** Add notes about what you've done
3. **Test Thoroughly:** Ensure fixes don't introduce new issues
4. **Add Preventive Actions:** Document how to prevent similar issues
5. **Close Properly:** Mark as resolved only when fully fixed

### **PR Workflow**
1. **Check CAPA Status:** Before starting work, check for blocking entries
2. **Include Impact Statement:** Add to PR description if needed
3. **Update CAPA Entries:** Reference CAPA entries in commit messages
4. **Verify Fixes:** Ensure your changes address the CAPA entries

---

## **📈 Success Metrics**

### **Individual Contributor Metrics**
- **CAPA Entries Created:** Track issues you discover
- **CAPA Entries Resolved:** Track issues you fix
- **Prevention Actions Added:** Track preventive measures you implement
- **PR Impact Statements:** Track how often you include impact statements

### **Team Metrics**
- **Resolution Rate:** Percentage of CAPA entries resolved on time
- **Prevention Coverage:** Percentage of CAPA entries with preventive actions
- **Regression Rate:** Percentage of resolved CAPA entries that regress
- **PR Blocking Rate:** Percentage of PRs blocked by CAPA entries

---

## **🆘 Getting Help**

### **Common Issues**
- **CAPA CLI not working:** Check Node.js and tsx installation
- **PR blocked unexpectedly:** Check CAPA entries for affected modules
- **Can't find CAPA entry:** Use `list` command with filters
- **Wrong severity assigned:** Update using `update` command

### **Resources**
- **CAPA CLI Help:** `tsx miff/pure/shared/capaCLI.ts help`
- **CAPA Report:** `tsx miff/pure/shared/capaCLI.ts report`
- **CI Logs:** Check GitHub Actions for CAPA validation results
- **Team Chat:** Ask in #miff-dev for help

---

## **🎯 Quick Reference**

### **Essential Commands**
```bash
# Check if PR will be blocked
tsx capaCLI.ts check <module> <file>

# List critical entries
tsx capaCLI.ts list --severity critical

# Create new entry
tsx capaCLI.ts create "Title" "Description" --severity high --module ModuleX

# Update entry status
tsx capaCLI.ts update <id> resolved "Fixed in PR #123"

# Generate report
tsx capaCLI.ts report
```

### **Common Workflows**
1. **Before starting work:** Check for blocking CAPA entries
2. **When finding issues:** Create CAPA entries immediately
3. **During development:** Update CAPA status as you work
4. **Before PR:** Include CAPA impact statement if needed
5. **After merging:** Update CAPA entries to resolved status

---

*This guide ensures all contributors can effectively use the CAPA system to maintain and improve the quality of the MIFF framework.*