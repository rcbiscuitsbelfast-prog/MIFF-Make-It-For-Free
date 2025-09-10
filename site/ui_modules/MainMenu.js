// MainMenu UI Module - Pure module for main menu interface
// Exports: render(), init(), update(data), destroy()

export class MainMenu {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.state = {
      visible: false,
      options: ['Start Game', 'Settings', 'Credits'],
      selectedIndex: 0
    };
    this.listeners = new Map();
  }

  render() {
    if (this.element) {
      this.destroy();
    }

    this.element = document.createElement('div');
    this.element.className = 'ui-main-menu';
    this.element.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #58a6ff;
      border-radius: 12px;
      padding: 24px;
      min-width: 300px;
      z-index: 1000;
      display: ${this.state.visible ? 'block' : 'none'};
      color: #e6edf3;
      font-family: 'Times New Roman', serif;
    `;

    this.element.innerHTML = `
      <h2 style="margin: 0 0 20px 0; text-align: center; color: #58a6ff;">Main Menu</h2>
      <div class="menu-options">
        ${this.state.options.map((option, index) => `
          <div class="menu-option ${index === this.state.selectedIndex ? 'selected' : ''}" 
               data-index="${index}"
               style="padding: 12px; margin: 8px 0; border-radius: 6px; cursor: pointer; 
                      background: ${index === this.state.selectedIndex ? 'rgba(88, 166, 255, 0.2)' : 'transparent'};
                      border: 1px solid ${index === this.state.selectedIndex ? '#58a6ff' : 'transparent'};
                      transition: all 0.2s;">
            ${option}
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
        Use Arrow Keys or Click to Navigate
      </div>
    `;

    this.container.appendChild(this.element);
    this.attachEventListeners();
    return this.element;
  }

  init() {
    this.render();
    this.bindKeyboardEvents();
    console.log('[MainMenu] Initialized');
  }

  update(data) {
    if (data.visible !== undefined) {
      this.state.visible = data.visible;
    }
    if (data.options) {
      this.state.options = data.options;
    }
    if (data.selectedIndex !== undefined) {
      this.state.selectedIndex = data.selectedIndex;
    }
    this.render();
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.removeEventListeners();
  }

  attachEventListeners() {
    if (!this.element) return;

    const options = this.element.querySelectorAll('.menu-option');
    options.forEach((option, index) => {
      const clickHandler = () => this.selectOption(index);
      option.addEventListener('click', clickHandler);
      this.listeners.set(option, clickHandler);
    });
  }

  removeEventListeners() {
    this.listeners.forEach((handler, element) => {
      element.removeEventListener('click', handler);
    });
    this.listeners.clear();
  }

  bindKeyboardEvents() {
    const keyHandler = (e) => {
      if (!this.state.visible) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.state.selectedIndex = Math.max(0, this.state.selectedIndex - 1);
          this.render();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.state.selectedIndex = Math.min(this.state.options.length - 1, this.state.selectedIndex + 1);
          this.render();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.selectOption(this.state.selectedIndex);
          break;
        case 'Escape':
          e.preventDefault();
          this.hide();
          break;
      }
    };

    window.addEventListener('keydown', keyHandler);
    this.listeners.set('keydown', keyHandler);
  }

  selectOption(index) {
    const option = this.state.options[index];
    console.log('[MainMenu] Selected option:', option);
    
    // Emit custom event
    const event = new CustomEvent('mainMenuSelect', {
      detail: { option, index }
    });
    window.dispatchEvent(event);
  }

  show() {
    this.state.visible = true;
    this.render();
  }

  hide() {
    this.state.visible = false;
    this.render();
  }
}