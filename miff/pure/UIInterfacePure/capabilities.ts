/**
 * Capability definition for UIInterfacePure
 * Generated automatically by CapabilityGenerator
 */

export const uiinterfaceCapability = {
  "id": "uiinterface",
  "name": "UIInterfacePure",
  "description": "UIInterface module providing core functionality",
  "version": "1.0.0",
  "type": "feature",
  "category": "interface",
  "tags": [
    "miff",
    "module",
    "manager",
    "uiinterface"
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
    "hasIndex": false
  },
  "status": "active",
  "createdAt": "2025-10-12T10:07:58.266Z",
  "updatedAt": "2025-10-12T10:07:58.266Z"
};

export default uiinterfaceCapability;
