export class FailZone {
    constructor(config = {}) {
        this.triggered = false;
        this.cfg = { failHeight: config.failHeight ?? -100 };
    }
    check(playerY, canvasHeight) {
        if (this.triggered)
            return true;
        const isFail = playerY > canvasHeight - this.cfg.failHeight;
        if (isFail)
            this.triggered = true;
        return this.triggered;
    }
    reset() { this.triggered = false; }
    isTriggered() { return this.triggered; }
}
