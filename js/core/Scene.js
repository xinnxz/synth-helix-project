/**
 * SYNTH::HELIX - Scene Manager
 * =============================
 * Three.js scene setup with post-processing
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CONFIG } from '../config.js';

export class SceneManager {
  constructor(container, theme) {
    this.container = container;
    this.theme = theme;
    
    this._setupScene();
    this._setupCamera();
    this._setupRenderer();
    this._setupPostProcessing();
    this._setupLights();
    
    window.addEventListener('resize', () => this.onResize());
  }

  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.theme.background, 0.02);
    this.scene.background = new THREE.Color(this.theme.background);
  }

  _setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.visual.cameraFov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 35);
    this.camera.lookAt(0, 0, 0);
  }

  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  _setupPostProcessing() {
    const renderPass = new RenderPass(this.scene, this.camera);
    
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      CONFIG.visual.bloomStrength,
      CONFIG.visual.bloomRadius,
      CONFIG.visual.bloomThreshold
    );

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(this.bloomPass);
  }

  _setupLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambient);

    // Point lights for atmosphere
    const light1 = new THREE.PointLight(this.theme.primary, 1, 50);
    light1.position.set(0, 20, 0);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(this.theme.secondary, 0.5, 30);
    light2.position.set(10, 10, 10);
    this.scene.add(light2);
  }

  /**
   * Update camera position (drift effect)
   * @param {number} time - Current time
   */
  updateCamera(time) {
    if (!CONFIG.visual.cameraDrift) return;

    const speed = CONFIG.visual.cameraDriftSpeed;
    this.camera.position.x = Math.sin(time * speed) * 20;
    this.camera.position.z = Math.cos(time * speed) * 40;
    this.camera.lookAt(0, 5, 0);
  }

  /**
   * Render the scene
   */
  render() {
    this.composer.render();
  }

  /**
   * Handle window resize
   */
  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  /**
   * Set color theme
   */
  setTheme(theme) {
    this.theme = theme;
    this.scene.fog.color.setHex(theme.background);
    this.scene.background.setHex(theme.background);
  }

  /**
   * Set bloom intensity
   */
  setBloomStrength(value) {
    this.bloomPass.strength = value;
  }

  /**
   * Get scene for adding objects
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get camera for raycasting
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Enter fullscreen mode
   */
  enterFullscreen() {
    const elem = this.container;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  /**
   * Exit fullscreen mode
   */
  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (document.fullscreenElement) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  /**
   * Dispose all resources
   */
  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.composer.dispose();
  }
}

export default SceneManager;
