try {
	require('ts-node').register();
} catch (err) {
	console.error('[gen-toppler-wrapper] ts-node not found. Installing temporarily...');
	const { execSync } = require('child_process');
	execSync('npm i -D ts-node typescript', { stdio: 'inherit' });
	require('ts-node').register();
}
require('./gen-toppler-html.ts');

