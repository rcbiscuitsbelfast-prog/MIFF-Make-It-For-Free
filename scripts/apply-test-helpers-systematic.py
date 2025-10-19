#!/usr/bin/env python3
"""
Systematically apply test helpers to all Manager.test.ts files

This script:
1. Finds all Manager.test.ts files
2. Detects domain-specific method names
3. Adds ManagerTestHelpers import
4. Adds helper setup in beforeEach
5. Unskips item-related tests
"""

import os
import re
import sys

# Known manager method mappings
KNOWN_MAPPINGS = {
    'APIGatewayManager': {
        'create': 'createGateway',
        'get': 'getGateway',
        'update': 'updateGateway',
        'delete': 'deleteGateway',
        'getAll': 'getAllGateways'
    },
    'StateManager': {
        'create': 'createState',
        'get': 'getState',
        'update': 'updateState',
        'delete': 'deleteState',
        'getAll': 'getAllStates'
    },
    'CacheManager': {
        'create': 'set',
        'get': 'get',
        'update': 'set',
        'delete': 'delete',
        'getAll': 'getAll'
    },
}

def detect_manager_methods(content):
    """Auto-detect domain-specific CRUD methods in Manager.ts"""
    methods = {
        'create': None,
        'get': None,
        'update': None,
        'delete': None,
        'getAll': None
    }
    
    # Look for method patterns
    create_match = re.search(r'\b(create|add)\w+\s*\(', content)
    if create_match:
        methods['create'] = create_match.group(0).split('(')[0].strip()
    
    get_match = re.search(r'\b(get(?!All)|find|fetch)\w+\s*\([^)]*\bid\b', content)
    if get_match:
        methods['get'] = get_match.group(0).split('(')[0].strip()
    
    update_match = re.search(r'\b(update|modify|set)\w+\s*\([^)]*\bid\b', content)
    if update_match:
        methods['update'] = update_match.group(0).split('(')[0].strip()
    
    delete_match = re.search(r'\b(delete|remove|destroy)\w+\s*\([^)]*\bid\b', content)
    if delete_match:
        methods['delete'] = delete_match.group(0).split('(')[0].strip()
    
    getall_match = re.search(r'\b(getAll|listAll|findAll)\w+\s*\(', content)
    if getall_match:
        methods['getAll'] = getall_match.group(0).split('(')[0].strip()
    
    return methods

def apply_helpers_to_test(test_filepath):
    """Apply test helpers to a Manager.test.ts file"""
    try:
        # Read test file
        with open(test_filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has helpers
        if 'ManagerTestHelpers' in content:
            return 'already_has_helpers'
        
        # Skip if no skipped item tests
        if 'it.skip' not in content or ('createItem' not in content and 'getItem' not in content):
            return 'no_skipped_tests'
        
        # Get manager class name
        manager_match = re.search(r"from ['\"]\.\/Manager['\"];\n\ndescribe\(['\"](\w+)['\"]", content)
        if not manager_match:
            return 'no_manager_class'
        
        manager_class = manager_match.group(1)
        
        # Get manager implementation file
        manager_dir = os.path.dirname(test_filepath)
        manager_file = os.path.join(manager_dir, 'Manager.ts')
        
        # Try to detect methods from implementation
        methods = None
        if os.path.exists(manager_file):
            try:
                with open(manager_file, 'r', encoding='utf-8') as f:
                    manager_content = f.read()
                methods = detect_manager_methods(manager_content)
            except:
                pass
        
        # Use known mapping if available, otherwise use detected methods
        if manager_class in KNOWN_MAPPINGS:
            methods = KNOWN_MAPPINGS[manager_class]
        elif not methods or not any(methods.values()):
            # Fallback: guess from manager name
            base = manager_class.replace('Manager', '')
            methods = {
                'create': f'create{base}',
                'get': f'get{base}',
                'update': f'update{base}',
                'delete': f'delete{base}',
                'getAll': f'getAll{base}s'
            }
        
        # Skip if no valid methods detected
        if not any(methods.values()):
            return 'no_methods_detected'
        
        # Add import
        import_statement = "import { addGenericItemMethods } from '../shared/testing/ManagerTestHelpers';"
        manager_import = re.search(r"import \{[^}]+\} from ['\"]\.\/Manager['\"];", content)
        if manager_import:
            insert_pos = manager_import.end()
            content = content[:insert_pos] + '\n' + import_statement + content[insert_pos:]
        
        # Add helper call in beforeEach
        helper_code = f'''    
    // Add generic item methods as aliases to domain-specific methods
    addGenericItemMethods(manager, {{
      create: '{methods['create'] or ''}',
      get: '{methods['get'] or ''}',
      update: '{methods['update'] or ''}',
      delete: '{methods['delete'] or ''}',
      getAll: '{methods['getAll'] or ''}'
    }});'''
        
        # Find beforeEach and insert helper
        beforeeach_match = re.search(r'(await manager\.initialize\(\);)', content)
        if beforeeach_match:
            insert_pos = beforeeach_match.end()
            content = content[:insert_pos] + helper_code + content[insert_pos:]
        else:
            return 'no_beforeeach'
        
        # Unskip item-related tests
        content = re.sub(
            r"it\.skip\((['\"])([^'\"]*)(createItem|getItem|updateItem|deleteItem|getAllItems)([^'\"]*)\1",
            r"it(\1\2\3\4\1",
            content
        )
        
        # Remove PENDING messages
        content = re.sub(r' - PENDING: \w+\(\) not implemented', '', content)
        
        # Write back
        with open(test_filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return 'success'
        
    except Exception as e:
        return f'error: {str(e)}'

def main():
    """Apply helpers to all Manager.test.ts files"""
    
    # Find all Manager.test.ts files
    test_files = []
    for root, dirs, files in os.walk('miff/pure'):
        if 'Manager.test.ts' in files:
            test_files.append(os.path.join(root, 'Manager.test.ts'))
    
    print(f"Found {len(test_files)} Manager.test.ts files")
    print("=" * 70)
    
    results = {
        'success': 0,
        'already_has_helpers': 0,
        'no_skipped_tests': 0,
        'no_manager_class': 0,
        'no_methods_detected': 0,
        'no_beforeeach': 0,
        'error': 0
    }
    
    for filepath in sorted(test_files):
        module = os.path.basename(os.path.dirname(filepath))
        result = apply_helpers_to_test(filepath)
        
        if result == 'success':
            print(f"✅ {module:<35} Applied helpers")
            results['success'] += 1
        elif result == 'already_has_helpers':
            print(f"⏭️  {module:<35} Already has helpers")
            results['already_has_helpers'] += 1
        elif result == 'no_skipped_tests':
            print(f"⏭️  {module:<35} No item tests to unskip")
            results['no_skipped_tests'] += 1
        elif result == 'no_manager_class':
            print(f"⚠️  {module:<35} Cannot detect manager class")
            results['no_manager_class'] += 1
        elif result == 'no_methods_detected':
            print(f"⚠️  {module:<35} Cannot detect CRUD methods")
            results['no_methods_detected'] += 1
        elif result == 'no_beforeeach':
            print(f"⚠️  {module:<35} No beforeEach found")
            results['no_beforeeach'] += 1
        elif result.startswith('error'):
            print(f"❌ {module:<35} {result}")
            results['error'] += 1
    
    print("\n" + "=" * 70)
    print(f"RESULTS:")
    print(f"  ✅ Successfully applied: {results['success']}")
    print(f"  ⏭️  Already had helpers:  {results['already_has_helpers']}")
    print(f"  ⏭️  No tests to unskip:   {results['no_skipped_tests']}")
    print(f"  ⚠️  Skipped (no class):   {results['no_manager_class']}")
    print(f"  ⚠️  Skipped (no methods): {results['no_methods_detected']}")
    print(f"  ⚠️  Skipped (no setup):   {results['no_beforeeach']}")
    print(f"  ❌ Errors:               {results['error']}")
    print(f"\n  Total processed: {len(test_files)}")
    
    if results['success'] > 0:
        print(f"\n✨ Applied test helpers to {results['success']} Manager test files!")

if __name__ == '__main__':
    main()
