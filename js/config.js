/**
 * SYNTH::HELIX - Configuration
 * ============================
 * Central configuration for all app settings
 */

export const CONFIG = {
  // ============ VISUAL SETTINGS ============
  visual: {
    beamCount: 32,           // Number of light beams
    beamRadius: 15,          // Radius of beam circle
    beamHeight: 20,          // Height of each beam
    beamThickness: 0.2,      // Thickness of beam cylinder
    
    // Camera
    cameraFov: 60,
    cameraDrift: true,       // Enable camera auto-movement
    cameraDriftSpeed: 0.2,
    
    // Post-processing
    bloomStrength: 2.0,
    bloomRadius: 0.5,
    bloomThreshold: 0.2,
    
    // Floor
    floorSize: 100,
    floorSegments: 50,
    floorWaveSpeed: 1,
    floorWaveAmplitude: 2,
  },

  // ============ AUDIO SETTINGS ============
  audio: {
    masterVolume: 0.3,
    baseFrequency: 220,      // A3 note as base
    
    // Delay/Echo effect
    delayTime: 0.3,
    delayFeedback: 0.4,
    
    // Default settings
    defaultScale: 'pentatonic',
    defaultWaveform: 'triangle',
    defaultOctave: 4,
  },

  // ============ COLOR THEMES ============
  themes: {
    cyberpunk: {
      name: 'Cyberpunk',
      primary: 0x00ffff,
      secondary: 0xff0055,
      background: 0x0a0a15,
      floor: 0x0044aa,
      accent: 0xff00ff,
    },
    vaporwave: {
      name: 'Vaporwave',
      primary: 0xff71ce,
      secondary: 0x01cdfe,
      background: 0x1a1a2e,
      floor: 0x6b2d5c,
      accent: 0xb967ff,
    },
    matrix: {
      name: 'Matrix',
      primary: 0x00ff41,
      secondary: 0x008f11,
      background: 0x0d0d0d,
      floor: 0x003300,
      accent: 0x39ff14,
    },
    synthwave: {
      name: 'Synthwave',
      primary: 0xf706cf,
      secondary: 0xfd1d53,
      background: 0x2a0845,
      floor: 0x4a1a7a,
      accent: 0xff2a6d,
    },
    aurora: {
      name: 'Aurora',
      primary: 0x00e676,
      secondary: 0x00b0ff,
      background: 0x0a1628,
      floor: 0x0d3d56,
      accent: 0x00ffab,
    },
    neonTokyo: {
      name: 'Neon Tokyo',
      primary: 0xff073a,
      secondary: 0x00d9ff,
      background: 0x0f0f23,
      floor: 0x1a0a2e,
      accent: 0xffbe0b,
    },
    oceanDeep: {
      name: 'Ocean Deep',
      primary: 0x0077b6,
      secondary: 0x00b4d8,
      background: 0x03045e,
      floor: 0x023e8a,
      accent: 0x90e0ef,
    },
    fireStorm: {
      name: 'Fire Storm',
      primary: 0xff6b35,
      secondary: 0xf7c59f,
      background: 0x1a0a0a,
      floor: 0x2d1810,
      accent: 0xffbe0b,
    },
  },

  // ============ UI SETTINGS ============
  ui: {
    showFPS: false,
    showControls: true,
    animationSpeed: 0.02,
  },

  // Default theme
  defaultTheme: 'cyberpunk',
};

export default CONFIG;
