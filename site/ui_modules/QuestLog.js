// QuestLog UI Module - Pure module for quest tracking interface
// Exports: render(), init(), update(data), destroy()

export class QuestLog {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.state = {
      visible: false,
      quests: [],
      selectedQuest: null
    };
    this.listeners = new Map();
  }

  render() {
    if (this.element) {
      this.destroy();
    }

    this.element = document.createElement('div');
    this.element.className = 'ui-quest-log';
    this.element.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #4ecdc4;
      border-radius: 12px;
      padding: 20px;
      width: 320px;
      max-height: 400px;
      z-index: 1000;
      display: ${this.state.visible ? 'block' : 'none'};
      color: #e6edf3;
      font-family: 'Times New Roman', serif;
      overflow-y: auto;
    `;

    this.element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; color: #4ecdc4;">Quest Log</h3>
        <button class="close-btn" style="background: none; border: none; color: #e6edf3; font-size: 18px; cursor: pointer;">×</button>
      </div>
      <div class="quest-list">
        ${this.state.quests.length === 0 ? 
          '<div style="text-align: center; opacity: 0.7; padding: 20px;">No active quests</div>' :
          this.state.quests.map((quest, index) => `
            <div class="quest-item ${quest.id === this.state.selectedQuest ? 'selected' : ''}" 
                 data-quest-id="${quest.id}"
                 style="padding: 12px; margin: 8px 0; border-radius: 6px; cursor: pointer;
                        background: ${quest.id === this.state.selectedQuest ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
                        border: 1px solid ${quest.id === this.state.selectedQuest ? '#4ecdc4' : 'transparent'};
                        transition: all 0.2s;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: bold; color: #4ecdc4;">${quest.title}</div>
                  <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${quest.status}</div>
                </div>
                <div style="font-size: 12px; opacity: 0.6;">${quest.progress || ''}</div>
              </div>
              ${quest.description ? `<div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">${quest.description}</div>` : ''}
            </div>
          `).join('')
        }
      </div>
    `;

    this.container.appendChild(this.element);
    this.attachEventListeners();
    return this.element;
  }

  init() {
    this.render();
    this.bindKeyboardEvents();
    console.log('[QuestLog] Initialized');
  }

  update(data) {
    if (data.visible !== undefined) {
      this.state.visible = data.visible;
    }
    if (data.quests) {
      this.state.quests = data.quests;
    }
    if (data.selectedQuest !== undefined) {
      this.state.selectedQuest = data.selectedQuest;
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

    // Close button
    const closeBtn = this.element.querySelector('.close-btn');
    if (closeBtn) {
      const closeHandler = () => this.hide();
      closeBtn.addEventListener('click', closeHandler);
      this.listeners.set(closeBtn, closeHandler);
    }

    // Quest items
    const questItems = this.element.querySelectorAll('.quest-item');
    questItems.forEach((item) => {
      const clickHandler = () => {
        const questId = item.dataset.questId;
        this.selectQuest(questId);
      };
      item.addEventListener('click', clickHandler);
      this.listeners.set(item, clickHandler);
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
        case 'Escape':
          e.preventDefault();
          this.hide();
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          this.hide();
          break;
      }
    };

    window.addEventListener('keydown', keyHandler);
    this.listeners.set('keydown', keyHandler);
  }

  selectQuest(questId) {
    this.state.selectedQuest = questId;
    this.render();
    
    const quest = this.state.quests.find(q => q.id === questId);
    if (quest) {
      console.log('[QuestLog] Selected quest:', quest.title);
      
      // Emit custom event
      const event = new CustomEvent('questSelect', {
        detail: { quest }
      });
      window.dispatchEvent(event);
    }
  }

  addQuest(quest) {
    this.state.quests.push(quest);
    this.render();
    console.log('[QuestLog] Added quest:', quest.title);
  }

  updateQuest(questId, updates) {
    const questIndex = this.state.quests.findIndex(q => q.id === questId);
    if (questIndex !== -1) {
      this.state.quests[questIndex] = { ...this.state.quests[questIndex], ...updates };
      this.render();
      console.log('[QuestLog] Updated quest:', questId);
    }
  }

  removeQuest(questId) {
    this.state.quests = this.state.quests.filter(q => q.id !== questId);
    if (this.state.selectedQuest === questId) {
      this.state.selectedQuest = null;
    }
    this.render();
    console.log('[QuestLog] Removed quest:', questId);
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