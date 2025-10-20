#!/usr/bin/env python3
"""
FULL REPOSITORY ANALYSIS
Analyzes ALL MIFF modules comprehensively
"""

import os
import json
import subprocess
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def get_file_loc(filepath):
    """Get lines of code for a file"""
    try:
        result = subprocess.run(
            ["wc", "-l", filepath],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return int(result.stdout.split()[0])
    except:
        pass
    return 0

def read_file_header(filepath, lines=30):
    """Read first N lines of a file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return [next(f, '') for _ in range(lines)]
    except:
        return []

def extract_description(filepath):
    """Extract description from file header comments"""
    lines = read_file_header(filepath, 50)
    desc_lines = []
    in_comment = False
    
    for line in lines:
        line = line.strip()
        if line.startswith('/**'):
            in_comment = True
            continue
        elif line.startswith('*/'):
            break
        elif in_comment and line.startswith('*'):
            clean = line[1:].strip()
            if clean and not clean.startswith('@'):
                desc_lines.append(clean)
    
    return ' '.join(desc_lines[:5]) if desc_lines else None

def extract_exports(filepath):
    """Extract key exports from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        exports = {
            'classes': re.findall(r'export class (\w+)', content),
            'interfaces': re.findall(r'export interface (\w+)', content),
            'enums': re.findall(r'export enum (\w+)', content),
            'functions': re.findall(r'export function (\w+)', content),
            'types': re.findall(r'export type (\w+)', content),
        }
        
        return exports
    except:
        return {'classes': [], 'interfaces': [], 'enums': [], 'functions': [], 'types': []}

def count_tests_in_file(filepath):
    """Count test cases in a test file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            test_count = content.count('it(') + content.count('test(')
            describe_count = content.count('describe(')
            return {'tests': test_count, 'suites': describe_count}
    except:
        return {'tests': 0, 'suites': 0}

def run_module_tests(module_name, timeout=45):
    """Run tests for a specific module"""
    try:
        result = subprocess.run(
            ["npm", "test", "--", "--testPathPattern", module_name, "--no-coverage"],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd="/workspace"
        )
        
        output = result.stdout + result.stderr
        
        # Parse results
        has_pass = "PASS " in output
        has_fail = "FAIL " in output
        
        status = "passing" if has_pass and not has_fail else \
                 "failing" if has_fail else \
                 "no_run"
        
        # Extract test summary
        summary = None
        for line in output.split('\n'):
            if 'Tests:' in line:
                summary = line.strip()
                break
        
        # Extract compilation errors
        errors = re.findall(r'error TS\d+: ([^\n]+)', output)
        
        return {
            'status': status,
            'exit_code': result.returncode,
            'summary': summary,
            'errors': errors[:3] if errors else [],
            'has_compilation_errors': 'error TS' in output
        }
    except subprocess.TimeoutExpired:
        return {'status': 'timeout', 'timeout': timeout}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def analyze_module(module_path):
    """Comprehensive analysis of a single module"""
    module_name = os.path.basename(module_path)
    
    print(f"  Analyzing {module_name}...")
    
    analysis = {
        'name': module_name,
        'path': module_path,
        'files': {},
        'structure': {},
        'code_metrics': {},
        'exports': {},
        'tests': {},
        'description': None,
        'issues': []
    }
    
    # Check structure
    has_index = os.path.exists(f"{module_path}/index.ts")
    has_manager = os.path.exists(f"{module_path}/Manager.ts")
    has_cli = os.path.exists(f"{module_path}/cliHarness.ts")
    has_readme = os.path.exists(f"{module_path}/README.md")
    
    analysis['structure'] = {
        'has_index': has_index,
        'has_manager': has_manager,
        'has_cli_harness': has_cli,
        'has_readme': has_readme,
        'pattern': 'Manager' if has_manager else 'Direct' if has_index else 'Unknown'
    }
    
    # Analyze files
    ts_files = list(Path(module_path).glob("*.ts"))
    test_files = list(Path(module_path).glob("**/*test.ts"))
    
    total_loc = 0
    for ts_file in ts_files:
        if 'test' not in ts_file.name.lower():
            loc = get_file_loc(str(ts_file))
            total_loc += loc
            analysis['files'][ts_file.name] = loc
    
    analysis['code_metrics'] = {
        'total_files': len(ts_files),
        'test_files': len(test_files),
        'total_loc': total_loc,
        'has_tests': len(test_files) > 0,
        'complexity': 'Low' if total_loc < 300 else 
                      'Medium' if total_loc < 1000 else 
                      'High' if total_loc < 2000 else 
                      'Very High'
    }
    
    # Get description
    if has_index:
        analysis['description'] = extract_description(f"{module_path}/index.ts")
    elif has_manager:
        analysis['description'] = extract_description(f"{module_path}/Manager.ts")
    
    # Get exports
    if has_index:
        analysis['exports'] = extract_exports(f"{module_path}/index.ts")
    
    # Analyze tests
    if test_files:
        analysis['tests']['files'] = []
        total_tests = 0
        for test_file in test_files:
            counts = count_tests_in_file(str(test_file))
            total_tests += counts['tests']
            analysis['tests']['files'].append({
                'name': test_file.name,
                'tests': counts['tests'],
                'suites': counts['suites']
            })
        analysis['tests']['total_test_count'] = total_tests
    
    # Run tests (with timeout to avoid hanging)
    if len(test_files) > 0:
        test_result = run_module_tests(module_name, timeout=30)
        analysis['tests'].update(test_result)
    
    return analysis

def main():
    print("="*70)
    print("FULL MIFF REPOSITORY ANALYSIS")
    print("="*70)
    
    modules_dir = "/workspace/miff/pure"
    
    # Get all module directories
    modules = []
    for item in sorted(os.listdir(modules_dir)):
        item_path = os.path.join(modules_dir, item)
        if os.path.isdir(item_path) and not item.startswith('.'):
            modules.append(item_path)
    
    print(f"\nFound {len(modules)} modules to analyze")
    print("This will take 15-30 minutes...\n")
    
    start_time = time.time()
    
    # Analyze modules sequentially (parallel might overload)
    results = []
    for i, module_path in enumerate(modules):
        print(f"[{i+1}/{len(modules)}] {os.path.basename(module_path)}")
        try:
            analysis = analyze_module(module_path)
            results.append(analysis)
        except Exception as e:
            print(f"  ERROR: {e}")
            results.append({
                'name': os.path.basename(module_path),
                'path': module_path,
                'error': str(e)
            })
    
    elapsed = time.time() - start_time
    
    # Save results
    output_file = '/workspace/FULL_MODULE_ANALYSIS.json'
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*70}")
    print(f"ANALYSIS COMPLETE in {elapsed/60:.1f} minutes")
    print(f"{'='*70}\n")
    
    # Generate summary statistics
    total = len(results)
    with_tests = sum(1 for r in results if r.get('code_metrics', {}).get('has_tests'))
    passing = sum(1 for r in results if r.get('tests', {}).get('status') == 'passing')
    failing = sum(1 for r in results if r.get('tests', {}).get('status') == 'failing')
    no_tests = total - with_tests
    compilation_errors = sum(1 for r in results if r.get('tests', {}).get('has_compilation_errors'))
    
    total_loc = sum(r.get('code_metrics', {}).get('total_loc', 0) for r in results)
    
    print(f"Summary Statistics:")
    print(f"  Total Modules: {total}")
    print(f"  Total LOC: {total_loc:,}")
    print(f"  Average LOC/module: {total_loc//total if total else 0}")
    print(f"")
    print(f"  With Tests: {with_tests} ({with_tests/total*100:.1f}%)")
    print(f"  Without Tests: {no_tests} ({no_tests/total*100:.1f}%)")
    print(f"")
    print(f"  Tests Passing: {passing} ({passing/total*100:.1f}%)")
    print(f"  Tests Failing: {failing} ({failing/total*100:.1f}%)")
    print(f"  No Tests Run: {total - passing - failing}")
    print(f"")
    print(f"  Compilation Errors: {compilation_errors} ({compilation_errors/total*100:.1f}%)")
    print(f"")
    print(f"Results saved to: {output_file}")

if __name__ == "__main__":
    main()
