// Scaffold Jest configuration and a basic test if missing
const fs = require('fs');
const path = require('path');

function ensureFile(filePath, content){
	if(!fs.existsSync(filePath)){
		fs.writeFileSync(filePath, content);
		console.log('[jest-scaffold] created', filePath);
	}
}

function main(){
	const root = process.cwd();
	ensureFile(path.join(root, 'jest.config.js'), 'module.exports = {}\n');
	const testsDir = path.join(root, 'tests');
	if(!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });
	ensureFile(path.join(testsDir, 'basic.test.js'), "test('placeholder', () => expect(true).toBe(true));\n");
	// Optional orchestration manifest check
	const testPath = path.join(testsDir, 'basic.test.js');
	const ext = "\n\ntry { test('orchestration manifest loads', () => { const manifest = require('../orchestration.json'); expect(manifest).toBeDefined(); }); } catch (e) {}\n";
	fs.appendFileSync(testPath, ext);
	console.log('[jest-scaffold] completed');
}

main();

