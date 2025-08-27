export function createTestCanvas(w: number, h: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	document.body.appendChild(canvas);
	return canvas;
}

