/**
 * ENEMY.JS
 * Enemy class for all hostile units in the game.
 * Handles movement along path, taking damage, slow effects, and rendering.
 */

import { ENEMY_TYPES, PATH, TILE_SIZE } from '../core/constants.js';
import { gridToPixel, PATH_SEGMENTS } from '../core/utils.js';

export class Enemy {
  constructor(type, game) {
    this.type = type;
    this.config = ENEMY_TYPES[type];
    this.hp = this.config.hp;
    this.maxHp = this.config.hp;
    this.speed = this.config.speed;        // Pixels per second
    this.armor = this.config.armor;
    this.reward = this.config.reward;
    this.game = game;                       // Reference to game instance
    
    this.dead = false;
    this.reachedEnd = false;
    this.pathIndex = 0;                     // Current path segment index
    this.pathProgress = 0;                  // Distance traveled along path
    
    // Set starting position at spawn point
    const start = gridToPixel(PATH[0].c, PATH[0].r);
    this.x = start.x;
    this.y = start.y;
    
    // Slow effect variables (for frost tower)
    this.slowed = false;
    this.slowAmount = 0;
    this.slowTimer = 0;
    
    // Visual effects
    this.hitFlash = 0;                      // Flash duration when hit (ms)
    this.bobOffset = Math.random() * Math.PI * 2;  // For idle animation
  }

  /**
   * Apply damage to enemy with armor reduction
   * @param {number} amount - Raw damage amount
   * @param {Object} game - Game instance for effects
   */
  takeDamage(amount, game) {
    // Armor reduces damage, but minimum 1 damage
    const dmg = Math.max(1, amount - this.armor);
    this.hp -= dmg;
    this.hitFlash = 100;                    // Trigger hit flash
    
    // Show damage number
    game.addFloatingText(this.x, this.y - 20, `-${dmg}`, '#f4a261');
    
    // Check if enemy dies
    if (this.hp <= 0) {
      this.dead = true;
      game.onEnemyKilled(this);
    }
  }

  /**
   * Apply slow effect to enemy (from frost tower)
   * @param {number} amount - Slow percentage (0-1, e.g., 0.4 = 40% slow)
   * @param {number} duration - Duration in milliseconds
   */
  applySlow(amount, duration) {
    // Only apply if stronger than current slow
    if (amount > this.slowAmount) {
      this.slowAmount = amount;
    }
    this.slowed = true;
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  /**
   * Update enemy position and state
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    if (this.dead || this.reachedEnd) return;

    // Update slow effect duration
    if (this.slowed) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowed = false;
        this.slowAmount = 0;
      }
    }

    // Calculate current speed (affected by slow)
    let currentSpeed = this.speed;
    if (this.slowed) {
      currentSpeed *= (1 - this.slowAmount);
    }

    // Move along path to next waypoint
    const targetIdx = this.pathIndex + 1;
    if (targetIdx >= PATH.length) {
      // Reached base - no more waypoints
      this.reachedEnd = true;
      this.game.onEnemyReachedBase(this);
      return;
    }

    const target = PATH[targetIdx];
    const tx = target.c * TILE_SIZE + TILE_SIZE / 2;
    const ty = target.r * TILE_SIZE + TILE_SIZE / 2;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    const moveAmount = currentSpeed * (dt / 1000);

    if (moveAmount >= dist) {
      // Snap to waypoint and move to next segment
      this.x = tx;
      this.y = ty;
      this.pathIndex++;
    } else {
      // Move towards waypoint
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }

    // Update path progress for targeting prioritization
    // (enemies closer to the end are targeted first)
    let progress = 0;
    for (let i = 0; i < this.pathIndex && i < PATH_SEGMENTS.length; i++) {
      progress += PATH_SEGMENTS[i].len;
    }
    if (this.pathIndex < PATH_SEGMENTS.length) {
      const seg = PATH_SEGMENTS[this.pathIndex];
      const segDist = Math.hypot(
        this.x - (seg.p1.c * TILE_SIZE + TILE_SIZE / 2),
        this.y - (seg.p1.r * TILE_SIZE + TILE_SIZE / 2)
      );
      progress += segDist;
    }
    this.pathProgress = progress;

    // Update visual effects
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.bobOffset += dt * 0.005;  // Slow bobbing animation
  }

  /**
   * Draw enemy on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (this.dead) return;

    // Bobbing animation (flies up and down slightly)
    const bobY = Math.sin(this.bobOffset) * 2;
    const drawY = this.y + bobY;

    // Shadow for flying enemies
    if (this.config.flying) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 10, this.config.radius, this.config.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw enemy body (white flash when hit)
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, drawY, this.config.radius, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Slow effect indicator (ice ring around enemy)
    if (this.slowed) {
      ctx.strokeStyle = '#a8d8ea';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.config.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Flying indicator (wings made of small circles)
    if (this.config.flying) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(this.x - 6, drawY - 6, 3, 0, Math.PI * 2);
      ctx.arc(this.x + 6, drawY - 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boss crown (special visual for boss enemies)
    if (this.type === 'boss') {
      ctx.fillStyle = '#f4a261';
      ctx.beginPath();
      ctx.moveTo(this.x - 8, drawY - this.config.radius - 4);
      ctx.lineTo(this.x - 4, drawY - this.config.radius - 10);
      ctx.lineTo(this.x, drawY - this.config.radius - 6);
      ctx.lineTo(this.x + 4, drawY - this.config.radius - 10);
      ctx.lineTo(this.x + 8, drawY - this.config.radius - 4);
      ctx.closePath();
      ctx.fill();
    }

    // Health bar
    const barW = this.config.radius * 2.2;
    const barH = 4;
    const barX = this.x - barW / 2;
    const barY = drawY - this.config.radius - 10;

    // Background (dark)
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX, barY, barW, barH);

    // Health (color based on percentage)
    const hpPct = this.hp / this.maxHp;
    if (hpPct > 0.5) {
      ctx.fillStyle = '#4ecca3';  // Green
    } else if (hpPct > 0.25) {
      ctx.fillStyle = '#f4a261';  // Orange
    } else {
      ctx.fillStyle = '#e94560';  // Red
    }
    ctx.fillRect(barX, barY, barW * hpPct, barH);
  }
}