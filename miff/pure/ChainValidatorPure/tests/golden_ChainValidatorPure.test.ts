import { ChainValidatorManager } from '../Manager';

describe('ChainValidatorPure Golden', () => {
  test('validate detects cycles and isolated nodes; stats computed; exports work', () => {
    const mgr = new ChainValidatorManager();

    // Nodes
    mgr.addNode({ id: 'A', type: 'chain', label: 'Chain A' });
    mgr.addNode({ id: 'B', type: 'quest', label: 'Quest B' });
    mgr.addNode({ id: 'C', type: 'task', label: 'Task C' });
    mgr.addNode({ id: 'D', type: 'event', label: 'Event D' });
    mgr.addNode({ id: 'Z', type: 'generic', label: 'Isolated' });

    // Edges (make a cycle A -> B -> C -> A, and tail C -> D)
    mgr.addEdge({ from: 'A', to: 'B' });
    mgr.addEdge({ from: 'B', to: 'C' });
    mgr.addEdge({ from: 'C', to: 'A' });
    mgr.addEdge({ from: 'C', to: 'D' });

    const validation = mgr.validate({});
    expect(validation.op).toBe('validate');
    expect(['warning', 'error', 'ok']).toContain(validation.status);
    expect(validation.result.summary.nodes).toBe(5);
    expect(validation.result.summary.edges).toBe(4);
    expect(validation.result.summary.isolatedNodes).toBe(1);
    expect(validation.result.issues.find(i => i.code === 'cycle')).toBeTruthy();

    const stats = mgr.getStats();
    expect(stats.op).toBe('stats');
    expect(stats.result.nodes).toBe(5);
    expect(stats.result.edges).toBe(4);
    expect(stats.result.components).toBe(2); // Z is its own component

    const j = mgr.exportGraph('json');
    const y = mgr.exportGraph('yaml');
    const c = mgr.exportGraph('csv');
    expect(j.format).toBe('json');
    expect(typeof j.result).toBe('object');
    expect(y.format).toBe('yaml');
    expect(typeof y.result).toBe('string');
    expect(c.format).toBe('csv');
    expect(typeof c.result).toBe('string');
  });
});

