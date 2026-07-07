'use client';

import { SynthSFX } from './synthSfx';

export type AmbientPreset = 'space' | 'retro' | 'cyber' | 'zen';

export class AmbientMusicPlayer {
  private static ctx: AudioContext | null = null;
  private static isPlaying = false;
  private static nextNoteTimeout: any = null;
  private static oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private static masterGain: GainNode | null = null;

  // Configuration States
  private static preset: AmbientPreset = 'space';
  private static playMusic = true;
  private static binaural = false;
  private static musicVolume = 50; // default 50%
  private static binauralNodes: { 
    oscL: OscillatorNode; 
    oscR: OscillatorNode; 
    panL: StereoPannerNode; 
    panR: StereoPannerNode; 
    gain: GainNode 
  } | null = null;

  static isPlayingActive() {
    return this.isPlaying;
  }

  static getPreset(): AmbientPreset {
    return this.preset;
  }

  static getPlayMusic(): boolean {
    return this.playMusic;
  }

  static getBinaural(): boolean {
    return this.binaural;
  }

  static getMusicVolume(): number {
    return this.musicVolume;
  }

  static setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(100, val));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessibility-music-volume', String(val));
      } catch (e) {}
    }
    this.updateVolume();
  }

  static setPlayMusic(val: boolean) {
    this.playMusic = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-ambient-music', String(val));
    }
    if (val) {
      this.start();
    } else {
      this.stop();
    }
  }

  static setBinaural(val: boolean) {
    this.binaural = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-ambient-binaural', String(val));
    }
    if (val) {
      this.startBinaural();
    } else {
      this.stopBinaural();
    }
  }

  static setPreset(preset: AmbientPreset) {
    this.preset = preset;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-ambient-preset', preset);
    }
    if (this.isPlaying) {
      this.restartLoop();
    }
  }

  static start() {
    if (typeof window === 'undefined') return;

    // Load initial states from local storage
    const savedMusic = localStorage.getItem('accessibility-ambient-music');
    if (savedMusic !== null) {
      this.playMusic = savedMusic === 'true';
    }
    const savedPreset = localStorage.getItem('accessibility-ambient-preset') as AmbientPreset;
    if (savedPreset) {
      this.preset = savedPreset;
    }
    const savedBinaural = localStorage.getItem('accessibility-ambient-binaural');
    if (savedBinaural !== null) {
      this.binaural = savedBinaural === 'true';
    }
    const savedMusicVol = localStorage.getItem('accessibility-music-volume');
    if (savedMusicVol !== null) {
      this.musicVolume = Number(savedMusicVol);
    }

    if (!this.playMusic) return;
    if (this.isPlaying) return;

    try {
      this.isPlaying = true;
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Ensure context is running (crucial browser autoplay policy safeguard)
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.updateVolume();
      this.masterGain.connect(this.ctx.destination);

      // Start the structured loop
      this.playLoop();

      // Trigger binaural beats if active
      if (this.binaural) {
        this.startBinaural();
      }
    } catch (e) {
      console.warn('Failed to start ambient music player:', e);
      this.isPlaying = false;
    }
  }

  static stop() {
    this.isPlaying = false;
    if (this.nextNoteTimeout) {
      clearTimeout(this.nextNoteTimeout);
      this.nextNoteTimeout = null;
    }
    this.stopBinaural();
    this.oscillators.forEach(item => {
      try {
        item.osc.stop();
      } catch (e) {}
    });
    this.oscillators = [];
    if (this.ctx) {
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    }
  }

  private static restartLoop() {
    if (this.nextNoteTimeout) {
      clearTimeout(this.nextNoteTimeout);
      this.nextNoteTimeout = null;
    }
    this.oscillators.forEach(item => {
      try {
        item.osc.stop();
      } catch (e) {}
    });
    this.oscillators = [];
    this.playLoop();
  }

  static updateVolume() {
    if (!this.masterGain || !this.ctx) return;
    const gainVal = (this.musicVolume / 100) * 1.3;
    
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(gainVal, this.ctx.currentTime + 0.15);
  }

  private static startBinaural() {
    if (!this.isPlaying || !this.ctx || !this.masterGain || this.binauralNodes) return;
    try {
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      const panL = this.ctx.createStereoPanner();
      const panR = this.ctx.createStereoPanner();
      const gain = this.ctx.createGain();

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(100, this.ctx.currentTime); // 100Hz Left

      oscR.type = 'sine';
      // 10Hz difference = Alpha wave focus (Relaxed focus, creativity)
      oscR.frequency.setValueAtTime(110, this.ctx.currentTime); // 110Hz Right

      panL.pan.setValueAtTime(-1, this.ctx.currentTime);
      panR.pan.setValueAtTime(1, this.ctx.currentTime);

      // Low volume for subtle background hum
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      oscL.connect(panL);
      panL.connect(gain);

      oscR.connect(panR);
      panR.connect(gain);

      gain.connect(this.masterGain);

      oscL.start();
      oscR.start();

      this.binauralNodes = { oscL, oscR, panL, panR, gain };
    } catch (e) {
      console.warn('Failed to start binaural beats:', e);
    }
  }

  private static stopBinaural() {
    if (this.binauralNodes) {
      try {
        this.binauralNodes.oscL.stop();
        this.binauralNodes.oscR.stop();
      } catch (e) {}
      this.binauralNodes = null;
    }
  }

  private static playLoop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    let tempo = 100;
    let beatDuration = 60 / tempo;
    let barDuration = beatDuration * 4;
    let loopDuration = 10000;
    let chords: number[][] = [];
    let melody: { freq: number; time: number; dur: number }[] = [];
    let chordWave: OscillatorType = 'sine';
    let melodyWave: OscillatorType = 'triangle';
    let chordVol = 0.06;
    let melodyVol = 0.15;
    let lowpassFreq = 1000;

    switch (this.preset) {
      case 'retro':
        tempo = 140;
        beatDuration = 60 / tempo;
        barDuration = beatDuration * 4;
        loopDuration = Math.round(barDuration * 4 * 1000);
        chordWave = 'triangle';
        melodyWave = 'square';
        chordVol = 0.04;
        melodyVol = 0.12;
        chords = [
          [220.00, 261.63, 329.63], // Bar 1: Am (A3, C4, E4)
          [174.61, 220.00, 261.63], // Bar 2: F (F3, A3, C4)
          [261.63, 329.63, 392.00], // Bar 3: C (C4, E4, G4)
          [196.00, 246.94, 293.66], // Bar 4: G (G3, B3, D4)
        ];
        melody = [
          { freq: 440.00, time: 0.0, dur: 0.2 }, // A4
          { freq: 523.25, time: 0.2, dur: 0.2 }, // C5
          { freq: 659.25, time: 0.4, dur: 0.2 }, // E5
          { freq: 880.00, time: 0.6, dur: 0.4 }, // A5
          
          { freq: 698.46, time: barDuration + 0.0, dur: 0.2 }, // F5
          { freq: 880.00, time: barDuration + 0.2, dur: 0.2 }, // A5
          { freq: 1046.50, time: barDuration + 0.4, dur: 0.2 }, // C6
          { freq: 1396.91, time: barDuration + 0.6, dur: 0.4 }, // F6
          
          { freq: 523.25, time: barDuration * 2 + 0.0, dur: 0.2 }, // C5
          { freq: 659.25, time: barDuration * 2 + 0.2, dur: 0.2 }, // E5
          { freq: 783.99, time: barDuration * 2 + 0.4, dur: 0.2 }, // G5
          { freq: 1046.50, time: barDuration * 2 + 0.6, dur: 0.4 }, // C6
          
          { freq: 783.99, time: barDuration * 3 + 0.0, dur: 0.2 }, // G5
          { freq: 987.77, time: barDuration * 3 + 0.2, dur: 0.2 }, // B5
          { freq: 1174.66, time: barDuration * 3 + 0.4, dur: 0.2 }, // D6
          { freq: 783.99, time: barDuration * 3 + 0.6, dur: 0.4 }, // G5
        ];
        break;

      case 'cyber':
        tempo = 120;
        beatDuration = 60 / tempo;
        barDuration = beatDuration * 4;
        loopDuration = Math.round(barDuration * 4 * 1000);
        chordWave = 'sawtooth';
        melodyWave = 'triangle';
        chordVol = 0.03; // quiet sawtooth
        melodyVol = 0.16;
        lowpassFreq = 350; // lowpass filter cutoff for chords
        chords = [
          [82.41, 123.47, 164.81], // Bar 1: Em
          [65.41, 130.81, 196.00], // Bar 2: C
          [73.42, 146.83, 220.00], // Bar 3: D
          [55.00, 110.00, 164.81], // Bar 4: Am
        ];
        melody = [
          { freq: 329.63, time: 0.0, dur: 0.15 }, // E4
          { freq: 329.63, time: 0.25, dur: 0.15 },
          { freq: 493.88, time: 0.5, dur: 0.15 }, // B4
          { freq: 440.00, time: 0.75, dur: 0.15 }, // A4
          { freq: 392.00, time: 1.0, dur: 0.3 },  // G4
          
          { freq: 261.63, time: barDuration + 0.0, dur: 0.15 }, // C4
          { freq: 392.00, time: barDuration + 0.25, dur: 0.15 }, // G4
          { freq: 523.25, time: barDuration + 0.5, dur: 0.15 }, // C5
          { freq: 493.88, time: barDuration + 0.75, dur: 0.15 }, // B4
          { freq: 392.00, time: barDuration + 1.0, dur: 0.3 },  // G4
          
          { freq: 293.66, time: barDuration * 2 + 0.0, dur: 0.15 }, // D4
          { freq: 440.00, time: barDuration * 2 + 0.25, dur: 0.15 }, // A4
          { freq: 587.33, time: barDuration * 2 + 0.5, dur: 0.15 }, // D5
          { freq: 523.25, time: barDuration * 2 + 0.75, dur: 0.15 }, // C5
          { freq: 440.00, time: barDuration * 2 + 1.0, dur: 0.3 },  // A4
          
          { freq: 220.00, time: barDuration * 3 + 0.0, dur: 0.15 }, // A3
          { freq: 329.63, time: barDuration * 3 + 0.25, dur: 0.15 }, // E4
          { freq: 440.00, time: barDuration * 3 + 0.5, dur: 0.15 }, // A4
          { freq: 392.00, time: barDuration * 3 + 0.75, dur: 0.15 }, // G4
          { freq: 329.63, time: barDuration * 3 + 1.0, dur: 0.3 },  // E4
        ];
        break;

      case 'zen':
        tempo = 60;
        beatDuration = 60 / tempo;
        barDuration = beatDuration * 4;
        loopDuration = Math.round(barDuration * 2 * 1000);
        chordWave = 'sine';
        melodyWave = 'sine';
        chordVol = 0.05;
        melodyVol = 0.22;
        chords = [
          [130.81, 196.00, 246.94, 329.63], // Bar 1: Cmaj9
          [174.61, 261.63, 329.63, 392.00], // Bar 2: Fmaj9
        ];
        melody = [
          { freq: 1046.50, time: 0.5, dur: 2.0 }, // C6 bell
          { freq: 1318.51, time: 2.0, dur: 2.0 }, // E6 bell
          { freq: 1174.66, time: barDuration + 0.5, dur: 2.0 }, // D6 bell
          { freq: 987.77, time: barDuration + 2.0, dur: 2.0 },  // B5 bell
        ];
        break;

      case 'space':
      default:
        tempo = 100;
        beatDuration = 60 / tempo;
        barDuration = beatDuration * 4;
        loopDuration = Math.round(barDuration * 4 * 1000);
        chordWave = 'sine';
        melodyWave = 'triangle';
        chordVol = 0.06;
        melodyVol = 0.15;
        chords = [
          [130.81, 164.81, 196.00, 246.94], // Bar 1: Cmaj7
          [174.61, 220.00, 261.63, 329.63], // Bar 2: Fmaj7
          [110.00, 130.81, 164.81, 196.00], // Bar 3: Am7
          [146.83, 174.61, 220.00, 293.66], // Bar 4: Dm7
        ];
        melody = [
          { freq: 392.00, time: 0.0, dur: 0.8 }, // G4
          { freq: 493.88, time: 0.8, dur: 0.8 }, // B4
          { freq: 587.33, time: 1.6, dur: 1.2 }, // D5
          
          { freq: 523.25, time: barDuration + 0.0, dur: 0.8 }, // C5
          { freq: 659.25, time: barDuration + 0.8, dur: 0.8 }, // E5
          { freq: 783.99, time: barDuration + 1.6, dur: 1.2 }, // G5
          
          { freq: 880.00, time: barDuration * 2 + 0.0, dur: 0.6 }, // A5
          { freq: 783.99, time: barDuration * 2 + 0.6, dur: 0.6 }, // G5
          { freq: 659.25, time: barDuration * 2 + 1.2, dur: 1.2 }, // E5
          
          { freq: 587.33, time: barDuration * 3 + 0.0, dur: 0.6 }, // D5
          { freq: 493.88, time: barDuration * 3 + 0.6, dur: 0.6 }, // B4
          { freq: 392.00, time: barDuration * 3 + 1.2, dur: 1.2 }, // G4
        ];
        break;
    }

    const now = this.ctx.currentTime;

    // 1. Play chords
    chords.forEach((chord, bar) => {
      const barStartTime = now + (bar * barDuration);
      chord.forEach(freq => {
        if (!this.ctx || !this.masterGain) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = chordWave;
          osc.frequency.setValueAtTime(freq, barStartTime);

          gain.gain.setValueAtTime(0, barStartTime);
          gain.gain.linearRampToValueAtTime(chordVol, barStartTime + 0.4); // soft attack
          gain.gain.setValueAtTime(chordVol, barStartTime + barDuration - 0.4);
          gain.gain.exponentialRampToValueAtTime(0.0001, barStartTime + barDuration); // decay

          if (this.preset === 'cyber') {
            // Apply lowpass filter to cyber sawtooth chords to keep it warm/deep
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(lowpassFreq, barStartTime);
            osc.connect(filter);
            filter.connect(gain);
          } else {
            osc.connect(gain);
          }

          gain.connect(this.masterGain);
          osc.start(barStartTime);
          osc.stop(barStartTime + barDuration);

          this.oscillators.push({ osc, gain });
        } catch (e) {}
      });
    });

    // 2. Play melody notes
    melody.forEach(note => {
      if (!this.ctx || !this.masterGain) return;
      try {
        const noteTime = now + note.time;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = melodyWave;
        osc.frequency.setValueAtTime(note.freq, noteTime);

        // Soft cybernetic bandpass filter for plucks
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(note.freq * (this.preset === 'retro' ? 1.5 : 1.25), noteTime);
        filter.Q.setValueAtTime(this.preset === 'zen' ? 1.0 : 1.8, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(melodyVol, noteTime + 0.02); // quick onset
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.dur); // decay

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + note.dur + 0.05);

        this.oscillators.push({ osc, gain });
      } catch (e) {}
    });

    // Loop
    this.nextNoteTimeout = setTimeout(() => {
      this.oscillators = [];
      this.playLoop();
    }, loopDuration);
  }
}
