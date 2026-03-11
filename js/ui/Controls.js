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
    const panelBody = this.panel?.querySelector('.panel-body');

    if (panelBody) {
        panelBody.innerHTML = `
          <!-- AUDIO SECTION -->
          <div class="controls-section">
            <h3>🎵 Audio</h3>
            
            <label>Volume</label>
            <input type="range" id="ctrl-volume" min="0" max="100" value="30" class="cyber-range">
            
            <label>Scale</label>
            <select id="ctrl-scale" class="cyber-select">
              ${getScaleNames().map(s => 
                `<option value="${s.id}" ${s.id === CONFIG.audio.defaultScale ? 'selected' : ''}>${s.name}</option>`
              ).join('')}
            </select>
            
            <label>Waveform</label>
            <select id="ctrl-waveform" class="cyber-select">
              <option value="sine">Sine (Smooth)</option>
              <option value="triangle" selected>Triangle (Soft)</option>
              <option value="sawtooth">Sawtooth (Bright)</option>
              <option value="square">Square (Retro)</option>
            </select>
          </div>
          
          <!-- EFFECTS SECTION -->
          <div class="controls-section">
            <h3>🎛️ Effects</h3>
            
            <label>Delay Time</label>
            <input type="range" id="ctrl-delay" min="0" max="100" value="30" class="cyber-range">
            
            <label>Reverb Mix</label>
            <input type="range" id="ctrl-reverb" min="0" max="100" value="30" class="cyber-range">
            
            <label>Filter Cutoff</label>
            <input type="range" id="ctrl-filter" min="0" max="100" value="100" class="cyber-range">
            
            <label>Filter Type</label>
            <select id="ctrl-filter-type" class="cyber-select">
              <option value="lowpass">Low Pass</option>
              <option value="highpass">High Pass</option>
              <option value="bandpass">Band Pass</option>
            </select>
            
            <label>Distortion</label>
            <input type="range" id="ctrl-distortion" min="0" max="100" value="0" class="cyber-range">
            
            <label>Chorus Mix</label>
            <input type="range" id="ctrl-chorus" min="0" max="100" value="0" class="cyber-range">
          </div>
          
          <!-- ARPEGGIATOR SECTION -->
          <div class="controls-section">
            <h3>🎼 Arpeggiator</h3>
            
            <button id="ctrl-arp-toggle" class="cyber-btn arp-btn">
              <span class="arp-icon">▶</span> Start Arp
            </button>
            
            <label>Pattern</label>
            <select id="ctrl-arp-pattern" class="cyber-select">
              <option value="up">Up ↑</option>
              <option value="down">Down ↓</option>
              <option value="updown">Up/Down ↕</option>
              <option value="random">Random 🎲</option>
              <option value="chord">Chord 🎹</option>
            </select>
            
            <label>Tempo: <span id="arp-tempo-display">120</span> BPM</label>
            <input type="range" id="ctrl-arp-tempo" min="60" max="200" value="120" class="cyber-range">
            
            <label>Chord Type</label>
            <select id="ctrl-arp-chord" class="cyber-select">
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="major7">Major 7th</option>
              <option value="minor7">Minor 7th</option>
              <option value="sus4">Sus4</option>
              <option value="power">Power</option>
            </select>
          </div>
    
          <!-- VISUALIZER SECTION -->
          <div class="controls-section visualizer-section">
            <h3>📊 Visualizer</h3>
            <div id="visualizer-container">
              <canvas id="waveform-canvas" width="280" height="60"></canvas>
              <canvas id="frequency-canvas" width="280" height="60"></canvas>
            </div>
          </div>
    
          <!-- MIDI SECTION -->
          <div class="controls-section">
            <h3>🎹 MIDI</h3>
            <button id="ctrl-midi-enable" class="cyber-btn midi-btn">
              Enable MIDI
            </button>
            <div id="midi-status" class="midi-status">
              Click to connect MIDI devices
            </div>
          </div>
          
          <!-- VISUAL SECTION -->
          <div class="controls-section">
            <h3>🎨 Visual</h3>
            
            <label>Visual Warp (Blackhole)</label>
            <input type="range" id="warp-intensity" min="0" max="100" value="0" class="cyber-range">
            
            <label>Theme</label>
            <select id="ctrl-theme" class="cyber-select">
              ${Object.entries(CONFIG.themes).map(([key, theme]) => 
                `<option value="${key}" ${key === CONFIG.defaultTheme ? 'selected' : ''}>${theme.name}</option>`
              ).join('')}
            </select>
            
            <label>Beam Count</label>
            <select id="ctrl-beams" class="cyber-select">
              <option value="16">16 Beams</option>
              <option value="32" selected>32 Beams</option>
              <option value="48">48 Beams</option>
              <option value="64">64 Beams</option>
            </select>
            
            <label>Bloom Intensity</label>
            <input type="range" id="ctrl-bloom" min="0" max="100" value="66" class="cyber-range">
          </div>
        `;
    }
    
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
    
    // Volume
    document.getElementById('ctrl-volume')?.addEventListener('input', (e) => {
      this.app.synth?.setVolume(e.target.value / 100);
    });

    // Scale
    document.getElementById('ctrl-scale')?.addEventListener('change', (e) => {
      this.app.synth?.setScale(e.target.value);
      if (this.app.arpeggiator) {
        this.app.arpeggiator.setNotes(this.app.arpeggiator.notes);
      }
    });

    // Waveform
    document.getElementById('ctrl-waveform')?.addEventListener('change', (e) => {
      this.app.synth?.setWaveform(e.target.value);
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
    document.getElementById('ctrl-theme')?.addEventListener('change', (e) => {
      this.app.setTheme(e.target.value);
    });

    // Beam count
    document.getElementById('ctrl-beams')?.addEventListener('change', (e) => {
      this.app.setBeamCount(parseInt(e.target.value));
    });

    // Bloom
    document.getElementById('ctrl-bloom')?.addEventListener('input', (e) => {
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
          {
             const recBtn = document.getElementById('record-btn');
             if (recBtn) recBtn.click();
          }
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
