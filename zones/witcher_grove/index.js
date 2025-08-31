// Witcher Grove Zone - ESM module
// Exports:
// - default async function(step): Pure reducer for fixture-driven replay
// - startZone (named): Initializes interactive scaffold used elsewhere

export { startZone } from './witcher_grove.js';

/**
 * default - Pure step reducer for Witcher Grove
 * Actions: 'reset' | 'path' | 'craft' | 'patrol'
 * - 'path' moves player one step toward target
 * - 'craft' consumes herbs to create a potion
 * - 'patrol' advances enemies along patrol points
 */
export default async function stepReducer(step){
	const prev = normalizeState(step?.state);
	const action = step?.action || 'noop';
	const data = step?.data || {};
	switch(action){
		case 'reset': return initialState();
		case 'path': return applyPath(prev, data.target || { x:0, y:0 });
		case 'craft': return craftPotion(prev, data.recipe || 'healing');
		case 'patrol': return advancePatrol(prev);
		default: return prev;
	}
}

// ---------- Pure helpers ----------
function initialState(){
	return {
		player: { x:0, y:0 },
		inventory: { herb: 2 },
		potions: {},
		enemies: [ { id:'e1', x:3, y:0, patrol:[{x:3,y:0},{x:3,y:2}] , p:0 } ]
	};
}

function normalizeState(s){
	if(!s || typeof s!=='object') return initialState();
	const c = JSON.parse(JSON.stringify(s));
	if(!c.player) c.player = { x:0, y:0 };
	if(!c.inventory) c.inventory = {};
	if(!c.potions) c.potions = {};
	if(!Array.isArray(c.enemies)) c.enemies = [];
	return c;
}

function applyPath(state, target){
	const next = JSON.parse(JSON.stringify(state));
	const dx = Math.sign((target.x||0) - next.player.x);
	const dy = Math.sign((target.y||0) - next.player.y);
	// Move one step (4-dir priority X then Y)
	if(dx!==0){ next.player.x += dx; }
	else if(dy!==0){ next.player.y += dy; }
	return next;
}

function craftPotion(state, recipe){
	const next = JSON.parse(JSON.stringify(state));
	if(recipe==='healing' && (next.inventory.herb||0) >= 2){
		next.inventory.herb -= 2;
		next.potions.healing = (next.potions.healing||0) + 1;
	}
	return next;
}

function advancePatrol(state){
	const next = JSON.parse(JSON.stringify(state));
	for(const e of next.enemies){
		const pts = e.patrol||[];
		if(pts.length===0) continue;
		// Move toward next patrol point by one step
		const tgt = pts[e.p % pts.length];
		const dx = Math.sign(tgt.x - e.x);
		const dy = Math.sign(tgt.y - e.y);
		if(dx!==0) e.x += dx; else if(dy!==0) e.y += dy; else e.p = (e.p+1)%pts.length;
	}
	return next;
}