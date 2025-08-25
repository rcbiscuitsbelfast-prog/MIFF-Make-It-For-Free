export interface Platform { x: number; y: number; width: number; height: number }

export interface SpawnerConfig {
    count?: number;
    verticalGap?: number;
    minX?: number;
    maxX?: number;
    width?: number;
    height?: number;
}

export class PlatformSpawner {
    private cfg: Required<SpawnerConfig>;
    constructor(config: SpawnerConfig = {}) {
        this.cfg = {
            count: config.count ?? 8,
            verticalGap: config.verticalGap ?? 70,
            minX: config.minX ?? 40,
            maxX: config.maxX ?? 280,
            width: config.width ?? 120,
            height: config.height ?? 16
        };
    }

    public generate(canvasSize: { width: number; height: number }): Platform[] {
        return Array.from({ length: this.cfg.count }).map((_, i) => ({
            x: (i % 2 === 0 ? this.cfg.minX : this.cfg.maxX - this.cfg.width),
            y: canvasSize.height - 80 - i * this.cfg.verticalGap,
            width: this.cfg.width,
            height: this.cfg.height
        }));
    }
}

