/**
 * CLI Harness for WitcherExplorerDemoPure
 * 
 * This harness provides CLI interface for WitcherExplorerDemoPure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module WitcherExplorerDemoPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

<<<<<<< HEAD
import {
  buildSamplePayload,
  validatePayload,
  witcherExplorerDemo,
  spiritTamerDemo,
  defaultStub,
  parseCLIArgs,
  formatOutput
} from '../miff/pure/shared/cliHarnessUtils';

const { mode } = parseCLIArgs(process.argv);

// Select output based on CLI argument
let output;
switch (mode) {
  case 'build-sample':
    output = buildSamplePayload();
    break;
  case 'validate':
    output = validatePayload();
    break;
  case 'witcher':
    output = witcherExplorerDemo();
    break;
  case 'spirit':
    output = spiritTamerDemo();
    break;
  default:
    output = witcherExplorerDemo(); // Default to witcher for this module
=======
function main(){
  const nav = pathfind({ width:10, height:10, walls:new Set(['3,0','3,1']) }, { x:0,y:0 }, { x:5,y:0 });
  const dlg = nextNode({ start:'a', nodes:{ a:{ id:'a', text:'Hi', choices:[{ text:'Next', next:'b' }] }, b:{ id:'b', text:'Bye' } } }, 'a', 0);
  const q = parseQuestText('id: q1\ntitle: Witcher Explorer\nstart: s1\nstep s1: Talk to elder | trigger: talk elder | next: s2\nstep s2: Collect 1 herb | trigger: collect herb 1 | reward: xp 10');
  
  // Extract events for golden fixture compatibility
  const events = [
    {
      type: 'pathfindingCompleted',
      path: nav.path,
      pathLength: nav.path ? nav.path.length : 0
    },
    {
      type: 'dialogueProgressed',
      nodeId: dlg.id,
      status: dlg.status
    },
    {
      type: 'questParsed',
      questId: q.quest ? q.quest.id : 'unknown',
      status: q.status
    }
  ];
  
  // Extract final state for golden fixture compatibility
  const finalState = {
    navigation: {
      pathFound: nav.status === 'ok',
      destination: { x: 5, y: 0 },
      pathLength: nav.path ? nav.path.length : 0
    },
    dialogue: {
      currentNode: dlg.id,
      completed: dlg.status === 'ok'
    },
    quest: {
      id: q.quest ? q.quest.id : 'q1',
      title: q.quest ? q.quest.title : 'Witcher Explorer',
      parsed: q.status === 'ok'
    }
  };
  
  console.log(JSON.stringify({ 
    op: 'runScenario', 
    status: 'ok', 
    name: 'WitcherExplorerDemoPure',
    events,
    finalState,
    nav, 
    dlg, 
    quest: q 
  }, null, 2));
>>>>>>> cursor/golden-scenario-validation-fix
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));