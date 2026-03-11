/**
 * SYNTH::HELIX - Audio Effects
 * =============================
 * Advanced audio effects: Chorus, Distortion, Filter, LFO
 */

export class AudioEffects {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.effects = {};
    
    this._createChorus();
    this._createDistortion();
    this._createFilter();
    this._createTremolo();
  }

  /**
   * Chorus Effect - Creates width and movement
   * Uses multiple delayed copies with LFO modulation
   */
  _createChorus() {
    const input = this.ctx.createGain();
    const output = this.ctx.createGain();
    const dry = this.ctx.createGain();
    const wet = this.ctx.createGain();
    
    dry.gain.value = 0.7;
    wet.gain.value = 0.3;
    
    // Create 3 voices with different delays
    const voices = [];
    const delays = [0.025, 0.03, 0.035];
    const depths = [0.002, 0.003, 0.0025];
    
    delays.forEach((delayTime, i) => {
      const delay = this.ctx.createDelay();
      delay.delayTime.value = delayTime;
      
      // LFO for modulation
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.5 + (i * 0.3); // Slightly different rates
      lfoGain.gain.value = depths[i];
      
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      lfo.start();
      
      input.connect(delay);
      delay.connect(wet);
      
      voices.push({ delay, lfo, lfoGain });
    });
    
    input.connect(dry);
    dry.connect(output);
    wet.connect(output);
    
    this.effects.chorus = {
      input,
      output,
      voices,
      setMix: (value) => {
        dry.gain.value = 1 - value;
        wet.gain.value = value;
      },
      setRate: (value) => {
        voices.forEach((v, i) => {
          v.lfo.frequency.value = value + (i * 0.3);
        });
      },
      setDepth: (value) => {
        voices.forEach((v, i) => {
          v.lfoGain.gain.value = value * (0.002 + i * 0.001);
        });
      }
    };
  }

  /**
   * Distortion Effect - Adds grit and harmonics
   */
  _createDistortion() {
    const input = this.ctx.createGain();
    const output = this.ctx.createGain();
    const waveshaper = this.ctx.createWaveShaper();
    const dry = this.ctx.createGain();
    const wet = this.ctx.createGain();
    const preGain = this.ctx.createGain();
    const postGain = this.ctx.createGain();
    
    dry.gain.value = 0.8;
    wet.gain.value = 0.2;
    preGain.gain.value = 1;
    postGain.gain.value = 0.5;
    
    // Create distortion curve
    const makeDistortionCurve = (amount) => {
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;
      
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    };
    
    waveshaper.curve = makeDistortionCurve(50);
    waveshaper.oversample = '4x';
    
    input.connect(dry);
    input.connect(preGain);
    preGain.connect(waveshaper);
    waveshaper.connect(postGain);
    postGain.connect(wet);
    dry.connect(output);
    wet.connect(output);
    
    this.effects.distortion = {
      input,
      output,
      setAmount: (value) => {
        waveshaper.curve = makeDistortionCurve(value * 100);
        preGain.gain.value = 1 + value * 2;
        postGain.gain.value = 0.5 / (1 + value);
      },
      setMix: (value) => {
        dry.gain.value = 1 - value;
        wet.gain.value = value;
      }
    };
  }

  /**
   * Filter Effect - Low-pass, High-pass, Band-pass
   */
  _createFilter() {
    const input = this.ctx.createGain();
    const output = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;
    
    // LFO for filter sweep
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 0; // Off by default
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    
    input.connect(filter);
    filter.connect(output);
    
    this.effects.filter = {
      input,
      output,
      filter,
      setType: (type) => {
        filter.type = type; // lowpass, highpass, bandpass, notch
      },
      setFrequency: (value) => {
        // Map 0-1 to 20Hz-20kHz logarithmically
        const minFreq = 20;
        const maxFreq = 20000;
        const freq = minFreq * Math.pow(maxFreq / minFreq, value);
        filter.frequency.value = freq;
      },
      setResonance: (value) => {
        filter.Q.value = value * 20;
      },
      setLfoRate: (value) => {
        lfo.frequency.value = value * 10;
      },
      setLfoDepth: (value) => {
        lfoGain.gain.value = value * 1000;
      }
    };
  }

  /**
   * Tremolo Effect - Volume modulation
   */
  _createTremolo() {
    const input = this.ctx.createGain();
    const output = this.ctx.createGain();
    const tremolo = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const dcOffset = this.ctx.createConstantSource();
    
    lfo.frequency.value = 4;
    lfoGain.gain.value = 0.5;
    dcOffset.offset.value = 0.5;
    
    tremolo.gain.value = 1;
    
    // LFO modulates the gain
    lfo.connect(lfoGain);
    lfoGain.connect(tremolo.gain);
    dcOffset.connect(tremolo.gain);
    
    lfo.start();
    dcOffset.start();
    
    input.connect(tremolo);
    tremolo.connect(output);
    
    this.effects.tremolo = {
      input,
      output,
      setRate: (value) => {
        lfo.frequency.value = value * 20; // 0-20 Hz
      },
      setDepth: (value) => {
        lfoGain.gain.value = value * 0.5;
        dcOffset.offset.value = 1 - (value * 0.5);
      }
    };
  }

  /**
   * Get an effect by name
   */
  get(name) {
    return this.effects[name];
  }

  /**
   * Connect effects in chain
   * @param {string[]} chain - Array of effect names in order
   */
  createChain(chain) {
    const first = this.effects[chain[0]];
    const last = this.effects[chain[chain.length - 1]];
    
    for (let i = 0; i < chain.length - 1; i++) {
      const current = this.effects[chain[i]];
      const next = this.effects[chain[i + 1]];
      current.output.connect(next.input);
    }
    
    return { input: first.input, output: last.output };
  }
}

export default AudioEffects;
