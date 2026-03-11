/**
 * SYNTH::HELIX - MIDI Controller
 * ================================
 * Web MIDI API support for external controllers
 */

export class MIDIController {
  constructor(synth) {
    this.synth = synth;
    this.midiAccess = null;
    this.inputs = [];
    this.isEnabled = false;
    this.noteMapping = {};
    
    // Callbacks
    this.onNoteOn = null;
    this.onNoteOff = null;
    this.onControlChange = null;
    
    // Check MIDI support
    this.isSupported = 'requestMIDIAccess' in navigator;
  }

  /**
   * Initialize MIDI access
   */
  async init() {
    if (!this.isSupported) {
      console.warn('Web MIDI API not supported in this browser');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      console.log('MIDI access granted');
      
      // Set up inputs
      this._setupInputs();
      
      // Listen for new devices
      this.midiAccess.onstatechange = (e) => {
        this._setupInputs();
      };
      
      this.isEnabled = true;
      return true;
    } catch (error) {
      console.error('MIDI access denied:', error);
      return false;
    }
  }

  /**
   * Set up MIDI inputs
   */
  _setupInputs() {
    this.inputs = [];
    
    for (const input of this.midiAccess.inputs.values()) {
      console.log(`MIDI Input: ${input.name}`);
      input.onmidimessage = (e) => this._handleMIDIMessage(e);
      this.inputs.push({
        id: input.id,
        name: input.name,
        manufacturer: input.manufacturer
      });
    }
  }

  /**
   * Handle incoming MIDI messages
   */
  _handleMIDIMessage(event) {
    const [status, data1, data2] = event.data;
    const command = status >> 4;
    const channel = status & 0xf;

    switch (command) {
      case 9: // Note On
        if (data2 > 0) {
          this._handleNoteOn(data1, data2, channel);
        } else {
          this._handleNoteOff(data1, channel);
        }
        break;
        
      case 8: // Note Off
        this._handleNoteOff(data1, channel);
        break;
        
      case 11: // Control Change
        this._handleControlChange(data1, data2, channel);
        break;
        
      case 14: // Pitch Bend
        this._handlePitchBend(data1, data2, channel);
        break;
    }
  }

  /**
   * Handle Note On
   */
  _handleNoteOn(note, velocity, channel) {
    // Convert MIDI note to frequency
    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    
    // Normalize velocity (0-127 to 0-1)
    const normalizedVelocity = velocity / 127;
    
    // Store active note
    this.noteMapping[note] = frequency;
    
    // Play note on synth
    if (this.synth) {
      this.synth.playNote(note % 32, {
        velocity: normalizedVelocity
      });
    }
    
    // Callback
    if (this.onNoteOn) {
      this.onNoteOn(note, velocity, frequency, channel);
    }
  }

  /**
   * Handle Note Off
   */
  _handleNoteOff(note, channel) {
    delete this.noteMapping[note];
    
    if (this.onNoteOff) {
      this.onNoteOff(note, channel);
    }
  }

  /**
   * Handle Control Change (CC)
   */
  _handleControlChange(controller, value, channel) {
    const normalizedValue = value / 127;
    
    // Common CC mappings
    switch (controller) {
      case 1: // Modulation wheel
        if (this.synth) {
          // Could map to filter or effect
        }
        break;
        
      case 7: // Volume
        if (this.synth) {
          this.synth.setVolume(normalizedValue);
        }
        break;
        
      case 64: // Sustain pedal
        // Handle sustain
        break;
        
      case 74: // Filter cutoff
        // Could map to filter frequency
        break;
    }
    
    if (this.onControlChange) {
      this.onControlChange(controller, value, channel);
    }
  }

  /**
   * Handle Pitch Bend
   */
  _handlePitchBend(lsb, msb, channel) {
    // Convert to -1 to 1 range
    const value = ((msb << 7) + lsb - 8192) / 8192;
    
    // Could apply to synth pitch
    console.log('Pitch Bend:', value);
  }

  /**
   * Get list of connected MIDI inputs
   */
  getInputs() {
    return this.inputs;
  }

  /**
   * Get MIDI note name from number
   */
  static getNoteName(noteNumber) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = notes[noteNumber % 12];
    return `${note}${octave}`;
  }

  /**
   * Create MIDI status UI
   */
  createStatusUI(container) {
    const wrapper = document.createElement('div');
    wrapper.id = 'midi-status';
    wrapper.innerHTML = `
      <div class="midi-header">🎹 MIDI</div>
      <div class="midi-devices" id="midi-devices">
        ${this.isSupported 
          ? '<span class="midi-waiting">Click to enable MIDI...</span>' 
          : '<span class="midi-error">MIDI not supported</span>'}
      </div>
    `;
    
    wrapper.addEventListener('click', async () => {
      if (!this.isEnabled && this.isSupported) {
        const success = await this.init();
        this._updateStatusUI();
      }
    });
    
    container.appendChild(wrapper);
    return wrapper;
  }

  /**
   * Update MIDI status UI
   */
  _updateStatusUI() {
    const devicesEl = document.getElementById('midi-devices');
    if (!devicesEl) return;
    
    if (this.inputs.length === 0) {
      devicesEl.innerHTML = '<span class="midi-waiting">No devices connected</span>';
    } else {
      devicesEl.innerHTML = this.inputs
        .map(i => `<span class="midi-device">✓ ${i.name}</span>`)
        .join('');
    }
  }
}

export default MIDIController;
