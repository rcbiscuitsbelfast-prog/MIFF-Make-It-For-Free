import { PixelDrawPure } from '../index';

describe('PixelDrawPure', () => {
  test('creates grid with correct dimensions', () => {
    const grid = PixelDrawPure.create(16, 16, 1);
    expect(grid.meta.width).toBe(16);
    expect(grid.meta.height).toBe(16);
    expect(grid.meta.cellSize).toBe(1);
    expect(grid.cells).toHaveLength(256);
  });

  test('sets and gets colors correctly', () => {
    const grid = PixelDrawPure.create(8, 8, 1);
    PixelDrawPure.setColor(grid, 2, 3, '#ff0000');
    expect(PixelDrawPure.getColor(grid, 2, 3)).toBe('#ff0000');
    expect(PixelDrawPure.getColor(grid, 1, 3)).toBe(null);
  });

  test('handles out of bounds gracefully', () => {
    const grid = PixelDrawPure.create(4, 4, 1);
    PixelDrawPure.setColor(grid, -1, 0, '#ff0000');
    PixelDrawPure.setColor(grid, 0, -1, '#ff0000');
    PixelDrawPure.setColor(grid, 4, 0, '#ff0000');
    PixelDrawPure.setColor(grid, 0, 4, '#ff0000');
    
    expect(PixelDrawPure.getColor(grid, -1, 0)).toBe(null);
    expect(PixelDrawPure.getColor(grid, 0, -1)).toBe(null);
    expect(PixelDrawPure.getColor(grid, 4, 0)).toBe(null);
    expect(PixelDrawPure.getColor(grid, 0, 4)).toBe(null);
  });

  test('exports JSON with correct schema', () => {
    const grid = PixelDrawPure.create(2, 2, 1);
    PixelDrawPure.setColor(grid, 0, 0, '#ff0000');
    PixelDrawPure.setColor(grid, 1, 1, '#00ff00');
    
    const json = PixelDrawPure.exportJSON(grid);
    expect(json).toMatchObject({
      schema: 'miff.pixel.grid.v1',
      meta: { width: 2, height: 2, cellSize: 1 },
      cells: ['#ff0000', null, null, '#00ff00']
    });
  });
});