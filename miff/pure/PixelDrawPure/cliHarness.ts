#!/usr/bin/env tsx

import { PixelDrawPure, PixelGrid, PixelCell, RgbHex } from './index';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface PixelDrawOperation {
  op: 'create' | 'set-color' | 'get-color' | 'draw-rect' | 'draw-circle' | 'draw-line' | 'fill' | 'clear' | 'export-json' | 'demo' | 'dump';
  width?: number;
  height?: number;
  cellSize?: number;
  x?: number;
  y?: number;
  color?: RgbHex;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  grid?: PixelGrid;
  exportFormat?: string;
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0!];
    let operation: PixelDrawOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as PixelDrawOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'create':
          if (!argv[1!] || !argv[2!]) throw new Error('create requires width and height');
          operation = { 
            op: 'create', 
            width: parseInt(argv[1!]),
            height: parseInt(argv[2!]),
            cellSize: parseInt(argv[3!]) || 1
          };
          break;
        case 'set-color':
          if (!argv[1!] || !argv[2!] || !argv[3!] || !argv[4!]) {
            throw new Error('set-color requires x, y, color, and grid JSON');
          }
          operation = { 
            op: 'set-color', 
            x: parseInt(argv[1!]),
            y: parseInt(argv[2!]),
            color: argv[3!] as RgbHex,
            grid: JSON.parse(argv[4!])
          };
          break;
        case 'get-color':
          if (!argv[1!] || !argv[2!] || !argv[3!]) {
            throw new Error('get-color requires x, y, and grid JSON');
          }
          operation = { 
            op: 'get-color', 
            x: parseInt(argv[1!]),
            y: parseInt(argv[2!]),
            grid: JSON.parse(argv[3!])
          };
          break;
        case 'draw-rect':
          if (!argv[1!] || !argv[2!] || !argv[3!] || !argv[4!] || !argv[5!] || !argv[6!]) {
            throw new Error('draw-rect requires x, y, width, height, color, and grid JSON');
          }
          operation = { 
            op: 'draw-rect', 
            x: parseInt(argv[1!]),
            y: parseInt(argv[2!]),
            width: parseInt(argv[3!]),
            height: parseInt(argv[4!]),
            color: argv[5!] as RgbHex,
            grid: JSON.parse(argv[6!])
          };
          break;
        case 'draw-circle':
          if (!argv[1!] || !argv[2!] || !argv[3!] || !argv[4!] || !argv[5!]) {
            throw new Error('draw-circle requires x, y, radius, color, and grid JSON');
          }
          operation = { 
            op: 'draw-circle', 
            x: parseInt(argv[1!]),
            y: parseInt(argv[2!]),
            radius: parseInt(argv[3!]),
            color: argv[4!] as RgbHex,
            grid: JSON.parse(argv[5!])
          };
          break;
        case 'draw-line':
          if (!argv[1!] || !argv[2!] || !argv[3!] || !argv[4!] || !argv[5!] || !argv[6!]) {
            throw new Error('draw-line requires x1, y1, x2, y2, color, and grid JSON');
          }
          operation = { 
            op: 'draw-line', 
            x1: parseInt(argv[1!]),
            y1: parseInt(argv[2!]),
            x2: parseInt(argv[3!]),
            y2: parseInt(argv[4!]),
            color: argv[5!] as RgbHex,
            grid: JSON.parse(argv[6!])
          };
          break;
        case 'fill':
          if (!argv[1!] || !argv[2!]) {
            throw new Error('fill requires color and grid JSON');
          }
          operation = { 
            op: 'fill', 
            color: argv[1!] as RgbHex,
            grid: JSON.parse(argv[2!])
          };
          break;
        case 'clear':
          if (!argv[1!]) throw new Error('clear requires grid JSON');
          operation = { op: 'clear', grid: JSON.parse(argv[1!]) };
          break;
        case 'export-json':
          if (!argv[1!]) throw new Error('export-json requires grid JSON');
          operation = { op: 'export-json', grid: JSON.parse(argv[1!]) };
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
      case 'create':
        const grid = PixelDrawPure.create(
          operation.width!,
          operation.height!,
          operation.cellSize || 1
        );
        
        result = {
          created: {
            grid,
            summary: {
              width: grid.meta.width,
              height: grid.meta.height,
              cellSize: grid.meta.cellSize,
              totalCells: grid.cells.length,
              emptyCells: grid.cells.filter((c: any) => c === null).length
            }
          }
        };
        break;

      case 'set-color':
        const setGrid = operation.grid!;
        PixelDrawPure.setColor(setGrid, operation.x!, operation.y!, operation.color!);
        
        result = {
          action: 'color_set',
          x: operation.x,
          y: operation.y,
          color: operation.color,
          summary: {
            width: setGrid.meta.width,
            height: setGrid.meta.height,
            filledCells: setGrid.cells.filter((c: any) => c !== null).length,
            totalCells: setGrid.cells.length
          }
        };
        break;

      case 'get-color':
        const getGrid = operation.grid!;
        const color = PixelDrawPure.getColor(getGrid, operation.x!, operation.y!);
        
        result = {
          action: 'color_retrieved',
          x: operation.x,
          y: operation.y,
          color,
          summary: {
            width: getGrid.meta.width,
            height: getGrid.meta.height,
            filledCells: getGrid.cells.filter((c: any) => c !== null).length
          }
        };
        break;

      case 'draw-rect':
        const rectGrid = operation.grid!;
        const rectCells: PixelCell[] = [];
        
        for (let y = operation.y!; y < operation.y! + operation.height!; y++) {
          for (let x = operation.x!; x < operation.x! + operation.width!; x++) {
            if (x >= 0 && y >= 0 && x < rectGrid.meta.width && y < rectGrid.meta.height) {
              PixelDrawPure.setColor(rectGrid, x, y, operation.color!);
              rectCells.push({ x, y, color: operation.color! });
            }
          }
        }
        
        result = {
          action: 'rectangle_drawn',
          rectangle: {
            x: operation.x,
            y: operation.y,
            width: operation.width,
            height: operation.height,
            color: operation.color,
            cellsDrawn: rectCells.length
          },
          summary: {
            width: rectGrid.meta.width,
            height: rectGrid.meta.height,
            filledCells: rectGrid.cells.filter((c: any) => c !== null).length,
            totalCells: rectGrid.cells.length
          }
        };
        break;

      case 'draw-circle':
        const circleGrid = operation.grid!;
        const circleCells: PixelCell[] = [];
        const centerX = operation.x!;
        const centerY = operation.y!;
        const radius = operation.radius!;
        
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          for (let x = centerX - radius; x <= centerX + radius; x++) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance <= radius && x >= 0 && y >= 0 && x < circleGrid.meta.width && y < circleGrid.meta.height) {
              PixelDrawPure.setColor(circleGrid, x, y, operation.color!);
              circleCells.push({ x, y, color: operation.color! });
            }
          }
        }
        
        result = {
          action: 'circle_drawn',
          circle: {
            x: centerX,
            y: centerY,
            radius,
            color: operation.color,
            cellsDrawn: circleCells.length
          },
          summary: {
            width: circleGrid.meta.width,
            height: circleGrid.meta.height,
            filledCells: circleGrid.cells.filter((c: any) => c !== null).length,
            totalCells: circleGrid.cells.length
          }
        };
        break;

      case 'draw-line':
        const lineGrid = operation.grid!;
        const lineCells: PixelCell[] = [];
        const x1 = operation.x1!;
        const y1 = operation.y1!;
        const x2 = operation.x2!;
        const y2 = operation.y2!;
        
        // Bresenham's line algorithm
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        let x = x1;
        let y = y1;
        
        while (true) {
          if (x >= 0 && y >= 0 && x < lineGrid.meta.width && y < lineGrid.meta.height) {
            PixelDrawPure.setColor(lineGrid, x, y, operation.color!);
            lineCells.push({ x, y, color: operation.color! });
          }
          
          if (x === x2 && y === y2) break;
          
          const e2 = 2 * err;
          if (e2 > -dy) {
            err -= dy;
            x += sx;
          }
          if (e2 < dx) {
            err += dx;
            y += sy;
          }
        }
        
        result = {
          action: 'line_drawn',
          line: {
            x1, y1, x2, y2,
            color: operation.color,
            cellsDrawn: lineCells.length
          },
          summary: {
            width: lineGrid.meta.width,
            height: lineGrid.meta.height,
            filledCells: lineGrid.cells.filter((c: any) => c !== null).length,
            totalCells: lineGrid.cells.length
          }
        };
        break;

      case 'fill':
        const fillGrid = operation.grid!;
        const originalFilled = fillGrid.cells.filter((c: any) => c !== null).length;
        
        for (let i = 0; i < fillGrid.cells.length; i++) {
          fillGrid.cells[i] = operation.color!;
        }
        
        result = {
          action: 'grid_filled',
          color: operation.color,
          summary: {
            width: fillGrid.meta.width,
            height: fillGrid.meta.height,
            cellsFilled: fillGrid.cells.length,
            originalFilled,
            newFilled: fillGrid.cells.length
          }
        };
        break;

      case 'clear':
        const clearGrid = operation.grid!;
        const originalFilledClear = clearGrid.cells.filter((c: any) => c !== null).length;
        
        for (let i = 0; i < clearGrid.cells.length; i++) {
          clearGrid.cells[i] = null;
        }
        
        result = {
          action: 'grid_cleared',
          summary: {
            width: clearGrid.meta.width,
            height: clearGrid.meta.height,
            cellsCleared: originalFilledClear,
            totalCells: clearGrid.cells.length
          }
        };
        break;

      case 'export-json':
        const exportGrid = operation.grid!;
        const exported = PixelDrawPure.exportJSON(exportGrid);
        
        result = {
          exported,
          summary: {
            width: exportGrid.meta.width,
            height: exportGrid.meta.height,
            cellSize: exportGrid.meta.cellSize,
            filledCells: exportGrid.cells.filter((c: any) => c !== null).length,
            totalCells: exportGrid.cells.length
          }
        };
        break;

      case 'demo':
        // Create a comprehensive pixel drawing demo
        const demoGrid = PixelDrawPure.create(32, 32, 1);
        
        // Draw a simple house
        const houseOperations = [];
        
        // House base (rectangle)
        for (let y = 20; y < 30; y++) {
          for (let x = 10; x < 22; x++) {
            PixelDrawPure.setColor(demoGrid, x, y, '#8B4513');
            houseOperations.push({ x, y, color: '#8B4513', operation: 'house_base' });
          }
        }
        
        // House roof (triangle)
        for (let y = 15; y < 20; y++) {
          const width = 20 - y;
          for (let x = 16 - width; x < 16 + width; x++) {
            PixelDrawPure.setColor(demoGrid, x, y, '#DC143C');
            houseOperations.push({ x, y, color: '#DC143C', operation: 'house_roof' });
          }
        }
        
        // Door
        for (let y = 20; y < 30; y++) {
          for (let x = 15; x < 17; x++) {
            PixelDrawPure.setColor(demoGrid, x, y, '#654321');
            houseOperations.push({ x, y, color: '#654321', operation: 'door' });
          }
        }
        
        // Windows
        PixelDrawPure.setColor(demoGrid, 12, 22, '#87CEEB');
        PixelDrawPure.setColor(demoGrid, 19, 22, '#87CEEB');
        houseOperations.push({ x: 12, y: 22, color: '#87CEEB', operation: 'window' });
        houseOperations.push({ x: 19, y: 22, color: '#87CEEB', operation: 'window' });
        
        // Sun (circle)
        const sunCells: PixelCell[] = [];
        for (let y = 5; y <= 11; y++) {
          for (let x = 25; x <= 27; x++) {
            const distance = Math.sqrt((x - 26) ** 2 + (y - 8) ** 2);
            if (distance <= 3) {
              PixelDrawPure.setColor(demoGrid, x, y, '#FFD700');
              sunCells.push({ x, y, color: '#FFD700' });
            }
          }
        }
        
        // Ground line
        for (let x = 0; x < 32; x++) {
          PixelDrawPure.setColor(demoGrid, x, 30, '#228B22');
        }
        
        const exportedDemo = PixelDrawPure.exportJSON(demoGrid);
        
        result = {
          demo: {
            grid: {
              width: demoGrid.meta.width,
              height: demoGrid.meta.height,
              cellSize: demoGrid.meta.cellSize,
              totalCells: demoGrid.cells.length
            },
            operations: {
              houseOperations: houseOperations.length,
              sunCells: sunCells.length,
              groundCells: 32
            },
            exported: exportedDemo,
            summary: {
              totalOperations: houseOperations.length + sunCells.length + 32,
              filledCells: demoGrid.cells.filter((c: any) => c !== null).length,
              emptyCells: demoGrid.cells.filter((c: any) => c === null).length,
              colors: [...new Set(demoGrid.cells.filter((c: any) => c !== null))],
              fillPercentage: (demoGrid.cells.filter((c: any) => c !== null).length / demoGrid.cells.length * 100).toFixed(1) + '%'
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['create', 'set-color', 'get-color', 'draw-rect', 'draw-circle', 'draw-line', 'fill', 'clear', 'export-json', 'demo', 'dump'],
          description: 'PixelDrawPure - Pixel grid drawing and manipulation system',
          features: [
            'Pixel grid creation and management',
            'Individual pixel color setting and retrieval',
            'Shape drawing (rectangles, circles, lines)',
            'Grid filling and clearing operations',
            'JSON export in MIFF format',
            'Canvas rendering support',
            'Bresenham line algorithm implementation'
          ],
          supportedShapes: ['rectangle', 'circle', 'line'],
          exportFormat: 'miff.pixel.grid.v1',
          defaultCellSize: 1,
          colorFormat: 'RGB Hex (#RRGGBB)',
          algorithms: ['Bresenham line', 'Circle rasterization', 'Rectangle filling']
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1!] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'PixelDrawPure Export',
      'Pixel grid drawing and manipulation data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
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
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1!]}`) {
  main();
}