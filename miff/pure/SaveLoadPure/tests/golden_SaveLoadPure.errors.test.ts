import { SaveLoadManager } from '../SaveLoadManager';

describe('SaveLoadPure Errors', () => {
  test('load invalid JSON and save invalid path', () => {
    const sm = new SaveLoadManager();
    const badLoad = sm.loadFromString('not-json');
    expect(badLoad.ok).toBe(false);
  });
});

