const { execSync } = require('child_process');

try {
	execSync('npx vite --open site/zones/witcher_grove/index.html', { stdio: 'inherit' });
} catch (err) {
	console.error('[start_grove] Failed to open Vite dev server:', err?.message || err);
	process.exit(1);
}

