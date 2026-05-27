/**
 * CONSTANTS.JS
 * Contains all game configuration constants, tower/enemy definitions,
 * path waypoints, and wave configurations.
 */

// ==================== CANVAS CONFIGURATION ====================
// Size of each tile in pixels (50x50 pixels per grid cell)
export const TILE_SIZE = 50;

// Grid dimensions: 20 columns x 12 rows = 1000x600 pixel canvas
export const COLS = 20;
export const ROWS = 12;
export const WIDTH = COLS * TILE_SIZE;  // 1000 pixels
export const HEIGHT = ROWS * TILE_SIZE; // 600 pixels

// ==================== COLOR PALETTE ====================
// Consistent theming for the entire game
export const COLORS = {
  bg: '#0f0f23',           // Dark space-like background
  grid: '#1a1a3e',         // Grid background
  gridLine: '#16213e',     // Subtle grid line color
  path: '#1f4068',         // Enemy path color
  pathBorder: '#2a5a8a',   // Path border glow
  spawn: '#e94560',        // Spawn point (red)
  base: '#f4a261',         // Base/endpoint (orange)
  baseInner: '#ffd700',    // Base inner (gold)
  gold: '#f4a261',         // Gold/currency color
  blue: '#0f3460',
  purple: '#533483',
  cyan: '#a8d8ea',
  green: '#4ecca3',
  red: '#e94560',
  text: '#eee'
};

// ==================== TOWER TYPES ====================
// Each tower has unique stats and special abilities
export const TOWER_TYPES = {
  archer: { 
    name: 'Archer',        // Display name
    cost: 50,              // Purchase price
    damage: 10,            // Base damage
    range: 3,              // Attack range in tiles
    fireRate: 400,         // Milliseconds between shots
    color: '#4ecca3',      // Visual color (green)
    projectileSpeed: 300,  // Speed of arrow in pixels/second
    desc: 'Fast, balanced attacks' 
  },
  cannon: { 
    name: 'Cannon', 
    cost: 100, 
    damage: 35, 
    range: 2, 
    fireRate: 1200, 
    color: '#f4a261',      // Orange
    projectileSpeed: 150, 
    aoe: 1.8,              // Area of effect radius in tiles
    desc: 'Area damage, slow fire' 
  },
  frost: { 
    name: 'Frost', 
    cost: 75, 
    damage: 5, 
    range: 2.5, 
    fireRate: 800, 
    color: '#a8d8ea',      // Ice blue
    projectileSpeed: 250, 
    slow: 0.4,             // 40% slow effect
    slowDuration: 2500,    // Slows for 2.5 seconds
    desc: 'Slows enemies' 
  },
  sniper: { 
    name: 'Sniper', 
    cost: 150, 
    damage: 80, 
    range: 5,              // Longest range
    fireRate: 2000,        // Slowest fire rate
    color: '#e94560',      // Red
    projectileSpeed: 800,  // Instant beam
    desc: 'Long range, high damage' 
  }
};

// ==================== ENEMY TYPES ====================
// Different enemy classes with varying stats
export const ENEMY_TYPES = {
  normal: { 
    hp: 30,                // Hit points
    speed: 60,             // Pixels per second
    armor: 0,              // Damage reduction
    reward: 5,             // Gold on death
    color: '#e94560',      // Red
    radius: 11,            // Visual size in pixels
    desc: 'Balanced' 
  },
  fast: { 
    hp: 15, 
    speed: 150,            // Very fast!
    armor: 0, 
    reward: 8, 
    color: '#f9ed69',      // Yellow
    radius: 9,             // Smaller
    desc: 'Fast, fragile' 
  },
  tank: { 
    hp: 120, 
    speed: 30,             // Very slow
    armor: 5,              // Reduces damage by 5
    reward: 15, 
    color: '#4ecca3',      // Green
    radius: 13,            // Larger
    desc: 'High HP, slow' 
  },
  flying: { 
    hp: 20, 
    speed: 108, 
    armor: 0, 
    reward: 10, 
    color: '#a8d8ea',      // Ice blue
    radius: 10, 
    flying: true,          // Special flag for flying enemies
    desc: 'Ignores terrain' 
  },
  boss: { 
    hp: 500,               // Massive health pool
    speed: 18,             // Extremely slow
    armor: 10,             // High armor
    reward: 100,           // Big reward!
    color: '#b83b5e',      // Dark red/purple
    radius: 17,            // Largest enemy
    desc: 'Boss enemy' 
  }
};

// ==================== PATH WAYPOINTS ====================
// Defines the route enemies take from spawn to base
// Each waypoint has column (c) and row (r) coordinates
export const PATH = [
  {c: 0, r: 2},    // Start (spawn point)
  {c: 4, r: 2},
  {c: 4, r: 8},
  {c: 9, r: 8},
  {c: 9, r: 3},
  {c: 14, r: 3},
  {c: 14, r: 9},
  {c: 19, r: 9}    // End (base)
];

// ==================== WAVE CONFIGURATIONS ====================
// Each wave defines enemy composition and spawn timing
// There are 10 waves total, increasing in difficulty
export const WAVES = [
  { enemies: Array(8).fill('normal'), reward: 40, interval: 800 },      // Wave 1: 8 normal
  { enemies: Array(12).fill('normal'), reward: 50, interval: 750 },     // Wave 2: 12 normal
  { enemies: Array(8).fill('fast'), reward: 60, interval: 700 },        // Wave 3: 8 fast
  { enemies: Array(4).fill('tank'), reward: 70, interval: 900 },        // Wave 4: 4 tanks
  { enemies: [...Array(8).fill('normal'), ...Array(4).fill('fast')], reward: 80, interval: 700 },  // Wave 5: Mixed
  { enemies: Array(12).fill('fast'), reward: 90, interval: 650 },       // Wave 6: 12 fast
  { enemies: Array(6).fill('tank'), reward: 100, interval: 850 },       // Wave 7: 6 tanks
  { enemies: Array(8).fill('flying'), reward: 110, interval: 700 },     // Wave 8: 8 flying
  { enemies: [...Array(12).fill('normal'), ...Array(6).fill('fast'), ...Array(4).fill('tank')], reward: 140, interval: 600 },  // Wave 9: Massive mixed
  { enemies: [...Array(1).fill('boss'), ...Array(8).fill('normal')], reward: 200, interval: 1000 }  // Wave 10: Boss + adds
];