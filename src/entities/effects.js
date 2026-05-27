/**
 * EFFECTS.JS
 * Visual effect classes for particles, floating text, beams, and screen shake.
 * These create satisfying feedback for actions like hits, kills, and explosions.
 */

/**
 * Particle effect for explosions, hits, and ambient effects
 * Creates small moving dots that fade out over time
 */
export class Particle {
  constructor(x, y, color, speed, life, size) {
    this.x = x;
    this.y = y;
    // Random velocity in all directions
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.color = color;
    this.life = life;          // Current life remaining (milliseconds)
    this.maxLife = life;       // Maximum life (for opacity calculation)
    this.size = size || (Math.random() * 3 + 1);
  }

  /**
   * Update particle position and life
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    this.x += this.vx * (dt / 16);   // Normalize to 60fps
    this.y += this.vy * (dt / 16);
    this.life -= dt;
  }

  /**
   * Draw particle on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/**
 * Floating text for damage numbers and reward indicators
 * Shows numbers that float upward and fade out
 */
export class FloatingText {
  constructor(x, y, text, color, duration = 800) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = duration;
    this.maxLife = duration;
    this.vy = -40;  // Float upward speed (pixels per second)
  }

  /**
   * Update text position and life
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    this.y += this.vy * (dt / 1000);
    this.life -= dt;
  }

  /**
   * Draw floating text on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 13px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

/**
 * Beam effect for sniper shots
 * Draws a line that fades out quickly
 */
export class BeamEffect {
  constructor(x1, y1, x2, y2, color) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.life = 100;      // milliseconds
    this.maxLife = 100;
  }

  /**
   * Update beam life
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    this.life -= dt;
  }

  /**
   * Draw beam on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (this.life <= 0) return;
    
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/**
 * Screen shake effect for impacts and explosions
 * Creates camera shake for more immersive feedback
 */
export class ScreenShake {
  constructor(intensity, duration) {
    this.intensity = intensity;  // How strong the shake is
    this.duration = duration;    // How long it lasts (ms)
    this.timer = duration;       // Current time remaining
  }

  /**
   * Update shake timer
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    this.timer -= dt;
    if (this.timer < 0) this.timer = 0;
  }

  /**
   * Get current shake offset for canvas translation
   * @returns {Object} {x, y} offset values
   */
  getOffset() {
    if (this.timer <= 0) return { x: 0, y: 0 };
    
    // Shake intensity decreases over time
    const amount = (this.timer / this.duration) * this.intensity;
    return {
      x: (Math.random() - 0.5) * 2 * amount,
      y: (Math.random() - 0.5) * 2 * amount
    };
  }

  /**
   * Check if shake is still active
   * @returns {boolean} True if active
   */
  isActive() {
    return this.timer > 0;
  }
}