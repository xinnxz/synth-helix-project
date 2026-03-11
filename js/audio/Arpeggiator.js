/**
 * SYNTH::HELIX - Arpeggiator
 * ============================
 * Automatic note pattern generator
 */

export class Arpeggiator {
  constructor(synth) {
    this.synth = synth;
    
    // State
    this.isPlaying = false;
    this.currentStep = 0;
    this.intervalId = null;
    
    // Settings
    this.tempo = 120; // BPM
    this.pattern = 'up'; // up, down, updown, random, chord
    this.octaveRange = 2;
    this.noteLength = 0.8; // As fraction of step
    this.subdivision = 4; // Notes per beat (4 = 16th notes)
    
    // Notes to arpeggiate (scale degrees)
    this.notes = [0, 2, 4, 7]; // Default: major arpeggio
    this.activeNotes = [];
    
    // Pattern generators
    this.patterns = {
      up: () => this._generateUpPattern(),
      down: () => this._generateDownPattern(),
      updown: () => this._generateUpDownPattern(),
      downup: () => this._generateDownUpPattern(),
      random: () => this._generateRandomPattern(),
      chord: () => this._generateChordPattern(),
    };
  }

  /**
   * Set notes to arpeggiate (scale degrees)
   */
  setNotes(notes) {
    this.notes = notes;
    this._regeneratePattern();
  }

  /**
   * Set arpeggio pattern type
   */
  setPattern(pattern) {
    if (this.patterns[pattern]) {
      this.pattern = pattern;
      this._regeneratePattern();
    }
  }

  /**
   * Set tempo in BPM
   */
  setTempo(bpm) {
    this.tempo = Math.max(30, Math.min(300, bpm));
    
    // Restart if playing
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  /**
   * Set octave range
   */
  setOctaveRange(range) {
    this.octaveRange = Math.max(1, Math.min(4, range));
    this._regeneratePattern();
  }

  /**
   * Set note subdivision (1 = quarter, 2 = eighth, 4 = 16th)
   */
  setSubdivision(value) {
    this.subdivision = value;
    
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  /**
   * Start arpeggiator
   */
  start() {
    if (this.isPlaying) return;
    
    this._regeneratePattern();
    this.currentStep = 0;
    this.isPlaying = true;
    
    // Calculate interval in milliseconds
    const beatMs = (60 / this.tempo) * 1000;
    const stepMs = beatMs / this.subdivision;
    
    this.intervalId = setInterval(() => this._tick(), stepMs);
  }

  /**
   * Stop arpeggiator
   */
  stop() {
    this.isPlaying = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.currentStep = 0;
  }

  /**
   * Toggle arpeggiator
   */
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  /**
   * Internal tick - triggered every step
   */
  _tick() {
    if (!this.isPlaying || this.activeNotes.length === 0) return;
    
    // Get current note(s)
    const stepNotes = this.activeNotes[this.currentStep % this.activeNotes.length];
    
    // Play note(s)
    if (Array.isArray(stepNotes)) {
      // Chord - play multiple notes
      stepNotes.forEach(note => {
        this.synth.playNote(note, {
          duration: this._getNoteDuration()
        });
      });
    } else {
      // Single note
      this.synth.playNote(stepNotes, {
        duration: this._getNoteDuration()
      });
    }
    
    // Advance step
    this.currentStep++;
  }

  /**
   * Get note duration based on settings
   */
  _getNoteDuration() {
    const beatSec = 60 / this.tempo;
    const stepSec = beatSec / this.subdivision;
    return stepSec * this.noteLength;
  }

  /**
   * Regenerate active pattern
   */
  _regeneratePattern() {
    const generator = this.patterns[this.pattern];
    if (generator) {
      this.activeNotes = generator();
    }
  }

  // ============ PATTERN GENERATORS ============

  _generateUpPattern() {
    const notes = [];
    for (let oct = 0; oct < this.octaveRange; oct++) {
      for (const note of this.notes) {
        notes.push(note + (oct * 12));
      }
    }
    return notes;
  }

  _generateDownPattern() {
    return this._generateUpPattern().reverse();
  }

  _generateUpDownPattern() {
    const up = this._generateUpPattern();
    const down = [...up].reverse().slice(1, -1); // Remove duplicates
    return [...up, ...down];
  }

  _generateDownUpPattern() {
    const down = this._generateDownPattern();
    const up = [...down].reverse().slice(1, -1);
    return [...down, ...up];
  }

  _generateRandomPattern() {
    const base = this._generateUpPattern();
    // Shuffle array
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    return base;
  }

  _generateChordPattern() {
    // Return arrays of notes (chords)
    const chords = [];
    for (let oct = 0; oct < this.octaveRange; oct++) {
      const chord = this.notes.map(n => n + (oct * 12));
      chords.push(chord);
    }
    return chords;
  }

  /**
   * Get preset arpeggio patterns
   */
  static getPresets() {
    return {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      major7: [0, 4, 7, 11],
      minor7: [0, 3, 7, 10],
      dom7: [0, 4, 7, 10],
      sus4: [0, 5, 7],
      sus2: [0, 2, 7],
      dim: [0, 3, 6],
      aug: [0, 4, 8],
      power: [0, 7],
    };
  }

  /**
   * Create arpeggiator UI
   */
  createUI(container) {
    const wrapper = document.createElement('div');
    wrapper.id = 'arp-controls';
    wrapper.innerHTML = `
      <h3>🎼 Arpeggiator</h3>
      
      <button id="arp-toggle" class="arp-toggle-btn">
        <span class="play-icon">▶</span> Start
      </button>
      
      <label>Pattern</label>
      <select id="arp-pattern">
        <option value="up">Up ↑</option>
        <option value="down">Down ↓</option>
        <option value="updown">Up/Down ↕</option>
        <option value="downup">Down/Up ↕</option>
        <option value="random">Random 🎲</option>
        <option value="chord">Chord 🎹</option>
      </select>
      
      <label>Tempo: <span id="arp-tempo-value">120</span> BPM</label>
      <input type="range" id="arp-tempo" min="30" max="240" value="120">
      
      <label>Octaves</label>
      <select id="arp-octaves">
        <option value="1">1 Octave</option>
        <option value="2" selected>2 Octaves</option>
        <option value="3">3 Octaves</option>
      </select>
      
      <label>Preset</label>
      <select id="arp-preset">
        <option value="major">Major</option>
        <option value="minor">Minor</option>
        <option value="major7">Major 7th</option>
        <option value="minor7">Minor 7th</option>
        <option value="dom7">Dominant 7th</option>
        <option value="sus4">Sus4</option>
        <option value="dim">Diminished</option>
        <option value="power">Power</option>
      </select>
    `;
    
    container.appendChild(wrapper);
    this._bindUIEvents();
    
    return wrapper;
  }

  _bindUIEvents() {
    // Toggle button
    document.getElementById('arp-toggle')?.addEventListener('click', (e) => {
      const isPlaying = this.toggle();
      e.target.innerHTML = isPlaying 
        ? '<span class="stop-icon">⏹</span> Stop' 
        : '<span class="play-icon">▶</span> Start';
      e.target.classList.toggle('active', isPlaying);
    });

    // Pattern
    document.getElementById('arp-pattern')?.addEventListener('change', (e) => {
      this.setPattern(e.target.value);
    });

    // Tempo
    document.getElementById('arp-tempo')?.addEventListener('input', (e) => {
      this.setTempo(parseInt(e.target.value));
      document.getElementById('arp-tempo-value').textContent = e.target.value;
    });

    // Octaves
    document.getElementById('arp-octaves')?.addEventListener('change', (e) => {
      this.setOctaveRange(parseInt(e.target.value));
    });

    // Preset
    document.getElementById('arp-preset')?.addEventListener('change', (e) => {
      const presets = Arpeggiator.getPresets();
      this.setNotes(presets[e.target.value] || presets.major);
    });
  }
}

export default Arpeggiator;
