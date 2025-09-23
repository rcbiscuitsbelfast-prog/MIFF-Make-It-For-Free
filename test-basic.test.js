/**
 * Basic test to verify Jest setup is working
 */

// Test basic functionality
test('Basic math works', () => {
  expect(1 + 1).toBe(2);
  expect(2 * 3).toBe(6);
  expect('MIFF').toBeTruthy();
});

// Test mocking
test('Mocking works', () => {
  const mockFn = jest.fn();
  mockFn();
  expect(mockFn).toHaveBeenCalled();
});

// Test async functionality
test('Async test works', async () => {
  const result = await Promise.resolve('success');
  expect(result).toBe('success');
});

// Test timers
test('Timer mocking works', () => {
  jest.useFakeTimers();
  const mockFn = jest.fn();
  setTimeout(mockFn, 100);
  jest.runOnlyPendingTimers();
  expect(mockFn).toHaveBeenCalled();
});

console.log('Basic Jest tests completed successfully');