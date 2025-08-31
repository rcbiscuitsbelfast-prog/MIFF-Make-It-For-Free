#!/usr/bin/env -S node --no-warnings
import fs from '../../miff/pure/fs';
import path from '../../miff/pure/path';

function main(){
	const name = process.argv[2] || 'MyScenarioPure';
	const template = process.argv[3] || 'tutorial';
	const dir = path.resolve(name);
	fs.mkdirSync(dir, { recursive: true });
	const scenario = template==='quest' ? {
		schema:'v13', name:'Quest Scenario', npcs:[{id:'villager'}], inventory:{ apple:1 }, branches:[{ choice:'give_apple', effect:{ inventory:{ apple:-1, coin:5 } } }]
	} : template==='combat' ? {
		schema:'v13', name:'Combat Scenario', arena:{ enemies:[{id:'slime',hp:10,atk:3,def:1}] }, loot:{ tableId:'starter' }, progression:{ xpPerWin:5 }
	} : {
		schema:'v13', name:'Tutorial Scenario', entities:[{id:'hero', stats:[{key:'hp',base:30}]}], steps:[{op:'showStats',args:{id:'hero'}}]
	};
	fs.writeFileSync(path.join(dir,'scenario.json'), JSON.stringify(scenario,null,2));
	const harness = `#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
const s = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]||'${name}/scenario.json'),'utf-8'));
console.log(JSON.stringify({ outputs:[{ op:'runScenario', status:'ok', events:[{type:'scenarioStarted', name:s.name}], finalState:s }]}, null, 2));
`;
	fs.writeFileSync(path.join(dir,'cliHarness.ts'), harness);
	const readme = `# ${name}
\nBootstrapped scenario (${template}). See scenario.json and cliHarness.ts.\n`;
	fs.writeFileSync(path.join(dir,'README.md'), readme);
	const test = `import { execFileSync } from 'child_process';
import path from 'path';

test('golden init scenario', () => {
	const root = path.resolve(__dirname, '..');
	const harness = path.resolve(root, 'cliHarness.ts');
	const scenario = path.resolve(root, 'scenario.json');
	const out = execFileSync('node', [harness, scenario], { encoding: 'utf-8' });
	const got = JSON.parse(out);
	expect(got.outputs[0].op).toBe('runScenario');
});
`;
	fs.mkdirSync(path.join(dir,'tests'), { recursive: true });
	fs.writeFileSync(path.join(dir,'tests','goldenScenario.test.ts'), test);
	console.log(`Initialized ${name} with ${template} template.`);
}
if(require.main===module) main();