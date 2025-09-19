import { DialogueEngine, DialogueTree, DialogueNode } from '../DialoguePure';

describe('DialoguePure Flow', () => {
  test('continue, make-choice, get-context', () => {
    const nodes = new Map<string, DialogueNode>();
    nodes.set('start', { id: 'start', type: 'text', content: 'Hello', next: 'choose' });
    nodes.set('choose', { id: 'choose', type: 'choice', content: 'Pick', choices: [ { id: 'a', text: 'A', next: 'end' }, { id: 'b', text: 'B', next: 'end' } ], next: 'end' });
    nodes.set('end', { id: 'end', type: 'end', content: 'Bye' });
    const tree: DialogueTree = { id: 't', name: 't', version: '1', nodes, variables: new Map(), flags: new Set() };
    const engine = new DialogueEngine(tree);
    const s = engine.start('start');
    expect(s?.node.id).toBe('start');
    const c = engine.continue();
    expect(c?.node.id).toBe('choose');
    const m = engine.selectChoice('a');
    expect(m?.node.id).toBe('end');
    const ctx = engine.getContext();
    expect(Array.isArray(ctx.history)).toBe(true);
  });
});