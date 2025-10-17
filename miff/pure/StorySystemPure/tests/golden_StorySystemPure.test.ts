import { StoryManager, type StoryArc, type StoryNode } from '../Manager';

describe('StorySystemPure Golden', () => {
  test('arc create/start/progress/export basics', () => {

    const nodes = new Map<string, StoryNode>();
    nodes.set('start', {
      id: 'start',
      title: 'Intro',
      content: 'Welcome!',
      type: 'narrative',
      conditions: [],
      rewards: [],
      nextNodes: ['choice_1'],
      metadata: {}
    });
    nodes.set('choice_1', {
      id: 'choice_1',
      title: 'Path',
      content: 'Choose a path',
      type: 'choice',
      conditions: [],
      rewards: [],
      nextNodes: ['end'],
      metadata: {}
    });
    nodes.set('end', {
      id: 'end',
      title: 'End',
      content: 'The end',
      type: 'narrative',
      conditions: [],
      rewards: [],
      nextNodes: [],
      metadata: {}
    });

    const arc: StoryArc = {
      id: 'arc1',
      name: 'Test Arc',
      description: 'A simple story arc',
      nodes,
      startNode: 'start',
      endNodes: ['end'],
      flags: new Map(),
      progress: new Map(),
      metadata: {}
    };

    const validate = manager.createArc(arc);
    expect(validate.status).toBe('ok');
    expect(validate.isValid).toBe(true);

    const started = manager.startArc('arc1');
    expect(started?.currentNode.id).toBe('start');
    expect(started?.nextNodes).toContain('choice_1');

    const advanced = manager.advanceToNode('arc1', 'choice_1');
    expect(advanced?.currentNode.id).toBe('choice_1');

    const stats = manager.getStoryStatistics();
    expect(stats.totalArcs).toBe(1);
    expect(stats.totalNodes).toBe(3);
  });
});

