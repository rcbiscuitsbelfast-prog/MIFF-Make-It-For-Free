import { QuestsManager } from '../Manager';

describe('QuestsPure Errors', () => {
  test('get/update non-existent quest', () => {
    const qm = new QuestsManager();
    const q = qm.getQuest('missing');
    expect(q === null || (q as any).status === 'error').toBe(true);
  });
});

