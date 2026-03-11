<div align="center">
  <img src="assets/og-image.jpg" alt="SYNTH::HELIX Banner" width="100%" style="border-radius: 10px; margin-bottom: 20px;" />

  <h1>🎹 SYNTH::HELIX 🌟</h1>
  <p><strong>The Masterpiece of Interactive 3D Light Beam Synthesizer</strong></p>
  
  <p>
    Experience the future of digital instruments. SYNTH::HELIX is a mind-blowing, immersive WebGL audio-visual synthesizer where you create music by sweeping through neon strings in a cyberpunk cosmos.
  </p>

  <div>
    <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/Technology-Three.js_|_WebAudio_API-000000.svg?style=for-the-badge&logo=javascript" alt="Technology" />
    <img src="https://img.shields.io/badge/WebXR-Ready-ff69b4.svg?style=for-the-badge&logo=virtual-reality" alt="WebXR Ready" />
  </div>
</div>

---

## ✨ Features (The "Mind-Blowing" Edition)

SYNTH::HELIX is not just an instrument, it's a sensory experience:

- **🕶️ WebXR (Virtual Reality) Support**: Step inside the music! Play the light beams with your hands in Virtual Reality directly from your browser.
- **🎧 True 3D Spatial Audio**: Web Audio API `PannerNode` creates a true binaural experience. The sound moves smoothly from left to right, near and far, exactly where the light beam is struck.
- **🎹 Hardware Web MIDI Integration**: Plug in your physical MIDI Keyboard/Piano. The 3D light beams react in real-time as you play your hardware instrument!
- **🌀 Space-Time Warping (Blackhole Shader)**: Play intensely! High audio frequencies and massive bass bends the 3D space itself, creating a gravitational pull/blackhole effect on the visual field.
- **🎙️ Audio-Reactive Nebula Environment**: The cosmic particle background breathes and explodes reacting to your Live Microphone input.
- **👻 Hologram Loop Station**: Record your sweep sessions and watch an automated "hologram ghost" playback your melody on loop while you jam over it!

---

## 🚀 Quick Start / Installation

You can run SYNTH::HELIX directly in your browser without complex build tools, as it leverages standard modern ES Modules.

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge).
- A local web server (Browser security policies require WebAudio and ES Modules to run from `http://`, not `file://`).

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/synth-helix-project.git
   cd synth-helix-project
   ```

2. **Serve the directory:**
   You can use any local server. For example, with Python 3:
   ```bash
   python -m http.server 8000
   ```
   Or with Node.js (`npx`):
   ```bash
   npx serve .
   ```

3. **Play:**
   Open your browser and navigate to `http://localhost:8000`.

---

## 🎮 How to Play

- **Mouse / Touch**: Sweep your cursor or swipe your finger across the light strings to trigger notes.
- **Drag & Hold**: Creates a sustained, deep bass / drone note.
- **Keyboard [S]**: Opens the Cyberpunk Settings Panel to change scales, effects, and holograms.
- **VR Headset**: Click the "ENTER VR" button and use your hand controllers to strum the beams.
- **MIDI Keyboard**: Connect your keyboard via USB; it will connect automatically.

---

## 🛠️ Architecture & Technologies

This application is built with vanilla, clean-code methodologies without overly heavy frontend frameworks to maximize 60FPS performance:

- **Visuals**: `Three.js` (WebGL, Custom GLSL Shaders, Post-Processing)
- **Audio Engine**: Native `Web Audio API` (Oscillators, Delay, Distortion, Context Reverb, BiquadFilters, 3D Spatial Panner)
- **External Interfaces**: `WebXR Device API` (VR), `Web MIDI API` (Hardware Integration).
- **Styling**: Pure CSS3 with Custom Properties (Design System) and Glassmorphism effects.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Crafted with 🔥 and code by the SYNTH::HELIX Team.*
