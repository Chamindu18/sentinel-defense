/**
 * GAME.JS
 * Main Game class that orchestrates all game systems.
 * Manages game state, entities, UI interactions, and the game loop.
 */

import { WIDTH, HEIGHT, TILE_SIZE, COLS, ROWS, COLORS, TOWER_TYPES, WAVES, PATH } from './constants.js';
import { isBuildable, pixelToGrid, gridToPixel } from './utils.js';
import { AudioManager } from '../systems/audio.js';
import { SaveManager } from '../systems/save.js';
import { WaveManager } from '../systems/wave.js';
import { Tower } from '../entities/tower.js';
import { Enemy } from '../entities/enemy.js';
import { Projectile } from '../entities/projectile.js';
import { Particle, FloatingText, BeamEffect, ScreenShake } from '../entities/effects.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Initialize systems
    this.audio = new AudioManager();
    this.saveManager = new SaveManager();
    this.waveManager = new WaveManager(this);
    
    // Game state
    this.state = 'menu';        // menu, playing, paused, victory, defeat
    this.showGrid = true;
    
    // Game entities
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.beams = [];
    this.screenShake = null;
    
    // Player resources
    this.coins = 150;
    this.health = 20;
    this.score = 0;
    this.kills = 0;
    
    // UI state
    this.buildMode = false;
    this.selectedTowerType = null;
    this.hoveredTower = null;
    this.selectedTower = null;
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Time tracking
    this.lastTime = 0;
    this.time = 0;
    
    // Bind methods to ensure correct 'this' context
    this.gameLoop = this.gameLoop.bind(this);
  }

  /**
   * Initialize the game and setup event listeners
   */
  init() {
    this.setupUI();
    this.setupInput();
    this.generateBuildCards();
    
    // Check for existing save file
    document.getElementById('btnContinue').disabled = !this.saveManager.exists();
    
    // Start the game loop
    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Setup UI button event listeners
   */
  setupUI() {
    // Main Menu
    document.getElementById('btnStart').onclick = () => this.startNewGame();
    document.getElementById('btnContinue').onclick = () => this.continueGame();
    document.getElementById('btnSettings').onclick = () => this.showSettings();
    document.getElementById('btnExit').onclick = () => window.close();

    // HUD
    document.getElementById('btnBuild').onclick = () => this.toggleBuildPanel();
    document.getElementById('btnPause').onclick = () => this.pause();
    document.getElementById('btnCancelBuild').onclick = () => this.closeBuildPanel();

    // Tower Popup
    document.getElementById('btnUpgrade').onclick = () => this.upgradeSelectedTower();
    document.getElementById('btnSell').onclick = () => this.sellSelectedTower();
    document.getElementById('btnClosePopup').onclick = () => this.closeTowerPopup();

    // Pause Screen
    document.getElementById('btnResume').onclick = () => this.resume();
    document.getElementById('btnRestart').onclick = () => { this.resume(); this.startNewGame(); };
    document.getElementById('btnSettingsPause').onclick = () => this.showSettings();
    document.getElementById('btnQuit').onclick = () => this.returnToMenu();

    // Result Screen
    document.getElementById('btnReplay').onclick = () => this.startNewGame();
    document.getElementById('btnMenuResult').onclick = () => this.returnToMenu();

    // Settings
    document.getElementById('volSound').oninput = (e) => {
      this.audio.setSoundVolume(e.target.value / 100);
    };
    document.getElementById('chkGrid').onchange = (e) => {
      this.showGrid = e.target.checked;
    };
    document.getElementById('btnBackSettings').onclick = () => this.hideSettings();

    // Start Wave
    document.getElementById('startWaveBtn').onclick = () => {
      this.waveManager.startWave();
      this.showStartWaveButton(false);
    };
  }

  /**
   * Setup mouse and keyboard input
   */
  setupInput() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;

      if (this.state === 'playing') {
        const g = pixelToGrid(this.mouseX, this.mouseY);
        this.hoveredTower = null;
        for (const t of this.towers) {
          if (t.c === g.c && t.r === g.r) {
            this.hoveredTower = t;
            break;
          }
        }
      }
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.state !== 'playing') return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const g = pixelToGrid(x, y);

      if (this.buildMode && this.selectedTowerType) {
        // Try to build tower
        if (isBuildable(g.c, g.r, this.towers)) {
          const cost = TOWER_TYPES[this.selectedTowerType].cost;
          if (this.coins >= cost) {
            this.coins -= cost;
            const tower = new Tower(g.c, g.r, this.selectedTowerType, this);
            this.towers.push(tower);
            this.audio.playBuild();
            this.addParticles(x, y, TOWER_TYPES[this.selectedTowerType].color, 10, 500);
            this.updateHUD();
            this.saveGame();
          } else {
            this.audio.playError();
          }
        } else {
          this.audio.playError();
        }
      } else {
        // Check if clicking on existing tower
        let clicked = false;
        for (const t of this.towers) {
          if (t.c === g.c && t.r === g.r) {
            this.openTowerPopup(t);
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          this.closeTowerPopup();
        }
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.buildMode) {
        this.closeBuildPanel();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.buildMode) {
          this.closeBuildPanel();
        } else if (document.getElementById('towerPopup').classList.contains('active')) {
          this.closeTowerPopup();
        } else if (this.state === 'playing') {
          this.pause();
        } else if (this.state === 'paused') {
          this.resume();
        }
      }
    });
  }

  /**
   * Generate tower selection cards in build panel
   */
  generateBuildCards() {
    const container = document.getElementById('towerCards');
    container.innerHTML = '';

    for (const [key, config] of Object.entries(TOWER_TYPES)) {
      const card = document.createElement('div');
      card.className = 'tower-card';
      card.dataset.type = key;
      card.innerHTML = `
        <div class="tower-icon" style="background:${config.color}20;border:2px solid ${config.color};">
          <span style="color:${config.color};">${key === 'archer' ? '➹' : key === 'cannon' ? '💣' : key === 'frost' ? '❄' : '⊹'}</span>
        </div>
        <h4>${config.name}</h4>
        <div class="tower-cost">${config.cost} coins</div>
        <div class="tower-stats-mini">
          DMG: ${config.damage} | RNG: ${config.range}<br>
          SPD: ${(1000 / config.fireRate).toFixed(1)}/s
        </div>
      `;
      card.onclick = () => this.selectTowerToBuild(key, card);
      container.appendChild(card);
    }
  }

  /**
   * Select a tower type to build
   */
  selectTowerToBuild(type, cardElement) {
    document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
    const cost = TOWER_TYPES[type].cost;
    if (this.coins >= cost) {
      cardElement.classList.add('selected');
      this.selectedTowerType = type;
      this.buildMode = true;
    } else {
      this.audio.playError();
    }
  }

  /**
   * Toggle build panel visibility
   */
  toggleBuildPanel() {
    const panel = document.getElementById('buildPanel');
    if (panel.classList.contains('active')) {
      this.closeBuildPanel();
    } else {
      panel.classList.add('active');
      this.updateBuildCards();
    }
  }

  /**
   * Close build panel
   */
  closeBuildPanel() {
    document.getElementById('buildPanel').classList.remove('active');
    document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
    this.buildMode = false;
    this.selectedTowerType = null;
  }

  /**
   * Update build cards (enable/disable based on coins)
   */
  updateBuildCards() {
    document.querySelectorAll('.tower-card').forEach(card => {
      const type = card.dataset.type;
      const cost = TOWER_TYPES[type].cost;
      if (this.coins < cost) {
        card.classList.add('disabled');
      } else {
        card.classList.remove('disabled');
      }
    });
  }

  /**
   * Open tower info popup
   */
  openTowerPopup(tower) {
    this.selectedTower = tower;
    const popup = document.getElementById('towerPopup');
    document.getElementById('popupTowerName').textContent = `${tower.config.name} (Lv.${tower.level})`;

    const stats = document.getElementById('popupStats');
    const upgradeCost = tower.getUpgradeCost();
    const canUpgrade = tower.level < 3 && this.coins >= upgradeCost;

    stats.innerHTML = `
      <span>Damage:</span><span>${tower.getDamage().toFixed(1)}</span>
      <span>Range:</span><span>${(tower.getRange() / TILE_SIZE).toFixed(1)} tiles</span>
      <span>Fire Rate:</span><span>${(1000 / tower.getFireRate()).toFixed(1)}/s</span>
      <span>Targeting:</span><span>${tower.targeting}</span>
      <span>Invested:</span><span>${tower.totalInvested}</span>
    `;

    const btnUpgrade = document.getElementById('btnUpgrade');
    if (tower.level >= 3) {
      btnUpgrade.textContent = 'Max Level';
      btnUpgrade.disabled = true;
    } else {
      btnUpgrade.textContent = `Upgrade (${upgradeCost})`;
      btnUpgrade.disabled = !canUpgrade;
    }
    document.getElementById('btnSell').textContent = `Sell (${tower.getSellValue()})`;

    popup.classList.add('active');
  }

  /**
   * Close tower info popup
   */
  closeTowerPopup() {
    document.getElementById('towerPopup').classList.remove('active');
    this.selectedTower = null;
  }

  /**
   * Upgrade selected tower
   */
  upgradeSelectedTower() {
    if (!this.selectedTower) return;
    const cost = this.selectedTower.getUpgradeCost();
    if (this.coins >= cost && this.selectedTower.level < 3) {
      this.coins -= cost;
      this.selectedTower.upgrade();
      this.audio.playUpgrade();
      this.addParticles(
        this.selectedTower.c * TILE_SIZE + TILE_SIZE / 2,
        this.selectedTower.r * TILE_SIZE + TILE_SIZE / 2,
        '#f4a261', 12, 600
      );
      this.openTowerPopup(this.selectedTower);
      this.updateHUD();
      this.updateBuildCards();
      this.saveGame();
    }
  }

  /**
   * Sell selected tower
   */
  sellSelectedTower() {
    if (!this.selectedTower) return;
    const value = this.selectedTower.getSellValue();
    this.coins += value;
    this.towers = this.towers.filter(t => t !== this.selectedTower);
    this.audio.playSell();
    this.addParticles(
      this.selectedTower.c * TILE_SIZE + TILE_SIZE / 2,
      this.selectedTower.r * TILE_SIZE + TILE_SIZE / 2,
      '#e94560', 10, 500
    );
    this.closeTowerPopup();
    this.updateHUD();
    this.updateBuildCards();
    this.saveGame();
  }

  /**
   * Start a new game
   */
  startNewGame() {
    this.audio.resume();
    this.state = 'playing';
    this.showScreen('hud');

    // Reset all game state
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.beams = [];
    this.screenShake = null;

    this.waveManager = new WaveManager(this);
    this.coins = 150;
    this.health = 20;
    this.score = 0;
    this.kills = 0;
    this.buildMode = false;
    this.selectedTowerType = null;
    this.selectedTower = null;

    this.closeBuildPanel();
    this.closeTowerPopup();
    this.showStartWaveButton(true);
    this.updateHUD();
    this.saveManager.clear();
  }

  /**
   * Continue saved game
   */
  continueGame() {
    const data = this.saveManager.load();
    if (!data) return;

    this.audio.resume();
    this.state = 'playing';
    this.showScreen('hud');

    // Restore towers
    this.towers = data.towers.map(t => {
      const tower = new Tower(t.c, t.r, t.type, this);
      tower.level = t.level;
      tower.totalInvested = TOWER_TYPES[t.type].cost * (1 + (t.level - 1) * 0.75);
      return tower;
    });

    // Reset dynamic entities
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.beams = [];
    this.screenShake = null;

    // Restore game state
    this.waveManager = new WaveManager(this);
    this.waveManager.currentWave = data.wave;
    this.coins = data.coins;
    this.health = data.health;
    this.score = data.score || 0;
    this.kills = 0;
    this.buildMode = false;
    this.selectedTowerType = null;
    this.selectedTower = null;

    this.closeBuildPanel();
    this.closeTowerPopup();

    if (this.waveManager.currentWave < WAVES.length) {
      this.showStartWaveButton(true);
    }
    this.updateHUD();
  }

  /**
   * Save current game state
   */
  saveGame() {
    if (this.state !== 'playing') return;
    this.saveManager.save({
      coins: this.coins,
      health: this.health,
      wave: this.waveManager.currentWave,
      score: this.score,
      towers: this.towers.map(t => ({ c: t.c, r: t.r, type: t.type, level: t.level }))
    });
    document.getElementById('btnContinue').disabled = false;
  }

  /**
   * Spawn a new enemy
   */
  spawnEnemy(type) {
    const enemy = new Enemy(type, this);
    this.enemies.push(enemy);
  }

  /**
   * Handle enemy death
   */
  onEnemyKilled(enemy) {
    this.coins += enemy.reward;
    this.score += enemy.reward * 10;
    this.kills++;
    this.audio.playHit();
    this.addParticles(enemy.x, enemy.y, enemy.config.color, 8, 400);
    this.addFloatingText(enemy.x, enemy.y, `+${enemy.reward}`, '#4ecca3');
    this.updateHUD();
    this.updateBuildCards();
    this.saveGame();
  }

  /**
   * Handle enemy reaching the base
   */
  onEnemyReachedBase(enemy) {
    this.health -= 1;
    enemy.dead = true;
    this.addScreenShake(6, 300);
    this.audio.playExplosion();
    this.addParticles(enemy.x, enemy.y, '#e94560', 12, 500);
    this.updateHUD();

    if (this.health <= 0) {
      this.gameOver();
    }
  }

  /**
   * Handle wave completion
   */
  onWaveComplete() {
    const reward = this.waveManager.getWaveReward();
    if (reward) {
      this.coins += reward;
      this.score += reward * 5;
      this.addFloatingText(WIDTH / 2, HEIGHT / 2 - 50, `Wave Complete! +${reward}`, '#f4a261');
    }
    this.updateHUD();
    this.updateBuildCards();
    this.saveGame();

    if (this.waveManager.isGameComplete()) {
      setTimeout(() => this.victory(), 1500);
    }
  }

  /**
   * Victory screen
   */
  victory() {
    this.state = 'victory';
    this.audio.playVictory();
    this.saveManager.clear();

    const title = document.getElementById('resultTitle');
    title.textContent = 'Victory!';
    title.className = 'victory';

    // Calculate stars based on remaining health
    const stars = document.getElementById('resultStars');
    const starCount = this.health >= 15 ? 3 : this.health >= 8 ? 2 : 1;
    stars.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span');
      s.className = 'star' + (i < starCount ? ' earned' : '');
      s.textContent = '★';
      stars.appendChild(s);
    }

    document.getElementById('resultStats').innerHTML = `
      <span class="stat-label">Waves Survived:</span><span class="stat-value">${this.waveManager.currentWave} / ${WAVES.length}</span>
      <span class="stat-label">Enemies Killed:</span><span class="stat-value">${this.kills}</span>
      <span class="stat-label">Final Score:</span><span class="stat-value">${this.score}</span>
      <span class="stat-label">Coins Remaining:</span><span class="stat-value">${this.coins}</span>
      <span class="stat-label">Base Health:</span><span class="stat-value">${this.health} / 20</span>
    `;

    this.showScreen('resultScreen');
  }

  /**
   * Game over screen
   */
  gameOver() {
    this.state = 'defeat';
    this.audio.playLoss();
    this.saveManager.clear();

    const title = document.getElementById('resultTitle');
    title.textContent = 'Defeat';
    title.className = 'defeat';

    document.getElementById('resultStars').innerHTML = '';
    document.getElementById('resultStats').innerHTML = `
      <span class="stat-label">Waves Reached:</span><span class="stat-value">${this.waveManager.currentWave} / ${WAVES.length}</span>
      <span class="stat-label">Enemies Killed:</span><span class="stat-value">${this.kills}</span>
      <span class="stat-label">Final Score:</span><span class="stat-value">${this.score}</span>
    `;

    this.showScreen('resultScreen');
  }

  /**
   * Pause the game
   */
  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.showScreen('pauseScreen');
    }
  }

  /**
   * Resume the game
   */
  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.showScreen('hud');
      this.lastTime = performance.now();
    }
  }

  /**
   * Return to main menu
   */
  returnToMenu() {
    this.state = 'menu';
    this.showScreen('mainMenu');
    document.getElementById('btnContinue').disabled = !this.saveManager.exists();
  }

  /**
   * Show settings screen
   */
  showSettings() {
    document.getElementById('settingsScreen').classList.add('active');
  }

  /**
   * Hide settings screen
   */
  hideSettings() {
    document.getElementById('settingsScreen').classList.remove('active');
  }

  /**
   * Show a specific screen
   */
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (id) document.getElementById(id).classList.add('active');
  }

  /**
   * Show wave announcement
   */
  showWaveAnnouncement(waveNum) {
    const el = document.getElementById('waveAnnounce');
    el.textContent = `Wave ${waveNum}`;
    el.classList.remove('show');
    void el.offsetWidth; // Force reflow to restart animation
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
  }

  /**
   * Show/hide start wave button
   */
  showStartWaveButton(show) {
    const btn = document.getElementById('startWaveBtn');
    if (show) btn.classList.add('active');
    else btn.classList.remove('active');
  }

  /**
   * Update HUD display
   */
  updateHUD() {
    document.getElementById('hudMoney').textContent = this.coins;
    document.getElementById('hudWave').textContent = `${this.waveManager.currentWave} / ${WAVES.length}`;
    document.getElementById('hudHealth').textContent = this.health;
  }

  /**
   * Add a projectile
   */
  addProjectile(p) {
    this.projectiles.push(p);
  }

  /**
   * Add a beam effect
   */
  addBeam(x1, y1, x2, y2, color) {
    this.beams.push(new BeamEffect(x1, y1, x2, y2, color));
  }

  /**
   * Add particle effects
   */
  addParticles(x, y, color, count, life) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color, 4, life));
    }
  }

  /**
   * Add floating text
   */
  addFloatingText(x, y, text, color) {
    this.floatingTexts.push(new FloatingText(x, y, text, color));
  }

  /**
   * Add screen shake effect
   */
  addScreenShake(intensity, duration) {
    this.screenShake = new ScreenShake(intensity, duration);
  }

  /**
   * Update game logic
   */
  update(dt) {
    if (this.state !== 'playing') return;

    this.time += dt;
    this.waveManager.update(dt);

    // Update towers
    for (const t of this.towers) {
      t.update(dt, this.enemies, this.time);
    }

    // Update enemies
    for (const e of this.enemies) {
      e.update(dt);
    }
    this.enemies = this.enemies.filter(e => !e.dead && !e.reachedEnd);

    // Update projectiles
    for (const p of this.projectiles) {
      p.update(dt, this.enemies);
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);

    // Update effects
    for (const p of this.particles) p.update(dt);
    for (const f of this.floatingTexts) f.update(dt);
    for (const b of this.beams) b.update(dt);
    
    this.particles = this.particles.filter(p => p.life > 0);
    this.floatingTexts = this.floatingTexts.filter(f => f.life > 0);
    this.beams = this.beams.filter(b => b.life > 0);

    // Update screen shake
    if (this.screenShake) {
      this.screenShake.update(dt);
      if (!this.screenShake.isActive()) this.screenShake = null;
    }
  }

  /**
   * Draw everything
   */
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    if (this.screenShake) {
      const off = this.screenShake.getOffset();
      ctx.translate(off.x, off.y);
    }

    // Draw background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw grid
    if (this.showGrid) {
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE, 0);
        ctx.lineTo(c * TILE_SIZE, HEIGHT);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * TILE_SIZE);
        ctx.lineTo(WIDTH, r * TILE_SIZE);
        ctx.stroke();
      }
    }

    // Draw path
    ctx.fillStyle = COLORS.path;
    for (let i = 0; i < PATH.length - 1; i++) {
      const p1 = PATH[i];
      const p2 = PATH[i + 1];
      const minC = Math.min(p1.c, p2.c);
      const maxC = Math.max(p1.c, p2.c);
      const minR = Math.min(p1.r, p2.r);
      const maxR = Math.max(p1.r, p2.r);
      ctx.fillRect(minC * TILE_SIZE, minR * TILE_SIZE, (maxC - minC + 1) * TILE_SIZE, (maxR - minR + 1) * TILE_SIZE);
    }

    // Draw path border
    ctx.strokeStyle = COLORS.pathBorder;
    ctx.lineWidth = 2;
    for (let i = 0; i < PATH.length - 1; i++) {
      const p1 = PATH[i];
      const p2 = PATH[i + 1];
      const minC = Math.min(p1.c, p2.c);
      const maxC = Math.max(p1.c, p2.c);
      const minR = Math.min(p1.r, p2.r);
      const maxR = Math.max(p1.r, p2.r);
      ctx.strokeRect(minC * TILE_SIZE + 1, minR * TILE_SIZE + 1, (maxC - minC + 1) * TILE_SIZE - 2, (maxR - minR + 1) * TILE_SIZE - 2);
    }

    // Draw spawn point
    const spawn = { x: PATH[0].c * TILE_SIZE + TILE_SIZE/2, y: PATH[0].r * TILE_SIZE + TILE_SIZE/2 };
    ctx.fillStyle = COLORS.spawn;
    ctx.shadowColor = COLORS.spawn;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(spawn.x, spawn.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPAWN', spawn.x, spawn.y + 4);

    // Draw base
    const base = { x: PATH[PATH.length-1].c * TILE_SIZE + TILE_SIZE/2, y: PATH[PATH.length-1].r * TILE_SIZE + TILE_SIZE/2 };
    ctx.fillStyle = COLORS.base;
    ctx.shadowColor = COLORS.base;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(base.x, base.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.baseInner;
    ctx.beginPath();
    ctx.arc(base.x, base.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0a0a1a';
    ctx.font = 'bold 14px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BASE', base.x, base.y + 5);

    // Draw build preview
    if (this.buildMode && this.selectedTowerType) {
      const g = pixelToGrid(this.mouseX, this.mouseY);
      if (g.c >= 0 && g.c < COLS && g.r >= 0 && g.r < ROWS) {
        const px = g.c * TILE_SIZE;
        const py = g.r * TILE_SIZE;
        const valid = isBuildable(g.c, g.r, this.towers);

        ctx.fillStyle = valid ? 'rgba(78, 204, 163, 0.2)' : 'rgba(233, 69, 96, 0.2)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = valid ? '#4ecca3' : '#e94560';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

        if (valid) {
          const range = TOWER_TYPES[this.selectedTowerType].range * TILE_SIZE;
          const cx = px + TILE_SIZE/2;
          const cy = py + TILE_SIZE/2;
          ctx.beginPath();
          ctx.arc(cx, cy, range, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(244, 162, 97, 0.1)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(244, 162, 97, 0.4)';
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // Draw towers
    for (const t of this.towers) {
      t.draw(ctx);
    }

    // Draw tower range on hover
    if (this.hoveredTower && !this.buildMode) {
      this.hoveredTower.drawRange(ctx);
    }

    // Draw enemies
    for (const e of this.enemies) {
      e.draw(ctx);
    }

    // Draw projectiles
    for (const p of this.projectiles) {
      p.draw(ctx);
    }

    // Draw effects
    for (const b of this.beams) b.draw(ctx);
    for (const p of this.particles) p.draw(ctx);
    for (const f of this.floatingTexts) f.draw(ctx);

    ctx.restore();
  }

  /**
   * Game loop
   */
  gameLoop(timestamp) {
    const dt = Math.min(timestamp - this.lastTime, 50);
    this.lastTime = timestamp;

    if (this.state === 'playing') {
      this.update(dt);
    }
    this.draw();

    requestAnimationFrame(this.gameLoop);
  }
}