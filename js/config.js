/**
 * SYNTH::HELIX - Core Configuration (Masterpiece Edition)
 * ========================================================
 * Central configuration for all application settings and modules.
 * @module Config
 */

export const CONFIG = {
    // ============ VISUAL & 3D ENVIRONMENT ============
    visual: {
        beamCount: 32,             // Number of interactive light beams
        beamRadius: 15,            // Radius of the circular arrangement
        beamHeight: 20,            // Height of each cylinder beam
        beamThickness: 0.2,        // Thickness of the beam
        
        // Perspective Camera
        cameraFov: 60,
        cameraDrift: true,         // Enable automatic slight floating camera
        cameraDriftSpeed: 0.2,
        
        // Post-processing & Shader Effects
        bloomStrength: 2.5,        // Enhanced neon glow
        bloomRadius: 0.6,
        bloomThreshold: 0.1,
        
        // The "Space-Time Warp" Effect (Blackhole Shader)
        warpIntensity: 0.0,        // Range 0.0 to 1.0
        warpSpeed: 1.5,
        
        // Cosmic Floor
        floorSize: 100,
        floorSegments: 60,
        floorWaveSpeed: 1.2,
        floorWaveAmplitude: 2.5,
    },

    // ============ AUDIO & SYNTHESIZER ============
    audio: {
        masterVolume: 0.4,
        baseFrequency: 220,        // A3 note root frequency
        
        // 3D Spatial Audio Settings (PannerNode)
        spatialEnabled: true,
        pannerRefDistance: 5,
        pannerMaxDistance: 30,
        
        // Main Effects Chain
        delayTime: 0.35,
        delayFeedback: 0.5,
        
        // Default Synth Settings
        defaultScale: 'pentatonic',
        defaultWaveform: 'triangle',
        defaultOctave: 4,
    },

    // ============ WEBXR (VR) SETTINGS ============
    vr: {
        enabled: true,
        controllerModel: 'oculus-quest-2',
        hapticFeedback: true,      // Vibrate controllers on beam intersection
        playerHeight: 1.6,         // Default Y position for camera in VR
    },

    // ============ HOLOGRAM LOOPER ============
    looper: {
        maxMemoryLength: 300,      // Max notes recorded
        playbackSpeed: 1.0,
        hologramAlpha: 0.3,        // Opacity of "Ghost" beams playing back
    },

    // ============ PREMIUM COLOR THEMES ============
    themes: {
        cyberpunk: {
            name: 'Cyberpunk 2077',
            primary: 0x00ffff,     // Cyan
            secondary: 0xff0055,   // Hot Pink
            background: 0x05050a,  // Deep Space
            floor: 0x002244,
            accent: 0xff00ff,
        },
        vaporwave: {
            name: 'Vaporwave Nostalgia',
            primary: 0xff71ce,
            secondary: 0x01cdfe,
            background: 0x1a1a2e,
            floor: 0x6b2d5c,
            accent: 0xb967ff,
        },
        matrix: {
            name: 'Digital Matrix',
            primary: 0x00ff41,
            secondary: 0x008f11,
            background: 0x050d05,
            floor: 0x002200,
            accent: 0x39ff14,
        },
        neonTokyo: {
            name: 'Neon Tokyo',
            primary: 0xff073a,
            secondary: 0x00d9ff,
            background: 0x0a0a1a,
            floor: 0x220a2e,
            accent: 0xffbe0b,
        }
    },

    // ============ SYSTEM & UI ============
    ui: {
        showFPS: false,
        animationSpeed: 0.02,
        autoHideHUDTimeout: 5000,
    },

    // Application Default Load Theme
    defaultTheme: 'cyberpunk',
};

export default CONFIG;
