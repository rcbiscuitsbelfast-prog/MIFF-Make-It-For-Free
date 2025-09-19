import { AIProfileIntegrationLayer, type AIProfile, type AIAction } from '../Manager';

describe('AIProfileIntegrationLayer Golden', () => {
  test('decision/integrate/learn', () => {
    const ai = new AIProfileIntegrationLayer();

    const profile: AIProfile = {
      id: 'p1',
      name: 'Aggressive',
      description: 'Prefers attack',
      traits: [
        { id: 'aggression', name: 'aggression', value: 0.8, weight: 0.9, description: '' }
      ],
      behaviorModifiers: [],
      skillBonuses: [],
      preferences: [],
      metadata: {}
    };

    ai.createProfile(profile);
    const actions: AIAction[] = [
      { id: 'a', name: 'Attack', type: 'attack', target: 'enemy', parameters: {}, confidence: 0, reasoning: '' },
      { id: 'd', name: 'Defend', type: 'defend', parameters: {}, confidence: 0, reasoning: '' }
    ];

    const decision = ai.makeDecision('p1', 'enemies_present', actions);
    expect(decision).toBeTruthy();
    expect(decision!.chosenAction.type).toBe('attack');

    const integrated = ai.integrateWithGameplay('p1', { health: 0.9, enemies: ['e1'], allies: [] });
    expect(integrated?.status).toBe('success');
    expect(integrated?.performance).toBeGreaterThanOrEqual(0);

    ai.recordLearning('p1', {
      profileId: 'p1',
      situation: 'combat',
      action: decision!.chosenAction,
      outcome: 'success',
      feedback: 0.5,
      timestamp: Date.now(),
      context: {}
    });

    const stats = ai.getAIStatistics();
    expect(stats.totalProfiles).toBe(1);
    expect(stats.totalDecisions).toBeGreaterThan(0);
  });
});

