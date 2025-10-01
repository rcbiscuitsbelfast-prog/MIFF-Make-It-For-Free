export * from '../../renderworld/index'

export function openPixelWorldViewport(): void {
	try {
		const url = 'https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/render/viewport/?v=2025-10-01-3';
		window.open(url, '_blank', 'noopener');
	} catch (err) {
		console.error('[RenderWorld] Failed to open Pixel World viewport', err);
	}
}
