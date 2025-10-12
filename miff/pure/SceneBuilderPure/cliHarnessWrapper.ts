#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for SceneBuilderPure
 * Adds missing operation: buildScene
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { SceneBuilder, Scene, SceneObject } from './Builder';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';

const { mode, params } = parseKeyValueArgs(process.argv);
const builder = new SceneBuilder();

try {
  switch (mode) {
    case 'buildScene': {
      const { sceneId, type, dimensions, procedural } = params;
      
      const dims = typeof dimensions === 'string' ? SafeJSONParser.parse(dimensions) : dimensions || { width: 100, height: 100 };
      
      const scene: Scene = {
        id: sceneId || 'scene_001',
        name: sceneId || 'New Scene',
        type: type || 'puzzle',
        dimensions: dims,
        objects: [],
        procedural: procedural === true || procedural === 'true'
      };
      
      // Add sample objects
      if (scene.procedural) {
        scene.objects = [
          { id: 'floor', type: 'ground', position: { x: 0, y: 0, z: 0 } },
          { id: 'wall_north', type: 'wall', position: { x: 0, y: 0, z: dims.height / 2 } },
          { id: 'wall_south', type: 'wall', position: { x: 0, y: 0, z: -dims.height / 2 } },
          { id: 'wall_east', type: 'wall', position: { x: dims.width / 2, y: 0, z: 0 } },
          { id: 'wall_west', type: 'wall', position: { x: -dims.width / 2, y: 0, z: 0 } },
          { id: 'puzzle_element', type: 'interactive', position: { x: 0, y: 1, z: 0 } }
        ];
      }
      
      builder.createScene(scene);
      
      handleSuccess({
        scene,
        objectCount: scene.objects.length,
        built: true
      }, 'buildScene');
      break;
    }

    case 'addObject': {
      const { sceneId, objectId, objectType, position } = params;
      const pos = typeof position === 'string' ? SafeJSONParser.parse(position) : position || { x: 0, y: 0, z: 0 };
      const obj: SceneObject = {
        id: objectId || 'object_001',
        type: objectType || 'prop',
        position: pos
      };
      builder.addObject(sceneId || 'scene_001', obj);
      handleSuccess({ sceneId, object: obj, added: true }, 'addObject');
      break;
    }

    case 'listScenes': {
      const scenes = builder.getAllScenes();
      handleSuccess({ scenes, count: scenes.length }, 'listScenes');
      break;
    }

    case 'getScene': {
      const { sceneId } = params;
      const scene = builder.getScene(sceneId || 'scene_001');
      handleSuccess({ scene }, 'getScene');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: buildScene, addObject, listScenes, getScene`);
  }
} catch (error) {
  handleError(error);
}
