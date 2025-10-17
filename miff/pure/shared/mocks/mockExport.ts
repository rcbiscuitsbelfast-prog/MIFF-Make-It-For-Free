/**
 * Mock Export System
 * 
 * Provides mock implementations for export functionality
 * in MIFF tests.
 */

export const mockExport = {
  exportToJSON: jest.fn().mockReturnValue({ success: true, data: {} }),
  exportToMarkdown: jest.fn().mockReturnValue({ success: true, data: '' }),
  exportToHTML: jest.fn().mockReturnValue({ success: true, data: '' })
};