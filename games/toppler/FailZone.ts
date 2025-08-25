export interface FailZoneConfig {
    failHeight?: number;
}

export class FailZone {
    private cfg: Required<FailZoneConfig>;
    private triggered = false;
    constructor(config: FailZoneConfig = {}) {
        this.cfg = { failHeight: config.failHeight ?? -100 };
    }

    public check(playerY: number, canvasHeight: number): boolean {
        if (this.triggered) return true;
        const isFail = playerY > canvasHeight - this.cfg.failHeight;
        if (isFail) this.triggered = true;
        return this.triggered;
    }

    public reset(): void { this.triggered = false; }
    public isTriggered(): boolean { return this.triggered; }
}

