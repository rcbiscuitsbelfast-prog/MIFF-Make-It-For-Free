import { describe, it, expect } from '@jest/globals';
import { SlicePure, createDataSlice, sliceData, windowData } from './index';

describe('SlicePure', () => {
  describe('Data Slicing', () => {
    it('should create data slice', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const slice = createDataSlice(data, 0, 5);

      expect(slice).toBeDefined();
      expect(slice.length).toBe(5);
      expect(slice).toEqual([1, 2, 3, 4, 5]);
    });

    it('should slice data with offset', () => {
      const data = ['a', 'b', 'c', 'd', 'e'];
      const result = sliceData(data, 2, 2);

      expect(result).toEqual(['c', 'd']);
    });

    it('should handle out of bounds slicing', () => {
      const data = [1, 2, 3];
      const result = sliceData(data, 10, 5);

      expect(result).toEqual([]);
    });
  });

  describe('Data Windowing', () => {
    it('should create sliding window', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8];
      const window = windowData(data, 3);

      expect(window).toBeDefined();
      expect(Array.isArray(window)).toBe(true);
    });

    it('should handle window size larger than data', () => {
      const data = [1, 2, 3];
      const window = windowData(data, 10);

      expect(window).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should paginate data', () => {
      const data = Array.from({ length: 100 }, (_, i) => i);
      const page1 = sliceData(data, 0, 10);
      const page2 = sliceData(data, 10, 10);

      expect(page1.length).toBe(10);
      expect(page2.length).toBe(10);
      expect(page1[0]).toBe(0);
      expect(page2[0]).toBe(10);
    });
  });
});
