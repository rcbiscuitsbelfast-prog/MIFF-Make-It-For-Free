export class MobileIntegration {
  constructor(canvas, onMove, onAction) {
    this.canvas = canvas;
    this.onMove = onMove;
    this.onAction = onAction;
    this.root = null;
    this.thumb = null;
    this.center = { x: 0, y: 0 };
  }

  mount() {
    if (this.root) return;
    const overlay = document.createElement('div');
    overlay.className = 'rw-overlay';

    const joystick = document.createElement('div');
    joystick.className = 'rw-joystick';
    const thumb = document.createElement('div');
    thumb.className = 'rw-joystick-thumb';
    joystick.appendChild(thumb);
    this.thumb = thumb;

    const actions = document.createElement('div');
    actions.className = 'rw-actions';
    const btnJump = document.createElement('button');
    btnJump.className = 'rw-btn';
    btnJump.textContent = 'Jump';
    const btnUse = document.createElement('button');
    btnUse.className = 'rw-btn';
    btnUse.textContent = 'Use';
    actions.appendChild(btnJump);
    actions.appendChild(btnUse);

    overlay.appendChild(joystick);
    overlay.appendChild(actions);
    this.canvas.parentElement.appendChild(overlay);
    this.root = overlay;

    const getVec = (clientX, clientY) => {
      const rect = joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const max = rect.width / 2 - 6;
      const len = Math.hypot(dx, dy);
      const factor = len > 0 ? Math.min(1, len / max) : 0;
      const nx = (dx / (max || 1)) * factor;
      const ny = (dy / (max || 1)) * factor;
      return { nx, ny, px: (cx + nx * max), py: (cy + ny * max) };
    };

    let dragging = false;
    const start = (e) => {
      dragging = true;
      const t = e.touches ? e.touches[0] : e;
      const v = getVec(t.clientX, t.clientY);
      this.thumb.style.left = `${v.px - joystick.getBoundingClientRect().left}px`;
      this.thumb.style.top = `${v.py - joystick.getBoundingClientRect().top}px`;
      this.onMove?.({ x: v.nx, y: v.ny });
    };
    const move = (e) => {
      if (!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      const v = getVec(t.clientX, t.clientY);
      this.thumb.style.left = `${v.px - joystick.getBoundingClientRect().left}px`;
      this.thumb.style.top = `${v.py - joystick.getBoundingClientRect().top}px`;
      this.onMove?.({ x: v.nx, y: v.ny });
    };
    const end = () => {
      dragging = false;
      this.thumb.style.left = '50%';
      this.thumb.style.top = '50%';
      this.onMove?.({ x: 0, y: 0 });
    };

    joystick.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    joystick.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end, { passive: true });

    btnJump.addEventListener('click', () => this.onAction?.('jump'));
    btnUse.addEventListener('click', () => this.onAction?.('use'));
  }
}
