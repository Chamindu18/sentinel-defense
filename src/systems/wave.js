/**
 * WAVE.JS
 * Wave manager for controlling enemy spawn sequences.
 * Handles spawning enemies, wave progression, and intermission periods.
 */

import { WAVES } from '../core/constants.js';

export class WaveManager {
  constructor(game) {
    this.game = game;
    this.currentWave = 0;      // 0-indexed, current wave number (0-9 for 10 waves)
    this.spawnQueue = [];       // Queue of enemy types to spawn
    this.spawnTimer = 0;        // Timer until next spawn (milliseconds)
    this.spawnInterval = 800;   // Milliseconds between spawns
    this.waveActive = false;    // Is wave currently in progress?
    this.intermission = false;  // Between waves (waiting for player)
    this.intermissionTimer = 0; // Timer for intermission countdown
  }

  /**
   * Start the current wave
   * Called when player clicks "Start Wave" button
   */
  startWave() {
    // Don't start if all waves are complete
    if (this.currentWave >= WAVES.length) return;
    
    this.waveActive = true;
    const wave = WAVES[this.currentWave];
    this.spawnQueue = [...wave.enemies];  // Copy the enemy array
    this.spawnTimer = 500;                 // Small delay before first spawn
    this.spawnInterval = wave.interval;    // Spawn interval for this wave
    this.currentWave++;                    // Increment to next wave
    this.intermission = false;
    
    // Show wave announcement on screen
    this.game.showWaveAnnouncement(this.currentWave);
    this.game.updateHUD();
  }

  /**
   * Update wave system
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    // Handle intermission (between waves)
    if (!this.waveActive) {
      // Check if wave is complete and intermission should start
      if (!this.intermission && this.currentWave < WAVES.length && 
          this.game.enemies.length === 0 && this.spawnQueue.length === 0) {
        // Wave is complete! Start intermission
        this.intermission = true;
        this.intermissionTimer = 3000;  // 3 second pause
      }
      
      // Handle intermission countdown
      if (this.intermission) {
        this.intermissionTimer -= dt;
        if (this.intermissionTimer <= 0) {
          // Intermission over - show Start Wave button
          this.intermission = false;
          this.game.showStartWaveButton(true);
        }
      }
      return;
    }

    // Handle spawning enemies during active wave
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        // Spawn the next enemy in queue
        const type = this.spawnQueue.shift();
        this.game.spawnEnemy(type);
        this.spawnTimer = this.spawnInterval;
      }
    } 
    // No more enemies to spawn and no enemies left on screen
    else if (this.game.enemies.length === 0) {
      this.waveActive = false;
      this.game.onWaveComplete();
    }
  }

  /**
   * Get current wave number (1-indexed for display)
   * @returns {number} Wave number (1-10)
   */
  getWaveNumber() {
    return this.currentWave;
  }

  /**
   * Check if all waves are completed
   * @returns {boolean} True if game is won
   */
  isGameComplete() {
    return this.currentWave >= WAVES.length && this.game.enemies.length === 0;
  }

  /**
   * Get wave reward for current/completed wave
   * @returns {number} Gold reward
   */
  getWaveReward() {
    if (this.currentWave === 0) return 0;
    return WAVES[this.currentWave - 1].reward;
  }
}