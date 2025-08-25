export interface WinTriggerConfig {
    winHeight?: number;
}

export class WinTrigger {
    private cfg: Required<WinTriggerConfig>;
    private triggered = false;
    constructor(config: WinTriggerConfig = {}) {
        this.cfg = { winHeight: config.winHeight ?? 560 };
    }

    public check(playerY: number, canvasHeight: number): boolean {
        if (this.triggered) return true;
        const heightFromBottom = canvasHeight - playerY;
        if (heightFromBottom >= this.cfg.winHeight) {
            this.triggered = true;
        }
        return this.triggered;
    }

    public reset(): void { this.triggered = false; }
    public isTriggered(): boolean { return this.triggered; }
}

