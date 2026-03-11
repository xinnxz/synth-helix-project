/**
 * SYNTH::HELIX - Particle System
 * ================================
 * Particle effects triggered when beams are activated
 */

import * as THREE from 'three';

export class Particles {
  constructor(scene) {
    this.scene = scene;
    this.particlePool = [];
    this.activeParticles = [];
    this.poolSize = 500;
    
    this._createPool();
  }

  _createPool() {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    
    for (let i = 0; i < this.poolSize; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.visible = false;
      particle.userData = {
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        active: false,
      };
      
      this.scene.add(particle);
      this.particlePool.push(particle);
    }
  }

  /**
   * Get an available particle from pool
   */
  _getParticle() {
    for (const particle of this.particlePool) {
      if (!particle.userData.active) {
        return particle;
      }
    }
    return null; // Pool exhausted
  }

  /**
   * Emit particles at a position
   * @param {THREE.Vector3} position - Emission point
   * @param {number} count - Number of particles
   * @param {number} color - Particle color (hex)
   */
  emit(position, count = 20, color = 0x00ffff) {
    for (let i = 0; i < count; i++) {
      const particle = this._getParticle();
      if (!particle) break;

      // Set position
      particle.position.copy(position);
      particle.position.y += Math.random() * 5;

      // Random velocity (burst effect)
      particle.userData.velocity.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 15 + 5,
        (Math.random() - 0.5) * 10
      );

      // Set appearance
      particle.material.color.setHex(color);
      particle.material.opacity = 1;
      particle.scale.setScalar(0.5 + Math.random() * 0.5);

      // Set life
      particle.userData.life = 0;
      particle.userData.maxLife = 1 + Math.random() * 0.5;
      particle.userData.active = true;
      particle.visible = true;

      this.activeParticles.push(particle);
    }
  }

  /**
   * Emit ring burst (shockwave effect)
   * @param {THREE.Vector3} position - Center of ring
   * @param {number} color - Ring color
   */
  emitRing(position, color = 0xff0055) {
    const ringCount = 32;
    
    for (let i = 0; i < ringCount; i++) {
      const particle = this._getParticle();
      if (!particle) break;

      const angle = (i / ringCount) * Math.PI * 2;
      const speed = 15;

      particle.position.copy(position);
      particle.position.y = 0.5;

      particle.userData.velocity.set(
        Math.cos(angle) * speed,
        2,
        Math.sin(angle) * speed
      );

      particle.material.color.setHex(color);
      particle.material.opacity = 1;
      particle.scale.setScalar(0.3);

      particle.userData.life = 0;
      particle.userData.maxLife = 0.8;
      particle.userData.active = true;
      particle.visible = true;

      this.activeParticles.push(particle);
    }
  }

  /**
   * Update all active particles
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    const gravity = -30;
    
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      const data = particle.userData;

      // Update life
      data.life += deltaTime;
      
      if (data.life >= data.maxLife) {
        // Deactivate particle
        particle.visible = false;
        data.active = false;
        this.activeParticles.splice(i, 1);
        continue;
      }

      // Apply physics
      data.velocity.y += gravity * deltaTime;
      particle.position.add(
        data.velocity.clone().multiplyScalar(deltaTime)
      );

      // Fade out
      const lifeRatio = 1 - (data.life / data.maxLife);
      particle.material.opacity = lifeRatio;
      particle.scale.setScalar(lifeRatio * 0.5);

      // Floor collision
      if (particle.position.y < 0) {
        particle.position.y = 0;
        data.velocity.y *= -0.3; // Bounce with damping
        data.velocity.x *= 0.8;
        data.velocity.z *= 0.8;
      }
    }
  }

  /**
   * Clear all active particles
   */
  clear() {
    this.activeParticles.forEach(particle => {
      particle.visible = false;
      particle.userData.active = false;
    });
    this.activeParticles = [];
  }

  /**
   * Dispose all resources
   */
  dispose() {
    this.particlePool.forEach(particle => {
      this.scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
    });
    this.particlePool = [];
    this.activeParticles = [];
  }
}

export default Particles;
