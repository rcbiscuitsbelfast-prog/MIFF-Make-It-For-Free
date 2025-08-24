'use strict';
(function(){
	const remixToggle = document.getElementById('remixToggle');
	let remix = false;

	function renderPreview(){
		const zone = location.hash.replace('#','');
		const preview = document.getElementById('zone-preview');
		if(!preview) return;
		if(zone){
			const src = `../zones/${zone}/index.html${remix? '?remix=1':''}`;
			preview.innerHTML = `
				<iframe src="${src}" frameborder="0" width="100%" height="600" loading="lazy"
					onerror="this.parentElement.innerHTML='Demo not available. Check your engine bridge or remix safety.'"></iframe>
			`;
		}else{
			preview.innerHTML = '';
		}
	}

	remixToggle.addEventListener('change', (e)=>{
		remix = !!e.target.checked;
		document.body.classList.toggle('remix-on', remix);
		renderPreview();
	});

	window.addEventListener('hashchange', renderPreview);
	// Render initial hash on load
	renderPreview();
})();