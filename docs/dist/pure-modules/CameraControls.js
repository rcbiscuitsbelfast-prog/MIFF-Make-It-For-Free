// Simple Camera Controls Module for RenderWorld
(function() {
  'use strict';
  
  // Camera state management
  class CameraController {
    constructor() {
      this.yaw = 0;
      this.pitch = 0;
      this.targetYaw = 0;
      this.targetPitch = 0;
      this.distance = 4.0;
      this.targetDistance = 4.0;
      this.minDistance = 2.0;
      this.maxDistance = 12.0;
      this.minPitch = -Math.PI/3;
      this.maxPitch = Math.PI/3;
      this.damping = 0.12;
      this.isFirstPerson = false;
      this.isPointerDown = false;
      this.lastX = 0;
      this.lastY = 0;
      this.pinchLast = null;
    }
    
    // Handle pointer down
    onPointerDown(x, y) {
      this.isPointerDown = true;
      this.lastX = x;
      this.lastY = y;
      console.log('Camera: Pointer down', x, y);
    }
    
    // Handle pointer move
    onPointerMove(x, y) {
      if (!this.isPointerDown) return;
      
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.lastX = x;
      this.lastY = y;
      
      // Increased sensitivity for better mobile response
      this.targetYaw -= dx * 0.01;
      this.targetPitch -= dy * 0.008;
      
      // Clamp pitch
      if (this.targetPitch < this.minPitch) this.targetPitch = this.minPitch;
      if (this.targetPitch > this.maxPitch) this.targetPitch = this.maxPitch;
      
      console.log('Camera: Move', this.targetYaw, this.targetPitch);
    }
    
    // Handle pointer up
    onPointerUp() {
      this.isPointerDown = false;
      console.log('Camera: Pointer up');
    }
    
    // Handle pinch zoom
    onPinchZoom(delta) {
      this.targetDistance = Math.min(this.maxDistance, Math.max(this.minDistance, this.targetDistance - delta * 0.01));
      console.log('Camera: Pinch zoom', this.targetDistance);
    }
    
    // Update camera with damping
    update() {
      this.yaw += (this.targetYaw - this.yaw) * this.damping;
      this.pitch += (this.targetPitch - this.pitch) * this.damping;
      this.distance += (this.targetDistance - this.distance) * this.damping;
    }
    
    // Get camera position
    getCameraPosition(playerPos) {
      if (this.isFirstPerson) {
        return {
          x: playerPos.x,
          y: playerPos.y + 1.7,
          z: playerPos.z
        };
      } else {
        const r = this.distance;
        const offX = -Math.sin(this.yaw) * Math.cos(this.pitch) * r;
        const offY = 3.0 + Math.sin(this.pitch) * r;
        const offZ = -Math.cos(this.yaw) * Math.cos(this.pitch) * r;
        
        return {
          x: playerPos.x + offX,
          y: playerPos.y + offY,
          z: playerPos.z + offZ
        };
      }
    }
    
    // Get camera look target
    getLookTarget(playerPos) {
      if (this.isFirstPerson) {
        const dirX = Math.sin(this.yaw) * Math.cos(this.pitch);
        const dirY = Math.sin(this.pitch);
        const dirZ = Math.cos(this.yaw) * Math.cos(this.pitch);
        
        return {
          x: playerPos.x + dirX,
          y: playerPos.y + 1.7 + dirY,
          z: playerPos.z + dirZ
        };
      } else {
        return {
          x: playerPos.x,
          y: playerPos.y + 1.4,
          z: playerPos.z
        };
      }
    }
  }
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.CameraController = CameraController;
  }
  
})();