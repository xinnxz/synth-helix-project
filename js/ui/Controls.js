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
    // Create panel container
    this.panel = document.createElement('div');
    this.panel.id = 'controls-panel';
    this.panel.innerHTML = `
      <div class="controls-header">
        <h2>⚙️ SETTINGS</h2>
        <button class="close-btn" id="close-controls">&times;</button>
      </div>
      
      <!-- AUDIO SECTION -->
      <div class="controls-section">
        <h3>🎵 Audio</h3>
        
        <label>Volume</label>
        <input type="range" id="ctrl-volume" min="0" max="100" value="30">
        
        <label>Scale</label>
        <select id="ctrl-scale">
          ${getScaleNames().map(s => 
            `<option value="${s.id}" ${s.id === CONFIG.audio.defaultScale ? 'selected' : ''}>${s.name}</option>`
          ).join('')}
        </select>
        
        <label>Waveform</label>
        <select id="ctrl-waveform">
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
        <input type="range" id="ctrl-delay" min="0" max="100" value="30">
        
        <label>Reverb Mix</label>
        <input type="range" id="ctrl-reverb" min="0" max="100" value="30">
        
        <label>Filter Cutoff</label>
        <input type="range" id="ctrl-filter" min="0" max="100" value="100">
        
        <label>Filter Type</label>
        <select id="ctrl-filter-type">
          <option value="lowpass">Low Pass</option>
          <option value="highpass">High Pass</option>
          <option value="bandpass">Band Pass</option>
        </select>
        
        <label>Distortion</label>
        <input type="range" id="ctrl-distortion" min="0" max="100" value="0">
        
        <label>Chorus Mix</label>
        <input type="range" id="ctrl-chorus" min="0" max="100" value="0">
      </div>
      
      <!-- ARPEGGIATOR SECTION -->
      <div class="controls-section">
        <h3>🎼 Arpeggiator</h3>
        
        <button id="ctrl-arp-toggle" class="arp-btn">
          <span class="arp-icon">▶</span> Start Arp
        </button>
        
        <label>Pattern</label>
        <select id="ctrl-arp-pattern">
          <option value="up">Up ↑</option>
          <option value="down">Down ↓</option>
          <option value="updown">Up/Down ↕</option>
          <option value="random">Random 🎲</option>
          <option value="chord">Chord 🎹</option>
        </select>
        
        <label>Tempo: <span id="arp-tempo-display">120</span> BPM</label>
        <input type="range" id="ctrl-arp-tempo" min="60" max="200" value="120">
        
        <label>Chord Type</label>
        <select id="ctrl-arp-chord">
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
        <button id="ctrl-midi-enable" class="midi-btn">
          Enable MIDI
        </button>
        <div id="midi-status" class="midi-status">
          Click to connect MIDI devices
        </div>
      </div>
      
      <!-- VISUAL SECTION -->
      <div class="controls-section">
        <h3>🎨 Visual</h3>
        
        <label>Theme</label>
        <select id="ctrl-theme">
          ${Object.entries(CONFIG.themes).map(([key, theme]) => 
            `<option value="${key}" ${key === CONFIG.defaultTheme ? 'selected' : ''}>${theme.name}</option>`
          ).join('')}
        </select>
        
        <label>Beam Count</label>
        <select id="ctrl-beams">
          <option value="16">16 Beams</option>
          <option value="32" selected>32 Beams</option>
          <option value="48">48 Beams</option>
          <option value="64">64 Beams</option>
        </select>
        
        <label>Bloom Intensity</label>
        <input type="range" id="ctrl-bloom" min="0" max="100" value="66">
      </div>
      
      <!-- RECORDING SECTION -->
      <div class="controls-section">
        <h3>🎬 Recording</h3>
        <button id="ctrl-record" class="record-btn">
          <span class="record-icon">⏺</span> Start Recording
        </button>
      </div>
      
      <!-- SHORTCUTS SECTION -->
      <div class="controls-section shortcuts">
        <h3>⌨️ Shortcuts</h3>
        <div class="shortcut"><span>F</span> Fullscreen</div>
        <div class="shortcut"><span>S</span> Settings</div>
        <div class="shortcut"><span>R</span> Record</div>
        <div class="shortcut"><span>M</span> Mute</div>
        <div class="shortcut"><span>A</span> Arpeggiator</div>
        <div class="shortcut"><span>Space</span> Bass Drop</div>
      </div>
    `;
    
    document.body.appendChild(this.panel);
    this._bindEvents();
  }

  _bindEvents() {
    // Close button
    document.getElementById('close-controls').addEventListener('click', () => {
      this.hide();
    });

    // ============ AUDIO CONTROLS ============
    
    // Volume
    document.getElementById('ctrl-volume').addEventListener('input', (e) => {
      this.app.synth?.setVolume(e.target.value / 100);
    });

    // Scale
    document.getElementById('ctrl-scale').addEventListener('change', (e) => {
      this.app.synth?.setScale(e.target.value);
      // Update arpeggiator if active
      if (this.app.arpeggiator) {
        this.app.arpeggiator.setNotes(this.app.arpeggiator.notes);
      }
    });

    // Waveform
    document.getElementById('ctrl-waveform').addEventListener('change', (e) => {
      this.app.synth?.setWaveform(e.target.value);
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

    // ============ RECORDING ============

    // Recording
    const recordBtn = document.getElementById('ctrl-record');
    recordBtn.addEventListener('click', () => {
      this.toggleRecording(recordBtn);
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
