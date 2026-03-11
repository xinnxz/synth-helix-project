/**
 * SYNTH::HELIX - Post-Processing Effects (Masterpiece Edition)
 * =============================================================
 * Handles Screen Shake, Reactive Bloom, and Custom GLSL Warp (Blackhole Shader)
 * @module PostEffects
 */

import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * Custom GLSL Shader for Space-Time Warping (Blackhole Effect)
 */
const WarpShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'warpIntensity': { value: 0.0 }, // 0 to 1
        'center': { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float warpIntensity;
        uniform vec2 center;
        varying vec2 vUv;
        
        void main() {
            vec2 cUv = vUv - center;
            float dist = length(cUv);
            
            // Core Blackhole Math: Bend UVs towards the center
            float warpFactor = 1.0 - (warpIntensity * exp(-dist * 5.0));
            vec2 distortedUv = center + cUv * warpFactor;
            
            // Chromatic Aberration at high intensity
            float r = texture2D(tDiffuse, distortedUv + vec2(0.01 * warpIntensity, 0.0)).r;
            float g = texture2D(tDiffuse, distortedUv).g;
            float b = texture2D(tDiffuse, distortedUv - vec2(0.01 * warpIntensity, 0.0)).b;
            
            vec4 finalColor = vec4(r, g, b, 1.0);
            
            // Darken the absolute center slightly to simulate event horizon
            finalColor.rgb *= smoothstep(0.0, 0.2 * warpIntensity, dist);
            
            gl_FragColor = finalColor;
        }
    `
};

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
    
    // Space Warp (Blackhole) State
    this.warpPass = new ShaderPass(WarpShader);
    this.composer.addPass(this.warpPass);
    this.currentWarp = 0;
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
   * Sets the target Space Warp intensity via external input (Shift Key or High Audio)
   * @param {number} target - Intensity (0.0 to 1.0)
   * @param {number} deltaTime 
   */
  updateWarpIntensity(target, deltaTime) {
      if(this.warpPass) {
          // Smooth Lerp towards target warp
          this.currentWarp = THREE.MathUtils.lerp(this.currentWarp, target, deltaTime * 3.0);
          this.warpPass.uniforms['warpIntensity'].value = this.currentWarp;
      }
  }

  /**
   * Update all post effects dynamics
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
