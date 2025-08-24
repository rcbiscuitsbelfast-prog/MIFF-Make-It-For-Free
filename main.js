// MIFF main entry
// Paths updated to use modules/pure facade for decluttered structure.

require('ts-node/register/transpile-only'); // allow requiring TS files without build

const { runTimeline } = require('./modules/pure/QuestTimelinePure.ts'); // moved: systems/QuestTimelinePure -> modules/pure facade
const fs = require('fs');

function runScenario(file) {
	const tl = JSON.parse(fs.readFileSync(file, 'utf-8'));
	return runTimeline(tl);
}

if (require.main === module) {
	const file = process.argv[2] || './scenarios/helmet_of_fate.timeline.json'; // default scenario path
	const out = runScenario(file);
	console.log(JSON.stringify(out, null, 2));
}

module.exports = { runScenario };