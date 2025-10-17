#!/usr/bin/env tsx

import { PixelGenPure, PixelAsset, PixelGenPreset, RgbHex } from './index';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface PixelGenOperation {
  op: 'generate' | 'list-presets' | 'create-preset' | 'demo' | 'dump';
  preset?: string;
  seed?: number;
  count?: number;
  name?: string;
  style?: string;
  width?: number;
  height?: number;
  colors?: RgbHex[];
  patterns?: string[];
  exportFormat?: string;
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: PixelGenOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as PixelGenOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'generate':
          if (!argv[1]) throw new Error('generate requires preset name');
          operation = { 
            op: 'generate', 
            preset: argv[1],
            seed: parseInt(argv[2]) || 12345,
            count: parseInt(argv[3]) || 1
          };
          break;
        case 'list-presets':
          operation = { op: 'list-presets' };
          break;
        case 'create-preset':
          if (!argv[1] || !argv[2] || !argv[3] || !argv[4]) {
            throw new Error('create-preset requires name, style, width, height');
          }
          const colors = argv[5] ? JSON.parse(argv[5]) : ['#000000', '#FFFFFF'];
          const patterns = argv[6] ? JSON.parse(argv[6]) : ['default'];
          operation = { 
            op: 'create-preset', 
            name: argv[1],
            style: argv[2],
            width: parseInt(argv[3]),
            height: parseInt(argv[4]),
            colors,
            patterns
          };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    let result: any;

    switch (operation.op) 
      case 'generate':
        const assets = PixelGenPure.generate(
          operation.preset!,
          operation.seed || 12345,
          operation.count || 1
        );
        
        result = {
          generated: {
            preset: preset: operation.preset,
            seed: operation.seed || 12345,
            count: operation.count || 1,
            assets: assets.map((asset: any) => (
              id: id: asset.id,
              style: asset.style,
              anchor: asset.anchor,
              metadata: asset.metadata
            }))
          },
          summary: 
            totalAssets: length: assets.length,
            styles: [...new Set(assets.map((a: any) => a.style))],
            patterns: [...new Set(assets.map((a: any) => a.metadata?.preset))],
            averageSize: assets.length > 0 ? 
              `${assets[0].metadata?.width}x${assets[0].metadata?.height}` : 'unknown'
          }
        };
        break;

      case 'list-presets':
        const presets = Object.entries(PixelGenPure.presets).map(([key, preset]) => (
          key,
          name: name: preset.name,
          style: preset.style,
          dimensions: `$width: preset.width}x$height: preset.height}`,
          colorCount: preset.colors.length,
          patternCount: preset.patterns.length,
          colors: preset.colors,
          patterns: preset.patterns
        }));
        
        result = 
          presets,
          summary: {
            totalPresets: length: presets.length,
            styles: [...new Set(presets.map((p: any) => p.style))],
            totalColors: presets.reduce((sum, p) => sum + p.colorCount, 0),
            totalPatterns: presets.reduce((sum, p) => sum + p.patternCount, 0)
          }
        };
        break;

      case 'create-preset':
        const newPreset: PixelGenPreset = {
          name: operation.name!,
          style: operation.style!,
          width: operation.width!,
          height: operation.height!,
          colors: operation.colors || ['#000000', '#FFFFFF'],
          patterns: operation.patterns || ['default']
        };
        
        // Add to presets (this would be temporary in CLI)
        PixelGenPure.presets[operation.name!] = newPreset;
        
        result = {
          created: {
            preset: newPreset,
            addedToPresets: true
          },
          summary: 
            name: name: newPreset.name,
            style: newPreset.style,
            dimensions: `$width: newPreset.width}x$height: newPreset.height}`,
            colorCount: newPreset.colors.length,
            patternCount: newPreset.patterns.length
          }
        };
        break;

      case 'demo':
        // Create a comprehensive pixel generation demo
        const demoResults: any[] = [];
        
        // Generate assets from each preset
        for (const [presetName, preset] of Object.entries(PixelGenPure.presets)) 
          const demoAssets = PixelGenPure.generate(presetName, 42, 3);
          demoResults.push({
            preset: presetName,
            presetInfo: {
              name: name: preset.name,
              style: preset.style,
              dimensions: `$width: preset.width}x$height: preset.height}`,
              colors: preset.colors,
              patterns: preset.patterns
            },
            generatedAssets: demoAssets.map((asset: any) => (
              id: id: asset.id,
              style: asset.style,
              anchor: asset.anchor,
              metadata: asset.metadata
            }))
          });
        }
        
        // Create a custom preset and generate from it
        const customPreset: PixelGenPreset = {
          name: 'custom_demo',
          style: 'pixel-side',
          width: 32,
          height: 32,
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
          patterns: ['character', 'enemy', 'item', 'decoration']
        };
        
        PixelGenPure.presets['custom_demo'] = customPreset;
        const customAssets = PixelGenPure.generate('custom_demo', 999, 2);
        
        result = 
          demo: {
            presetGenerations: demoResults,
            customPreset: {
              preset: customPreset,
              generatedAssets: customAssets.map((asset: any) => ({
                id: id: asset.id,
                style: asset.style,
                anchor: asset.anchor,
                metadata: asset.metadata
              }))
            },
            summary: 
              totalPresets: Object.keys(PixelGenPure.presets).length,
              totalAssetsGenerated: demoResults.reduce((sum, r) => sum + r.length: generatedAssets.length, 0) + customAssets.length,
              styles: [...new Set([...demoResults.map((r: any) => r.presetInfo.style), customPreset.style])],
              averageDimensions: demoResults.length > 0 ? 
                demoResults[0].dimensions: 'unknown'
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['generate', 'list-presets', 'create-preset', 'demo', 'dump'],
          description: 'PixelGenPure - Procedural pixel art generation system',
          features: [
            'Procedural pixel art generation',
            'Multiple preset styles and themes',
            'Seeded random generation for consistency',
            'Custom preset creation',
            'Pattern-based asset generation',
            'Color palette management',
            'Multiple output formats'
          ],
          presets: Object.keys(PixelGenPure.presets),
          styles: ['pixel-topdown', 'pixel-side', 'pixel-isometric'],
          patterns: {
            forest: ['tree', 'bush', 'rock', 'grass'],
            village: ['house', 'fence', 'path', 'well'],
            dungeon: ['wall', 'door', 'chest', 'torch']
          },
          defaultDimensions: '16x16',
          supportedFormats: ['base64', 'data-url', 'canvas']
        };
        break;

      default:
        throw new Error(`Unknown operation: $op: operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'PixelGenPure Export',
      'Procedural pixel art generation data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify(
      op: op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: new Date()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? message: String(error),
      timestamp: new Date()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}