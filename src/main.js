/**
 * MAIN.JS
 * Entry point for Sentinel Defense game.
 * Initializes the game when the page loads.
 */

import { Game } from './core/game.js';

/**
 * Wait for the DOM to be fully loaded before starting the game
 * This ensures all HTML elements are available
 */
document.addEventListener('DOMContentLoaded', () => {
  // Get reference to the canvas element
  const canvas = document.getElementById('gameCanvas');
  
  // Check if canvas exists (should always exist in our HTML)
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  // Create and initialize the game
  const game = new Game(canvas);
  game.init();
  
  // Log that game started successfully
  console.log('Sentinel Defense - Game Started');
});