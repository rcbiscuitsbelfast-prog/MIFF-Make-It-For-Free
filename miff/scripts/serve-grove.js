const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ROOT = process.cwd();

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
};

function send(res, code, body, headers={}){
	res.writeHead(code, Object.assign({ 'Cache-Control': 'no-store' }, headers));
	res.end(body);
}

function filePathFromUrl(urlPath){
	// Normalize and prevent traversal
	let p = decodeURIComponent((urlPath || '/').split('?')[0]);
	if (p === '/' || p === '') p = '/site/zones/witcher_grove/index.html';
	// Common aliases
	if (p === '/viewer') p = '/site/zones/witcher_grove/index.html';
	// Normalize as POSIX path for URLs and disallow traversals
	const normalized = path.posix.normalize(p);
	if (normalized.includes('..')) return null;
	const safe = normalized.startsWith('/') ? normalized.slice(1) : normalized;
	return path.join(ROOT, safe);
}

const server = http.createServer((req, res) => {
	try{
		const fp = filePathFromUrl(req.url || '/');
		if (!fp) return send(res, 403, 'Forbidden');
		let stat;
		try { stat = fs.statSync(fp); } catch {}
		if (!stat) {
			return send(res, 404, 'Not Found');
		}
		if (stat.isDirectory()) {
			// Redirect directories to index.html where appropriate
			const index = path.join(fp, 'index.html');
			if (fs.existsSync(index)) {
				const body = fs.readFileSync(index);
				return send(res, 200, body, { 'Content-Type': MIME['.html'] });
			}
			return send(res, 403, 'Forbidden');
		}
		const ext = path.extname(fp).toLowerCase();
		const type = MIME[ext] || 'application/octet-stream';
		const body = fs.readFileSync(fp);
		return send(res, 200, body, { 'Content-Type': type });
	}catch(err){
		console.error('[serve-grove] error', err);
		return send(res, 500, 'Internal Server Error');
	}
});

server.listen(PORT, () => {
	console.log(`[serve-grove] Serving at http://localhost:${PORT}`);
	console.log('[serve-grove] Viewer:', `http://localhost:${PORT}/site/zones/witcher_grove/index.html`);
});

