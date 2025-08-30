export class WinTrigger {
    constructor(config = {}) {
        this.triggered = false;
        this.cfg = { winHeight: config.winHeight ?? 560 };
    }
    check(playerY, canvasHeight) {
        if (this.triggered)
            return true;
        const heightFromBottom = canvasHeight - playerY;
        if (heightFromBottom >= this.cfg.winHeight) {
            this.triggered = true;
        }
        return this.triggered;
    }
    reset() { this.triggered = false; }
    isTriggered() { return this.triggered; }
}
