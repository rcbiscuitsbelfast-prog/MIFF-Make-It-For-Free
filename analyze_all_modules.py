#!/usr/bin/env python3
"""
Comprehensive Module Analysis Script
Analyzes each MIFF module in depth
"""

import os
import json
import subprocess
from pathlib import Path

def analyze_module(module_path):
    """Deep analysis of a single module"""
    module_name = os.path.basename(module_path)
    
    analysis = {
        "name": module_name,
        "path": module_path,
        "structure": {},
        "code_metrics": {},
        "tests": {},
        "exports": {},
        "dependencies": {},
        "status": {},
        "issues": []
    }
    
    # Check structure
    has_index = os.path.exists(f"{module_path}/index.ts")
    has_manager = os.path.exists(f"{module_path}/Manager.ts")
    has_cli = os.path.exists(f"{module_path}/cliHarness.ts")
    has_readme = os.path.exists(f"{module_path}/README.md")
    
    analysis["structure"] = {
        "has_index": has_index,
        "has_manager": has_manager,
        "has_cli_harness": has_cli,
        "has_readme": has_readme,
        "pattern": "Manager" if has_manager else "Direct" if has_index else "Unknown"
    }
    
    # Count files
    ts_files = list(Path(module_path).glob("*.ts"))
    test_files = list(Path(module_path).glob("**/*test.ts"))
    
    analysis["code_metrics"] = {
        "total_files": len(ts_files),
        "test_files": len(test_files),
        "has_tests": len(test_files) > 0
    }
    
    # Get LOC
    if has_index:
        try:
            result = subprocess.run(
                ["wc", "-l", f"{module_path}/index.ts"],
                capture_output=True,
                text=True
            )
            loc = int(result.stdout.split()[0]) if result.returncode == 0 else 0
            analysis["code_metrics"]["index_loc"] = loc
        except:
            analysis["code_metrics"]["index_loc"] = 0
    
    if has_manager:
        try:
            result = subprocess.run(
                ["wc", "-l", f"{module_path}/Manager.ts"],
                capture_output=True,
                text=True
            )
            loc = int(result.stdout.split()[0]) if result.returncode == 0 else 0
            analysis["code_metrics"]["manager_loc"] = loc
        except:
            analysis["code_metrics"]["manager_loc"] = 0
    
    # Check exports
    if has_index:
        try:
            with open(f"{module_path}/index.ts", 'r') as f:
                content = f.read()
                export_count = content.count('export ')
                has_default = 'export default' in content
                has_namespace = 'export namespace' in content
                has_reexport = 'export *' in content or 'export {' in content
                
                analysis["exports"] = {
                    "export_count": export_count,
                    "has_default_export": has_default,
                    "has_namespace": has_namespace,
                    "has_reexport": has_reexport
                }
        except:
            pass
    
    # Test status
    if test_files:
        analysis["tests"]["test_files"] = [str(f.name) for f in test_files]
        
        # Try to run tests
        test_pattern = module_name
        try:
            result = subprocess.run(
                ["npm", "test", "--", "--testPathPattern", test_pattern, "--no-coverage"],
                capture_output=True,
                text=True,
                timeout=30,
                cwd="/workspace"
            )
            
            output = result.stdout + result.stderr
            
            # Parse results
            has_pass = "PASS " in output
            has_fail = "FAIL " in output
            
            analysis["tests"]["status"] = "passing" if has_pass and not has_fail else "failing" if has_fail else "no_tests_run"
            analysis["tests"]["exit_code"] = result.returncode
            
            # Extract test counts
            for line in output.split('\n'):
                if 'Tests:' in line:
                    analysis["tests"]["summary"] = line.strip()
                    break
                    
        except subprocess.TimeoutExpired:
            analysis["tests"]["status"] = "timeout"
        except Exception as e:
            analysis["tests"]["status"] = "error"
            analysis["tests"]["error"] = str(e)
    
    return analysis

def main():
    modules_dir = "/workspace/miff/pure"
    
    # Get all module directories
    modules = []
    for item in sorted(os.listdir(modules_dir)):
        item_path = os.path.join(modules_dir, item)
        if os.path.isdir(item_path) and not item.startswith('.'):
            modules.append(item_path)
    
    print(f"Found {len(modules)} modules to analyze")
    
    results = []
    for i, module_path in enumerate(modules[:20]):  # First 20 for speed
        print(f"Analyzing {i+1}/20: {os.path.basename(module_path)}...")
        analysis = analyze_module(module_path)
        results.append(analysis)
    
    # Save results
    with open('/workspace/MODULE_ANALYSIS_RAW.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nAnalysis complete. Results saved to MODULE_ANALYSIS_RAW.json")
    
    # Print summary
    passing = sum(1 for r in results if r.get("tests", {}).get("status") == "passing")
    failing = sum(1 for r in results if r.get("tests", {}).get("status") == "failing")
    no_tests = sum(1 for r in results if not r.get("code_metrics", {}).get("has_tests"))
    
    print(f"\nSummary:")
    print(f"  Passing: {passing}")
    print(f"  Failing: {failing}")
    print(f"  No tests: {no_tests}")

if __name__ == "__main__":
    main()
