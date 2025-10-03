/**
 * Geometric Character Creator
 * Creates a movable geometric man using pure canvas drawing - no external assets needed
 * Built for MIFF's modular system
 */

class GeometricCharacter {
  constructor(x = 0, y = 0) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.scale = 1;
    
    // Animation state
    this.animation = {
      frame: 0,
      time: 0,
      speed: 0.1,
      sequence: 'idle'
    };
    
    // Body parts with relative positions and sizes
    this.bodyParts = {
      head: {
        x: 0, y: -30,
        width: 16, height: 16,
        shape: 'circle',
        color: '#ffcc99',
        outline: '#333'
      },
      torso: {
        x: 0, y: -10,
        width: 20, height: 25,
        shape: 'rect',
        color: '#4488ff',
        outline: '#333'
      },
      leftArm: {
        x: -15, y: -15,
        width: 8, height: 20,
        shape: 'rect',
        color: '#ffcc99',
        outline: '#333',
        pivot: { x: 0, y: -8 }
      },
      rightArm: {
        x: 15, y: -15,
        width: 8, height: 20,
        shape: 'rect',
        color: '#ffcc99',
        outline: '#333',
        pivot: { x: 0, y: -8 }
      },
      leftLeg: {
        x: -6, y: 10,
        width: 8, height: 25,
        shape: 'rect',
        color: '#2266cc',
        outline: '#333',
        pivot: { x: 0, y: -10 }
      },
      rightLeg: {
        x: 6, y: 10,
        width: 8, height: 25,
        shape: 'rect',
        color: '#2266cc',
        outline: '#333',
        pivot: { x: 0, y: -10 }
      }
    };
    
    // Movement state
    this.isMoving = false;
    this.movementDirection = 0;
    this.groundY = 200; // Ground level
    
    console.log('🧙 Geometric character created');
  }

  update(deltaTime, input = {}) {
    // Update animation timer
    this.animation.time += deltaTime;
    
    // Handle input and movement
    this.handleInput(input);
    this.updateMovement(deltaTime);
    this.updateAnimation(deltaTime);
    this.updatePhysics(deltaTime);
  }

  handleInput(input) {
    const speed = 150; // pixels per second
    
    this.velocity.x = 0;
    this.isMoving = false;
    
    if (input.left) {
      this.velocity.x = -speed;
      this.isMoving = true;
      this.movementDirection = -1;
    }
    if (input.right) {
      this.velocity.x = speed;
      this.isMoving = true;
      this.movementDirection = 1;
    }
    if (input.jump && Math.abs(this.velocity.y) < 0.1) {
      this.velocity.y = -300; // Jump velocity
    }
    
    // Update animation sequence
    if (this.isMoving) {
      this.animation.sequence = 'walk';
    } else {
      this.animation.sequence = 'idle';
    }
  }

  updateMovement(deltaTime) {
    // Apply velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Apply damping to horizontal movement
    this.velocity.x *= 0.9;
  }

  updatePhysics(deltaTime) {
    // Gravity
    const gravity = 800; // pixels per second squared
    this.velocity.y += gravity * deltaTime;
    
    // Ground collision
    if (this.position.y > this.groundY) {
      this.position.y = this.groundY;
      this.velocity.y = 0;
    }
  }

  updateAnimation(deltaTime) {
    if (this.animation.time > this.animation.speed) {
      this.animation.frame += 1;
      this.animation.time = 0;
    }
    
    // Reset frame counter based on sequence
    const maxFrames = {
      idle: 4,
      walk: 6
    };
    
    if (this.animation.frame >= maxFrames[this.animation.sequence]) {
      this.animation.frame = 0;
    }
  }

  getAnimatedBodyParts() {
    const parts = JSON.parse(JSON.stringify(this.bodyParts)); // Deep copy
    const frame = this.animation.frame;
    const time = performance.now() * 0.001;
    
    switch (this.animation.sequence) {
      case 'idle':
        // Subtle breathing animation
        const breathe = Math.sin(time * 2) * 0.02;
        parts.torso.height += breathe * 2;
        parts.head.y += breathe;
        break;
        
      case 'walk':
        // Walking animation - arm and leg swinging
        const walkCycle = (frame / 6) * Math.PI * 2;
        const armSwing = Math.sin(walkCycle) * 0.3;
        const legSwing = Math.sin(walkCycle + Math.PI) * 0.4;
        
        // Arms swing opposite to each other
        parts.leftArm.rotation = armSwing;
        parts.rightArm.rotation = -armSwing;
        
        // Legs swing opposite to each other
        parts.leftLeg.rotation = legSwing;
        parts.rightLeg.rotation = -legSwing;
        
        // Slight torso bob
        const bob = Math.sin(walkCycle * 2) * 2;
        parts.head.y += bob;
        parts.torso.y += bob;
        
        break;
    }
    
    return parts;
  }

  render(ctx) {
    ctx.save();
    
    // Move to character position
    ctx.translate(this.position.x, this.position.y);
    ctx.scale(this.scale, this.scale);
    
    // Flip horizontally if moving left
    if (this.movementDirection < 0) {
      ctx.scale(-1, 1);
    }
    
    const parts = this.getAnimatedBodyParts();
    
    // Render body parts in order (back to front)
    this.renderBodyPart(ctx, 'leftArm', parts.leftArm);
    this.renderBodyPart(ctx, 'leftLeg', parts.leftLeg);
    this.renderBodyPart(ctx, 'torso', parts.torso);
    this.renderBodyPart(ctx, 'rightArm', parts.rightArm);
    this.renderBodyPart(ctx, 'rightLeg', parts.rightLeg);
    this.renderBodyPart(ctx, 'head', parts.head);
    
    ctx.restore();
    
    // Debug info
    if (window.DEBUG_MODE) {
      this.renderDebugInfo(ctx);
    }
  }

  renderBodyPart(ctx, partName, part) {
    ctx.save();
    
    // Move to part position
    ctx.translate(part.x, part.y);
    
    // Apply rotation if exists
    if (part.rotation) {
      if (part.pivot) {
        ctx.translate(part.pivot.x, part.pivot.y);
        ctx.rotate(part.rotation);
        ctx.translate(-part.pivot.x, -part.pivot.y);
      } else {
        ctx.rotate(part.rotation);
      }
    }
    
    // Set colors
    ctx.fillStyle = part.color;
    ctx.strokeStyle = part.outline;
    ctx.lineWidth = 2;
    
    // Draw shape
    switch (part.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, part.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'rect':
        ctx.fillRect(-part.width / 2, -part.height / 2, part.width, part.height);
        ctx.strokeRect(-part.width / 2, -part.height / 2, part.width, part.height);
        break;
    }
    
    // Add details based on part
    this.renderPartDetails(ctx, partName, part);
    
    ctx.restore();
  }

  renderPartDetails(ctx, partName, part) {
    ctx.fillStyle = '#333';
    
    switch (partName) {
      case 'head':
        // Eyes
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.beginPath();
        ctx.arc(0, 4, 3, 0, Math.PI);
        ctx.stroke();
        break;
        
      case 'torso':
        // Simple shirt pattern
        ctx.strokeStyle = '#2266aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, -8, 12, 4);
        break;
    }
  }

  renderDebugInfo(ctx) {
    ctx.save();
    ctx.fillStyle = '#ff0000';
    ctx.font = '12px monospace';
    ctx.fillText(`Pos: ${Math.round(this.position.x)}, ${Math.round(this.position.y)}`, 
                 this.position.x - 40, this.position.y - 60);
    ctx.fillText(`Vel: ${Math.round(this.velocity.x)}, ${Math.round(this.velocity.y)}`, 
                 this.position.x - 40, this.position.y - 45);
    ctx.fillText(`Anim: ${this.animation.sequence} (${this.animation.frame})`, 
                 this.position.x - 40, this.position.y - 30);
    ctx.restore();
  }

  // Collision detection
  getBounds() {
    return {
      left: this.position.x - 15,
      right: this.position.x + 15,
      top: this.position.y - 40,
      bottom: this.position.y + 15
    };
  }

  // Character customization
  setColors(headColor, shirtColor, pantsColor) {
    this.bodyParts.head.color = headColor;
    this.bodyParts.leftArm.color = headColor;
    this.bodyParts.rightArm.color = headColor;
    this.bodyParts.torso.color = shirtColor;
    this.bodyParts.leftLeg.color = pantsColor;
    this.bodyParts.rightLeg.color = pantsColor;
  }

  setScale(scale) {
    this.scale = scale;
  }

  teleportTo(x, y) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = 0;
    this.velocity.y = 0;
  }
}

// Demo scene to test the character
class GeometricCharacterDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.character = new GeometricCharacter(canvas.width / 2, 200);
    
    // Input handling
    this.input = {
      left: false,
      right: false,
      jump: false
    };
    
    this.setupInput();
    this.lastTime = 0;
    
    // Customize character appearance
    this.character.setColors('#ffcc99', '#4488ff', '#2266cc');
    
    console.log('🎮 Character demo initialized');
  }

  setupInput() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          this.input.left = true;
          break;
        case 'd':
        case 'arrowright':
          this.input.right = true;
          break;
        case ' ':
        case 'w':
        case 'arrowup':
          this.input.jump = true;
          e.preventDefault();
          break;
        case 'r':
          // Reset character position
          this.character.teleportTo(this.canvas.width / 2, 200);
          break;
        case 'c':
          // Change character colors randomly
          const colors = ['#ffcc99', '#ff9999', '#99ccff', '#99ff99', '#ffff99'];
          const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
          this.character.setColors(randomColor(), randomColor(), randomColor());
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          this.input.left = false;
          break;
        case 'd':
        case 'arrowright':
          this.input.right = false;
          break;
        case ' ':
        case 'w':
        case 'arrowup':
          this.input.jump = false;
          break;
      }
    });

    // Touch input for mobile
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      this.input.jump = true;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartX;
      
      this.input.left = deltaX < -20;
      this.input.right = deltaX > 20;
      
      if (Math.abs(deltaX) <= 20) {
        this.input.left = false;
        this.input.right = false;
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.input.left = false;
      this.input.right = false;
      this.input.jump = false;
    });
  }

  update(currentTime) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    if (deltaTime > 0) {
      this.character.update(deltaTime, this.input);
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB'; // Sky blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw ground
    this.ctx.fillStyle = '#90EE90'; // Light green
    this.ctx.fillRect(0, 215, this.canvas.width, this.canvas.height - 215);
    
    // Draw character
    this.character.render(this.ctx);
    
    // Draw instructions
    this.ctx.fillStyle = '#333';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('WASD / Arrow Keys: Move and Jump', 10, 30);
    this.ctx.fillText('R: Reset position', 10, 50);
    this.ctx.fillText('C: Change colors', 10, 70);
    this.ctx.fillText('Touch: Tap to jump, drag to move', 10, 90);
  }

  start() {
    const animate = (currentTime) => {
      this.update(currentTime);
      this.render();
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
}

// Easy integration with your existing MIFF system
class MIFFGeometricCharacter {
  static create(canvas) {
    return new GeometricCharacterDemo(canvas);
  }
  
  static createCharacterOnly(x, y) {
    return new GeometricCharacter(x, y);
  }
}

// Export for your module system
if (typeof window !== 'undefined') {
  window.GeometricCharacter = GeometricCharacter;
  window.GeometricCharacterDemo = GeometricCharacterDemo;
  window.MIFFGeometricCharacter = MIFFGeometricCharacter;
}

export { GeometricCharacter, GeometricCharacterDemo, MIFFGeometricCharacter };

console.log('🎮 Geometric Character system loaded!');
console.log('Usage: const demo = new GeometricCharacterDemo(canvas); demo.start();');
