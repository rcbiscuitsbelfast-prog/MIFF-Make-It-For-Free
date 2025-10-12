/**
 * Capability definition for QuestSystemPure
 * Generated automatically by CapabilityGenerator
 */

export const questsystemCapability = {
  "id": "questsystem",
  "name": "QuestSystemPure",
  "description": "QuestSystem module providing core functionality",
  "version": "1.0.0",
  "type": "core",
  "category": "quest",
  "tags": [
    "miff",
    "module",
    "manager",
    "cli",
    "exported",
    "questsystem"
  ],
  "dependencies": [
    "core-manager",
    "core-logging"
  ],
  "interfaces": [],
  "methods": [
    {
      "name": "initialize",
      "description": "Initialize the module manager",
      "parameters": [],
      "returnType": "Promise<void>",
      "isAsync": true,
      "isPublic": true,
      "examples": [
        "await manager.initialize();"
      ]
    },
    {
      "name": "destroy",
      "description": "Destroy the module manager",
      "parameters": [],
      "returnType": "Promise<void>",
      "isAsync": true,
      "isPublic": true,
      "examples": [
        "await manager.destroy();"
      ]
    }
  ],
  "properties": [
    {
      "name": "isInitialized",
      "type": "boolean",
      "description": "Whether the module is initialized",
      "readOnly": true,
      "defaultValue": false
    }
  ],
  "events": [
    {
      "name": "moduleReady",
      "description": "Module is ready for use",
      "payload": "ModuleInfo",
      "isAsync": true
    }
  ],
  "metadata": {
    "hasManager": true,
    "hasCLI": true,
    "hasIndex": true
  },
  "status": "active",
  "createdAt": "2025-10-12T10:07:58.204Z",
  "updatedAt": "2025-10-12T10:07:58.204Z"
};

export default questsystemCapability;
