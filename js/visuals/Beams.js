/**
 * SYNTH::HELIX - Light Beams
 * ===========================
 * Visual light beam cylinders that respond to interaction
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Beams {
  constructor(scene, theme) {
    this.scene = scene;
    this.theme = theme;
    this.meshes = [];
    this.beamCount = CONFIG.visual.beamCount;
    
    this._createBeams();
  }

  _createBeams() {
    const geometry = new THREE.CylinderGeometry(
      CONFIG.visual.beamThickness,
      CONFIG.visual.beamThickness,
      CONFIG.visual.beamHeight,
      16
    );
    
    // Shift geometry so pivot is at bottom
    geometry.translate(0, CONFIG.visual.beamHeight / 2, 0);

    for (let i = 0; i < this.beamCount; i++) {
      const angle = (i / this.beamCount) * Math.PI * 2;
      const x = Math.cos(angle) * CONFIG.visual.beamRadius;
      const z = Math.sin(angle) * CONFIG.visual.beamRadius;

      // Clone material for individual color control
      const material = new THREE.MeshBasicMaterial({
        color: this.theme.primary,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, 0, z);

      // Store metadata
      mesh.userData = {
        id: i,
        angle: angle,
        hue: i / this.beamCount,
        isActive: false,
        targetScale: { x: 1, y: 1, z: 1 },
        originalPosition: new THREE.Vector3(x, 0, z),
      };

      this.scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  /**
   * Trigger beam visual effect
   * @param {THREE.Mesh} mesh - The beam mesh to trigger
   */
  trigger(mesh) {
    if (!mesh || !mesh.userData) return;

    // Flash white and expand
    mesh.material.color.setHex(0xffffff);
    mesh.scale.set(3, 1.2, 3);
    mesh.userData.isActive = true;

    // Return beam index for audio
    return mesh.userData.id;
  }

  /**
   * Update all beams (called every frame)
   * @param {number} time - Current time
   */
  update(time) {
    this.meshes.forEach((mesh, i) => {
      const userData = mesh.userData;

      // Smooth return to normal scale
      mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, 1, 0.1);
      mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, 1, 0.1);
      mesh.scale.z = THREE.MathUtils.lerp(mesh.scale.z, 1, 0.1);
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, 0.1);

      // Rainbow color based on hue
      const targetColor = new THREE.Color().setHSL(userData.hue, 1, 0.5);
      mesh.material.color.lerp(targetColor, 0.05);

      // The Elegant Rotation: Rotate around the center axis (0,0) softly
      const rotationSpeed = 0.2; // Radian per second
      const currentAngle = userData.angle + (time * rotationSpeed);
      mesh.position.x = Math.cos(currentAngle) * CONFIG.visual.beamRadius;
      mesh.position.z = Math.sin(currentAngle) * CONFIG.visual.beamRadius;

      // Subtle idle animation (breathing up & down lightly)
      mesh.position.y += Math.sin(time * 2 + i) * 0.05;
    });
  }

  /**
   * Set color theme
   */
  setTheme(theme) {
    this.theme = theme;
    this.meshes.forEach(mesh => {
      // Theme will be applied gradually through update()
    });
  }

  /**
   * Get all beam meshes for raycasting
   */
  getMeshes() {
    return this.meshes;
  }

  /**
   * Change beam count (requires rebuild)
   */
  setBeamCount(count) {
    // Remove existing beams
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.meshes = [];
    
    // Create new beams
    this.beamCount = count;
    this._createBeams();
  }

  /**
   * Dispose all resources
   */
  dispose() {
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.meshes = [];
  }
}

export default Beams;
