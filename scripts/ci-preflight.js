// Validate presence of required npm scripts in root package.json
const fs = require('fs');

function fail(msg){
	console.error(`[preflight] ${msg}`);
	process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync('package.json','utf-8'));
if(!pkg.scripts || !pkg.scripts.test){
	fail('Missing "test" script in root package.json');
}
console.log('[preflight] test script present:', pkg.scripts.test);
process.exit(0);

