/**
 * SYNTH::HELIX - Neural Audio-Visual Engine Core
 * =================================================
 * Main application entry point orchestrating 3D environments, 
 * VR sessions, Audio synthesis, and UI Interactions.
 * @module Main
 */

import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
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
import { Looper } from './core/Looper.js';

/**
 * Main Class controlling the entire SYNTH::HELIX lifecycle
 * @class SynthHelix
 */
class SynthHelix {
  constructor() {
    /** @type {boolean} Flag indicating if engine is ready */
    this.isInitialized = false;
    /** @type {boolean} Flag indicating if animation loop is active */
    this.isPlaying = false;
    
    this.time = 0;
    this.lastTime = 0;
    this.isMouseDown = false;
    this.lastHoveredIndex = -1;
    this.bassActiveTime = 0;
    this.shiftPressed = false; // Space-time warp trigger
    
    // Theme Configuration
    this.currentTheme = CONFIG.themes[CONFIG.defaultTheme];
    
    // Core Iteraction logic
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    
    // Module Declarations
    this.sceneManager = null;
    this.beams = null;
    this.floor = null;
    this.particles = null;
    this.background = null;
    this.postEffects = null;
    
    // Audio Systems
    this.synth = null;
    this.effects = null;
    this.visualizer = null;
    this.midiController = null;
    this.arpeggiator = null;
    this.looper = null;
    
    // UI Systems
    this.controls = null;
    
    // DOM Elements Bindings (Matching new HTML5 semantics)
    this.container = document.getElementById('canvas-container');
    this.bootScreen = document.getElementById('boot-screen');
    this.startBtn = document.getElementById('start-btn');
    this.mainHud = document.getElementById('main-hud');
    this.looperHud = document.getElementById('looper-hud');
    this.interactionHint = document.getElementById('interaction-hint');
    this.vrBtnContainer = document.getElementById('vr-btn');
    
    this._bindEvents();
  }

  /**
   * Bind DOM Level Event Listeners
   * @private
   */
  _bindEvents() {
    // Engine Boot Sequence
    this.startBtn?.addEventListener('click', () => this.start());
    
    // Input mechanisms
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mousedown', () => this._onMouseDown());
    document.addEventListener('mouseup', () => this._onMouseUp());
    document.addEventListener('keydown', (e) => { if(e.key === 'Shift') this.shiftPressed = true; });
    document.addEventListener('keyup', (e) => { if(e.key === 'Shift') this.shiftPressed = false; });
    
    // Mobile Touch interfaces
    document.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    document.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    document.addEventListener('touchend', () => this._onMouseUp());
  }

  /**
   * Boot up the 3D Engine, Audio Context, and start the animation loop.
   * This function implies the user has interacted with the document (required for WebAudio).
   * @public
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
    
    // Initialize UI & Core Modules
    this.controls = new Controls(this);
    this.looper = new Looper(this);
    
    // Setup WebXR if supported/configured
    if (CONFIG.vr.enabled && this.sceneManager.renderer.xr) {
        this.sceneManager.renderer.xr.enabled = true;
        const vrButtonElement = VRButton.createButton(this.sceneManager.renderer);
        // Style and inject VR button into our custom UI container
        vrButtonElement.style.position = 'relative';
        vrButtonElement.style.border = 'none';
        vrButtonElement.style.borderRadius = 'var(--border-radius)';
        this.vrBtnContainer?.appendChild(vrButtonElement);
        this.vrBtnContainer?.classList.remove('hidden');
    }

    // UI Orchestration Fade Out/In
    if(this.bootScreen) this.bootScreen.classList.remove('active');
    setTimeout(() => {
        if(this.bootScreen) this.bootScreen.style.display = 'none';
        if(this.mainHud) this.mainHud.classList.remove('hidden');
        if(this.interactionHint) this.interactionHint.classList.remove('hidden');
        if(this.looperHud) this.looperHud.classList.remove('hidden');
    }, 500);
    
    this.isInitialized = true;
    this.isPlaying = true;
    
    // Start animation loop using WebXR compatible renderer animation loop instead of generic requestAnimationFrame
    this.sceneManager.renderer.setAnimationLoop(() => this._animate());
  }

  /**
   * Main Engine Frame Loop (Tick)
   * Process physics, WebGL renders, raycasting updates.
   * @private
   */
  _animate() {
    if (!this.isPlaying) return;
    
    // Calculate delta time
    const now = performance.now() / 1000;
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    this.time += CONFIG.ui.animationSpeed;
    
    // Bass Drop timing
    const isBassActive = this.bassActiveTime > 0;
    if (this.bassActiveTime > 0) this.bassActiveTime -= deltaTime;
    
    // Audio FFT Analysis level (creates reactivity)
    const audioLevel = this.visualizer ? this.visualizer.getLevel() : 0;
    
    // --- 1. Sub-Systems Updates Phase ---
    this.beams.update(this.time, isBassActive);
    this.floor.update(this.time, isBassActive ? 2 : 1);
    this.particles.update(deltaTime);
    if(this.background) this.background.update(this.time, audioLevel);
    
    // Update Hologram Looper Logic
    if(this.looper) this.looper.update(this.time);
    
    // Update camera (drift or WebXR tracking)
    this.sceneManager.updateCamera(this.time);
    
    // --- 2. Post-Processing Phase (Blackhole Warp & Bloom) ---
    if (this.postEffects) {
      this.postEffects.updateOriginalPosition();
      this.postEffects.setAudioReactiveBloom(audioLevel);
      
      // Update Space Warp based on shift press or audio level extreme limits
      const warpTarget = this.shiftPressed ? 1.0 : (audioLevel > 0.8 ? audioLevel - 0.5 : 0.0);
      this.postEffects.updateWarpIntensity(warpTarget, deltaTime);
      
      this.postEffects.update(deltaTime);
    }
    
    // --- 3. Render Phase ---
    this.sceneManager.render();
  }

  /**
   * Updates 2D mouse projection to Normalized Device Coordinates
   * @param {MouseEvent} event 
   * @private
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
   * @param {THREE.Mesh} mesh
   * @private
   */
  _triggerBeam(mesh) {
    // Visual
    const beamIndex = this.beams.trigger(mesh);
    
    // Record to Memory if Looper is active
    if (this.looper) {
        this.looper.recordEvent(beamIndex);
    }
    
    // Particles
    this.particles.emit(
      mesh.position.clone(),
      15,
      this.currentTheme.primary
    );
    
    // Audio (With 3D Spatial Location provided)
    if (this.synth) {
      this.synth.playNote(beamIndex, {
          position: mesh.position.clone()
      });
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
