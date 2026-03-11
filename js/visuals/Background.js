/**
 * SYNTH::HELIX - Background Effects
 * ===================================
 * Animated background with starfield and grid effects
 */

import * as THREE from 'three';

export class Background {
  constructor(scene) {
    this.scene = scene;
    this.stars = null;
    this.grid = null;
    this.nebula = null;
    
    this._createStarfield();
    this._createGrid();
    this._createNebula();
  }

  /**
   * Create starfield particles
   */
  _createStarfield() {
    const starCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Position stars in a large sphere
      const radius = 200 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random cyan/magenta/white colors
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1; // Cyan
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0.6; // Magenta
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1; // White
      }

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  /**
   * Create animated grid plane
   */
  _createGrid() {
    const gridSize = 200;
    const divisions = 40;

    // Create grid geometry manually for animation
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const step = gridSize / divisions;
    const half = gridSize / 2;

    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const y = i * step - half;
      vertices.push(-half, y, 0);
      vertices.push(half, y, 0);
    }

    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = i * step - half;
      vertices.push(x, -half, 0);
      vertices.push(x, half, 0);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.15,
    });

    this.grid = new THREE.LineSegments(geometry, material);
    this.grid.rotation.x = -Math.PI / 2;
    this.grid.position.y = -5;
    this.scene.add(this.grid);
  }

  /**
   * Create nebula clouds effect
   */
  _createNebula() {
    const nebulaCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nebulaCount * 3);
    const colors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100 + 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      // Purple/blue colors
      colors[i * 3] = 0.3 + Math.random() * 0.3;
      colors[i * 3 + 1] = 0.1 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 30,
      vertexColors: true,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
    });

    this.nebula = new THREE.Points(geometry, material);
    this.scene.add(this.nebula);
  }

  /**
   * Update background animations
   * @param {number} time - Current time
   * @param {number} audioLevel - Audio level for reactivity (0-1)
   */
  update(time, audioLevel = 0) {
    // Rotate starfield
    if (this.stars) {
      this.stars.rotation.y = time * 0.02;
      this.stars.rotation.x = Math.sin(time * 0.1) * 0.1;
      
      // Pulse opacity with audio
      this.stars.material.opacity = 0.6 + audioLevel * 0.4;
    }

    // Animate grid
    if (this.grid) {
      // Create wave effect on grid
      const positions = this.grid.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.05 + time) * Math.cos(y * 0.05 + time) * (2 + audioLevel * 5);
      }
      this.grid.geometry.attributes.position.needsUpdate = true;
      
      // Pulse grid opacity
      this.grid.material.opacity = 0.1 + audioLevel * 0.2;
    }

    // Animate nebula
    if (this.nebula) {
      this.nebula.rotation.y = time * 0.01;
      this.nebula.material.opacity = 0.05 + audioLevel * 0.1;
    }
  }

  /**
   * Set theme colors
   */
  setTheme(theme) {
    if (this.grid) {
      this.grid.material.color.setHex(theme.primary);
    }
  }

  /**
   * Dispose all resources
   */
  dispose() {
    if (this.stars) {
      this.scene.remove(this.stars);
      this.stars.geometry.dispose();
      this.stars.material.dispose();
    }
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.geometry.dispose();
      this.grid.material.dispose();
    }
    if (this.nebula) {
      this.scene.remove(this.nebula);
      this.nebula.geometry.dispose();
      this.nebula.material.dispose();
    }
  }
}

export default Background;
