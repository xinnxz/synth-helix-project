/**
 * SYNTH::HELIX - Animated Floor
 * ==============================
 * Wireframe floor with wave animation
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Floor {
  constructor(scene, theme) {
    this.scene = scene;
    this.theme = theme;
    this.mesh = null;
    
    this._createFloor();
  }

  _createFloor() {
    const geometry = new THREE.PlaneGeometry(
      CONFIG.visual.floorSize,
      CONFIG.visual.floorSize,
      CONFIG.visual.floorSegments,
      CONFIG.visual.floorSegments
    );

    const material = new THREE.MeshBasicMaterial({
      color: this.theme.floor,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.mesh);
  }

  /**
   * Update floor animation (wave effect)
   * @param {number} time - Current time
   * @param {number} intensity - Wave intensity multiplier
   */
  update(time, intensity = 1) {
    const positions = this.mesh.geometry.attributes.position;
    const waveSpeed = CONFIG.visual.floorWaveSpeed;
    const amplitude = CONFIG.visual.floorWaveAmplitude * intensity;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      // Sine wave ripple effect
      const wave = Math.sin(x * 0.2 + time * waveSpeed) * 
                   Math.cos(y * 0.2 + time * waveSpeed) * 
                   amplitude;
      
      positions.setZ(i, wave);
    }

    positions.needsUpdate = true;
  }

  /**
   * Set color theme
   */
  setTheme(theme) {
    this.theme = theme;
    this.mesh.material.color.setHex(theme.floor);
  }

  /**
   * Set floor opacity
   */
  setOpacity(value) {
    this.mesh.material.opacity = Math.max(0, Math.min(1, value));
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export default Floor;
