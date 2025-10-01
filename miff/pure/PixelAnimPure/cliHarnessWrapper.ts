#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for PixelAnimPure
 * Adds missing operation: animateObject
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { PixelAnimator, Animation, AnimationFrame } from './Animator';

const { mode, params } = parseKeyValueArgs(process.argv);
const animator = new PixelAnimator();

try {
  switch (mode) {
    case 'animateObject': {
      const { objectId, animation, duration, easing } = params;
      
      const anim: Animation = {
        id: `${animation}_${Date.now()}`,
        name: animation || 'float',
        frames: [],
        duration: duration || 5,
        loop: false,
        easing: easing || 'ease-in-out'
      };
      
      // Generate frames for float animation
      const frameCount = Math.floor(duration || 5) * 30; // 30 fps
      for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount;
        const y = Math.sin(t * Math.PI * 2) * 10; // Float up and down
        anim.frames.push({
          time: t * anim.duration,
          properties: {
            y,
            opacity: 1
          }
        });
      }
      
      animator.playAnimation(objectId || 'object_001', anim);
      
      handleSuccess({
        objectId,
        animation: anim,
        frameCount: anim.frames.length,
        duration: anim.duration,
        easing: anim.easing,
        playing: true
      }, 'animateObject');
      break;
    }

    case 'play': {
      const { animationId, objectId } = params;
      animator.play(objectId || 'object_001', animationId || 'anim_001');
      handleSuccess({ objectId, animationId, playing: true }, 'play');
      break;
    }

    case 'stop': {
      const { objectId } = params;
      animator.stop(objectId || 'object_001');
      handleSuccess({ objectId, stopped: true }, 'stop');
      break;
    }

    case 'listAnimations': {
      const animations = animator.getAnimations();
      handleSuccess({ animations, count: animations.length }, 'listAnimations');
      break;
    }

    case 'update': {
      const { deltaTime } = params;
      animator.update(deltaTime || 0.016); // ~60fps
      handleSuccess({ deltaTime, updated: true }, 'update');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: animateObject, play, stop, listAnimations, update`);
  }
} catch (error) {
  handleError(error);
}
