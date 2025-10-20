#!/usr/bin/env python3
import json

failures = {
    "SavePure": {
        "error": "Property 'create' does not exist",
        "test_expects": "SavePure.create(), SavePure.save(), SavePure.load()",
        "module_has": "SaveSystem class, SaveSnapshot, SaveManager",
        "module_loc": 1415,
        "test_loc": 96
    },
    "SimpleGamePure": {
        "error": "Property 'create' does not exist",
        "test_expects": "SimpleGamePure.create(), .update(), .getState()",
        "module_has": "SimpleGame abstract class, SimpleGameBuilder",
        "module_loc": 549,
        "test_loc": 73
    },
    "AudioPure": {
        "error": "Type 'Date' not assignable to 'number'",
        "test_expects": "AudioPure static API",
        "module_has": "AudioSystem class with timestamp issues",
        "module_loc": 831,
        "test_loc": 433
    },
    "InputSystemPure": {
        "error": "Type 'Date' not assignable to 'number'",
        "test_expects": "InputSystemManager with number timestamps",
        "module_has": "InputSystemManager with Date timestamps in test",
        "module_loc": 669,
        "test_loc": 421
    },
    "PhysicsPure": {
        "error": "Module has no exported member 'capabilities'",
        "test_expects": "capabilities class",
        "module_has": "PhysicsSystem, capabilities.ts file",
        "module_loc": 829,
        "test_loc": 27
    },
    "InventoryPure": {
        "error": "Module has no exported member 'runCLICommand'",
        "test_expects": "CLI test infrastructure",
        "module_has": "InventorySystem Manager",
        "module_loc": 745,
        "test_loc": 83
    },
    "DialoguePure": {
        "error": "Variable 'nextNodeId' used before assigned",
        "test_expects": "DialogueEngine with proper flow",
        "module_has": "DialogueEngine with logic bug",
        "module_loc": 741,
        "test_loc": 20
    },
    "CombatCorePure": {
        "error": "CLI harness missing 'CombatEngine' export",
        "test_expects": "CLI test with CombatEngine",
        "module_has": "CombatCore namespace, no CombatEngine",
        "module_loc": 1204,
        "test_loc": 12
    },
    "NPCsPure": {
        "error": "CLI harness path errors, worker killed",
        "test_expects": "CLI test infrastructure",
        "module_has": "NPCSystem Manager",
        "module_loc": 946,
        "test_loc": 160
    },
    "PathfindingPure": {
        "error": "Property 'schema' does not exist on type 'string'",
        "test_expects": "PathfindingManager with complex result types",
        "module_has": "PathfindingManager with union types",
        "module_loc": 889,
        "test_loc": 289
    },
    "ProgressionPure": {
        "error": "Property 'previousLevel' does not exist on type 'Event'",
        "test_expects": "Events with specific data properties",
        "module_has": "Generic Event type",
        "module_loc": 1063,
        "test_loc": 545
    },
    "EquipmentPure": {
        "error": "'items' does not exist in result type, worker killed",
        "test_expects": "CLI test with specific result structure",
        "module_has": "EquipmentManager with different result type",
        "module_loc": 982,
        "test_loc": 32
    },
    "FusionPure": {
        "error": "Property 'spiritAId' does not exist on type 'Event'",
        "test_expects": "Events with fusion-specific properties",
        "module_has": "Generic Event type",
        "module_loc": 642,
        "test_loc": 446
    },
    "ModdingPure": {
        "error": "Module has no exported member 'runCLICommand'",
        "test_expects": "CLI test infrastructure",
        "module_has": "ModdingSystem",
        "module_loc": 615,
        "test_loc": 136
    },
    "SyncPure": {
        "error": "Missing exports, syntax errors line 881",
        "test_expects": "SyncManager with specific types",
        "module_has": "SyncManager but test has syntax error",
        "module_loc": 1298,
        "test_loc": 881
    },
    "LogPure": {
        "error": "Passes but DialogPure adjacent test fails",
        "test_expects": "LogPure golden test",
        "module_has": "Logger system",
        "module_loc": 447,
        "test_loc": 0
    },
    "SessionManifestPure": {
        "error": "Variable 'message' cannot find name",
        "test_expects": "SessionManifestManager",
        "module_has": "SessionManifestManager with source bug (FIXED)",
        "module_loc": 332,
        "test_loc": 218
    },
    "RenderWorldPure": {
        "error": "Property 'setCamera' does not exist",
        "test_expects": "RenderWorldPure.setCamera() static",
        "module_has": "RenderWorldPure class",
        "module_loc": 285,
        "test_loc": 78
    },
    "SlicePure": {
        "error": "Module has no exported member 'windowData'",
        "test_expects": "windowData function",
        "module_has": "SlicePure, createDataSlice, sliceData",
        "module_loc": 169,
        "test_loc": 60
    },
    "AudioMixerPure": {
        "error": "Module has no default export",
        "test_expects": "AudioMixer named export",
        "module_has": "AudioMixer default export",
        "module_loc": 318,
        "test_loc": 72
    },
    "ButtonStylePure": {
        "error": "Module has no exported member 'applyTheme'",
        "test_expects": "applyTheme function",
        "module_has": "ButtonStylePure, createButtonStyle",
        "module_loc": 181,
        "test_loc": 57
    },
    "CreaturesPure": {
        "error": "Cannot find module './index'",
        "test_expects": "CreaturesPure from index",
        "module_has": "No index.ts file",
        "module_loc": 0,
        "test_loc": 90
    }
}

# Categorize
categories = {
    "REWRITE_TEST_SIMPLE": [],
    "REWRITE_TEST_MODERATE": [],
    "REWRITE_API_SIMPLE": [],
    "REWRITE_API_MODERATE": [],
    "FIX_SOURCE_BUG": [],
    "DELETE_TEST": []
}

for name, data in failures.items():
    test_loc = data["test_loc"]
    module_loc = data["module_loc"]
    error = data["error"]
    
    # Simple test rewrites
    if "CLI" in error or "runCLICommand" in error:
        categories["DELETE_TEST"].append(name)
    elif "missing" in error or "does not exist" in data["test_expects"].lower() or module_loc == 0:
        categories["DELETE_TEST"].append(name)
    elif "Type 'Date'" in error or "timestamp" in error.lower():
        categories["FIX_SOURCE_BUG"].append(name)
    elif test_loc < 100:
        categories["REWRITE_TEST_SIMPLE"].append(name)
    elif "Event" in error and "property" in error.lower():
        categories["REWRITE_TEST_MODERATE"].append(name)
    elif module_loc < 500 and test_loc < 200:
        categories["REWRITE_API_SIMPLE"].append(name)
    else:
        categories["REWRITE_TEST_MODERATE"].append(name)

print(json.dumps(categories, indent=2))
