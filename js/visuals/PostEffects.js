/**
 * SYNTH::HELIX - Post-Processing Effects
 * ========================================
 * Screen shake, reactive bloom, and other post effects
 */

import * as THREE from 'three';

export class PostEffects {
  constructor(camera, composer) {
    this.camera = camera;
    this.composer = composer;
    
    // Original camera position
    this.originalPosition = camera.position.clone();
    
    // Shake state
    this.isShaking = false;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTime = 0;
    
    // Reactive bloom
    this.bloomPass = null;
    this.targetBloomStrength = 2.0;
    this.currentBloomStrength = 2.0;
  }

  /**
   * Set bloom pass reference
   */
  setBloomPass(bloomPass) {
    this.bloomPass = bloomPass;
  }

  /**
   * Trigger screen shake effect
   * @param {number} intensity - Shake intensity (0-1)
   * @param {number} duration - Duration in seconds
   */
  shake(intensity = 0.5, duration = 0.3) {
    this.isShaking = true;
    this.shakeIntensity = intensity * 2;
    this.shakeDuration = duration;
    this.shakeTime = 0;
  }

  /**
   * Update bloom based on audio level
   * @param {number} audioLevel - Audio level (0-1)
   */
  setAudioReactiveBloom(audioLevel) {
    // Target bloom increases with audio level
    this.targetBloomStrength = 1.5 + audioLevel * 2;
  }

  /**
   * Flash bloom effect
   */
  flashBloom() {
    if (this.bloomPass) {
      this.bloomPass.strength = 4;
      this.targetBloomStrength = 4;
    }
  }

  /**
   * Update all post effects
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Update screen shake
    if (this.isShaking) {
      this.shakeTime += deltaTime;
      
      if (this.shakeTime < this.shakeDuration) {
        // Apply random offset
        const decay = 1 - (this.shakeTime / this.shakeDuration);
        const offsetX = (Math.random() - 0.5) * this.shakeIntensity * decay;
        const offsetY = (Math.random() - 0.5) * this.shakeIntensity * decay;
        const offsetZ = (Math.random() - 0.5) * this.shakeIntensity * decay * 0.5;
        
        this.camera.position.x = this.originalPosition.x + offsetX;
        this.camera.position.y = this.originalPosition.y + offsetY;
        this.camera.position.z = this.originalPosition.z + offsetZ;
      } else {
        // Reset to original
        this.isShaking = false;
        this.camera.position.copy(this.originalPosition);
      }
    }

    // Smooth bloom transition
    if (this.bloomPass) {
      this.currentBloomStrength = THREE.MathUtils.lerp(
        this.currentBloomStrength,
        this.targetBloomStrength,
        deltaTime * 5
      );
      this.bloomPass.strength = this.currentBloomStrength;
      
      // Decay target back to base
      this.targetBloomStrength = THREE.MathUtils.lerp(
        this.targetBloomStrength,
        2.0,
        deltaTime * 2
      );
    }
  }

  /**
   * Update original camera position (for when camera drifts)
   */
  updateOriginalPosition() {
    if (!this.isShaking) {
      this.originalPosition.copy(this.camera.position);
    }
  }
}

export default PostEffects;
