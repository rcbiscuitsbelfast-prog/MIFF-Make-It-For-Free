'use strict';
(function(){
	const remixToggle = document.getElementById('remixToggle');
	const cards = document.querySelectorAll('.card[data-zone]');
	let remix = false;

	function openZone(zone){
		// For static hosting, link to README anchors or local dev routes.
		const map = {
			toppler: '../../sampler/zones/toppler.js',
			spirit_tamer: '../../sampler/zones/spirit_tamer.js',
			witcher_grove: '../../sampler/zones/witcher_grove.js',
			remix_lab: '../../sampler/zones/remix_lab.js'
		};
		const url = map[zone] || '../../README.md';
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	remixToggle.addEventListener('change', (e)=>{
		remix = !!e.target.checked;
		document.body.classList.toggle('remix-on', remix);
		console.log('Remix Mode:', remix);
	});

	cards.forEach(btn => btn.addEventListener('click', ()=>{
		openZone(btn.getAttribute('data-zone'));
	}));
})();