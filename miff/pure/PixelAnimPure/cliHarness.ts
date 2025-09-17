#!/usr/bin/env tsx

import { PixelAnimPure, Animation, AnimationFrame, SpriteSheet } from './index';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface PixelAnimOperation {
  op: 'create-animation' | 'create-from-preset' | 'create-spritesheet' | 'export-animation' | 'export-spritesheet' | 'list-presets' | 'demo' | 'dump';
  name?: string;
  frameFiles?: string[];
  fps?: number;
  loop?: boolean;
  presetName?: string;
  animations?: Animation[];
  frameWidth?: number;
  frameHeight?: number;
  animation?: Animation;
  spriteSheet?: SpriteSheet;
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
    let operation: PixelAnimOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as PixelAnimOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'create-animation':
          if (!argv[1] || !argv[2]) throw new Error('create-animation requires name and frame files JSON array');
          operation = { 
            op: 'create-animation', 
            name: argv[1],
            frameFiles: JSON.parse(argv[2]),
            fps: parseInt(argv[3]) || 8,
            loop: argv[4] === 'true'
          };
          break;
        case 'create-from-preset':
          if (!argv[1]) throw new Error('create-from-preset requires preset name');
          operation = { op: 'create-from-preset', presetName: argv[1] };
          break;
        case 'create-spritesheet':
          if (!argv[1] || !argv[2] || !argv[3]) {
            throw new Error('create-spritesheet requires animations JSON, frameWidth, and frameHeight');
          }
          operation = { 
            op: 'create-spritesheet',
            animations: JSON.parse(argv[1]),
            frameWidth: parseInt(argv[2]),
            frameHeight: parseInt(argv[3])
          };
          break;
        case 'export-animation':
          if (!argv[1]) throw new Error('export-animation requires animation JSON');
          operation = { op: 'export-animation', animation: JSON.parse(argv[1]) };
          break;
        case 'export-spritesheet':
          if (!argv[1]) throw new Error('export-spritesheet requires spriteSheet JSON');
          operation = { op: 'export-spritesheet', spriteSheet: JSON.parse(argv[1]) };
          break;
        case 'list-presets':
          operation = { op: 'list-presets' };
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

    switch (operation.op) {
      case 'create-animation':
        const animation = PixelAnimPure.createAnimation(
          operation.name!,
          operation.frameFiles!,
          operation.fps || 8,
          operation.loop !== false
        );
        
        result = {
          created: {
            animation,
            summary: {
              name: animation.name,
              frameCount: animation.frames.length,
              duration: animation.frames.reduce((sum, frame) => sum + frame.duration, 0),
              fps: animation.speed,
              loop: animation.loop
            }
          }
        };
        break;

      case 'create-from-preset':
        const presetAnimation = PixelAnimPure.createFromPreset(operation.presetName!);
        
        result = {
          created: {
            animation: presetAnimation,
            preset: operation.presetName,
            summary: {
              name: presetAnimation.name,
              frameCount: presetAnimation.frames.length,
              duration: presetAnimation.frames.reduce((sum, frame) => sum + frame.duration, 0),
              fps: presetAnimation.speed,
              loop: presetAnimation.loop
            }
          }
        };
        break;

      case 'create-spritesheet':
        const spriteSheet = PixelAnimPure.createSpriteSheet(
          operation.animations!,
          operation.frameWidth!,
          operation.frameHeight!
        );
        
        result = {
          created: {
            spriteSheet,
            summary: {
              width: spriteSheet.width,
              height: spriteSheet.height,
              frameWidth: spriteSheet.frameWidth,
              frameHeight: spriteSheet.frameHeight,
              layerCount: spriteSheet.layers.length,
              animationCount: operation.animations!.length
            }
          }
        };
        break;

      case 'export-animation':
        const exportedAnimation = PixelAnimPure.exportAnimation(operation.animation!);
        
        result = {
          exported: {
            animation: exportedAnimation,
            format: 'miff.pixel.animation.v1'
          }
        };
        break;

      case 'export-spritesheet':
        const exportedSpriteSheet = PixelAnimPure.exportSpriteSheet(operation.spriteSheet!);
        
        result = {
          exported: {
            spriteSheet: exportedSpriteSheet,
            format: 'miff.pixel.spritesheet.v1'
          }
        };
        break;

      case 'list-presets':
        const presets = Object.entries(PixelAnimPure.presets).map(([key, preset]) => ({
          key,
          name: preset.name,
          frameCount: preset.frames.length,
          fps: preset.fps,
          loop: preset.loop,
          frames: preset.frames
        }));
        
        result = {
          presets,
          summary: {
            totalPresets: presets.length,
            totalFrames: presets.reduce((sum, p) => sum + p.frameCount, 0),
            averageFPS: presets.reduce((sum, p) => sum + p.fps, 0) / presets.length,
            loopingAnimations: presets.filter(p => p.loop).length
          }
        };
        break;

      case 'demo':
        // Create a comprehensive animation demo
        const demoAnimations: Animation[] = [];
        
        // Create animations from presets
        for (const [presetName, preset] of Object.entries(PixelAnimPure.presets)) {
          const anim = PixelAnimPure.createFromPreset(presetName);
          demoAnimations.push(anim);
        }
        
        // Create a custom animation
        const customAnimation = PixelAnimPure.createAnimation(
          'custom_attack',
          ['attack1.png', 'attack2.png', 'attack3.png', 'attack4.png'],
          12,
          false
        );
        demoAnimations.push(customAnimation);
        
        // Create a sprite sheet from all animations
        const demoSpriteSheet = PixelAnimPure.createSpriteSheet(demoAnimations, 32, 32);
        
        // Export animations and sprite sheet
        const exportedAnimations = demoAnimations.map(anim => PixelAnimPure.exportAnimation(anim));
        const exportedDemoSpriteSheet = PixelAnimPure.exportSpriteSheet(demoSpriteSheet);
        
        result = {
          demo: {
            animations: {
              created: demoAnimations.map(anim => ({
                name: anim.name,
                frameCount: anim.frames.length,
                duration: anim.frames.reduce((sum, frame) => sum + frame.duration, 0),
                fps: anim.speed,
                loop: anim.loop
              })),
              exported: exportedAnimations
            },
            spriteSheet: {
              created: {
                width: demoSpriteSheet.width,
                height: demoSpriteSheet.height,
                frameWidth: demoSpriteSheet.frameWidth,
                frameHeight: demoSpriteSheet.frameHeight,
                layerCount: demoSpriteSheet.layers.length
              },
              exported: exportedDemoSpriteSheet
            },
            summary: {
              totalAnimations: demoAnimations.length,
              totalFrames: demoAnimations.reduce((sum, anim) => sum + anim.frames.length, 0),
              totalDuration: demoAnimations.reduce((sum, anim) => 
                sum + anim.frames.reduce((frameSum, frame) => frameSum + frame.duration, 0), 0
              ),
              averageFPS: demoAnimations.reduce((sum, anim) => sum + anim.speed, 0) / demoAnimations.length,
              loopingAnimations: demoAnimations.filter(anim => anim.loop).length,
              spriteSheetLayers: demoSpriteSheet.layers.length
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['create-animation', 'create-from-preset', 'create-spritesheet', 'export-animation', 'export-spritesheet', 'list-presets', 'demo', 'dump'],
          description: 'PixelAnimPure - Pixel animation and sprite sheet management system',
          features: [
            'Animation creation and management',
            'Preset-based animation generation',
            'Sprite sheet creation and optimization',
            'Animation export in MIFF format',
            'Frame-based animation timing',
            'Loop and one-shot animation support',
            'Multiple FPS support'
          ],
          presets: Object.keys(PixelAnimPure.presets),
          supportedFormats: ['miff.pixel.animation.v1', 'miff.pixel.spritesheet.v1'],
          defaultFPS: 8,
          animationTypes: ['loop', 'one-shot'],
          frameFormats: ['PNG', 'Data URL', 'Base64']
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
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
      'PixelAnimPure Export',
      'Pixel animation and sprite sheet data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error) {
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}