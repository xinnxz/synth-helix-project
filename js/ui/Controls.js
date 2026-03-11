/**
 * SYNTH::HELIX - UI Controls
 * ============================
 * Settings panel for customizing the instrument
 */

import { CONFIG } from '../config.js';
import { getScaleNames } from '../audio/Scales.js';

export class Controls {
  constructor(app) {
    this.app = app;
    this.isVisible = false;
    this.panel = null;
    
    this._createPanel();
    this._setupKeyboardShortcuts();
  }

  _createPanel() {
    // Gunakan panel yang sudah ada di HTML5 (hindari innerHTML string panjang)
    this.panel = document.getElementById('controls-panel');
    
    // Bind Event Listeners
    this._bindEvents();
  }

  _bindEvents() {
    // Set Header Settings Toggle
    document.getElementById('settings-btn')?.addEventListener('click', () => {
        this.toggle();
    });

    document.getElementById('close-settings')?.addEventListener('click', () => {
      this.hide();
    });

    // ============ AUDIO CONTROLS ============
    
    // Scale Modulation
    document.getElementById('scale-select')?.addEventListener('change', (e) => {
      this.app.synth?.setScale(e.target.value);
    });

    // ============ VISUAL CONTROLS ============
    
    // Visual Warp Intensity (Blackhole Effect)
    document.getElementById('warp-intensity')?.addEventListener('input', (e) => {
        if(this.app.postEffects){
            // Directly set uniform
            this.app.postEffects.updateWarpIntensity(e.target.value / 100, 0.5); 
        }
    });

    // ============ EFFECTS CONTROLS ============

    // Delay
    document.getElementById('ctrl-delay').addEventListener('input', (e) => {
      this.app.synth?.setDelayTime(e.target.value / 100);
    });

    // Reverb
    document.getElementById('ctrl-reverb').addEventListener('input', (e) => {
      this.app.synth?.setReverbMix(e.target.value / 100);
    });

    // Filter Cutoff
    document.getElementById('ctrl-filter')?.addEventListener('input', (e) => {
      this.app.effects?.get('filter')?.setFrequency(e.target.value / 100);
    });

    // Filter Type
    document.getElementById('ctrl-filter-type')?.addEventListener('change', (e) => {
      this.app.effects?.get('filter')?.setType(e.target.value);
    });

    // Distortion
    document.getElementById('ctrl-distortion')?.addEventListener('input', (e) => {
      this.app.effects?.get('distortion')?.setAmount(e.target.value / 100);
    });

    // Chorus
    document.getElementById('ctrl-chorus')?.addEventListener('input', (e) => {
      this.app.effects?.get('chorus')?.setMix(e.target.value / 100);
    });

    // ============ ARPEGGIATOR CONTROLS ============

    // Arp Toggle
    document.getElementById('ctrl-arp-toggle')?.addEventListener('click', (e) => {
      if (this.app.arpeggiator) {
        const isPlaying = this.app.arpeggiator.toggle();
        e.target.innerHTML = isPlaying 
          ? '<span class="arp-icon">⏹</span> Stop Arp' 
          : '<span class="arp-icon">▶</span> Start Arp';
        e.target.classList.toggle('active', isPlaying);
      }
    });

    // Arp Pattern
    document.getElementById('ctrl-arp-pattern')?.addEventListener('change', (e) => {
      this.app.arpeggiator?.setPattern(e.target.value);
    });

    // Arp Tempo
    document.getElementById('ctrl-arp-tempo')?.addEventListener('input', (e) => {
      this.app.arpeggiator?.setTempo(parseInt(e.target.value));
      document.getElementById('arp-tempo-display').textContent = e.target.value;
    });

    // Arp Chord Type
    document.getElementById('ctrl-arp-chord')?.addEventListener('change', (e) => {
      const presets = {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        major7: [0, 4, 7, 11],
        minor7: [0, 3, 7, 10],
        sus4: [0, 5, 7],
        power: [0, 7],
      };
      this.app.arpeggiator?.setNotes(presets[e.target.value] || presets.major);
    });

    // ============ MIDI CONTROLS ============

    // MIDI Enable
    document.getElementById('ctrl-midi-enable')?.addEventListener('click', async (e) => {
      if (this.app.midiController) {
        const success = await this.app.midiController.init();
        const statusEl = document.getElementById('midi-status');
        if (success) {
          const inputs = this.app.midiController.getInputs();
          if (inputs.length > 0) {
            statusEl.innerHTML = inputs.map(i => `✓ ${i.name}`).join('<br>');
            e.target.textContent = 'MIDI Connected';
            e.target.classList.add('active');
          } else {
            statusEl.textContent = 'No MIDI devices found';
          }
        } else {
          statusEl.textContent = 'MIDI not available';
        }
      }
    });

    // ============ VISUAL CONTROLS ============

    // Theme
    document.getElementById('ctrl-theme').addEventListener('change', (e) => {
      this.app.setTheme(e.target.value);
    });

    // Beam count
    document.getElementById('ctrl-beams').addEventListener('change', (e) => {
      this.app.setBeamCount(parseInt(e.target.value));
    });

    // Bloom
    document.getElementById('ctrl-bloom').addEventListener('input', (e) => {
      this.app.sceneManager?.setBloomStrength(e.target.value / 33);
    });

    // ============ RECORDING / LOOPER ============

    const recordBtn = document.getElementById('record-btn');
    const clearLoopBtn = document.getElementById('clear-loop-btn');
    
    recordBtn?.addEventListener('click', () => {
      if(this.app.looper) {
          this.app.looper.toggleRecording();
      }
    });
    
    clearLoopBtn?.addEventListener('click', () => {
      if(this.app.looper) {
          this.app.looper.clearLoop();
      }
    });
  }

  _setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch(e.key.toLowerCase()) {
        case 's':
          this.toggle();
          break;
        case 'f':
          this.app.sceneManager?.toggleFullscreen();
          break;
        case 'r':
          this.toggleRecording(document.getElementById('ctrl-record'));
          break;
        case 'm':
          this.toggleMute();
          break;
        case 'a':
          // Toggle arpeggiator
          if (this.app.arpeggiator) {
            const isPlaying = this.app.arpeggiator.toggle();
            const btn = document.getElementById('ctrl-arp-toggle');
            if (btn) {
              btn.innerHTML = isPlaying 
                ? '<span class="arp-icon">⏹</span> Stop Arp' 
                : '<span class="arp-icon">▶</span> Start Arp';
              btn.classList.toggle('active', isPlaying);
            }
          }
          break;
        case ' ':
          e.preventDefault();
          this.app.synth?.playBassDrop();
          this.app.triggerBassVisuals();
          break;
      }
    });
  }

  toggleRecording(btn) {
    if (!this.app.synth) return;

    if (this.app.synth.isRecording) {
      this.app.synth.exportRecording('synth-helix-session');
      btn.innerHTML = '<span class="record-icon">⏺</span> Start Recording';
      btn.classList.remove('recording');
    } else {
      this.app.synth.startRecording();
      btn.innerHTML = '<span class="record-icon recording">⏹</span> Stop & Save';
      btn.classList.add('recording');
    }
  }

  toggleMute() {
    if (!this.app.synth) return;
    
    const volumeSlider = document.getElementById('ctrl-volume');
    if (parseFloat(volumeSlider.value) > 0) {
      this._previousVolume = volumeSlider.value;
      volumeSlider.value = 0;
      this.app.synth.setVolume(0);
    } else {
      volumeSlider.value = this._previousVolume || 30;
      this.app.synth.setVolume(this._previousVolume / 100 || 0.3);
    }
  }

  show() {
    this.panel.classList.add('visible');
    this.isVisible = true;
  }

  hide() {
    this.panel.classList.remove('visible');
    this.isVisible = false;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

export default Controls;
