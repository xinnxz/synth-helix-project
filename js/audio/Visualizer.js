/**
 * SYNTH::HELIX - Audio Visualizer
 * =================================
 * Real-time audio visualization (waveform & frequency)
 */

export class AudioVisualizer {
  constructor(audioContext, sourceNode) {
    this.ctx = audioContext;
    this.sourceNode = sourceNode;
    
    // Create analyzer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    // Data arrays
    this.bufferLength = this.analyser.frequencyBinCount;
    this.waveformData = new Uint8Array(this.bufferLength);
    this.frequencyData = new Uint8Array(this.bufferLength);
    
    // Connect source to analyser
    if (sourceNode) {
      sourceNode.connect(this.analyser);
    }
    
    // Canvas elements (will be set up later)
    this.waveformCanvas = null;
    this.frequencyCanvas = null;
    this.isActive = false;
  }

  /**
   * Connect a new source node
   */
  connectSource(sourceNode) {
    this.sourceNode = sourceNode;
    sourceNode.connect(this.analyser);
  }

  /**
   * Set up waveform visualization canvas
   */
  setupWaveformCanvas(canvas) {
    this.waveformCanvas = canvas;
    this.waveformCtx = canvas.getContext('2d');
  }

  /**
   * Set up frequency visualization canvas
   */
  setupFrequencyCanvas(canvas) {
    this.frequencyCanvas = canvas;
    this.frequencyCtx = canvas.getContext('2d');
  }

  /**
   * Start visualization
   */
  start() {
    this.isActive = true;
    this._draw();
  }

  /**
   * Stop visualization
   */
  stop() {
    this.isActive = false;
  }

  /**
   * Main draw loop
   */
  _draw() {
    if (!this.isActive) return;
    
    requestAnimationFrame(() => this._draw());
    
    // Get data
    this.analyser.getByteTimeDomainData(this.waveformData);
    this.analyser.getByteFrequencyData(this.frequencyData);
    
    // Draw waveform
    if (this.waveformCanvas && this.waveformCtx) {
      this._drawWaveform();
    }
    
    // Draw frequency
    if (this.frequencyCanvas && this.frequencyCtx) {
      this._drawFrequency();
    }
  }

  /**
   * Draw waveform (oscilloscope style)
   */
  _drawWaveform() {
    const canvas = this.waveformCanvas;
    const ctx = this.waveformCtx;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = 'rgba(10, 10, 21, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    
    const sliceWidth = width / this.bufferLength;
    let x = 0;
    
    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.waveformData[i] / 128.0;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /**
   * Draw frequency bars
   */
  _drawFrequency() {
    const canvas = this.frequencyCanvas;
    const ctx = this.frequencyCtx;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = 'rgba(10, 10, 21, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw bars
    const barCount = 64;
    const barWidth = width / barCount;
    const step = Math.floor(this.bufferLength / barCount);
    
    for (let i = 0; i < barCount; i++) {
      const value = this.frequencyData[i * step];
      const barHeight = (value / 255) * height;
      
      // Gradient color based on frequency
      const hue = (i / barCount) * 180; // Cyan to magenta
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      
      // Glow effect
      ctx.shadowBlur = 5;
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      
      ctx.fillRect(
        i * barWidth,
        height - barHeight,
        barWidth - 1,
        barHeight
      );
    }
    
    ctx.shadowBlur = 0;
  }

  /**
   * Get current audio level (0-1)
   */
  getLevel() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      sum += this.frequencyData[i];
    }
    return sum / (this.bufferLength * 255);
  }

  /**
   * Get bass level (low frequencies)
   */
  getBassLevel() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    const bassRange = Math.floor(this.bufferLength * 0.1); // Bottom 10%
    let sum = 0;
    for (let i = 0; i < bassRange; i++) {
      sum += this.frequencyData[i];
    }
    return sum / (bassRange * 255);
  }

  /**
   * Get treble level (high frequencies)
   */
  getTrebleLevel() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    const startIndex = Math.floor(this.bufferLength * 0.7);
    let sum = 0;
    for (let i = startIndex; i < this.bufferLength; i++) {
      sum += this.frequencyData[i];
    }
    return sum / ((this.bufferLength - startIndex) * 255);
  }

  /**
   * Create visualization UI
   */
  createVisualizerUI(container) {
    const wrapper = document.createElement('div');
    wrapper.id = 'visualizer-wrapper';
    wrapper.innerHTML = `
      <div class="visualizer-section">
        <div class="visualizer-label">WAVEFORM</div>
        <canvas id="waveform-canvas" width="300" height="80"></canvas>
      </div>
      <div class="visualizer-section">
        <div class="visualizer-label">SPECTRUM</div>
        <canvas id="frequency-canvas" width="300" height="80"></canvas>
      </div>
    `;
    container.appendChild(wrapper);
    
    // Set up canvases
    this.setupWaveformCanvas(document.getElementById('waveform-canvas'));
    this.setupFrequencyCanvas(document.getElementById('frequency-canvas'));
    
    return wrapper;
  }
}

export default AudioVisualizer;
