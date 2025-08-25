/**
 * PlatformSpawner - Generates platforms for MIFF Toppler demo
 * 
 * Features:
 * - Static and procedural platform generation
 * - Remixable layout injection
 * - Theme-aware platform styling
 * - Configurable difficulty scaling
 * - Remix-safe architecture with no hardcoded dependencies
 */

export interface PlatformConfig {
    width: number;
    height: number;
    minSpacing: number;
    maxSpacing: number;
    minWidth: number;
    maxWidth: number;
    theme: string;
    movingPlatforms: boolean;
    breakablePlatforms: boolean;
}

export interface Platform {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'static' | 'moving' | 'breakable';
    theme: string;
    isActive: boolean;
    update: (deltaTime: number) => void;
    render: (ctx: CanvasRenderingContext2D, remixMode: boolean) => void;
    destroy: () => void;
}

export interface LayoutPreset {
    name: string;
    description: string;
    platforms: PlatformData[];
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export interface PlatformData {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'static' | 'moving' | 'breakable';
    theme?: string;
}

export class PlatformSpawner {
    private config: PlatformConfig;
    private platforms: Platform[];
    private layoutPresets: Map<string, LayoutPreset>;
    private currentLayout: string;
    private screenBounds: { width: number; height: number };

    constructor(config: Partial<PlatformConfig> = {}, screenBounds: { width: number; height: number }) {
        this.config = {
            width: 20,
            height: 80,
            minSpacing: 80,
            maxSpacing: 150,
            minWidth: 60,
            maxWidth: 120,
            theme: 'classic',
            movingPlatforms: false,
            breakablePlatforms: false,
            ...config
        };

        this.platforms = [];
        this.layoutPresets = new Map();
        this.currentLayout = 'default';
        this.screenBounds = screenBounds;
        
        this.initializeLayoutPresets();
    }

    private initializeLayoutPresets(): void {
        // Default procedural layout
        this.layoutPresets.set('default', {
            name: 'Default',
            description: 'Procedurally generated platforms with random spacing',
            platforms: [],
            difficulty: 'medium'
        });

        // Easy layout - closer platforms
        this.layoutPresets.set('easy', {
            name: 'Easy',
            description: 'Closer platform spacing for beginners',
            platforms: [],
            difficulty: 'easy'
        });

        // Hard layout - wider gaps
        this.layoutPresets.set('hard', {
            name: 'Hard',
            description: 'Wider platform gaps for experienced players',
            platforms: [],
            difficulty: 'hard'
        });

        // Extreme layout - challenging jumps
        this.layoutPresets.set('extreme', {
            name: 'Extreme',
            description: 'Maximum difficulty with precise timing required',
            platforms: [],
            difficulty: 'extreme'
        });

        // Forest theme layout
        this.layoutPresets.set('forest', {
            name: 'Forest',
            description: 'Nature-inspired platform arrangement',
            platforms: [
                { x: 100, y: 100, width: 100, height: 20, type: 'static' },
                { x: 300, y: 200, width: 80, height: 20, type: 'static' },
                { x: 150, y: 300, width: 120, height: 20, type: 'static' },
                { x: 400, y: 400, width: 90, height: 20, type: 'static' },
                { x: 200, y: 500, width: 110, height: 20, type: 'static' },
                { x: 350, y: 600, width: 85, height: 20, type: 'static' },
                { x: 120, y: 700, width: 95, height: 20, type: 'static' }
            ],
            difficulty: 'medium'
        });

        // Ruins theme layout
        this.layoutPresets.set('ruins', {
            name: 'Ruins',
            description: 'Ancient architecture-inspired layout',
            platforms: [
                { x: 50, y: 150, width: 150, height: 25, type: 'static' },
                { x: 250, y: 250, width: 100, height: 25, type: 'static' },
                { x: 100, y: 350, width: 200, height: 25, type: 'static' },
                { x: 300, y: 450, width: 120, height: 25, type: 'static' },
                { x: 80, y: 550, width: 180, height: 25, type: 'static' },
                { x: 280, y: 650, width: 140, height: 25, type: 'static' },
                { x: 150, y: 750, width: 160, height: 25, type: 'static' }
            ],
            difficulty: 'hard'
        });

        // Neon theme layout
        this.layoutPresets.set('neon', {
            name: 'Neon',
            description: 'Cyberpunk-inspired floating platforms',
            platforms: [
                { x: 120, y: 120, width: 80, height: 15, type: 'static' },
                { x: 280, y: 220, width: 60, height: 15, type: 'static' },
                { x: 180, y: 320, width: 100, height: 15, type: 'static' },
                { x: 320, y: 420, width: 70, height: 15, type: 'static' },
                { x: 140, y: 520, width: 90, height: 15, type: 'static' },
                { x: 260, y: 620, width: 75, height: 15, type: 'static' },
                { x: 200, y: 720, width: 85, height: 15, type: 'static' }
            ],
            difficulty: 'medium'
        });
    }

    public generatePlatforms(layoutName: string = 'default', count: number = 8): Platform[] {
        this.currentLayout = layoutName;
        this.platforms = [];

        const preset = this.layoutPresets.get(layoutName);
        if (preset && preset.platforms.length > 0) {
            // Use predefined layout
            this.platforms = preset.platforms.map((data, index) => 
                this.createPlatform(data, `platform_${index}`)
            );
        } else {
            // Generate procedural layout
            this.platforms = this.generateProceduralLayout(count);
        }

        return this.platforms;
    }

    private generateProceduralLayout(count: number): Platform[] {
        const platforms: Platform[] = [];
        const spacing = this.getSpacingForDifficulty(this.currentLayout);
        
        for (let i = 0; i < count; i++) {
            const platform = this.createProceduralPlatform(i, spacing);
            platforms.push(platform);
        }

        return platforms;
    }

    private createProceduralPlatform(index: number, spacing: number): Platform {
        const y = this.screenBounds.height - (index * spacing + 100);
        const x = Math.random() * (this.screenBounds.width - 120) + 60;
        const width = this.config.minWidth + Math.random() * (this.config.maxWidth - this.config.minWidth);
        
        return this.createPlatform({
            x,
            y,
            width,
            height: this.config.height,
            type: 'static'
        }, `platform_${index}`);
    }

    private createPlatform(data: PlatformData, id: string): Platform {
        const platform: Platform = {
            id,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            type: data.type,
            theme: data.theme || this.config.theme,
            isActive: true,
            update: (deltaTime: number) => this.updatePlatform(platform, deltaTime),
            render: (ctx: CanvasRenderingContext2D, remixMode: boolean) => this.renderPlatform(platform, ctx, remixMode),
            destroy: () => this.destroyPlatform(platform)
        };

        return platform;
    }

    private updatePlatform(platform: Platform, deltaTime: number): void {
        if (platform.type === 'moving') {
            // Implement moving platform logic
            this.updateMovingPlatform(platform, deltaTime);
        }
    }

    private updateMovingPlatform(platform: Platform, deltaTime: number): void {
        // Simple horizontal movement pattern
        const time = Date.now() * 0.001;
        const amplitude = 50;
        const frequency = 0.5;
        
        platform.x = platform.x + Math.sin(time * frequency) * amplitude * deltaTime * 0.01;
        
        // Keep platform within bounds
        if (platform.x < 0) platform.x = 0;
        if (platform.x + platform.width > this.screenBounds.width) {
            platform.x = this.screenBounds.width - platform.width;
        }
    }

    private renderPlatform(platform: Platform, ctx: CanvasRenderingContext2D, remixMode: boolean): void {
        if (!platform.isActive) return;

        // Get theme-appropriate color
        const color = this.getPlatformColor(platform.theme, platform.type);
        
        // Draw platform
        ctx.fillStyle = color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add theme-specific details
        this.renderPlatformDetails(platform, ctx);
        
        // Debug overlay in remix mode
        if (remixMode) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            
            // Show platform info
            ctx.fillStyle = '#ffff00';
            ctx.font = '10px monospace';
            ctx.fillText(`${platform.id}`, platform.x, platform.y - 5);
        }
    }

    private renderPlatformDetails(platform: Platform, ctx: CanvasRenderingContext2D): void {
        const theme = platform.theme || this.config.theme;
        
        switch (theme) {
            case 'forest':
                // Add grass texture
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(platform.x, platform.y, platform.width, 5);
                break;
                
            case 'ruins':
                // Add stone texture
                ctx.fillStyle = '#696969';
                ctx.fillRect(platform.x, platform.y, platform.width, 5);
                break;
                
            case 'neon':
                // Add glow effect
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.shadowBlur = 0;
                break;
                
            default:
                // Classic theme - no additional details
                break;
        }
    }

    private getPlatformColor(theme: string, type: string): string {
        const colorSchemes: Record<string, Record<string, string>> = {
            forest: {
                static: '#228B22',
                moving: '#32CD32',
                breakable: '#8B4513'
            },
            ruins: {
                static: '#A0522D',
                moving: '#CD853F',
                breakable: '#696969'
            },
            neon: {
                static: '#FF00FF',
                moving: '#00FFFF',
                breakable: '#FF0000'
            },
            classic: {
                static: '#4ECDC4',
                moving: '#45B7D1',
                breakable: '#96CEB4'
            }
        };
        
        const themeColors = colorSchemes[theme];
        if (themeColors && themeColors[type]) {
            return themeColors[type];
        }
        
        const classicColors = colorSchemes['classic'];
        if (classicColors && classicColors['static']) {
            return classicColors['static'];
        }
        
        return '#4ECDC4';
    }

    private getSpacingForDifficulty(difficulty: string): number {
        const spacingMap: Record<string, number> = {
            'easy': 80,
            'medium': 120,
            'hard': 160,
            'extreme': 200
        };
        
        const spacing = spacingMap[difficulty];
        if (spacing !== undefined) {
            return spacing;
        }
        
        const mediumSpacing = spacingMap['medium'];
        return mediumSpacing !== undefined ? mediumSpacing : 120;
    }

    private destroyPlatform(platform: Platform): void {
        platform.isActive = false;
        const index = this.platforms.findIndex(p => p.id === platform.id);
        if (index !== -1) {
            this.platforms.splice(index, 1);
        }
    }

    public updateScreenBounds(bounds: { width: number; height: number }): void {
        this.screenBounds = bounds;
    }

    public addCustomLayout(name: string, layout: LayoutPreset): void {
        this.layoutPresets.set(name, layout);
    }

    public getAvailableLayouts(): LayoutPreset[] {
        return Array.from(this.layoutPresets.values());
    }

    public getCurrentLayout(): string {
        return this.currentLayout;
    }

    public setTheme(theme: string): void {
        this.config.theme = theme;
        // Update existing platforms with new theme
        this.platforms.forEach(platform => {
            platform.theme = theme;
        });
    }

    public getPlatforms(): Platform[] {
        return [...this.platforms];
    }

    public reset(): void {
        this.platforms.forEach(platform => platform.destroy());
        this.platforms = [];
    }

    public destroy(): void {
        this.reset();
        this.layoutPresets.clear();
    }
}