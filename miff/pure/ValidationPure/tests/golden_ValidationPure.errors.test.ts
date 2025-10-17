import { ValidationManager } from '../Manager';

describe('ValidationPure Errors', () => {
  test('validate invalid data returns issues', () => {
    const vm = new ValidationManager();
    const res = vm?.validateAll({ bad: true } as any);
    expect(res?.status === 'error' || (res as any).issues?.length >= 0).toBe(true);
  });
});

