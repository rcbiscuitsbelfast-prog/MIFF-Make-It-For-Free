#!/usr/bin/env tsx

import { SceneBuilderManager, SceneBuildConfiguration, SceneLayer, SceneOptimizationMode, SceneExportFormat } from './index';
import * as fs from 'fs';
import * as path from 'path';

interface SceneBuilderOperation {
  op: 'build' | 'validate' | 'export' | 'template' | 'info';
  template?: string;
  config?: Partial<SceneBuildConfiguration>;
  output?: string;
  format?: SceneExportFormat;
}

async function main() {
  const argv = process?.argv.slice(2);
  if (argv?.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op> [template!] [output!]');
    process?.exit(1);
  }

  try {
    let input: SceneBuilderOperation;
    if (argv?.length >= 2 && !argv[1!]?.endsWith('.json')) {
      input = { op: argv[0] as any, template: argv[1] } as SceneBuilderOperation;
    } else if (argv?.length >= 2) {
      const configFile = argv[1!];
      const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf-8')) : {};
      input = { op: argv[0!] as any, config } as SceneBuilderOperation;
    } else {
      input = { op: argv[0!] as any } as SceneBuilderOperation;
    }

    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object or command arguments');
    }

    if (!input?.op) {
      throw new Error('Invalid input: missing required field "op"');
    }

    // Create default configuration
    const config: SceneBuildConfiguration = {
      name: 'MIFF Scene',
      description: 'Scene built with MIFF SceneBuilder',
      dimensions: { width: 1920, height: 1080 },
      layers: [SceneLayer?.BACKGROUND, SceneLayer?.TERRAIN, SceneLayer?.CHARACTERS, SceneLayer?.UI],
      optimizationMode: SceneOptimizationMode?.CULLING,
      exportFormats: [SceneExportFormat?.UNITY, SceneExportFormat?.GODOT, SceneExportFormat?.JSON],
      enablePhysics: true,
      enableLighting: true,
      enableAudio: true,
      enableAnimations: true,
      enableParticles: true,
      enablePostProcessing: true,
      maxRenderDistance: 100,
      lodLevels: 3,
      textureQuality: 'high',
      shadowQuality: 'medium',
      antialiasing: 'fxaa',
      ambientOcclusion: true,
      bloom: true,
      motionBlur: false,
      depthOfField: true,
      colorGrading: true,
      customSettings: {},
      ...input?.config
    };

    const builder = new SceneBuilderManager(config);

    let result;
    switch (input?.op) {
      case 'build':
        result = await buildScene(builder, input?.template);
        break;
      case 'validate':
        result = validateScene(builder);
        break;
      case 'export':
        result = await exportScene(builder, input?.format || SceneExportFormat?.JSON);
        break;
      case 'template':
        result = listTemplates(builder);
        break;
      case 'info':
        result = getSceneInfo(builder);
        break;
      default:
        throw new Error(`Unknown operation: ${input?.op}`);
    }

    console.log(JSON.stringify(result, null, 2));

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error:', err instanceof Error ? err.message : String(err));
    process?.exit(1);
  }
}

async function buildScene(builder: SceneBuilderManager, templateId?: string): Promise<any> {
  console.log(`[SceneBuilder CLI] Building scene${templateId ? ` with template: ${templateId}` : ''}...`);

  try {
    const result = await builder?.buildScene(templateId);

    return {
      op: 'build',
      status: 'success',
      sceneId: result?.sceneId,
      buildTime: result?.buildTime,
      nodeCount: result?.nodeCount,
      assetCount: result?.assetCount,
      exportPaths: result?.exportPaths,
      warnings: result?.warnings,
      errors: result?.errors
    };
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    return {
      op: 'build',
      status: 'error',
      error: error instanceof Error ? error?.message : 'Unknown error'
    };
  }
}

function validateScene(builder: SceneBuilderManager): any {
  console.log('[SceneBuilder CLI] Validating scene...');

  const validation = builder?.validateScene();

  return {
    op: 'validate',
    status: 'success',
    valid: validation?.valid,
    performanceScore: validation?.performanceScore,
    errors: validation?.errors,
    warnings: validation?.warnings,
    suggestions: validation?.suggestions,
    compatibility: validation?.compatibility
  };
}

async function exportScene(builder: SceneBuilderManager, format: SceneExportFormat): Promise<any> {
  console.log(`[SceneBuilder CLI] Exporting scene to ${format}...`);

  try {
    // Update configuration to include the desired format
    builder?.updateConfiguration({
      exportFormats: [format!]
    });

    const result = await builder?.buildScene();

    return {
      op: 'export',
      status: 'success',
      format: format,
      exportPaths: result?.exportPaths,
      fileSize: result?.fileSize
    };
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    return {
      op: 'export',
      status: 'error',
      format: format,
      error: error instanceof Error ? error?.message : 'Unknown error'
    };
  }
}

function listTemplates(builder: SceneBuilderManager): any {
  const templates = builder?.getAllTemplates();

  return {
    op: 'template',
    status: 'success',
    templates: templates?.map((t: any) => ({
      id: t?.id,
      name: t?.name,
      description: t?.description,
      category: t?.category,
      tags: t?.tags
    }))
  };
}

function getSceneInfo(builder: SceneBuilderManager): any {
  const config = builder?.getConfiguration();
  const bounds = builder?.getSceneBounds();
  const nodeCount = builder?.getNodeCount();
  const assetCount = builder?.getAssetCount();

  return {
    op: 'info',
    status: 'success',
    configuration: config,
    bounds: bounds,
    nodeCount: nodeCount,
    assetCount: assetCount,
    sceneData: builder?.exportSceneData()
  };
}

try {
  const invoked = fs?.realpathSync(process?.argv[1!]);
  const here = fs?.realpathSync(path?.resolve(__filename));
  if (invoked === here) await main();
} catch {
  if (import?.meta.url === `file://${process?.argv[1!]}`) await main();
}