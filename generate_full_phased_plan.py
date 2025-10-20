#!/usr/bin/env python3
"""
Generate comprehensive phased plan for all 236 modules
"""

import json

def load_analysis():
    with open('FULL_MODULE_ANALYSIS.json', 'r') as f:
        return json.load(f)

def categorize_module(module):
    """Categorize module by status and fix priority"""
    tests = module.get('tests', {})
    metrics = module.get('code_metrics', {})
    
    status = tests.get('status', 'unknown')
    has_tests = metrics.get('has_tests', False)
    has_comp_errors = tests.get('has_compilation_errors', False)
    loc = metrics.get('total_loc', 0)
    
    if status == 'passing' and not has_comp_errors:
        return 'production_ready', 0, 0
    
    elif has_comp_errors:
        return 'compilation_errors', 1, 0.5  # Priority 1, 30min
    
    elif has_tests and status == 'failing':
        if loc < 300:
            return 'simple_test_fix', 2, 1  # Priority 2, 1hr
        elif loc < 1000:
            return 'moderate_test_fix', 3, 2  # Priority 3, 2hrs
        else:
            return 'complex_test_fix', 4, 4  # Priority 4, 4hrs
    
    elif status == 'timeout':
        return 'timeout_issues', 5, 3  # Priority 5, 3hrs
    
    elif not has_tests:
        if loc > 1000:
            return 'large_untested', 7, 8  # Priority 7, 8hrs
        elif loc > 300:
            return 'medium_untested', 6, 4  # Priority 6, 4hrs
        else:
            return 'small_untested', 8, 2  # Priority 8, 2hrs
    
    else:
        return 'unknown', 9, 2

def generate_phased_plan(modules):
    """Generate comprehensive phased execution plan"""
    
    md = "# COMPLETE REPOSITORY RECOVERY PLAN\n\n"
    md += f"**Total Modules:** {len(modules)}\n"
    md += f"**Analysis Date:** 2025-10-20\n\n"
    md += "---\n\n"
    
    # Categorize all modules
    categorized = {}
    total_time = 0
    
    for module in modules:
        cat, priority, time = categorize_module(module)
        if cat not in categorized:
            categorized[cat] = []
        categorized[cat].append({
            'module': module,
            'priority': priority,
            'time': time
        })
        total_time += time
    
    # Summary
    md += "## Executive Summary\n\n"
    md += f"**Total Estimated Work:** {total_time:.0f} hours ({total_time/40:.1f} weeks at 40 hrs/week)\n\n"
    
    md += "### Current Status\n"
    md += f"- ✅ **Production Ready:** {len(categorized.get('production_ready', []))} modules (done)\n"
    md += f"- 🔴 **Compilation Errors:** {len(categorized.get('compilation_errors', []))} modules\n"
    md += f"- 🔧 **Simple Test Fixes:** {len(categorized.get('simple_test_fix', []))} modules\n"
    md += f"- ⚙️ **Moderate Test Fixes:** {len(categorized.get('moderate_test_fix', []))} modules\n"
    md += f"- 🔨 **Complex Test Fixes:** {len(categorized.get('complex_test_fix', []))} modules\n"
    md += f"- ⏱️ **Timeout Issues:** {len(categorized.get('timeout_issues', []))} modules\n"
    md += f"- 📋 **Medium Untested:** {len(categorized.get('medium_untested', []))} modules\n"
    md += f"- 📝 **Large Untested:** {len(categorized.get('large_untested', []))} modules\n"
    md += f"- 📄 **Small Untested:** {len(categorized.get('small_untested', []))} modules\n\n"
    
    # Phases
    phases = [
        {
            'name': 'Phase 1: Compilation Errors',
            'priority': 1,
            'category': 'compilation_errors',
            'description': 'Fix all TypeScript compilation errors - CRITICAL BLOCKER',
            'time_estimate': '0.5 hours per module'
        },
        {
            'name': 'Phase 2: Simple Test Fixes',
            'priority': 2,
            'category': 'simple_test_fix',
            'description': 'Fix tests in small modules (<300 LOC) - Quick wins',
            'time_estimate': '1 hour per module'
        },
        {
            'name': 'Phase 3: Moderate Test Fixes',
            'priority': 3,
            'category': 'moderate_test_fix',
            'description': 'Fix tests in medium modules (300-1000 LOC)',
            'time_estimate': '2 hours per module'
        },
        {
            'name': 'Phase 4: Complex Test Fixes',
            'priority': 4,
            'category': 'complex_test_fix',
            'description': 'Fix tests in large modules (1000+ LOC)',
            'time_estimate': '4 hours per module'
        },
        {
            'name': 'Phase 5: Timeout Issues',
            'priority': 5,
            'category': 'timeout_issues',
            'description': 'Investigate and fix timeout issues',
            'time_estimate': '3 hours per module'
        },
        {
            'name': 'Phase 6: Medium Untested Modules',
            'priority': 6,
            'category': 'medium_untested',
            'description': 'Write tests for medium modules (300-1000 LOC)',
            'time_estimate': '4 hours per module'
        },
        {
            'name': 'Phase 7: Large Untested Modules',
            'priority': 7,
            'category': 'large_untested',
            'description': 'Write comprehensive tests for large modules (1000+ LOC)',
            'time_estimate': '8 hours per module'
        },
        {
            'name': 'Phase 8: Small Untested Modules',
            'priority': 8,
            'category': 'small_untested',
            'description': 'Write tests for small modules (<300 LOC)',
            'time_estimate': '2 hours per module'
        }
    ]
    
    cumulative_time = 0
    cumulative_modules = len(categorized.get('production_ready', []))
    
    md += "### Phased Roadmap\n\n"
    for phase in phases:
        mods = categorized.get(phase['category'], [])
        if not mods:
            continue
        phase_time = sum(m['time'] for m in mods)
        cumulative_time += phase_time
        cumulative_modules += len(mods)
        
        md += f"**{phase['name']}**\n"
        md += f"- Modules: {len(mods)}\n"
        md += f"- Time: {phase_time:.0f} hours ({phase_time/40:.1f} weeks)\n"
        md += f"- After completion: {cumulative_modules}/{len(modules)} passing ({cumulative_modules/len(modules)*100:.1f}%)\n"
        md += f"- Cumulative time: {cumulative_time:.0f} hours ({cumulative_time/40:.1f} weeks)\n\n"
    
    md += "---\n\n"
    
    # Detailed phase breakdowns
    for phase in phases:
        mods = categorized.get(phase['category'], [])
        if not mods:
            continue
        
        md += f"## {phase['name']}\n\n"
        md += f"{phase['description']}\n\n"
        md += f"**Total Modules:** {len(mods)}\n"
        md += f"**Estimated Time:** {sum(m['time'] for m in mods):.0f} hours\n"
        md += f"**Time Per Module:** {phase['time_estimate']}\n\n"
        
        # Sort by LOC descending (tackle largest first within priority)
        sorted_mods = sorted(mods, key=lambda x: x['module'].get('code_metrics', {}).get('total_loc', 0), reverse=True)
        
        md += "### Modules\n\n"
        for i, item in enumerate(sorted_mods[:50], 1):  # Top 50 per phase
            module = item['module']
            name = module['name']
            loc = module.get('code_metrics', {}).get('total_loc', 0)
            test_count = module.get('tests', {}).get('total_test_count', 0)
            errors = module.get('tests', {}).get('errors', [])
            
            md += f"{i}. **{name}** ({loc:,} LOC"
            if test_count:
                md += f", {test_count} tests"
            md += f") - {item['time']:.1f}hrs\n"
            
            if errors:
                md += f"   - Error: `{errors[0][:80]}`\n"
            
        if len(sorted_mods) > 50:
            md += f"\n...and {len(sorted_mods) - 50} more modules\n"
        
        md += "\n---\n\n"
    
    # Milestone targets
    md += "## Milestone Targets\n\n"
    
    milestones = [
        (25, "Initial Progress"),
        (50, "Quarter Complete"),
        (75, "Half Complete"),
        (90, "Strong Majority"),
        (95, "Near Perfection"),
        (100, "Full Repository Health")
    ]
    
    current_passing = len(categorized.get('production_ready', []))
    
    for target_pct, milestone_name in milestones:
        target_modules = int(len(modules) * target_pct / 100)
        needed = target_modules - current_passing
        
        if needed <= 0:
            continue
        
        # Calculate time to reach this milestone
        time_needed = 0
        modules_added = 0
        
        for phase in phases:
            mods = categorized.get(phase['category'], [])
            if not mods:
                continue
            
            for mod_item in mods:
                if modules_added >= needed:
                    break
                time_needed += mod_item['time']
                modules_added += 1
            
            if modules_added >= needed:
                break
        
        md += f"### {target_pct}% - {milestone_name}\n"
        md += f"- **Target:** {target_modules}/{len(modules)} modules passing\n"
        md += f"- **Need:** {needed} more modules\n"
        md += f"- **Estimated Time:** {time_needed:.0f} hours ({time_needed/40:.1f} weeks)\n\n"
    
    md += "---\n\n"
    
    # Recommendations
    md += "## Recommendations\n\n"
    md += "### Immediate Action (This Week)\n"
    md += f"- Execute Phase 1: Fix {len(categorized.get('compilation_errors', []))} compilation errors\n"
    md += f"- Execute Phase 2: Fix {len(categorized.get('simple_test_fix', [])[:20])} simple test modules\n"
    md += f"- **Time:** ~{sum(m['time'] for m in categorized.get('compilation_errors', [])) + sum(m['time'] for m in categorized.get('simple_test_fix', [])[:20]):.0f} hours\n"
    md += f"- **Result:** ~{current_passing + len(categorized.get('compilation_errors', [])) + 20}/{len(modules)} passing\n\n"
    
    md += "### This Month\n"
    md += "- Complete Phases 1-3\n"
    md += "- **Result:** 50%+ modules passing\n\n"
    
    md += "### This Quarter\n"
    md += "- Complete Phases 1-5\n"
    md += "- **Result:** 75%+ modules passing\n\n"
    
    md += "### Long-term (Optional)\n"
    md += "- Phases 6-8: Write tests for untested modules\n"
    md += "- **Result:** 90-100% modules with tests and passing\n\n"
    
    return md

def main():
    modules = load_analysis()
    
    print("Generating comprehensive phased plan...")
    plan = generate_phased_plan(modules)
    
    output_file = 'FULL_REPOSITORY_RECOVERY_PLAN.md'
    with open(output_file, 'w') as f:
        f.write(plan)
    
    print(f"Plan generated: {output_file}")
    print(f"Plan size: {len(plan):,} characters")

if __name__ == "__main__":
    main()
