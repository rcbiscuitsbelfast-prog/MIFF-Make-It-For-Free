// Remix Lab Zone - Contributor-facing debug zone and CLI triggers
// This zone provides debugging tools and validation for MIFF contributors

export function startZone(config = {}) {
	const { remix = false, debug = false } = config;
	
	console.log('🧪 Remix Lab Zone started', { remix, debug });
	
	// Initialize debug tools if in remix mode
	if (remix) {
		initRemixTools();
	}
	
	// Return zone state for testing
	return {
		zone: 'remix_lab',
		status: 'active',
		remix: remix,
		debug: debug
	};
}

function initRemixTools() {
	// Add debug overlay
	const debugOverlay = document.createElement('div');
	debugOverlay.id = 'remix-debug-overlay';
	debugOverlay.style.cssText = `
		position: fixed;
		top: 10px;
		right: 10px;
		background: rgba(15,17,22,0.9);
		border: 1px solid #58a6ff;
		border-radius: 8px;
		padding: 12px;
		color: #e6edf3;
		font-family: monospace;
		font-size: 12px;
		z-index: 10000;
		max-width: 300px;
	`;
	
	debugOverlay.innerHTML = `
		<div><strong>🧪 Remix Lab Debug</strong></div>
		<div>Zone: remix_lab</div>
		<div>Status: Active</div>
		<div>Time: ${new Date().toLocaleTimeString()}</div>
		<div style="margin-top: 8px;">
			<button onclick="console.log('Remix Lab: Debug button clicked')" style="background: #1f6feb; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Test Console</button>
		</div>
	`;
	
	document.body.appendChild(debugOverlay);
	
	console.log('🧪 Remix Lab: Debug tools initialized');
}

// Export for testing
export const remixLabZone = {
	startZone,
	initRemixTools
};