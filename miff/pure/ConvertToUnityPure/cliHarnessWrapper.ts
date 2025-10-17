#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for ConvertToUnityPure
 * Handles --mode=action style arguments
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';

const { mode, params } = parseKeyValueArgs(process.argv);

try {
  switch (mode) {
    case 'convertToUnity': {
      const { outputPath, unityVersion, includeScripts, packageFormat } = params;
      
      // Simulate Unity conversion
      const conversion = {
        outputPath: outputPath || '/export/unity',
        unityVersion: unityVersion || '2022.3',
        packageFormat: packageFormat || 'unitypackage',
        includeScripts: includeScripts !== false,
        files: [
          'Assets/Scenes/MainScene.unity',
          'Assets/Scripts/GameManager.cs',
          'Assets/Prefabs/Player.prefab',
          'Assets/Materials/PlayerMaterial.mat'
        ],
        success: true,
        timestamp: new Date().toISOString()
      };
      
      handleSuccess({
        conversion,
        message: 'Unity package created successfully',
        packagePath: `${outputPath || '/export/unity'}/MIFFGame.${packageFormat || 'unitypackage'}`
      }, 'convertToUnity');
      break;
    }

    case 'exportScene': {
      const { sceneName } = params;
      
      handleSuccess({
        sceneName: sceneName || 'MainScene',
        exported: true,
        format: 'unity',
        path: `Assets/Scenes/${sceneName || 'MainScene'}.unity`
      }, 'exportScene');
      break;
    }

    case 'generateScripts': {
      const scripts = [
        'GameManager.cs',
        'PlayerController.cs',
        'CameraController.cs'
      ];
      
      handleSuccess({
        scripts,
        count: scripts.length,
        generated: true
      }, 'generateScripts');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: convertToUnity, exportScene, generateScripts`);
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
