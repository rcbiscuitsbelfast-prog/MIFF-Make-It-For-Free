// DialogueBox UI Module - Pure module for dialogue and conversation interface
// Exports: render(), init(), update(data), destroy()

export class DialogueBox {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.state = {
      visible: false,
      speaker: '',
      text: '',
      choices: [],
      selectedChoice: 0,
      typing: false,
      typeSpeed: 30
    };
    this.listeners = new Map();
    this.typingTimer = null;
  }

  render() {
    if (this.element) {
      this.destroy();
    }

    this.element = document.createElement('div');
    this.element.className = 'ui-dialogue-box';
    this.element.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #4ecdc4;
      border-radius: 12px;
      padding: 20px;
      z-index: 1000;
      display: ${this.state.visible ? 'block' : 'none'};
      color: #e6edf3;
      font-family: 'Times New Roman', serif;
      max-height: 200px;
    `;

    this.element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div class="speaker-name" style="font-weight: bold; color: #4ecdc4; font-size: 16px;">${this.state.speaker}</div>
        <button class="close-btn" style="background: none; border: none; color: #e6edf3; font-size: 18px; cursor: pointer;">×</button>
      </div>
      <div class="dialogue-text" style="margin-bottom: 16px; line-height: 1.4; min-height: 40px;">
        ${this.state.typing ? this.state.text : ''}
        ${this.state.typing ? '<span class="typing-cursor" style="animation: blink 1s infinite;">|</span>' : ''}
      </div>
      <div class="dialogue-choices" style="display: ${this.state.choices.length > 0 ? 'block' : 'none'};">
        ${this.state.choices.map((choice, index) => `
          <div class="dialogue-choice ${index === this.state.selectedChoice ? 'selected' : ''}" 
               data-choice-index="${index}"
               style="padding: 8px 12px; margin: 4px 0; border-radius: 6px; cursor: pointer;
                      background: ${index === this.state.selectedChoice ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
                      border: 1px solid ${index === this.state.selectedChoice ? '#4ecdc4' : 'transparent'};
                      transition: all 0.2s;">
            ${choice.text}
          </div>
        `).join('')}
      </div>
      <div class="dialogue-controls" style="display: ${this.state.choices.length === 0 ? 'block' : 'none'}; text-align: center; margin-top: 12px;">
        <div style="font-size: 12px; opacity: 0.7;">Press Space or Click to continue</div>
      </div>
      <style>
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      </style>
    `;

    this.container.appendChild(this.element);
    this.attachEventListeners();
    return this.element;
  }

  init() {
    this.render();
    this.bindKeyboardEvents();
    console.log('[DialogueBox] Initialized');
  }

  update(data) {
    if (data.visible !== undefined) {
      this.state.visible = data.visible;
    }
    if (data.speaker !== undefined) {
      this.state.speaker = data.speaker;
    }
    if (data.text !== undefined) {
      this.state.text = data.text;
    }
    if (data.choices !== undefined) {
      this.state.choices = data.choices;
    }
    if (data.selectedChoice !== undefined) {
      this.state.selectedChoice = data.selectedChoice;
    }
    if (data.typing !== undefined) {
      this.state.typing = data.typing;
    }
    this.render();
  }

  destroy() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.removeEventListeners();
  }

  attachEventListeners() {
    if (!this.element) return;

    // Close button
    const closeBtn = this.element.querySelector('.close-btn');
    if (closeBtn) {
      const closeHandler = () => this.hide();
      closeBtn.addEventListener('click', closeHandler);
      this.listeners.set(closeBtn, closeHandler);
    }

    // Dialogue choices
    const choices = this.element.querySelectorAll('.dialogue-choice');
    choices.forEach((choice) => {
      const clickHandler = () => {
        const choiceIndex = parseInt(choice.dataset.choiceIndex);
        this.selectChoice(choiceIndex);
      };
      choice.addEventListener('click', clickHandler);
      this.listeners.set(choice, clickHandler);
    });

    // Click to continue
    const textArea = this.element.querySelector('.dialogue-text');
    if (textArea && this.state.choices.length === 0) {
      const continueHandler = () => this.continueDialogue();
      textArea.addEventListener('click', continueHandler);
      this.listeners.set(textArea, continueHandler);
    }
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
        case 'Escape':
          e.preventDefault();
          this.hide();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (this.state.choices.length > 0) {
            this.state.selectedChoice = Math.max(0, this.state.selectedChoice - 1);
            this.render();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (this.state.choices.length > 0) {
            this.state.selectedChoice = Math.min(this.state.choices.length - 1, this.state.selectedChoice + 1);
            this.render();
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (this.state.choices.length > 0) {
            this.selectChoice(this.state.selectedChoice);
          } else {
            this.continueDialogue();
          }
          break;
      }
    };

    window.addEventListener('keydown', keyHandler);
    this.listeners.set('keydown', keyHandler);
  }

  selectChoice(choiceIndex) {
    if (choiceIndex >= 0 && choiceIndex < this.state.choices.length) {
      const choice = this.state.choices[choiceIndex];
      console.log('[DialogueBox] Selected choice:', choice.text);
      
      // Emit custom event
      const event = new CustomEvent('dialogueChoice', {
        detail: { choice, index: choiceIndex }
      });
      window.dispatchEvent(event);
    }
  }

  continueDialogue() {
    console.log('[DialogueBox] Continuing dialogue');
    
    // Emit custom event
    const event = new CustomEvent('dialogueContinue', {
      detail: { speaker: this.state.speaker, text: this.state.text }
    });
    window.dispatchEvent(event);
  }

  showDialogue(speaker, text, choices = []) {
    this.state.speaker = speaker;
    this.state.text = '';
    this.state.choices = choices;
    this.state.selectedChoice = 0;
    this.state.visible = true;
    this.state.typing = true;
    
    this.render();
    this.typeText(text);
  }

  typeText(text) {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    let currentText = '';
    let index = 0;

    const typeNextChar = () => {
      if (index < text.length) {
        currentText += text[index];
        this.state.text = currentText;
        this.render();
        index++;
        this.typingTimer = setTimeout(typeNextChar, this.state.typeSpeed);
      } else {
        this.state.typing = false;
        this.render();
      }
    };

    typeNextChar();
  }

  show() {
    this.state.visible = true;
    this.render();
  }

  hide() {
    this.state.visible = false;
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
    this.render();
  }
}