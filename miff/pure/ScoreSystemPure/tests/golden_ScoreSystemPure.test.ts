import { runCLICommand } from '../../../../cli/integration';

describe('ScoreSystemPure CLI Harness', () => {
  beforeEach(async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['reset']);
  });

  test('should create a new score', async () => {
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'create-score',
      '--score-id=player1',
      '--category=combat',
      '--initial-score=100'
    ]);
    expect(output).toMatchSpecificGolden('create-score-ok');
  });

  test('should get a score', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['get-score', '--score-id=player1']);
    expect(output).toMatchSpecificGolden('get-score-ok');
  });

  test('should update a score', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'update-score',
      '--score-id=player1',
      '--updates={"level":2,"experience":500}'
    ]);
    expect(output).toMatchSpecificGolden('update-score-ok');
  });

  test('should apply score events', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'apply-events',
      '--score-id=player1',
      '--events=[{"id":"evt1","type":"add","value":100,"category":"combat","source":"battle","timestamp":1000}]'
    ]);
    expect(output).toMatchSpecificGolden('apply-events-ok');
  });

  test('should add a score bonus', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'add-bonus',
      '--score-id=player1',
      '--bonus-id=streak_bonus',
      '--name="Win Streak Bonus"',
      '--multiplier=1.5',
      '--duration=3600',
      '--source=streak'
    ]);
    expect(output).toMatchSpecificGolden('add-bonus-ok');
  });

  test('should add a score penalty', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'add-penalty',
      '--score-id=player1',
      '--penalty-id=time_penalty',
      '--name="Time Penalty"',
      '--reduction=50',
      '--duration=1800',
      '--source=timeout'
    ]);
    expect(output).toMatchSpecificGolden('add-penalty-ok');
  });

  test('should register an achievement', async () => {
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'register-achievement',
      '--achievement-id=first_blood',
      '--name="First Blood"',
      '--description="Win your first battle"',
      '--category=combat',
      '--requirements=[{"type":"score_threshold","value":100,"category":"combat"}]',
      '--rewards=[{"type":"score_bonus","value":50}]'
    ]);
    expect(output).toMatchSpecificGolden('register-achievement-ok');
  });

  test('should check achievements', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'register-achievement',
      '--achievement-id=first_blood',
      '--name="First Blood"',
      '--description="Win your first battle"',
      '--category=combat',
      '--requirements=[{"type":"score_threshold","value":100,"category":"combat"}]',
      '--rewards=[{"type":"score_bonus","value":50}]'
    ]);
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['apply-events', '--score-id=player1', '--events=[{"id":"evt1","type":"add","value":150,"category":"combat","source":"battle","timestamp":1000}]']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['check-achievements', '--score-id=player1']);
    expect(output).toMatchSpecificGolden('check-achievements-ok');
  });

  test('should update leaderboard', async () => {
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'update-leaderboard',
      '--leaderboard-id=combat',
      '--player-id=player1',
      '--player-name="Player 1"',
      '--score=1000'
    ]);
    expect(output).toMatchSpecificGolden('update-leaderboard-ok');
  });

  test('should get leaderboard', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'update-leaderboard',
      '--leaderboard-id=combat',
      '--player-id=player1',
      '--player-name="Player 1"',
      '--score=1000'
    ]);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['get-leaderboard', '--leaderboard-id=combat']);
    expect(output).toMatchSpecificGolden('get-leaderboard-ok');
  });

  test('should list scores with filter', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player2', '--category=exploration']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['list-scores', '--category=combat']);
    expect(output).toMatchSpecificGolden('list-scores-ok');
  });

  test('should get score statistics', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player2', '--category=exploration']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['stats']);
    expect(output).toMatchSpecificGolden('stats-ok');
  });

  test('should export score data in JSON format', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['export', '--format=json']);
    expect(output).toMatchSpecificGolden('export-json-ok');
  });

  test('should export score data in manifest format', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['export', '--format=manifest']);
    expect(output).toMatchSpecificGolden('export-manifest-ok');
  });

  test('should export score data in summary format', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['export', '--format=summary']);
    expect(output).toMatchSpecificGolden('export-summary-ok');
  });

  test('should export leaderboards', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', [
      'update-leaderboard',
      '--leaderboard-id=combat',
      '--player-id=player1',
      '--player-name="Player 1"',
      '--score=1000'
    ]);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['export', '--format=leaderboards']);
    expect(output).toMatchSpecificGolden('export-leaderboards-ok');
  });

  test('should reset score system', async () => {
    await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['create-score', '--score-id=player1', '--category=combat']);
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['reset']);
    expect(output).toMatchSpecificGolden('reset-scores-ok');
  });

  test('should run demo scenario', async () => {
    const output = await runCLICommand('miff/pure/ScoreSystemPure/cliHarness?.ts', ['demo']);
    expect(output).toMatchSpecificGolden('demo-scenario-ok');
  });
});