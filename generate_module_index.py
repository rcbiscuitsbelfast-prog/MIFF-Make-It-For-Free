#!/usr/bin/env python3
"""Generate comprehensive MODULE_INDEX.md"""

import json
import os
from pathlib import Path

def read_module_description(module_path):
    """Extract description from index.ts or Manager.ts"""
    for filename in ['index.ts', 'Manager.ts']:
        filepath = f"{module_path}/{filename}"
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r') as f:
                    lines = f.readlines()[:50]  # First 50 lines
                    desc_lines = []
                    in_comment = False
                    for line in lines:
                        line = line.strip()
                        if line.startswith('/**'):
                            in_comment = True
                        elif in_comment:
                            if line.startswith('*/'):
                                break
                            if line.startswith('*'):
                                clean = line[1:].strip()
                                if clean and not clean.startswith('@'):
                                    desc_lines.append(clean)
                    return ' '.join(desc_lines[:3]) if desc_lines else "No description"
            except:
                pass
    return "No description available"

def get_key_exports(module_path):
    """Get key exports from index.ts"""
    index_file = f"{module_path}/index.ts"
    if not os.path.exists(index_file):
        return []
    
    try:
        with open(index_file, 'r') as f:
            content = f.read()
            exports = []
            for line in content.split('\n')[:100]:
                if 'export class ' in line:
                    class_name = line.split('export class ')[1].split()[0].split('{')[0]
                    exports.append(f"class {class_name}")
                elif 'export interface ' in line:
                    interface_name = line.split('export interface ')[1].split()[0].split('{')[0]
                    exports.append(f"interface {interface_name}")
                elif 'export enum ' in line:
                    enum_name = line.split('export enum ')[1].split()[0].split('{')[0]
                    exports.append(f"enum {enum_name}")
            return exports[:5]  # Top 5
    except:
        return []

def main():
    # Load analysis
    with open('/workspace/MODULE_ANALYSIS_RAW.json', 'r') as f:
        analysis_data = json.load(f)
    
    # Generate markdown
    md = "# MIFF Framework - Comprehensive Module Index\n\n"
    md += f"**Total Modules:** {len(analysis_data)}\n"
    md += f"**Analysis Date:** 2025-10-16\n\n"
    md += "---\n\n"
    
    # Summary stats
    passing = sum(1 for m in analysis_data if m.get("tests", {}).get("status") == "passing")
    failing = sum(1 for m in analysis_data if m.get("tests", {}).get("status") == "failing")
    no_tests = sum(1 for m in analysis_data if not m.get("code_metrics", {}).get("has_tests"))
    
    md += "## Summary Statistics\n\n"
    md += f"- **Passing Tests:** {passing} modules\n"
    md += f"- **Failing Tests:** {failing} modules\n"
    md += f"- **No Tests:** {no_tests} modules\n"
    md += f"- **Test Coverage:** {((passing + failing) / len(analysis_data) * 100):.1f}%\n\n"
    md += "---\n\n"
    
    # Individual modules
    md += "## Module Details\n\n"
    
    for module in analysis_data:
        name = module["name"]
        path = module["path"]
        
        md += f"### {name}\n\n"
        
        # Description
        desc = read_module_description(path)
        md += f"**Description:** {desc}\n\n"
        
        # Structure
        struct = module["structure"]
        md += f"**Pattern:** {struct['pattern']}\n"
        md += f"**Components:**\n"
        if struct["has_index"]:
            md += f"- ✅ index.ts ({module['code_metrics'].get('index_loc', 0)} LOC)\n"
        if struct["has_manager"]:
            md += f"- ✅ Manager.ts ({module['code_metrics'].get('manager_loc', 0)} LOC)\n"
        if struct["has_cli_harness"]:
            md += f"- ✅ CLI Harness\n"
        if struct["has_readme"]:
            md += f"- ✅ README.md\n"
        md += "\n"
        
        # Exports
        exports = get_key_exports(path)
        if exports:
            md += f"**Key Exports:** {', '.join(exports)}\n\n"
        
        # Tests
        tests = module.get("tests", {})
        metrics = module.get("code_metrics", {})
        
        if metrics.get("has_tests"):
            test_status = tests.get("status", "unknown")
            status_emoji = "✅" if test_status == "passing" else "❌" if test_status == "failing" else "⚠️"
            md += f"**Test Status:** {status_emoji} {test_status.upper()}\n"
            md += f"**Test Files:** {metrics.get('test_files', 0)}\n"
            if "summary" in tests:
                md += f"**Test Results:** {tests['summary']}\n"
        else:
            md += f"**Test Status:** ⚠️ NO TESTS\n"
        
        md += "\n"
        
        # Status assessment
        md += f"**Status Assessment:**\n"
        if test_status == "passing":
            md += "- ✅ **PRODUCTION READY** - Tests passing, implementation verified\n"
        elif test_status == "failing":
            md += "- ⚠️ **NEEDS WORK** - Tests failing, requires fixes\n"
        elif not metrics.get("has_tests"):
            md += "- 📝 **NEEDS TESTS** - Implementation exists, tests needed\n"
        else:
            md += "- ❓ **STATUS UNKNOWN** - Requires investigation\n"
        
        md += "\n---\n\n"
    
    # Write to file
    with open('/workspace/MODULE_INDEX_DETAILED.md', 'w') as f:
        f.write(md)
    
    print("Generated MODULE_INDEX_DETAILED.md")

if __name__ == "__main__":
    main()
