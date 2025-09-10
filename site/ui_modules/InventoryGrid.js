// InventoryGrid UI Module - Pure module for inventory management interface
// Exports: render(), init(), update(data), destroy()

export class InventoryGrid {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.state = {
      visible: false,
      items: [],
      selectedItem: null,
      gridSize: { rows: 4, cols: 6 },
      maxItems: 24
    };
    this.listeners = new Map();
  }

  render() {
    if (this.element) {
      this.destroy();
    }

    this.element = document.createElement('div');
    this.element.className = 'ui-inventory-grid';
    this.element.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #ff6b6b;
      border-radius: 12px;
      padding: 24px;
      width: 400px;
      z-index: 1000;
      display: ${this.state.visible ? 'block' : 'none'};
      color: #e6edf3;
      font-family: 'Times New Roman', serif;
    `;

    // Create grid
    const gridItems = [];
    for (let i = 0; i < this.state.maxItems; i++) {
      const item = this.state.items[i] || null;
      const isSelected = item && this.state.selectedItem === item.id;
      
      gridItems.push(`
        <div class="inventory-slot ${isSelected ? 'selected' : ''}" 
             data-slot="${i}"
             style="width: 48px; height: 48px; border: 2px solid ${isSelected ? '#ff6b6b' : '#444'};
                    border-radius: 6px; display: flex; align-items: center; justify-content: center;
                    background: ${item ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                    cursor: pointer; transition: all 0.2s; position: relative;">
          ${item ? `
            <div style="text-align: center;">
              <div style="font-size: 20px;">${item.icon || '📦'}</div>
              ${item.quantity > 1 ? `<div style="position: absolute; bottom: 2px; right: 2px; font-size: 10px; background: rgba(0,0,0,0.8); padding: 1px 3px; border-radius: 3px;">${item.quantity}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `);
    }

    this.element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #ff6b6b;">Inventory</h3>
        <button class="close-btn" style="background: none; border: none; color: #e6edf3; font-size: 18px; cursor: pointer;">×</button>
      </div>
      <div class="inventory-grid" style="display: grid; grid-template-columns: repeat(${this.state.gridSize.cols}, 1fr); gap: 8px; margin-bottom: 20px;">
        ${gridItems.join('')}
      </div>
      <div class="item-details" style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; min-height: 60px;">
        ${this.state.selectedItem ? this.renderItemDetails() : '<div style="text-align: center; opacity: 0.7;">Select an item to view details</div>'}
      </div>
      <div style="margin-top: 16px; text-align: center; font-size: 12px; opacity: 0.7;">
        ${this.state.items.length}/${this.state.maxItems} items
      </div>
    `;

    this.container.appendChild(this.element);
    this.attachEventListeners();
    return this.element;
  }

  renderItemDetails() {
    const item = this.state.items.find(i => i.id === this.state.selectedItem);
    if (!item) return '';

    return `
      <div>
        <div style="font-weight: bold; color: #ff6b6b; margin-bottom: 8px;">${item.name}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${item.description || 'No description available'}</div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="use-item-btn" style="background: #ff6b6b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Use</button>
          <button class="drop-item-btn" style="background: #666; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Drop</button>
        </div>
      </div>
    `;
  }

  init() {
    this.render();
    this.bindKeyboardEvents();
    console.log('[InventoryGrid] Initialized');
  }

  update(data) {
    if (data.visible !== undefined) {
      this.state.visible = data.visible;
    }
    if (data.items) {
      this.state.items = data.items;
    }
    if (data.selectedItem !== undefined) {
      this.state.selectedItem = data.selectedItem;
    }
    if (data.gridSize) {
      this.state.gridSize = data.gridSize;
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

    // Inventory slots
    const slots = this.element.querySelectorAll('.inventory-slot');
    slots.forEach((slot) => {
      const clickHandler = () => {
        const slotIndex = parseInt(slot.dataset.slot);
        this.selectSlot(slotIndex);
      };
      slot.addEventListener('click', clickHandler);
      this.listeners.set(slot, clickHandler);
    });

    // Item action buttons
    const useBtn = this.element.querySelector('.use-item-btn');
    if (useBtn) {
      const useHandler = () => this.useSelectedItem();
      useBtn.addEventListener('click', useHandler);
      this.listeners.set(useBtn, useHandler);
    }

    const dropBtn = this.element.querySelector('.drop-item-btn');
    if (dropBtn) {
      const dropHandler = () => this.dropSelectedItem();
      dropBtn.addEventListener('click', dropHandler);
      this.listeners.set(dropBtn, dropHandler);
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
        case 'i':
        case 'I':
          e.preventDefault();
          this.hide();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          this.navigateGrid(e.key);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.useSelectedItem();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          this.dropSelectedItem();
          break;
      }
    };

    window.addEventListener('keydown', keyHandler);
    this.listeners.set('keydown', keyHandler);
  }

  navigateGrid(direction) {
    if (!this.state.selectedItem) {
      // Select first item if none selected
      const firstItem = this.state.items[0];
      if (firstItem) {
        this.state.selectedItem = firstItem.id;
        this.render();
      }
      return;
    }

    const currentIndex = this.state.items.findIndex(item => item.id === this.state.selectedItem);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    switch (direction) {
      case 'ArrowUp':
        newIndex = Math.max(0, currentIndex - this.state.gridSize.cols);
        break;
      case 'ArrowDown':
        newIndex = Math.min(this.state.items.length - 1, currentIndex + this.state.gridSize.cols);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        newIndex = Math.min(this.state.items.length - 1, currentIndex + 1);
        break;
    }

    if (newIndex !== currentIndex && this.state.items[newIndex]) {
      this.state.selectedItem = this.state.items[newIndex].id;
      this.render();
    }
  }

  selectSlot(slotIndex) {
    const item = this.state.items[slotIndex];
    if (item) {
      this.state.selectedItem = item.id;
      this.render();
    }
  }

  useSelectedItem() {
    const item = this.state.items.find(i => i.id === this.state.selectedItem);
    if (item) {
      console.log('[InventoryGrid] Using item:', item.name);
      
      // Emit custom event
      const event = new CustomEvent('inventoryUse', {
        detail: { item }
      });
      window.dispatchEvent(event);
    }
  }

  dropSelectedItem() {
    const item = this.state.items.find(i => i.id === this.state.selectedItem);
    if (item) {
      console.log('[InventoryGrid] Dropping item:', item.name);
      
      // Emit custom event
      const event = new CustomEvent('inventoryDrop', {
        detail: { item }
      });
      window.dispatchEvent(event);
    }
  }

  addItem(item) {
    if (this.state.items.length >= this.state.maxItems) {
      console.log('[InventoryGrid] Inventory full, cannot add item:', item.name);
      return false;
    }

    // Check if item already exists and can be stacked
    const existingItem = this.state.items.find(i => i.id === item.id && i.stackable);
    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      this.state.items.push({ ...item, quantity: item.quantity || 1 });
    }

    this.render();
    console.log('[InventoryGrid] Added item:', item.name);
    return true;
  }

  removeItem(itemId, quantity = 1) {
    const itemIndex = this.state.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.state.items[itemIndex];
    if (item.quantity > quantity) {
      item.quantity -= quantity;
    } else {
      this.state.items.splice(itemIndex, 1);
      if (this.state.selectedItem === itemId) {
        this.state.selectedItem = null;
      }
    }

    this.render();
    console.log('[InventoryGrid] Removed item:', item.name);
    return true;
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