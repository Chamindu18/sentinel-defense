/**
 * UTILS.JS
 * Utility functions for coordinate conversion, collision detection,
 * and path calculations.
 */

import { TILE_SIZE, PATH, COLS, ROWS } from './constants.js';

/**
 * Convert grid coordinates to pixel coordinates
 * @param {number} c - Column index (0-19)
 * @param {number} r - Row index (0-11)
 * @returns {Object} Pixel coordinates {x, y} (center of tile)
 * 
 * Example: gridToPixel(0, 0) returns {x: 25, y: 25}
 *          gridToPixel(5, 3) returns {x: 275, y: 175}
 */
export function gridToPixel(c, r) {
  return { 
    x: c * TILE_SIZE + TILE_SIZE/2, 
    y: r * TILE_SIZE + TILE_SIZE/2 
  };
}

/**
 * Convert pixel coordinates to grid coordinates
 * @param {number} x - Pixel X coordinate
 * @param {number} y - Pixel Y coordinate
 * @returns {Object} Grid coordinates {c, r}
 * 
 * Example: pixelToGrid(275, 175) returns {c: 5, r: 3}
 */
export function pixelToGrid(x, y) {
  return { 
    c: Math.floor(x / TILE_SIZE), 
    r: Math.floor(y / TILE_SIZE) 
  };
}

/**
 * Check if a tile is part of the enemy path
 * @param {number} c - Column index
 * @param {number} r - Row index
 * @returns {boolean} True if tile is on path
 * 
 * This checks both horizontal and vertical path segments
 */
export function isPathTile(c, r) {
  // Loop through each segment of the path
  for (let i = 0; i < PATH.length - 1; i++) {
    const p1 = PATH[i];
    const p2 = PATH[i + 1];
    
    // Check horizontal segment (same column, rows vary)
    if (p1.c === p2.c && c === p1.c) {
      const minR = Math.min(p1.r, p2.r);
      const maxR = Math.max(p1.r, p2.r);
      if (r >= minR && r <= maxR) return true;
    }
    
    // Check vertical segment (same row, columns vary)
    if (p1.r === p2.r && r === p1.r) {
      const minC = Math.min(p1.c, p2.c);
      const maxC = Math.max(p1.c, p2.c);
      if (c >= minC && c <= maxC) return true;
    }
  }
  
  // Also check if it's the final endpoint
  return (c === PATH[PATH.length - 1].c && r === PATH[PATH.length - 1].r);
}

/**
 * Check if a tile is the spawn point (where enemies appear)
 * @param {number} c - Column index
 * @param {number} r - Row index
 * @returns {boolean} True if spawn tile
 */
export function isSpawnTile(c, r) {
  return c === PATH[0].c && r === PATH[0].r;
}

/**
 * Check if a tile is the base (where enemies reach the end)
 * @param {number} c - Column index
 * @param {number} r - Row index
 * @returns {boolean} True if base tile
 */
export function isBaseTile(c, r) {
  return c === PATH[PATH.length - 1].c && r === PATH[PATH.length - 1].r;
}

/**
 * Check if a tile is buildable (not path, spawn, base, or occupied)
 * @param {number} c - Column index
 * @param {number} r - Row index
 * @param {Array} towers - Array of existing towers
 * @returns {boolean} True if can build tower here
 */
export function isBuildable(c, r, towers) {
  // Check if within map boundaries
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
  
  // Check if tile is on enemy path
  if (isPathTile(c, r)) return false;
  
  // Check if tile is spawn point
  if (isSpawnTile(c, r)) return false;
  
  // Check if tile is base
  if (isBaseTile(c, r)) return false;
  
  // Check if another tower already occupies this tile
  for (const tower of towers) {
    if (tower.c === c && tower.r === r) return false;
  }
  
  return true;  // All checks passed - can build here!
}

/**
 * Precompute path segments for efficient enemy movement
 * This calculates the length of each path segment and cumulative distances
 * 
 * PATH_SEGMENTS: Array of objects containing segment data
 * PATH_TOTAL_LENGTH: Total length of the entire path in pixels
 */
export const PATH_SEGMENTS = [];
export let PATH_TOTAL_LENGTH = 0;

// Calculate each segment's length and cumulative starting distance
for (let i = 0; i < PATH.length - 1; i++) {
  const p1 = PATH[i];
  const p2 = PATH[i + 1];
  
  // Calculate distance between waypoints in pixels
  const dx = (p2.c - p1.c) * TILE_SIZE;
  const dy = (p2.r - p1.r) * TILE_SIZE;
  const len = Math.hypot(dx, dy);
  
  // Store segment data
  PATH_SEGMENTS.push({ 
    p1, p2,           // Start and end waypoints
    dx, dy,           // Delta x and y in pixels
    len,              // Length of this segment
    startDist: PATH_TOTAL_LENGTH  // Cumulative distance at start of segment
  });
  
  // Add this segment's length to total
  PATH_TOTAL_LENGTH += len;
}