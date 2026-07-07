'use client';

export class SynthSFX {
  private static volume = 0.5; // default 50%
  private static introCtx: AudioContext | null = null;
  private static introSource: AudioBufferSourceNode | null = null;
  private static clickSoundType: 'sine' | 'retro' | 'laser' | 'soft' | 'mechanical' = 'sine';
  private static welcomeBuffer: AudioBuffer | null = null;
  private static isWelcomeLoading = false;
  private static lastClickTime = 0;

  // Read initial volume from localStorage if available
  static init() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('accessibility-volume');
        if (saved !== null) {
          this.volume = Number(saved) / 100;
        }
        const savedSound = localStorage.getItem('accessibility-click-sound-type') as any;
        if (savedSound) {
          this.clickSoundType = savedSound;
        }
        this.preloadWelcomeSound();
      } catch (e) {
        console.warn('Failed to read volume/sound from localStorage:', e);
      }
    }
  }

  static async preloadWelcomeSound() {
    if (typeof window === 'undefined' || this.welcomeBuffer || this.isWelcomeLoading) return;
    try {
      this.isWelcomeLoading = true;
      let res = await fetch('/sounds/welcome.mp3');
      if (!res.ok) {
        // Fallback to welcome.m4a if mp3 is missing
        res = await fetch('/sounds/welcome.m4a');
      }
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      
      const arrayBuffer = await res.arrayBuffer();
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.welcomeBuffer = await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      // Catch silently - file might not be downloaded by the user yet
    } finally {
      this.isWelcomeLoading = false;
    }
  }

  static setVolume(val: number) {
    this.volume = Math.max(0, Math.min(100, val)) / 100;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessibility-volume', String(val));
        // Notify other modules (like background music) that volume has changed
        window.dispatchEvent(new CustomEvent('accessibility-volume-changed'));
      } catch (e) {}
    }
  }

  static getVolume(): number {
    return Math.round(this.volume * 100);
  }

  static setClickSoundType(type: 'sine' | 'retro' | 'laser' | 'soft' | 'mechanical') {
    this.clickSoundType = type;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessibility-click-sound-type', type);
      } catch (e) {}
    }
  }

  static getClickSoundType(): 'sine' | 'retro' | 'laser' | 'soft' | 'mechanical' {
    return this.clickSoundType;
  }

  // 1. UI Click sound (Used for UI adjustments like sliders and switches)
  static playClick() {
    if (this.volume === 0 || typeof window === 'undefined') return;

    const now = Date.now();
    if (now - this.lastClickTime < 60) {
      return; // Debounce clicks within 60ms to prevent double playback
    }
    this.lastClickTime = now;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let duration = 0.07;
      let startFreq = 900;
      let endFreq = 200;
      let oscType: OscillatorType = 'sine';
      let volumeMultiplier = 0.35;
      let useBubbleFilter = false;

      if (this.clickSoundType === 'retro') {
        oscType = 'square';
        startFreq = 250;
        endFreq = 1000;
        duration = 0.09;
        volumeMultiplier = 0.12;
      } else if (this.clickSoundType === 'laser') {
        oscType = 'sawtooth';
        startFreq = 2200;
        endFreq = 180;
        duration = 0.16;
        volumeMultiplier = 0.16;
      } else if (this.clickSoundType === 'soft') {
        oscType = 'sine';
        startFreq = 300;
        endFreq = 800;
        duration = 0.12;
        volumeMultiplier = 0.55;
        useBubbleFilter = true;
      } else if (this.clickSoundType === 'mechanical') {
        oscType = 'triangle';
        startFreq = 2800;
        endFreq = 1100;
        duration = 0.025;
        volumeMultiplier = 0.45;
      }

      osc.type = oscType;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

      gain.gain.setValueAtTime(this.volume * volumeMultiplier, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      if (useBubbleFilter) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.Q.setValueAtTime(3.0, ctx.currentTime);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio Click SFX failed to play:', e);
    }
  }

  // 2. Global click sound (triggered on ANY click on the entire screen)
  static playGlobalClick() {
    this.playClick();
  }

  // 3. Process start pulse sound (triggered when image/video generation begins)
  static playPulse() {
    if (this.volume === 0 || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.45);

      gain.gain.setValueAtTime(this.volume * 0.45, ctx.currentTime); // Balanced louder volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Web Audio Pulse SFX failed to play:', e);
    }
  }

  // 4. Process success arpeggio sound (triggered when generation finishes successfully)
  static playSuccess() {
    if (this.volume === 0 || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

        gain.gain.setValueAtTime(this.volume * 0.42, ctx.currentTime + start); // Balanced louder volume
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play a beautiful, futuristic major triad (C5 -> E5 -> G5 -> C6)
      playNote(523.25, 0, 0.25);
      playNote(659.25, 0.08, 0.25);
      playNote(783.99, 0.16, 0.35);
      playNote(1046.50, 0.24, 0.55);
    } catch (e) {
      console.warn('Web Audio Success SFX failed to play:', e);
    }
  }

  // 5. Majestic introductory chime rhythm (completely bass-less, non-siren welcome sequence)
  static async playIntroSweep() {
    if (this.volume === 0 || typeof window === 'undefined') return;
    this.stopIntroSweep();

    try {
      if (!this.welcomeBuffer && !this.isWelcomeLoading) {
        await this.preloadWelcomeSound();
      }

      if (this.welcomeBuffer) {
        this.introCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (this.introCtx.state === 'suspended') {
          await this.introCtx.resume();
        }

        const source = this.introCtx.createBufferSource();
        source.buffer = this.welcomeBuffer;

        const gainNode = this.introCtx.createGain();
        gainNode.gain.setValueAtTime(this.volume * 0.55, this.introCtx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.introCtx.destination);

        source.start(0);
        this.introSource = source;
      } else {
        // Fallback to legacy synthesized chime sequence
        this.playLegacyIntroSweep();
      }
    } catch (e) {
      console.warn('Web Audio welcome sound failed to play:', e);
      this.playLegacyIntroSweep();
    }
  }

  // Fallback synthesized chime sweep (bass-less celestial sequence)
  private static playLegacyIntroSweep() {
    try {
      this.introCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.introCtx.state === 'suspended') {
        this.introCtx.resume();
      }
      const now = this.introCtx.currentTime;
      const ctxRef = this.introCtx;

      // ── LAYER 1: Warm Celestial Chord Pad (Flute/String Synth) ──
      const padNotes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      padNotes.forEach(freq => {
        if (!ctxRef) return;
        const osc = ctxRef.createOscillator();
        const gain = ctxRef.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.09, now + 1.0); // swell
        gain.gain.setValueAtTime(this.volume * 0.09, now + 3.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // fade out before second 6

        osc.connect(gain);
        gain.connect(ctxRef.destination);

        osc.start(now);
        osc.stop(now + 5.05);
      });

      // ── LAYER 2: Crystal Chimes (Crystal Bells Instrument) ──
      const playChime = (freq: number, startTime: number) => {
        if (!ctxRef) return;
        const osc = ctxRef.createOscillator();
        const gain = ctxRef.createGain();
        const filter = ctxRef.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + startTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.3, now + startTime);
        filter.Q.setValueAtTime(2.5, now + startTime);

        gain.gain.setValueAtTime(0, now + startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.75, now + startTime + 0.05); // Balanced punchy chime volume
        gain.gain.exponentialRampToValueAtTime(0.0001, now + startTime + 1.5); // long decay

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctxRef.destination);

        osc.start(now + startTime);
        osc.stop(now + startTime + 1.55);
      };

      // Play the main chime arpeggio (C5 -> E5 -> G5 -> C6)
      playChime(523.25, 0.0);       // C5 starts at 0.0s
      playChime(659.25, 1.2);       // E5 starts at 1.2s
      playChime(783.99, 2.4);       // G5 starts at 2.4s
      playChime(1046.50, 3.6);      // C6 starts at 3.6s

      // ── LAYER 3: Soft High Flute Counter-Melody Accents (Echo Bell) ──
      const playFluteAccent = (freq: number, startTime: number) => {
        if (!ctxRef) return;
        const osc = ctxRef.createOscillator();
        const gain = ctxRef.createGain();
        const filter = ctxRef.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + startTime);
        
        // Fast pitch envelope for cute pluck effect
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + startTime + 0.1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 1.5, now + startTime);

        gain.gain.setValueAtTime(0, now + startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.28, now + startTime + 0.03); // softer accent volume
        gain.gain.exponentialRampToValueAtTime(0.0001, now + startTime + 0.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctxRef.destination);

        osc.start(now + startTime);
        osc.stop(now + startTime + 0.85);
      };

      // Play the counter-melody echoes
      playFluteAccent(783.99, 0.6);   // G5 accent
      playFluteAccent(1046.50, 1.8);  // C6 accent
      playFluteAccent(1318.51, 3.0);  // E6 accent
      playFluteAccent(1567.98, 4.2);  // G6 accent
    } catch (e) {
      console.warn('Web Audio Intro Chime failed to play:', e);
    }
  }

  // Closes and stops the intro chimes immediately
  static stopIntroSweep() {
    if (this.introSource) {
      try {
        this.introSource.stop();
      } catch (e) {}
      this.introSource = null;
    }
    if (this.introCtx) {
      try {
        this.introCtx.close();
      } catch (e) {}
      this.introCtx = null;
    }
  }
}

// Initialize volume immediately when module is loaded client-side
if (typeof window !== 'undefined') {
  SynthSFX.init();
}
