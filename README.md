# 🌌 AI Models Laboratory
### *The Ultimate Visionary Playground for AI Image Generation*

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-blue.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-Graphics-orange.svg?logo=three.js)](https://threejs.org/)

---

Welcome to the public source preview and architecture reference for **AI Models Laboratory**, a high-performance visual playground for comparing modern AI image and video models in real time. 

> [!NOTE]
> **Repository Scope & Copyright Notice**
>
> This repository is a **read-only developer portfolio and code preview** curated to showcase backend architecture, Web Audio API synthesis pipelines, and performance guard strategies. 
> To protect proprietary UI designs, custom 3D WebGL assets, and product animations, the full production code is maintained in a private repository.

---

## 🛠️ Architecture Highlights

This preview highlights three core pillars of full-stack engineering implemented in the project:

### 1. ⚡ Intelligent Performance Guard & WebGL Fallbacks
To ensure an immersive 60 FPS loading experience on low-end devices and slow mobile connections, a multi-tier client detection script runs prior to initializing WebGL:
* **Hardware Benchmarking**: Queries `navigator.deviceMemory` (RAM) and `navigator.hardwareConcurrency` (CPU cores) to identify low-spec hardware.
* **Network Latency Check**: Queries the Network Information API for connection speed indicators (`slow-2g`, `2g`, `3g`) or data-saving mode (`conn.saveData`).
* **Visual Adaptability**: If a bottleneck is detected, the application automatically bypasses the heavy 3D Spline WebGL scene (saving 1MB of JS overhead and CPU cycles) and displays a hardware-accelerated CSS space gradient fallback.

### 🔊 2. Real-Time Web Audio API Synthesis
Custom synthesized auditory feedback engineered directly inside the client browser without media asset latency:
* **Auditory Presets**: Multi-mode sound synthesis engine (`Default` chime, retro `8-Bit` square-wave sweeps, sci-fi `Laser` sawtooth zaps, filtered `Bubble` bandpass pops, and tactile `Mechanical` keyboard switches).
* **Binaural Ambience**: Generates real-time custom chords, panning melodies, and binaural beats directly within the browser AudioContext for relaxing research sessions.
* **Audio Debouncing**: Integrated audio call-stack throttling (60ms debounce window) to prevent overlapping click sounds from event propagation.

### 🛡️ 3. Safe Secrets & Cryptographic Verification
* **Secret Audit Utilities**: Real-time validation, rate limit tracking, and usage budget metrics.
* **Key Encryption Display**: Frontend key-masking logic that displays sensitive API credentials in an encrypted style representation to prevent shoulder-surfing.

---

## 🗂️ Code Preview Directory

* **[src/app/api/](file:///C:/Users/Shteren/Downloads/imagetest1-poll-main/imagetest1-poll-main/src/app/api)**: Contains the serverless Next.js App Router API route handlers (`generate`, `download`, `history`, `support`, `user`) connecting the frontend securely to backend services.
* **[src/lib/synthSfx.ts](file:///C:/Users/Shteren/Downloads/imagetest1-poll-main/imagetest1-poll-main/src/lib/synthSfx.ts)**: Implements browser-based audio synthesis, click sound debouncing, and custom asset preloading.
* **[src/lib/ambientMusic.ts](file:///C:/Users/Shteren/Downloads/imagetest1-poll-main/imagetest1-poll-main/src/lib/ambientMusic.ts)**: Web Audio API binaural background music synthesizer.
* **[src/lib/secretAudit.ts](file:///C:/Users/Shteren/Downloads/imagetest1-poll-main/imagetest1-poll-main/src/lib/secretAudit.ts)**: Security auditing and validation logic.

---

## 📜 License
This preview code is provided for educational and review purposes. The underlying product design, assets, and branding are proprietary.

Developed with ❤️ by Shteren.
