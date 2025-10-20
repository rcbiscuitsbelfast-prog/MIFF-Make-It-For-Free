#!/usr/bin/env python3
"""
Generate comprehensive report for ALL modules
"""

import json
from pathlib import Path

def load_analysis():
    with open('FULL_MODULE_ANALYSIS.json', 'r') as f:
        return json.load(f)

def categorize_module(module):
    """Categorize module by status"""
    tests = module.get('tests', {})
    metrics = module.get('code_metrics', {})
    
    status = tests.get('status', 'unknown')
    has_tests = metrics.get('has_tests', False)
    has_comp_errors = tests.get('has_compilation_errors', False)
    loc = metrics.get('total_loc', 0)
    
    # Tier 1: Production Ready
    if status == 'passing' and not has_comp_errors:
        return 'production_ready'
    
    # Tier 2: Has tests but failing
    elif has_tests and status == 'failing':
        if has_comp_errors:
            return 'compilation_errors'
        else:
            return 'test_failures'
    
    # Tier 3: No tests
    elif not has_tests:
        if loc > 1000:
            return 'large_untested'
        elif loc > 300:
            return 'medium_untested'
        else:
            return 'small_untested'
    
    # Tier 4: Timeout/unknown
    elif status == 'timeout':
        return 'timeout'
    
    else:
        return 'unknown'

def estimate_fix_time(module, category):
    """Estimate time to fix module"""
    if category == 'production_ready':
        return 0
    elif category == 'compilation_errors':
        return 0.5  # 30 min average
    elif category == 'test_failures':
        loc = module.get('code_metrics', {}).get('total_loc', 0)
        if loc < 300:
            return 1  # 1 hour
        elif loc < 1000:
            return 2  # 2 hours
        else:
            return 4  # 4 hours
    elif category == 'large_untested':
        return 8  # 8 hours to write comprehensive tests
    elif category == 'medium_untested':
        return 4  # 4 hours
    elif category == 'small_untested':
        return 2  # 2 hours
    elif category == 'timeout':
        return 3  # 3 hours to investigate
    else:
        return 2  # 2 hours

def generate_markdown_report(modules):
    """Generate comprehensive markdown report"""
    
    md = "# MIFF Framework - Complete Module Analysis\n\n"
    md += f"**Total Modules:** {len(modules)}\n"
    md += f"**Analysis Date:** 2025-10-20\n\n"
    md += "---\n\n"
    
    # Categorize all modules
    categories = {}
    for module in modules:
        cat = categorize_module(module)
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(module)
    
    # Summary
    md += "## Executive Summary\n\n"
    
    total = len(modules)
    total_loc = sum(m.get('code_metrics', {}).get('total_loc', 0) for m in modules)
    
    md += f"### Repository Overview\n"
    md += f"- **Total Modules:** {total}\n"
    md += f"- **Total Lines of Code:** {total_loc:,}\n"
    md += f"- **Average LOC/Module:** {total_loc//total if total else 0}\n\n"
    
    md += f"### Module Status\n"
    md += f"- ✅ **Production Ready:** {len(categories.get('production_ready', []))} modules ({len(categories.get('production_ready', []))/total*100:.1f}%)\n"
    md += f"- 🔴 **Compilation Errors:** {len(categories.get('compilation_errors', []))} modules ({len(categories.get('compilation_errors', []))/total*100:.1f}%)\n"
    md += f"- ❌ **Test Failures:** {len(categories.get('test_failures', []))} modules ({len(categories.get('test_failures', []))/total*100:.1f}%)\n"
    md += f"- ⏱️ **Timeout:** {len(categories.get('timeout', []))} modules ({len(categories.get('timeout', []))/total*100:.1f}%)\n"
    md += f"- 📝 **Large Untested:** {len(categories.get('large_untested', []))} modules ({len(categories.get('large_untested', []))/total*100:.1f}%)\n"
    md += f"- 📋 **Medium Untested:** {len(categories.get('medium_untested', []))} modules ({len(categories.get('medium_untested', []))/total*100:.1f}%)\n"
    md += f"- 📄 **Small Untested:** {len(categories.get('small_untested', []))} modules ({len(categories.get('small_untested', []))/total*100:.1f}%)\n\n"
    
    # Time estimates
    total_time = 0
    for cat, mods in categories.items():
        for mod in mods:
            total_time += estimate_fix_time(mod, cat)
    
    md += f"### Estimated Work\n"
    md += f"- **Total Time to Fix All:** {total_time:.0f} hours ({total_time/40:.1f} weeks at 40 hrs/week)\n"
    md += f"- **To 50% Passing:** {total_time * 0.25:.0f} hours\n"
    md += f"- **To 75% Passing:** {total_time * 0.50:.0f} hours\n"
    md += f"- **To 90% Passing:** {total_time * 0.75:.0f} hours\n\n"
    
    md += "---\n\n"
    
    # Detailed sections for each category
    category_order = [
        ('production_ready', '✅ Production Ready', 'These modules have passing tests and are ready for production use.'),
        ('compilation_errors', '🔴 Compilation Errors', 'These modules have TypeScript compilation errors that must be fixed.'),
        ('test_failures', '❌ Test Failures', 'These modules have tests but they are failing.'),
        ('timeout', '⏱️ Timeout Issues', 'These modules have tests that timeout or take too long.'),
        ('large_untested', '📝 Large Untested Modules', 'Modules over 1000 LOC without tests.'),
        ('medium_untested', '📋 Medium Untested Modules', 'Modules 300-1000 LOC without tests.'),
        ('small_untested', '📄 Small Untested Modules', 'Modules under 300 LOC without tests.'),
    ]
    
    for cat_id, cat_title, cat_desc in category_order:
        mods = categories.get(cat_id, [])
        if not mods:
            continue
            
        md += f"## {cat_title} ({len(mods)} modules)\n\n"
        md += f"{cat_desc}\n\n"
        
        # Sort by LOC descending
        mods_sorted = sorted(mods, key=lambda x: x.get('code_metrics', {}).get('total_loc', 0), reverse=True)
        
        for i, module in enumerate(mods_sorted, 1):
            name = module['name']
            metrics = module.get('code_metrics', {})
            structure = module.get('structure', {})
            tests = module.get('tests', {})
            exports = module.get('exports', {})
            
            loc = metrics.get('total_loc', 0)
            complexity = metrics.get('complexity', 'Unknown')
            pattern = structure.get('pattern', 'Unknown')
            test_count = tests.get('total_test_count', 0)
            
            md += f"### {i}. {name}\n\n"
            md += f"**Complexity:** {complexity} ({loc:,} LOC) | **Pattern:** {pattern}\n\n"
            
            # Description
            desc = module.get('description')
            if desc:
                md += f"**Description:** {desc[:200]}{'...' if len(desc) > 200 else ''}\n\n"
            
            # Files
            files = module.get('files', {})
            if files:
                md += f"**Files:**\n"
                for fname, floc in sorted(files.items(), key=lambda x: x[1], reverse=True)[:5]:
                    md += f"- `{fname}` ({floc} LOC)\n"
                md += "\n"
            
            # Exports
            if exports:
                exp_summary = []
                if exports.get('classes'):
                    exp_summary.append(f"{len(exports['classes'])} classes")
                if exports.get('interfaces'):
                    exp_summary.append(f"{len(exports['interfaces'])} interfaces")
                if exports.get('enums'):
                    exp_summary.append(f"{len(exports['enums'])} enums")
                if exports.get('functions'):
                    exp_summary.append(f"{len(exports['functions'])} functions")
                
                if exp_summary:
                    md += f"**Exports:** {', '.join(exp_summary)}\n\n"
            
            # Test info
            if test_count > 0:
                test_files = tests.get('files', [])
                md += f"**Tests:** {test_count} tests in {len(test_files)} file(s)\n"
                test_status = tests.get('status', 'unknown')
                md += f"**Status:** {test_status.upper()}\n\n"
                
                # Errors
                if tests.get('errors'):
                    md += f"**Errors:**\n"
                    for err in tests['errors'][:2]:
                        md += f"- `{err[:100]}`\n"
                    md += "\n"
            else:
                md += f"**Tests:** None\n\n"
            
            # Fix estimate
            fix_time = estimate_fix_time(module, cat_id)
            if fix_time > 0:
                md += f"**Estimated Fix Time:** {fix_time:.1f} hours\n\n"
            
            md += "---\n\n"
    
    return md

def main():
    modules = load_analysis()
    
    print("Generating comprehensive report...")
    report = generate_markdown_report(modules)
    
    output_file = 'COMPLETE_MODULE_REPORT.md'
    with open(output_file, 'w') as f:
        f.write(report)
    
    print(f"Report generated: {output_file}")
    print(f"Report size: {len(report):,} characters")

if __name__ == "__main__":
    main()
