/**
 * SYNTH::HELIX - Synthesizer Engine
 * ===================================
 * Advanced Web Audio API synthesizer with effects
 */

import { CONFIG } from '../config.js';
import { getFrequency, SCALES } from './Scales.js';

export class Synth {
  constructor() {
    // Create Audio Context
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Current settings
    this.currentScale = CONFIG.audio.defaultScale;
    this.currentWaveform = CONFIG.audio.defaultWaveform;
    this.baseFrequency = CONFIG.audio.baseFrequency;
    this.octave = CONFIG.audio.defaultOctave;
    
    // Master output chain
    this._setupMasterChain();
    
    // Recording
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  /**
   * Setup master audio chain with effects
   * Signal flow: Source -> Effects -> Master Gain -> Destination
   */
  _setupMasterChain() {
    // Master Gain (volume control)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = CONFIG.audio.masterVolume;

    // Compressor (untuk mencegah clipping)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    // Delay (Echo effect)
    this.delay = this.ctx.createDelay();
    this.delay.delayTime.value = CONFIG.audio.delayTime;
    
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.value = CONFIG.audio.delayFeedback;

    // Delay feedback loop
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);

    // Reverb (using ConvolverNode with impulse response)
    this.reverb = this.ctx.createConvolver();
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.3;
    this._createReverbImpulse();

    // Dry/Wet mix
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.7;
    
    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.value = 0.3;

    // Connect chain
    // Dry path: masterGain -> dryGain -> compressor -> destination
    // Wet path: masterGain -> delay -> wetGain -> compressor -> destination
    // Reverb path: masterGain -> reverb -> reverbGain -> compressor -> destination
    
    this.masterGain.connect(this.dryGain);
    this.dryGain.connect(this.compressor);
    
    this.masterGain.connect(this.delay);
    this.delay.connect(this.wetGain);
    this.wetGain.connect(this.compressor);
    
    this.masterGain.connect(this.reverb);
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.compressor);
    
    this.compressor.connect(this.ctx.destination);
  }

  /**
   * Create synthetic impulse response for reverb
   */
  _createReverbImpulse() {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2; // 2 second reverb
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with some randomness
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    this.reverb.buffer = impulse;
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resume() {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Play a note based on beam index with Spatial 3D Audio support
   * @param {number} beamIndex - Index of triggered beam (0 to beamCount-1)
   * @param {Object} options - Additional options including 3D position
   */
  playNote(beamIndex, options = {}) {
    this.resume();

    const {
      waveform = this.currentWaveform,
      duration = 0.5,
      velocity = 1.0,
      position = null    // THREE.Vector3 array or object [x,y,z]
    } = options;

    // Calculate frequency from beam index
    const frequency = getFrequency(
      beamIndex,
      this.currentScale,
      this.baseFrequency,
      0 // octave offset
    );

    // Create oscillator
    const osc = this.ctx.createOscillator();
    osc.type = waveform;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    // Create envelope (ADSR-like)
    const envelope = this.ctx.createGain();
    const now = this.ctx.currentTime;
    
    // Attack
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(velocity, now + 0.01);
    
    // Decay & Sustain
    envelope.gain.exponentialRampToValueAtTime(velocity * 0.7, now + 0.1);
    
    // Release
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Connect Envelope to optional spatial Panner, else direct to master
    let lastNode = envelope;

    if (CONFIG.audio.spatialEnabled && position) {
      const panner = this.ctx.createPanner();
      panner.panningModel = 'HRTF'; // Best quality 3D Audio
      panner.distanceModel = 'inverse';
      panner.refDistance = CONFIG.audio.pannerRefDistance;
      panner.maxDistance = CONFIG.audio.pannerMaxDistance;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;
      
      panner.positionX.value = position.x || 0;
      panner.positionY.value = position.y || 0;
      panner.positionZ.value = position.z || 0;
      
      envelope.connect(panner);
      lastNode = panner;
    }

    // Connect to Master and Play
    lastNode.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + duration + 0.1);

    return { frequency, osc };
  }

  /**
   * Update the spatial listener's position to match the camera
   * @param {THREE.Camera} camera 
   */
  updateListener(camera) {
    if (!CONFIG.audio.spatialEnabled || !this.ctx.listener) return;

    // Set position
    if (this.ctx.listener.positionX) {
      // Modern Web Audio API
      this.ctx.listener.positionX.setTargetAtTime(camera.position.x, this.ctx.currentTime, 0.05);
      this.ctx.listener.positionY.setTargetAtTime(camera.position.y, this.ctx.currentTime, 0.05);
      this.ctx.listener.positionZ.setTargetAtTime(camera.position.z, this.ctx.currentTime, 0.05);
      
      // We also need to get camera direction for orientation
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const up = camera.up;
      
      this.ctx.listener.forwardX.setTargetAtTime(dir.x, this.ctx.currentTime, 0.05);
      this.ctx.listener.forwardY.setTargetAtTime(dir.y, this.ctx.currentTime, 0.05);
      this.ctx.listener.forwardZ.setTargetAtTime(dir.z, this.ctx.currentTime, 0.05);
      
      this.ctx.listener.upX.setTargetAtTime(up.x, this.ctx.currentTime, 0.05);
      this.ctx.listener.upY.setTargetAtTime(up.y, this.ctx.currentTime, 0.05);
      this.ctx.listener.upZ.setTargetAtTime(up.z, this.ctx.currentTime, 0.05);
    } else {
      // Fallback for older browsers
      this.ctx.listener.setPosition(camera.position.x, camera.position.y, camera.position.z);
    }
  }

  /**
   * Play bass drop effect (on mouse click)
   */
  playBassDrop() {
    this.resume();

    const now = this.ctx.currentTime;
    
    // Main bass oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.0);

    // Sub bass for extra punch
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(60, now);
    subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.8);

    // Envelopes
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.6, now);
    env.gain.linearRampToValueAtTime(0, now + 1.0);

    const subEnv = this.ctx.createGain();
    subEnv.gain.setValueAtTime(0.4, now);
    subEnv.gain.linearRampToValueAtTime(0, now + 0.8);

    // Distortion for grit
    const distortion = this.ctx.createWaveShaper();
    distortion.curve = this._makeDistortionCurve(50);

    // Connect
    osc.connect(env);
    env.connect(distortion);
    distortion.connect(this.masterGain);
    
    subOsc.connect(subEnv);
    subEnv.connect(this.masterGain);

    // Play
    osc.start(now);
    osc.stop(now + 1.1);
    subOsc.start(now);
    subOsc.stop(now + 0.9);
  }

  /**
   * Create distortion curve
   */
  _makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }

  /**
   * Play ambient pad (background sound)
   */
  playAmbientPad(frequency = 110) {
    this.resume();

    const now = this.ctx.currentTime;
    const duration = 4;

    // Multiple detuned oscillators for rich sound
    const oscillators = [];
    const detunes = [-10, 0, 10, 7];

    detunes.forEach(detune => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      osc.detune.value = detune;
      oscillators.push(osc);
    });

    // Envelope
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.15, now + 1);
    env.gain.linearRampToValueAtTime(0.1, now + duration - 1);
    env.gain.linearRampToValueAtTime(0, now + duration);

    // LFO for movement
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);

    // Connect all
    oscillators.forEach(osc => {
      lfoGain.connect(osc.frequency);
      osc.connect(env);
      osc.start(now);
      osc.stop(now + duration);
    });

    env.connect(this.masterGain);
    lfo.start(now);
    lfo.stop(now + duration);
  }

  // ============ SETTINGS ============
  
  setScale(scaleName) {
    if (SCALES[scaleName]) {
      this.currentScale = scaleName;
    }
  }

  setWaveform(waveform) {
    const validWaveforms = ['sine', 'triangle', 'sawtooth', 'square'];
    if (validWaveforms.includes(waveform)) {
      this.currentWaveform = waveform;
    }
  }

  setVolume(value) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, value));
  }

  setDelayTime(value) {
    this.delay.delayTime.value = Math.max(0, Math.min(1, value));
  }

  setDelayFeedback(value) {
    this.delayFeedback.gain.value = Math.max(0, Math.min(0.9, value));
  }

  setReverbMix(value) {
    this.reverbGain.gain.value = Math.max(0, Math.min(1, value));
  }

  // ============ RECORDING ============

  async startRecording() {
    const dest = this.ctx.createMediaStreamDestination();
    this.compressor.connect(dest);
    
    this.mediaRecorder = new MediaRecorder(dest.stream);
    this.recordedChunks = [];
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };
    
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.isRecording = false;
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  async exportRecording(filename = 'synth-helix-recording') {
    const blob = await this.stopRecording();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default Synth;
