'use strict';
(function(){
	// MIFF Router: hash-based router for zones and tools (remix-safe, no deps)
	// Exposes window.MIFFRouter for contributor extensions.

	const preview = document.getElementById('zone-preview');
	const remixToggle = document.getElementById('remixToggle');
	let remixOn = false;

	// Known routes: add new zones here. Keys are hash values without '#'
	const ROUTES = {
		'toppler': 'zones/toppler/index.html',
		'spirit_tamer': 'zones/spirit_tamer/index.html',
		'witcher_grove': 'zones/witcher_grove/index.html',
		'dashboard': 'dashboard/index.html'
	};

	function getHash(){ return (location.hash||'').replace(/^#/, '').trim(); }

	function buildSrc(route){
		if(!route) return null;
		// Only append remix flag for zone pages, not dashboard
		const isZone = route.startsWith('zones/');
		const q = (isZone && remixOn) ? '?remix=1' : '';
		return `./${route}${q}`;
	}

	function ensureDebugOverlay(){
		let dbg = document.getElementById('route-debug');
		if(dbg) return dbg;
		dbg = document.createElement('div');
		dbg.id = 'route-debug';
		dbg.style.position = 'fixed';
		dbg.style.right = '8px';
		dbg.style.bottom = '8px';
		dbg.style.background = 'rgba(0,0,0,0.6)';
		dbg.style.color = '#e6edf3';
		dbg.style.font = '12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif';
		dbg.style.padding = '6px 8px';
		dbg.style.border = '1px solid #222';
		dbg.style.borderRadius = '6px';
		dbg.style.zIndex = '9999';
		dbg.style.pointerEvents = 'none';
		document.body.appendChild(dbg);
		return dbg;
	}

	function setDebug(status){
		const dbg = ensureDebugOverlay();
		dbg.textContent = `[MIFF] route=${getHash()||'(splash)'} | ${status}`;
	}

	function fadeOutIn(node, next){
		if(!node){ next(); return; }
		node.style.transition = 'opacity 180ms ease';
		node.style.opacity = '0';
		setTimeout(()=>{ next(); setTimeout(()=>{ node.style.opacity = '1'; }, 20); }, 200);
	}

	function renderSplash(){
		if(!preview) return;
		preview.innerHTML = `
			<div style="padding:16px;text-align:center">
				<h3 style="margin:8px 0">Made with MIFF in mind</h3>
				<p style="color:#9da7b1">Choose a zone above to start, or open the dashboard.</p>
			</div>
		`;
		setDebug('idle');
	}

	function renderRoute(){
		if(!preview) return;
		const key = getHash();
		if(!key){ renderSplash(); return; }
		const route = ROUTES[key];
		if(!route){
			preview.innerHTML = `<div style="padding:16px">Unknown route: <code>${key}</code></div>`;
			setDebug('unknown');
			return;
		}
		const src = buildSrc(route);
		fadeOutIn(preview, ()=>{
			preview.innerHTML = `
				<iframe src="${src}" frameborder="0" width="100%" height="600" loading="lazy"></iframe>
			`;
			const iframe = preview.querySelector('iframe');
			if(iframe){
				setDebug('loading');
				iframe.addEventListener('load', ()=> setDebug('loaded'));
				iframe.addEventListener('error', ()=>{
					setDebug('error');
					preview.innerHTML = `<div style="padding:16px">Demo not available. Check asset paths or remix safety.</div>`;
				});
			}
		});
	}

	// Remix toggle wiring
	if(remixToggle){
		remixToggle.addEventListener('change', (e)=>{
			remixOn = !!e.target.checked;
			document.body.classList.toggle('remix-on', remixOn);
			renderRoute();
		});
	}

	// Public API for extensions
	window.MIFFRouter = {
		navigate(key){ location.hash = key ? `#${key}` : ''; },
		refresh(){ renderRoute(); },
		current(){ return getHash(); }
	};

	window.addEventListener('hashchange', renderRoute);
	// Initial render
	renderRoute();
})();