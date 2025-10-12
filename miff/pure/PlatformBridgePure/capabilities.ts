/**
 * Capability definition for PlatformBridgePure
 * Generated automatically by CapabilityGenerator
 */

export const platformbridgeCapability = {
  "id": "platformbridge",
  "name": "PlatformBridgePure",
  "description": "PlatformBridge module providing core functionality",
  "version": "1.0.0",
  "type": "integration",
  "category": "general",
  "tags": [
    "miff",
    "module",
    "manager",
    "exported",
    "platformbridge"
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
    "hasCLI": false,
    "hasIndex": true
  },
  "status": "active",
  "createdAt": "2025-10-12T10:07:58.196Z",
  "updatedAt": "2025-10-12T10:07:58.196Z"
};

export default platformbridgeCapability;
