#!/usr/bin/env npx ts-node

import { runScenario } from './ScenarioPackSpiritTamerDemoPure';

function main(){
	const out = runScenario({ bpm: 120, totalBeats: 4, window: 0.1, threshold: 3, dt: 0.1, taps: [ { t: 0.5 }, { t: 1 }, { t: 1.5 }, { t: 3 } ]});
	console.log(JSON.stringify(out, null, 2));
}

if(require.main===module) main();