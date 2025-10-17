/**
 * Simple StructuredLogger Test
 * Basic test to verify Jest configuration is working
 */

describe('StructuredLogger Simple Test', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    const message = 'Hello World';
    expect(message).toBe('Hello World');
  });

  test('should handle arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr[0]).toBe(1);
  });
});