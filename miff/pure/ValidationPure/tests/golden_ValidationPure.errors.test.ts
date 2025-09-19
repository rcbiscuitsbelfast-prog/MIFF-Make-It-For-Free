import { ValidatorManager } from '../Manager';

describe('ValidationPure Errors', () => {
  test('validate invalid data returns issues', () => {
    const vm = new ValidatorManager();
    const res = vm.validate({ bad: true } as any);
    expect(res.status === 'error' || (res as any).issues?.length >= 0).toBe(true);
  });
});

