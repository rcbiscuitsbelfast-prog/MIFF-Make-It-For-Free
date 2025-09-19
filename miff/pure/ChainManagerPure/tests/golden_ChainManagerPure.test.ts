import { ChainManager, type QuestChain } from '../Manager';

describe('ChainManagerPure Golden', () => {
  test('chain create/progress/export', () => {
    const cm = new ChainManager();
    const chain: QuestChain = {
      id: 'c1',
      name: 'Intro Chain',
      description: 'Basic quest chain',
      quests: ['q1', 'q2', 'q3'],
      prerequisites: [],
      rewards: [],
      metadata: {}
    };
    const created = cm.createChain(chain);
    expect(created.status).toBe('ok');

    const p1 = cm.updateProgress('c1', 'q1', true);
    expect(p1?.status).toBe('active');
    const p2 = cm.updateProgress('c1', 'q2', true);
    expect(p2?.progress).toBeGreaterThan(0);
    const p3 = cm.updateProgress('c1', 'q3', true);
    expect(p3?.status).toBe('completed');

    const stats = cm.getChainStatistics();
    expect(stats.completedChains).toBe(1);

    const exp = cm.exportChain('c1', 'json');
    expect(exp.status).toBe('ok');
    expect((exp.data as any).chain.id).toBe('c1');
  });
});

