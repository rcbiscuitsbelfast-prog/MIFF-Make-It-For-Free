// Zone: Witcher Grove - Minimal combat sampler
// Purpose: Demonstrate turn-based combat tick
// Modules: CombatManager (CombatCorePure), InputSystemPure

require('ts-node/register/transpile-only');
const { CombatManager } = require('../../CombatCorePure/CombatManager');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');

function startZone(){
	const cm = new CombatManager();
	cm.create('geralt', 30, 10, 5);
	cm.create('drowner', 12, 6, 2);
	const result = cm.simulate('geralt', 'drowner');
	const input = mapInputs([{ t:0, type:'key', key:'space' }], [{ type:'key', code:'space', action:'attack' }]);
	console.log('[Witcher Grove] combat:', JSON.stringify({ result, actions: input.actions }, null, 2));
	return { status:'ok', zone:'witcher_grove' };
}

module.exports = { startZone };