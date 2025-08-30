export class StartMenu {
    constructor(config = {}) {
        this.instructionsVisible = false;
        this.config = {
            title: config.title ?? 'Toppler',
            instructions: config.instructions ?? 'Press Space or Arrow Up to jump. Reach the top without falling.',
            contrastMode: !!config.contrastMode,
            reducedMotion: !!config.reducedMotion
        };
    }
    mount(container, events) {
        this.container = container;
        this.overlay = document.createElement('div');
        this.overlay.id = 'toppler-start-menu';
        this.overlay.style.cssText = [
            'position: absolute',
            'inset: 0',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'background: rgba(0,0,0,0.85)',
            'z-index: 1000',
        ].join(';');
        const panel = document.createElement('div');
        panel.style.cssText = [
            'background: #1e1e1e',
            'color: #fff',
            'padding: 24px',
            'border-radius: 12px',
            'width: 320px',
            'font-family: system-ui, sans-serif',
            'text-align: center'
        ].join(';');
        const h1 = document.createElement('h1');
        h1.textContent = this.config.title;
        h1.style.margin = '0 0 8px 0';
        h1.style.fontSize = '24px';
        const p = document.createElement('p');
        p.textContent = this.config.instructions;
        p.style.margin = '0 0 16px 0';
        p.style.fontSize = '14px';
        p.style.opacity = '0.85';
        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Game';
        startBtn.style.cssText = 'background:#4ECDC4;color:#111;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;margin-right:8px;';
        startBtn.onclick = () => {
            this.unmount();
            events.onStart();
        };
        const instrBtn = document.createElement('button');
        instrBtn.textContent = 'Instructions';
        instrBtn.style.cssText = 'background:#333;color:#fff;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;';
        instrBtn.onclick = () => this.toggleInstructions();
        const toggles = document.createElement('div');
        toggles.style.marginTop = '12px';
        const contrast = document.createElement('label');
        const contrastCb = document.createElement('input');
        contrastCb.type = 'checkbox';
        contrastCb.checked = this.config.contrastMode;
        contrastCb.onchange = () => events.onToggleContrast?.(contrastCb.checked);
        contrast.appendChild(contrastCb);
        contrast.appendChild(document.createTextNode(' High Contrast'));
        const reduce = document.createElement('label');
        const reduceCb = document.createElement('input');
        reduceCb.type = 'checkbox';
        reduceCb.checked = this.config.reducedMotion;
        reduceCb.style.marginLeft = '12px';
        reduceCb.onchange = () => events.onToggleReducedMotion?.(reduceCb.checked);
        reduce.appendChild(reduceCb);
        reduce.appendChild(document.createTextNode(' Reduced Motion'));
        toggles.appendChild(contrast);
        toggles.appendChild(reduce);
        panel.appendChild(h1);
        panel.appendChild(p);
        panel.appendChild(startBtn);
        panel.appendChild(instrBtn);
        panel.appendChild(toggles);
        this.overlay.appendChild(panel);
        this.container.appendChild(this.overlay);
    }
    toggleInstructions() {
        this.instructionsVisible = !this.instructionsVisible;
        let instr = document.getElementById('toppler-instructions');
        if (!instr) {
            instr = document.createElement('div');
            instr.id = 'toppler-instructions';
            instr.style.cssText = 'margin-top:12px;font-size:12px;opacity:0.8;text-align:left;';
            this.overlay.querySelector('div')?.appendChild(instr);
        }
        instr.textContent = 'Jump between platforms to reach the top. Falling below the threshold resets the run.';
        instr.style.display = this.instructionsVisible ? 'block' : 'none';
    }
    unmount() {
        if (this.overlay && this.overlay.parentNode)
            this.overlay.parentNode.removeChild(this.overlay);
    }
}
