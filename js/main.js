/**
 * SYNTH::HELIX - Main Application
 * =================================
 * Entry point and main game loop
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { SceneManager } from './core/Scene.js';
import { Beams } from './visuals/Beams.js';
import { Floor } from './visuals/Floor.js';
import { Particles } from './visuals/Particles.js';
import { Background } from './visuals/Background.js';
import { PostEffects } from './visuals/PostEffects.js';
import { Synth } from './audio/Synth.js';
import { AudioEffects } from './audio/Effects.js';
import { AudioVisualizer } from './audio/Visualizer.js';
import { MIDIController } from './audio/MIDI.js';
import { Arpeggiator } from './audio/Arpeggiator.js';
import { Controls } from './ui/Controls.js';

class SynthHelix {
  constructor() {
    // State
    this.isInitialized = false;
    this.isPlaying = false;
    this.time = 0;
    this.lastTime = 0;
    this.isMouseDown = false;
    this.lastHoveredIndex = -1;
    this.bassActiveTime = 0;
    
    // Get current theme
    this.currentTheme = CONFIG.themes[CONFIG.defaultTheme];
    
    // Mouse & Raycaster
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    
    // Modules (initialized on start)
    this.sceneManager = null;
    this.beams = null;
    this.floor = null;
    this.particles = null;
    this.background = null;
    this.postEffects = null;
    this.synth = null;
    this.effects = null;
    this.visualizer = null;
    this.midiController = null;
    this.arpeggiator = null;
    this.controls = null;
    
    // DOM Elements
    this.container = document.getElementById('canvas-container');
    this.startBtn = document.getElementById('start-btn');
    this.overlayText = document.getElementById('overlay-text');
    
    // Bind events
    this._bindEvents();
  }

  _bindEvents() {
    // Start button
    this.startBtn.addEventListener('click', () => this.start());
    
    // Mouse events
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mousedown', () => this._onMouseDown());
    document.addEventListener('mouseup', () => this._onMouseUp());
    
    // Touch events for mobile
    document.addEventListener('touchmove', (e) => this._onTouchMove(e));
    document.addEventListener('touchstart', (e) => this._onTouchStart(e));
    document.addEventListener('touchend', () => this._onMouseUp());
  }

  /**
   * Initialize and start the application
   */
  start() {
    if (this.isInitialized) return;
    
    // Initialize scene
    this.sceneManager = new SceneManager(this.container, this.currentTheme);
    const scene = this.sceneManager.getScene();
    
    // Initialize visuals
    this.beams = new Beams(scene, this.currentTheme);
    this.floor = new Floor(scene, this.currentTheme);
    this.particles = new Particles(scene);
    this.background = new Background(scene);
    
    // Initialize post-processing effects
    this.postEffects = new PostEffects(
      this.sceneManager.getCamera(),
      this.sceneManager.composer
    );
    this.postEffects.setBloomPass(this.sceneManager.bloomPass);
    
    // Initialize audio
    this.synth = new Synth();
    this.effects = new AudioEffects(this.synth.ctx);
    this.arpeggiator = new Arpeggiator(this.synth);
    this.midiController = new MIDIController(this.synth);
    
    // Initialize visualizer (connect to master gain)
    this.visualizer = new AudioVisualizer(this.synth.ctx, this.synth.masterGain);
    
    // Set up visualizer canvases after controls are created
    setTimeout(() => {
      const waveformCanvas = document.getElementById('waveform-canvas');
      const frequencyCanvas = document.getElementById('frequency-canvas');
      if (waveformCanvas) this.visualizer.setupWaveformCanvas(waveformCanvas);
      if (frequencyCanvas) this.visualizer.setupFrequencyCanvas(frequencyCanvas);
      this.visualizer.start();
    }, 100);
    
    // Initialize UI
    this.controls = new Controls(this);
    
    // Update UI
    this.startBtn.style.display = 'none';
    this.overlayText.classList.remove('hidden');
    
    this.isInitialized = true;
    this.isPlaying = true;
    
    // Start animation loop
    this._animate();
  }

  /**
   * Main animation loop
   */
  _animate() {
    if (!this.isPlaying) return;
    
    requestAnimationFrame(() => this._animate());
    
    // Calculate delta time
    const now = performance.now() / 1000;
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    this.time += CONFIG.ui.animationSpeed;
    
    // Check if bass is active
    const isBassActive = this.bassActiveTime > 0;
    if (this.bassActiveTime > 0) {
      this.bassActiveTime -= deltaTime;
    }
    
    // Get audio level for reactive visuals
    const audioLevel = this.visualizer ? this.visualizer.getLevel() : 0;
    
    // Update all visual modules
    this.beams.update(this.time, isBassActive);
    this.floor.update(this.time, isBassActive ? 2 : 1);
    this.particles.update(deltaTime);
    this.background?.update(this.time, audioLevel);
    this.sceneManager.updateCamera(this.time);
    
    // Update post effects
    if (this.postEffects) {
      this.postEffects.updateOriginalPosition();
      this.postEffects.setAudioReactiveBloom(audioLevel);
      this.postEffects.update(deltaTime);
    }
    
    // Render
    this.sceneManager.render();
  }

  /**
   * Handle mouse movement
   */
  _onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this._checkBeamIntersection();
  }

  /**
   * Handle touch movement
   */
  _onTouchMove(event) {
    if (event.touches.length === 0) return;
    
    const touch = event.touches[0];
    this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    
    this._checkBeamIntersection();
  }

  /**
   * Handle touch start
   */
  _onTouchStart(event) {
    if (event.touches.length === 0) return;
    
    const touch = event.touches[0];
    this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    
    this._checkBeamIntersection();
  }

  /**
   * Check if mouse/touch intersects with beams
   */
  _checkBeamIntersection() {
    if (!this.isInitialized) return;
    
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.getCamera());
    const intersects = this.raycaster.intersectObjects(this.beams.getMeshes());
    
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      const index = mesh.userData.id;
      
      if (index !== this.lastHoveredIndex) {
        this.lastHoveredIndex = index;
        this._triggerBeam(mesh);
      }
    } else {
      this.lastHoveredIndex = -1;
    }
  }

  /**
   * Trigger a beam (visual + audio)
   */
  _triggerBeam(mesh) {
    // Visual
    const beamIndex = this.beams.trigger(mesh);
    
    // Particles
    this.particles.emit(
      mesh.position.clone(),
      15,
      this.currentTheme.primary
    );
    
    // Audio
    if (this.synth) {
      this.synth.playNote(beamIndex);
    }
  }

  /**
   * Handle mouse down (bass drop)
   */
  _onMouseDown() {
    this.isMouseDown = true;
    this.triggerBassVisuals();
    
    if (this.synth && this.isInitialized) {
      this.synth.playBassDrop();
    }
  }

  /**
   * Handle mouse up
   */
  _onMouseUp() {
    this.isMouseDown = false;
  }

  /**
   * Trigger bass drop visuals
   */
  triggerBassVisuals() {
    this.bassActiveTime = 0.5; // Active for 0.5 seconds
    
    // Emit ring particles at center
    if (this.particles) {
      this.particles.emitRing(
        new THREE.Vector3(0, 0, 0),
        this.currentTheme.secondary
      );
    }
    
    // Screen shake effect
    if (this.postEffects) {
      this.postEffects.shake(0.5, 0.3);
      this.postEffects.flashBloom();
    }
  }

  /**
   * Set color theme
   */
  setTheme(themeName) {
    const theme = CONFIG.themes[themeName];
    if (!theme) return;
    
    this.currentTheme = theme;
    
    if (this.sceneManager) this.sceneManager.setTheme(theme);
    if (this.beams) this.beams.setTheme(theme);
    if (this.floor) this.floor.setTheme(theme);
    if (this.background) this.background.setTheme(theme);
  }

  /**
   * Set beam count
   */
  setBeamCount(count) {
    if (this.beams) {
      this.beams.setBeamCount(count);
    }
  }

  /**
   * Pause the application
   */
  pause() {
    this.isPlaying = false;
  }

  /**
   * Resume the application
   */
  resume() {
    if (!this.isPlaying && this.isInitialized) {
      this.isPlaying = true;
      this.lastTime = performance.now() / 1000;
      this._animate();
    }
  }

  /**
   * Dispose all resources
   */
  dispose() {
    this.isPlaying = false;
    
    if (this.sceneManager) this.sceneManager.dispose();
    if (this.beams) this.beams.dispose();
    if (this.floor) this.floor.dispose();
    if (this.particles) this.particles.dispose();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.synthHelix = new SynthHelix();
});

export default SynthHelix;
