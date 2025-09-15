export interface AnimationFrame {
	frame: number;
	duration: number; // milliseconds
	layer: string; // filename or data URL
}

export interface Animation {
	name: string;
	frames: AnimationFrame[];
	loop: boolean;
	speed: number; // frames per second
}

export interface SpriteSheet {
	width: number;
	height: number;
	frameWidth: number;
	frameHeight: number;
	layers: string[]; // filenames or data URLs
}

export const PixelAnimPure = {
	createAnimation(name: string, frameFiles: string[], fps: number = 8, loop: boolean = true): Animation {
		const duration = 1000 / fps; // milliseconds per frame
		const frames: AnimationFrame[] = frameFiles.map((file, index) => ({
			frame: index,
			duration,
			layer: file
		}));

		return {
			name,
			frames,
			loop,
			speed: fps
		};
	},

	createSpriteSheet(animations: Animation[], frameWidth: number, frameHeight: number): SpriteSheet {
		const allLayers: string[] = [];
		animations.forEach(anim => {
			anim.frames.forEach(frame => {
				if (!allLayers.includes(frame.layer)) {
					allLayers.push(frame.layer);
				}
			});
		});

		return {
			width: frameWidth * allLayers.length,
			height: frameHeight,
			frameWidth,
			frameHeight,
			layers: allLayers
		};
	},

	exportAnimation(animation: Animation): unknown {
		return {
			schema: "miff.pixel.animation.v1",
			name: animation.name,
			frames: animation.frames,
			loop: animation.loop,
			speed: animation.speed
		};
	},

	exportSpriteSheet(spriteSheet: SpriteSheet): unknown {
		return {
			schema: "miff.pixel.spritesheet.v1",
			width: spriteSheet.width,
			height: spriteSheet.height,
			frameWidth: spriteSheet.frameWidth,
			frameHeight: spriteSheet.frameHeight,
			layers: spriteSheet.layers
		};
	}
};