// Audit 'miff-*' packages for required scripts, stub missing 'test'
const fs = require('fs');
const path = require('path');

const required = ['test','build','simulate','orchestrate'];

function findDirs(root){
	const results = [];
	function walk(dir){
		for(const name of fs.readdirSync(dir)){
			const p = path.join(dir, name);
			try{
				const st = fs.statSync(p);
				if(st.isDirectory()){
					if(/^miff-/.test(name)) results.push(p);
					walk(p);
				}
			}catch{}
		}
	}
	walk(root);
	return results;
}

function main(){
	const root = process.cwd();
	const dirs = findDirs(root);
	for(const dir of dirs){
		const pkgPath = path.join(dir, 'package.json');
		if(!fs.existsSync(pkgPath)) continue;
		const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf-8'));
		pkg.scripts = pkg.scripts || {};
		if(!pkg.scripts.test){
			pkg.scripts.test = `echo \"No tests defined for ${pkg.name || path.basename(dir)}\" && exit 0`;
			console.log('🛠 Stubbed test script in', pkg.name || dir);
		}
		for(const s of required){
			if(!pkg.scripts[s]){
				console.log(`⚠️ ${pkg.name || dir} missing '${s}' script`);
			}
		}
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
	}
	console.log('[ci-script-validator] Completed');
}

main();

