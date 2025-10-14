export interface AnimationFrame {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	frame: number;
	duration: number; // milliseconds
	layer: string; // filename or data URL
}

export interface Animation {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	frames: AnimationFrame[];
	loop: boolean;
	speed: number; // frames per second
}

export interface SpriteSheet {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	width: number;
	height: number;
	frameWidth: number;
	frameHeight: number;
	layers: string[]; // filenames or data URLs
}

export const PixelAnimUtils = {
	createAnimation: (name: string, frames: string[], fps: number, loop: boolean): Animation => {
		return {
			name,
			frames,
			fps,
			loop,
			currentFrame: 0,
			lastUpdate: 0
		};
	},

	createFromPreset: (presetName: string): Animation => {
		const presets: Record<string, any> = {};
		const preset = presets[presetName];
		if (!preset) throw new Error(`Unknown animation preset: ${presetName}`);
		return PixelAnimUtils.createAnimation(preset.name, preset.frames, preset.fps, preset.loop);
	},

	createSpriteSheet: (animations: Animation[], frameWidth: number, frameHeight: number): SpriteSheet => {
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

	exportAnimation: (animation: Animation): unknown => {
		return {
			schema: "miff.pixel.animation.v1",
			name: animation.name,
			frames: animation.frames,
			loop: animation.loop,
			speed: animation.speed
		};
	},

	exportSpriteSheet: (spriteSheet: SpriteSheet): unknown => {
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