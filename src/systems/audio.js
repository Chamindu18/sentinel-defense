/**
 * AUDIO.JS
 * Audio manager using Web Audio API for sound effects.
 * Creates synthesized sounds for shooting, explosions, UI interactions, etc.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;          // Audio context (Web Audio API)
    this.masterGain = null;   // Master volume control node
    this.soundVolume = 0.7;   // Sound effects volume (0-1)
    this.musicVolume = 0.5;   // Music volume (for future use)
    this.enabled = true;      // Whether audio is available
    this.init();
  }

  /**
   * Initialize Web Audio API
   * Creates audio context and master gain node
   */
  init() {
    try {
      // Create audio context (webkit prefix for Safari support)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      
      // Create master gain node for volume control
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.soundVolume * 0.3;  // 30% of volume for balance
    } catch (e) {
      console.warn('Web Audio API not supported in this browser');
      this.enabled = false;
    }
  }

  /**
   * Resume audio context (required after user interaction)
   * Browsers require user interaction before audio can play
   */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Set sound effects volume
   * @param {number} v - Volume (0-1)
   */
  setSoundVolume(v) {
    this.soundVolume = v;
    if (this.masterGain) {
      this.masterGain.gain.value = v * 0.3;
    }
  }

  /**
   * Play a simple tone using oscillator
   * @param {number} freq - Frequency in Hz (pitch)
   * @param {number} duration - Duration in seconds
   * @param {string} type - Waveform type (sine, square, sawtooth, triangle)
   * @param {number} vol - Volume (0-1)
   */
  playTone(freq, duration, type = 'sine', vol = 0.1) {
    if (!this.enabled || !this.ctx) return;
    
    // Create oscillator (sound source)
    const osc = this.ctx.createOscillator();
    // Create gain node for volume envelope
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Volume envelope: start at vol, fade out to silence
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Play shooting sound based on tower type
   * @param {string} type - Tower type ('archer', 'cannon', 'frost', 'sniper')
   */
  playShoot(type) {
    if (!this.enabled) return;
    
    if (type === 'archer') {
      // Arrow shoot - two quick high tones
      this.playTone(880, 0.1, 'triangle', 0.08);
      this.playTone(660, 0.1, 'triangle', 0.05);
    } else if (type === 'cannon') {
      // Cannon - noise burst plus low tone
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate white noise with decay
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      noise.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      
      // Add low tone for impact
      this.playTone(150, 0.2, 'sawtooth', 0.1);
    } else if (type === 'frost') {
      // Frost - icy high tones
      this.playTone(1200, 0.15, 'sine', 0.06);
      this.playTone(1800, 0.15, 'sine', 0.04);
    } else if (type === 'sniper') {
      // Sniper - sharp crack sound
      this.playTone(440, 0.05, 'square', 0.08);
      this.playTone(880, 0.1, 'sawtooth', 0.06);
    }
  }

  /**
   * Play hit sound when enemy takes damage
   */
  playHit() {
    if (!this.enabled) return;
    this.playTone(200, 0.08, 'square', 0.08);
  }

  /**
   * Play explosion sound for cannon AOE and base damage
   */
  playExplosion() {
    if (!this.enabled) return;
    
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate low-frequency noise for explosion
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Add low-pass filter that sweeps down (makes it sound like an explosion)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  /**
   * Play build sound when placing a tower
   */
  playBuild() {
    if (!this.enabled) return;
    this.playTone(523, 0.1, 'sine', 0.08);
    this.playTone(659, 0.1, 'sine', 0.06);
  }

  /**
   * Play upgrade sound when upgrading tower
   */
  playUpgrade() {
    if (!this.enabled) return;
    this.playTone(523, 0.12, 'sine', 0.08);
    this.playTone(659, 0.12, 'sine', 0.08);
    this.playTone(784, 0.15, 'sine', 0.1);
  }

  /**
   * Play sell sound when selling a tower
   */
  playSell() {
    if (!this.enabled) return;
    this.playTone(784, 0.1, 'sine', 0.06);
    this.playTone(659, 0.1, 'sine', 0.05);
  }

  /**
   * Play victory fanfare (ascending arpeggio)
   */
  playVictory() {
    if (!this.enabled) return;
    const notes = [523, 659, 784, 1047];  // C, E, G, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.1), i * 150);
    });
  }

  /**
   * Play defeat sound (descending tones)
   */
  playLoss() {
    if (!this.enabled) return;
    const notes = [400, 350, 300, 250];  // Descending
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.4, 'sawtooth', 0.08), i * 200);
    });
  }

  /**
   * Play error sound (insufficient funds or invalid action)
   */
  playError() {
    if (!this.enabled) return;
    this.playTone(150, 0.15, 'square', 0.08);
  }
}