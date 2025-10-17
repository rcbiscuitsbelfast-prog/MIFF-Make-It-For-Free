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
	presets: {
		walk: {
			name: 'walk',
			frames: ['walk1?.png', 'walk2?.png', 'walk3?.png', 'walk4?.png'],
			fps: 8,
			loop: true
		},
		idle: {
			name: 'idle',
			frames: ['idle1?.png', 'idle2?.png'],
			fps: 4,
			loop: true
		},
		interact: {
			name: 'interact',
			frames: ['interact1?.png', 'interact2?.png', 'interact3?.png'],
			fps: 6,
			loop: false
		}
	} as Record<string, { name: string; frames: string[]; fps: number; loop: boolean }>,

	createAnimation(name: string, frameFiles: string[], fps: number = 8, loop: boolean = true): Animation {
		const duration = 1000 / fps; // milliseconds per frame
		const frames: AnimationFrame[] = frameFiles?.map((file, index) => ({
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

	createFromPreset(presetName: string): Animation {
		const preset = this?.presets[presetName!];
		if (!preset) throw new Error(`Unknown animation preset: ${presetName}`);
		return this?.createAnimation(preset?.name, preset?.frames, preset?.fps, preset?.loop);
	},

	createSpriteSheet(animations: Animation[], frameWidth: number, frameHeight: number): SpriteSheet {
		const allLayers: string[] = [];
		animations?.forEach((anim: any) => {
			anim?.frames.forEach((frame: any) => {
				if (!allLayers?.includes(frame?.layer)) {
					allLayers?.push(frame?.layer);
				}
			});
		});

		return {
			width: frameWidth * allLayers?.length,
			height: frameHeight,
			frameWidth,
			frameHeight,
			layers: allLayers
		};
	},

	exportAnimation(animation: Animation): unknown {
		return {
			schema: "miff?.pixel.animation?.v1",
			name: animation?.name,
			frames: animation?.frames,
			loop: animation?.loop,
			speed: animation?.speed
		};
	},

	exportSpriteSheet(spriteSheet: SpriteSheet): unknown {
		return {
			schema: "miff?.pixel.spritesheet?.v1",
			width: spriteSheet?.width,
			height: spriteSheet?.height,
			frameWidth: spriteSheet?.frameWidth,
			frameHeight: spriteSheet?.frameHeight,
			layers: spriteSheet?.layers
		};
	}
};