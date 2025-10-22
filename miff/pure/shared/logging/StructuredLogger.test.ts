/**
 * StructuredLogger Test Suite
 * Basic test to verify Jest configuration is working
 */

import { StructuredLogger } from './StructuredLogger';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = StructuredLogger.getInstance();
  });

  test('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(StructuredLogger);
  });

  test('should have info method', () => {
    expect(typeof StructuredLogger.info).toBe('function');
  });

  test('should have warn method', () => {
    expect(typeof StructuredLogger.warn).toBe('function');
  });

  test('should have error method', () => {
    expect(typeof StructuredLogger.error).toBe('function');
  });

  test('should have debug method', () => {
    expect(typeof StructuredLogger.debug).toBe('function');
  });

  test('should log info message', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    
    StructuredLogger.info('Test message');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should log warning message', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    StructuredLogger.warn('Test warning');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should log error message', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    StructuredLogger.error('Test error');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});