/**
 * SYNTH::HELIX - Hologram Loop Station
 * ====================================
 * Records and plays back beam interactions to create a "Ghost" holographic performer.
 * @module Looper
 */

import { CONFIG } from '../config.js';

export class Looper {
    constructor(app) {
        this.app = app;
        
        this.isRecording = false;
        this.isPlaying = false;
        
        // Memory banks
        this.recordStartTime = 0;
        this.loopDuration = 0;
        this.events = []; // Stores { timeOffset, beamIndex }
        
        // Playback state
        this.playbackStartTime = 0;
        this.lastPlayedEventIndex = -1;
        
        // UI Elements
        this.recordBtn = document.getElementById('record-btn');
        this.clearBtn = document.getElementById('clear-loop-btn');
    }

    /**
     * Start/Stop recording session
     */
    toggleRecording() {
        if (this.isRecording) {
            // Stop Recording -> Start Playback
            this.isRecording = false;
            this.loopDuration = this.app.time - this.recordStartTime;
            
            // If we recorded something, start playing it
            if (this.events.length > 0) {
                this.startPlayback();
                this.recordBtn.classList.remove('recording');
                this.recordBtn.innerHTML = '<span class="rec-dot" style="background:var(--color-primary)"></span> PLAYING LOOP';
                this.clearBtn.classList.remove('hidden');
            } else {
                this.clearLoop();
            }
        } else {
            // Start Recording
            this.clearLoop(); // Clear previous
            this.isRecording = true;
            this.recordStartTime = this.app.time;
            
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '<span class="rec-dot"></span> RECORDING... (CLICK AGAIN TO STOP)';
            this.clearBtn.classList.add('hidden');
        }
    }

    /**
     * Called by main app whenever a user triggers a beam.
     * Records it if we are currently recording.
     */
    recordEvent(beamIndex) {
        if (!this.isRecording) return;
        
        // Prevent memory overflow
        if (this.events.length >= CONFIG.looper.maxMemoryLength) {
            this.toggleRecording(); // auto-stop
            return;
        }

        const timeOffset = this.app.time - this.recordStartTime;
        this.events.push({
            timeOffset: timeOffset,
            beamIndex: beamIndex
        });
    }

    /**
     * Start the Hologram Playback
     */
    startPlayback() {
        this.isPlaying = true;
        this.playbackStartTime = this.app.time;
        this.lastPlayedEventIndex = -1;
    }

    /**
     * Stop and clear memory
     */
    clearLoop() {
        this.isRecording = false;
        this.isPlaying = false;
        this.events = [];
        this.loopDuration = 0;
        
        if(this.recordBtn) {
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '<span class="rec-dot"></span> RECORD LOOP';
        }
        if(this.clearBtn) this.clearBtn.classList.add('hidden');
    }

    /**
     * Called every frame in the main animation loop to check if a ghost note should play.
     */
    update(currentTime) {
        if (!this.isPlaying || this.events.length === 0 || this.loopDuration <= 0) return;

        // Calculate where we are in the loop
        const elapsedTime = currentTime - this.playbackStartTime;
        const currentLoopTime = elapsedTime % this.loopDuration;
        
        // Check if we looped back to the start
        if (currentLoopTime < (elapsedTime % this.loopDuration > 0.1 ? 0.05 : 0)) {
            // Rough heuristic: if time wrapped around, reset the index pointer
            if(elapsedTime > 0.5) { // prevent immediate trigger on first frame
                 this.lastPlayedEventIndex = -1;
            }
        }

        // Find next event
        for (let i = this.lastPlayedEventIndex + 1; i < this.events.length; i++) {
            const ev = this.events[i];
            
            // If the time has passed the event time, play it
            if (currentLoopTime >= ev.timeOffset) {
                this._playGhostNote(ev.beamIndex);
                this.lastPlayedEventIndex = i;
            } else {
                // Since array is ordered, we can break early
                break;
            }
        }
    }

    /**
     * Triggers the visuals and audio but as a "Hologram"
     * @private
     */
    _playGhostNote(beamIndex) {
        // Trigger Audio
        if (this.app.synth && this.app.beams) {
            const meshes = this.app.beams.getMeshes();
            const targetMesh = meshes.find(m => m.userData.id === beamIndex);
            
            if (targetMesh) {
                // 1. Play Audio with Spatial Position
                this.app.synth.playNote(beamIndex, {
                    position: targetMesh.position.clone()
                });

                // 2. Trigger Ghost Visuals
                // Instead of normal white flash, make it look holographic/transparent cyan
                targetMesh.material.color.setHex(0x00ffff);
                targetMesh.scale.set(2, 1.1, 2);
                targetMesh.material.opacity = CONFIG.looper.hologramAlpha;
                
                // 3. Emit Ghost Particles (smaller, faster)
                if(this.app.particles) {
                    this.app.particles.emit(
                        targetMesh.position.clone(),
                        5, // fewer particles
                        0x00ffff // cyan hologram
                    );
                }
            }
        }
    }
}
