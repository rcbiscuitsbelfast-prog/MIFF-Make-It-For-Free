/**
 * SlicePure Tests
 * 
 * Tests for SlicePure data slicing utilities
 */

import { SlicePure, createDataSlice, sliceData } from './index';

describe('SlicePure', () => {
  describe('Basic Slicing', () => {
    it('should create data slice', () => {
      const data = [1, 2, 3, 4, 5];
      const slice = createDataSlice(data, 0, 3);
      
      expect(slice).toBeDefined();
      expect(slice.length).toBe(3);
      expect(slice).toEqual([1, 2, 3]);
    });

    it('should slice array data', () => {
      const data = ['a', 'b', 'c', 'd', 'e'];
      const result = sliceData(data, { start: 1, end: 4 });
      
      expect(result).toEqual(['b', 'c', 'd']);
    });

    it('should handle negative indices', () => {
      const data = [1, 2, 3, 4, 5];
      const slice = createDataSlice(data, -3, -1);
      
      expect(slice).toEqual([3, 4]);
    });
  });

  describe('Pagination', () => {
    it('should paginate data', () => {
      const data = Array.from({ length: 100 }, (_, i) => i);
      
      const page1 = SlicePure.paginate(data, 0, 10);
      const page2 = SlicePure.paginate(data, 1, 10);
      
      expect(page1.length).toBe(10);
      expect(page1[0]).toBe(0);
      expect(page2[0]).toBe(10);
    });

    it('should handle partial last page', () => {
      const data = Array.from({ length: 25 }, (_, i) => i);
      
      const lastPage = SlicePure.paginate(data, 2, 10);
      expect(lastPage.length).toBe(5); // 25 items, 10 per page, page 2 has 5
    });
  });

  describe('Chunking', () => {
    it('should chunk data into equal parts', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const chunks = SlicePure.chunk(data, 3);
      
      expect(chunks.length).toBe(3);
      expect(chunks[0]).toEqual([1, 2, 3]);
      expect(chunks[1]).toEqual([4, 5, 6]);
      expect(chunks[2]).toEqual([7, 8, 9]);
    });

    it('should handle remainder in last chunk', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = SlicePure.chunk(data, 3);
      
      expect(chunks.length).toBe(4);
      expect(chunks[3]).toEqual([10]);
    });
  });

  describe('Range Selection', () => {
    it('should select range of data', () => {
      const data = Array.from({ length: 50 }, (_, i) => i);
      
      const range = SlicePure.range(data, 10, 20);
      expect(range.length).toBe(10);
      expect(range[0]).toBe(10);
      expect(range[9]).toBe(19);
    });

    it('should clamp range to data bounds', () => {
      const data = [1, 2, 3, 4, 5];
      
      const range = SlicePure.range(data, 0, 100);
      expect(range.length).toBe(5);
      expect(range).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Filtering', () => {
    it('should filter and slice data', () => {
      const data = Array.from({ length: 20 }, (_, i) => i);
      
      const filtered = SlicePure.filterSlice(data, n => n % 2 === 0, 0, 5);
      expect(filtered.length).toBe(5);
      expect(filtered).toEqual([0, 2, 4, 6, 8]);
    });
  });
});
