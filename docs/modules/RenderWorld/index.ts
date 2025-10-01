export * from '../../renderworld/index'

export function openPixelWorldViewport(): void {
	try {
		const url = '../render/viewport/pixelCityViewport.html';
		window.open(url, '_blank');
	} catch (err) {
		console.error('[RenderWorld] Failed to open Pixel World viewport', err);
	}
}
