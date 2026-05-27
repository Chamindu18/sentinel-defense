/**
 * TOWER.JS
 * Tower class for defensive structures that attack enemies.
 * Handles targeting, shooting, upgrading, and rendering.
 */

import { TOWER_TYPES, TILE_SIZE } from '../core/constants.js';
import { Projectile } from './projectile.js';

export class Tower {
  constructor(c, r, type, game) {
    this.c = c;                     // Grid column (0-19)
    this.r = r;                     // Grid row (0-11)
    this.type = type;
    this.game = game;               // Reference to game instance
    this.level = 1;                 // Starts at level 1, max level 3
    this.config = TOWER_TYPES[type];
    this.angle = 0;                 // Current rotation angle (radians)
    this.target = null;             // Current target enemy
    this.lastShot = 0;              // Last shot timestamp (ms)
    this.totalInvested = this.config.cost;  // Total gold invested (for sell value)
    this.targeting = 'first';       // Targeting priority: first, nearest, last, strongest
  }

  /**
   * Get current damage with level scaling
   * Level 1: 100% damage
   * Level 2: 150% damage
   * Level 3: 200% damage
   * @returns {number} Current damage
   */
  getDamage() {
    return this.config.damage * (1 + 0.5 * (this.level - 1));
  }

  /**
   * Get current attack range in pixels
   * Level 1: 100% range
   * Level 2: 110% range
   * Level 3: 120% range
   * @returns {number} Range in pixels
   */
  getRange() {
    return this.config.range * (1 + 0.1 * (this.level - 1)) * TILE_SIZE;
  }

  /**
   * Get current fire rate (cooldown between shots)
   * Level 1: 100% fire rate (slowest)
   * Level 2: 90% fire rate (faster)
   * Level 3: 80% fire rate (fastest)
   * @returns {number} Fire rate in milliseconds
   */
  getFireRate() {
    return this.config.fireRate * (1 - 0.1 * (this.level - 1));
  }

  /**
   * Calculate upgrade cost based on current level
   * @returns {number} Upgrade cost
   */
  getUpgradeCost() {
    // Upgrade cost is 70% of base cost for level 2, 80% for level 3
    const mult = this.level === 1 ? 0.7 : 0.8;
    return Math.floor(this.config.cost * mult);
  }

  /**
   * Calculate sell value (50% of total investment)
   * @returns {number} Sell value
   */
  getSellValue() {
    return Math.floor(this.totalInvested * 0.5);
  }

  /**
   * Upgrade tower to next level
   * @returns {boolean} True if upgraded successfully
   */
  upgrade() {
    if (this.level >= 3) return false;
    const cost = this.getUpgradeCost();
    this.level++;
    this.totalInvested += cost;
    return true;
  }

  /**
   * Find best target among enemies based on targeting priority
   * @param {Array} enemies - Array of enemy objects
   * @returns {Object|null} Best target or null
   */
  findTarget(enemies) {
    const cx = this.c * TILE_SIZE + TILE_SIZE / 2;
    const cy = this.r * TILE_SIZE + TILE_SIZE / 2;
    const range = this.getRange();
    let candidates = [];

    // Find all enemies in range
    for (const e of enemies) {
      if (e.dead) continue;
      const dist = Math.hypot(e.x - cx, e.y - cy);
      if (dist <= range) {
        candidates.push({ enemy: e, dist });
      }
    }

    if (candidates.length === 0) return null;

    // Sort based on targeting priority
    if (this.targeting === 'nearest') {
      candidates.sort((a, b) => a.dist - b.dist);
    } else if (this.targeting === 'first') {
      // First = closest to the end (highest progress)
      candidates.sort((a, b) => b.enemy.pathProgress - a.enemy.pathProgress);
    } else if (this.targeting === 'last') {
      // Last = furthest from the end (lowest progress)
      candidates.sort((a, b) => a.enemy.pathProgress - b.enemy.pathProgress);
    } else if (this.targeting === 'strongest') {
      // Strongest = highest HP
      candidates.sort((a, b) => b.enemy.hp - a.enemy.hp);
    }

    return candidates[0].enemy;
  }

  /**
   * Update tower: find targets, rotate, and shoot
   * @param {number} dt - Delta time in milliseconds
   * @param {Array} enemies - Array of enemies
   * @param {number} now - Current timestamp
   */
  update(dt, enemies, now) {
    const cx = this.c * TILE_SIZE + TILE_SIZE / 2;
    const cy = this.r * TILE_SIZE + TILE_SIZE / 2;

    // Find new target if current is invalid
    if (!this.target || this.target.dead) {
      this.target = this.findTarget(enemies);
    } else {
      // Check if target is still in range
      const dist = Math.hypot(this.target.x - cx, this.target.y - cy);
      if (dist > this.getRange()) {
        this.target = this.findTarget(enemies);
      }
    }

    // Shoot if target exists and cooldown is ready
    if (this.target) {
      // Smooth rotation towards target
      const dx = this.target.x - cx;
      const dy = this.target.y - cy;
      const targetAngle = Math.atan2(dy, dx);
      let diff = targetAngle - this.angle;
      
      // Normalize angle difference to shortest path
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      
      // Apply rotation (smooth interpolation)
      this.angle += diff * Math.min(1, dt * 0.01);

      // Shoot if cooldown is ready
      if (now - this.lastShot >= this.getFireRate()) {
        this.shoot();
        this.lastShot = now;
      }
    }
  }

  /**
   * Shoot projectile at current target
   */
  shoot() {
    const cx = this.c * TILE_SIZE + TILE_SIZE / 2;
    const cy = this.r * TILE_SIZE + TILE_SIZE / 2;
    this.game.audio.playShoot(this.type);

    if (this.type === 'sniper') {
      // Sniper: instant hit with beam effect (no projectile)
      const dmg = Math.max(1, this.getDamage() - this.target.armor);
      this.target.takeDamage(dmg, this.game);
      this.game.addBeam(cx, cy, this.target.x, this.target.y, this.config.color);
    } else if (this.type === 'cannon') {
      // Cannon: ballistic projectile with AOE explosion
      const projectile = new Projectile(
        cx, cy, this.target.x, this.target.y,
        this.type, this.getDamage(), this.config, null, true, this.game
      );
      this.game.addProjectile(projectile);
    } else {
      // Archer & Frost: homing projectile
      const projectile = new Projectile(
        cx, cy, 0, 0, this.type, this.getDamage(),
        this.config, this.target, false, this.game
      );
      this.game.addProjectile(projectile);
    }
  }

  /**
   * Draw tower on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    const cx = this.c * TILE_SIZE + TILE_SIZE / 2;
    const cy = this.r * TILE_SIZE + TILE_SIZE / 2;

    // Base platform (square)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(cx - 22, cy - 22, 44, 44);
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 22, cy - 22, 44, 44);

    // Save context state for rotation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);

    // Draw tower based on type
    if (this.type === 'archer') {
      // Bow shape
      ctx.strokeStyle = this.config.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, 8);
      ctx.lineTo(-8, -8);
      ctx.fill();
    } else if (this.type === 'cannon') {
      // Cannon body
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(0, -7, 22, 14);
      ctx.fillStyle = '#f4a261';
      ctx.fillRect(18, -5, 6, 10);
    } else if (this.type === 'frost') {
      // Diamond shape (ice crystal)
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(0, 14);
      ctx.lineTo(-16, 0);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.type === 'sniper') {
      // Sniper scope/rifle
      ctx.fillStyle = this.config.color;
      ctx.fillRect(-10, -10, 20, 20);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(0, -4, 28, 8);
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Level indicator stars (above tower)
    if (this.level > 1) {
      ctx.fillStyle = '#f4a261';
      ctx.font = '11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      const stars = '★'.repeat(this.level - 1);
      ctx.fillText(stars, cx, cy - 26);
    }
  }

  /**
   * Draw tower attack range (for preview/hover)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawRange(ctx) {
    const cx = this.c * TILE_SIZE + TILE_SIZE / 2;
    const cy = this.r * TILE_SIZE + TILE_SIZE / 2;
    const range = this.getRange();

    ctx.beginPath();
    ctx.arc(cx, cy, range, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 162, 97, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 162, 97, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}