/**
 * PROJECTILE.JS
 * Projectile class for tower attacks with different behaviors.
 * Supports homing projectiles (archer/frost) and ballistic projectiles (cannon).
 */

import { TILE_SIZE } from '../core/constants.js';

export class Projectile {
  constructor(x, y, tx, ty, type, damage, config, target = null, ballistic = false, game) {
    this.x = x;                     // Current X position
    this.y = y;                     // Current Y position
    this.startX = x;                // Starting X (for beam drawing)
    this.startY = y;                // Starting Y (for beam drawing)
    this.tx = tx;                   // Target X (for ballistic projectiles)
    this.ty = ty;                   // Target Y (for ballistic projectiles)
    this.type = type;               // Tower type that fired this projectile
    this.damage = damage;
    this.config = config;
    this.target = target;           // Homing target enemy
    this.ballistic = ballistic;     // True = straight line to point, False = homing
    this.game = game;
    this.dead = false;
    this.vx = 0;                    // X velocity (pixels per second)
    this.vy = 0;                    // Y velocity (pixels per second)

    if (ballistic) {
      // Calculate direction vector to target point
      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy);
      this.vx = (dx / dist) * config.projectileSpeed;
      this.vy = (dy / dist) * config.projectileSpeed;
    }
  }

  /**
   * Update projectile position and check for hits
   * @param {number} dt - Delta time in milliseconds
   * @param {Array} enemies - Array of enemies
   */
  update(dt, enemies) {
    if (this.dead) return;

    if (this.ballistic) {
      // Ballistic: Move in straight line to target point
      this.x += this.vx * (dt / 1000);
      this.y += this.vy * (dt / 1000);

      // Check if reached target point (close enough)
      const dx = this.x - this.tx;
      const dy = this.y - this.ty;
      if (Math.hypot(dx, dy) < 10) {
        this.explode(enemies);
      }
    } else if (this.target && !this.target.dead) {
      // Homing: Track the target enemy
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);
      const speed = this.config.projectileSpeed;

      if (dist < 10) {
        // Hit the target
        this.hit(this.target);
      } else {
        // Move towards target
        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.x += this.vx * (dt / 1000);
        this.y += this.vy * (dt / 1000);
      }
    } else {
      // Target lost (died or out of range) - continue in last direction
      this.x += this.vx * (dt / 1000);
      this.y += this.vy * (dt / 1000);

      // Remove if off screen
      if (this.x < -50 || this.x > 1050 || this.y < -50 || this.y > 650) {
        this.dead = true;
      }
    }
  }

  /**
   * Hit a specific enemy (for homing projectiles)
   * @param {Object} enemy - Target enemy
   */
  hit(enemy) {
    this.dead = true;

    // Apply slow effect for frost tower
    if (this.type === 'frost') {
      enemy.applySlow(this.config.slow, this.config.slowDuration);
    }

    // Apply damage
    enemy.takeDamage(this.damage, this.game);
    
    // Add hit particles
    this.game.addParticles(this.x, this.y, this.config.color, 6, 400);
  }

  /**
   * Explode with area of effect (for cannon)
   * Damages all enemies within radius
   * @param {Array} enemies - Array of enemies
   */
  explode(enemies) {
    this.dead = true;
    this.game.audio.playExplosion();
    
    const aoeRadius = this.config.aoe * TILE_SIZE;
    
    // Add explosion particles and screen shake
    this.game.addParticles(this.x, this.y, this.config.color, 15, 600);
    this.game.addScreenShake(4, 200);

    // Damage all enemies in AOE radius
    for (const e of enemies) {
      if (e.dead) continue;
      
      const dist = Math.hypot(e.x - this.x, e.y - this.y);
      if (dist <= aoeRadius) {
        // Damage falls off based on distance (less damage at edge)
        const falloff = 1 - (dist / aoeRadius) * 0.5;
        const finalDamage = Math.floor(this.damage * falloff);
        e.takeDamage(finalDamage, this.game);
      }
    }
  }

  /**
   * Draw projectile on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (this.dead) return;

    if (this.type === 'sniper') {
      // Sniper: Draw beam line
      ctx.strokeStyle = this.config.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(this.startX, this.startY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (this.type === 'cannon') {
      // Cannon: Draw cannonball with trail effect
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 7, 0, Math.PI * 2);
      ctx.fill();
      
      // Trail effect
      ctx.fillStyle = 'rgba(244, 162, 97, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x - this.vx * 0.03, this.y - this.vy * 0.03, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Archer & Frost: Draw arrow/missile shape
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx));
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-5, 4);
      ctx.lineTo(-5, -4);
      ctx.fill();
      ctx.restore();
    }
  }
}