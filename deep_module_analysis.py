#!/usr/bin/env python3
"""
DEEP MODULE ANALYSIS
Analyzes each module comprehensively
"""

import os
import re
import subprocess
from pathlib import Path

def analyze_module_deep(module_path):
    """Extremely detailed module analysis"""
    module_name = os.path.basename(module_path)
    
    print(f"\n{'='*80}")
    print(f"DEEP ANALYSIS: {module_name}")
    print(f"{'='*80}\n")
    
    # 1. FILE STRUCTURE
    print("📁 FILE STRUCTURE:")
    for file in sorted(os.listdir(module_path)):
        if file.endswith('.ts'):
            filepath = f"{module_path}/{file}"
            loc = subprocess.run(["wc", "-l", filepath], capture_output=True, text=True)
            loc_count = loc.stdout.split()[0] if loc.returncode == 0 else "?"
            print(f"   - {file}: {loc_count} lines")
    
    # 2. EXPORTS ANALYSIS
    print("\n📦 EXPORTS:")
    index_file = f"{module_path}/index.ts"
    if os.path.exists(index_file):
        with open(index_file, 'r') as f:
            content = f.read()
            
            classes = re.findall(r'export class (\w+)', content)
            interfaces = re.findall(r'export interface (\w+)', content)
            enums = re.findall(r'export enum (\w+)', content)
            functions = re.findall(r'export function (\w+)', content)
            
            if classes:
                print(f"   Classes: {', '.join(classes[:5])}")
            if interfaces:
                print(f"   Interfaces: {len(interfaces)} total")
            if enums:
                print(f"   Enums: {', '.join(enums[:3])}")
            if functions:
                print(f"   Functions: {', '.join(functions[:3])}")
    
    # 3. TEST ANALYSIS
    print("\n🧪 TESTS:")
    test_files = list(Path(module_path).glob("**/*test.ts"))
    if test_files:
        for test_file in test_files:
            print(f"   - {test_file.name}")
            with open(test_file, 'r') as f:
                content = f.read()
                test_count = content.count('it(') + content.count('test(')
                describe_count = content.count('describe(')
                print(f"     {describe_count} suites, {test_count} tests")
    else:
        print("   ⚠️  NO TESTS FOUND")
    
    # 4. DEPENDENCIES
    print("\n🔗 DEPENDENCIES:")
    if os.path.exists(index_file):
        with open(index_file, 'r') as f:
            content = f.read()
            imports = re.findall(r"from ['\"]\.\./([\w/]+)['\"]", content)
            if imports:
                unique_imports = list(set(imports))[:5]
                for imp in unique_imports:
                    print(f"   - {imp}")
            else:
                print("   - Self-contained (no internal deps)")
    
    # 5. COMPLEXITY ANALYSIS
    print("\n📊 COMPLEXITY:")
    total_loc = 0
    for file in Path(module_path).glob("*.ts"):
        if 'test' not in file.name:
            result = subprocess.run(["wc", "-l", str(file)], capture_output=True, text=True)
            if result.returncode == 0:
                total_loc += int(result.stdout.split()[0])
    
    complexity = "Low" if total_loc < 300 else "Medium" if total_loc < 1000 else "High" if total_loc < 2000 else "Very High"
    print(f"   Total LOC: {total_loc}")
    print(f"   Complexity: {complexity}")
    
    # 6. STATUS CHECK
    print("\n✓ STATUS:")
    try:
        result = subprocess.run(
            ["npm", "test", "--", "--testPathPattern", module_name, "--no-coverage"],
            capture_output=True,
            text=True,
            timeout=30,
            cwd="/workspace"
        )
        
        if "PASS " in result.stdout and "FAIL " not in result.stdout:
            print("   ✅ PASSING - Production ready")
        elif "FAIL " in result.stdout:
            # Count failures
            fail_count = result.stdout.count("FAIL ")
            print(f"   ❌ FAILING - {fail_count} test file(s) failing")
            
            # Extract error types
            if "error TS" in result.stdout:
                errors = re.findall(r'error TS\d+: ([^\n]+)', result.stdout)
                if errors:
                    print(f"   Compilation errors: {errors[0][:60]}...")
        else:
            print("   ⚠️  NO TESTS OR TIMEOUT")
    except subprocess.TimeoutExpired:
        print("   ⏱️  TIMEOUT - Tests too slow")
    except Exception as e:
        print(f"   ❓ ERROR - {str(e)[:60]}")
    
    return {
        "name": module_name,
        "total_loc": total_loc,
        "complexity": complexity,
        "test_files": len(test_files)
    }

# Analyze first 20 modules
modules_dir = "/workspace/miff/pure"
modules = [os.path.join(modules_dir, item) for item in sorted(os.listdir(modules_dir))
           if os.path.isdir(os.path.join(modules_dir, item)) and not item.startswith('.')]

results = []
for module_path in modules[:20]:
    result = analyze_module_deep(module_path)
    results.append(result)

print(f"\n{'='*80}")
print("ANALYSIS COMPLETE - First 20 modules")
print(f"{'='*80}\n")
