#!/usr/bin/env node

// run-golden-tests: Replay sampler fixtures and validate zone flows (remix-safe)
// Modules: TestSystemPure, InputSystemPure, ZoneSystemPure

require('ts-node/register/transpile-only');
const fs = require('fs');
const path = require('path');
const Test = require('../modules/pure/TestSystemPure.ts');
const Zone = require('../modules/pure/ZoneSystemPure.ts');
const { mapInputs } = require('../modules/pure/InputSystemPure.ts');

function listFixtures(dir){
	return fs.readdirSync(dir).filter(f=>f.endsWith('.fixture.json')).map(f=>path.resolve(dir, f));
}

function inferZoneId(fixtureFile){
	const base = path.basename(fixtureFile).toLowerCase();
	if(base.startsWith('toppler')) return 'toppler';
	if(base.startsWith('spirit_tamer')) return 'spirit_tamer';
	if(base.startsWith('witcher_grove')) return 'witcher_grove';
	if(base.startsWith('witcher_explorer')) return 'witcher_grove';
	return 'synth_nexus';
}

function loadZone(zoneId){
	const zones = {
		synth_nexus: require('../zones/synth_nexus'),
		toppler: require('../zones/toppler'),
		spirit_tamer: require('../zones/spirit_tamer'),
		witcher_grove: require('../zones/witcher_grove'),
		remix_lab: require('../zones/remix_lab')
	};
	return zones[zoneId];
}

function validateExpected(expected, events){
	let pass = true;
	const details = [];
	if(expected){
		if(expected.dialog){
			const ok = events.some(e=> e.op==='dialog');
			pass = pass && ok; if(!ok) details.push('dialog op not observed');
		}
		if(expected.quest){
			const ok = events.some(e=> e.op==='quest' && e.id===expected.quest.questId);
			pass = pass && ok; if(!ok) details.push('quest not started');
		}
		if(expected.routing){
			const ok = events.some(e=> e.op==='zone.route' && e.route && e.route.to===expected.routing.to);
			pass = pass && ok; if(!ok) details.push('routing not observed');
		}
	}
	return { pass, details };
}

function run(){
	const root = path.resolve(__dirname, '..');
	const fixturesDir = path.resolve(root, 'miff/scenarios');
	const files = listFixtures(fixturesDir);
	const results = [];
	let anyFail = false;

	for(const file of files){
		const zoneId = inferZoneId(file);
		const mod = loadZone(zoneId);
		const fixture = JSON.parse(fs.readFileSync(file, 'utf-8'));
		// Simulate replay for contributor feedback
		const replay = Test.replayFixture(file);
		const started = mod.startZone ? mod.startZone({ fixture, remix:false }) : { status:'error' };
		const events = [];
		// Simulate taps if present in either tapSequence or taps
		const taps = (fixture.tapSequence || fixture.taps || []).map(t => typeof t==='string'? { target:t } : t);
		for(const t of taps){
			if(started.onTap){
				const ev = started.onTap(t.target || t);
				if(ev) events.push(ev);
			}
		}
		const expected = fixture.expected;
		const check = validateExpected(expected, events);
		const ok = check.pass;
		if(!ok) anyFail = true;
		results.push({ fixture: path.basename(file), zone: zoneId, pass: ok, details: check.details.join('; ') });
	}

	// Output summary
	console.log('\nGolden Summary');
	console.table(results.map(r=>({ Fixture:r.fixture, Zone:r.zone, Pass:r.pass, Details:r.details })));
	if(anyFail){
		console.error('One or more fixtures failed validation.');
		process.exit(1);
	}
	process.exit(0);
}

if(require.main===module){ run(); }