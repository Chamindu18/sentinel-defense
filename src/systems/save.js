/**
 * SAVE.JS
 * Save game manager using localStorage with checksum validation.
 * Prevents save file corruption and tampering.
 */

export class SaveManager {
  constructor() {
    // Storage keys for save data and checksum
    this.key = 'sentinel_defense_save_v1';
    this.checksumKey = 'sentinel_defense_checksum_v1';
  }

  /**
   * Generate checksum for data validation
   * Creates a simple hash from the JSON string
   * @param {Object} data - Game data object
   * @returns {string} Hexadecimal checksum
   */
  generateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    
    // Simple hash algorithm
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  /**
   * Validate loaded save data structure
   * Checks all required fields and their types
   * @param {Object} data - Loaded data object
   * @returns {boolean} True if valid
   */
  validate(data) {
    // Basic structure check
    if (!data || typeof data !== 'object') return false;
    
    // Validate player stats
    if (typeof data.coins !== 'number' || data.coins < 0 || data.coins > 999999) return false;
    if (typeof data.health !== 'number' || data.health < 0 || data.health > 100) return false;
    if (typeof data.wave !== 'number' || data.wave < 0 || data.wave > 10) return false;
    if (typeof data.score !== 'number' || data.score < 0) return false;
    
    // Validate towers array
    if (!Array.isArray(data.towers)) return false;
    
    // Validate each tower's properties
    for (const t of data.towers) {
      if (!t || typeof t.c !== 'number' || typeof t.r !== 'number') return false;
      if (t.c < 0 || t.c >= 20 || t.r < 0 || t.r >= 12) return false;
      if (!['archer', 'cannon', 'frost', 'sniper'].includes(t.type)) return false;
      if (typeof t.level !== 'number' || t.level < 1 || t.level > 3) return false;
    }
    
    return true;  // All validation passed
  }

  /**
   * Save game data to localStorage
   * @param {Object} data - Game data to save
   * @returns {boolean} True if successful
   */
  save(data) {
    try {
      // Prepare payload with timestamp
      const payload = {
        coins: data.coins,
        health: data.health,
        wave: data.wave,
        score: data.score,
        towers: data.towers.map(t => ({ 
          c: t.c, 
          r: t.r, 
          type: t.type, 
          level: t.level 
        })),
        timestamp: Date.now()
      };
      
      // Save both data and checksum
      localStorage.setItem(this.key, JSON.stringify(payload));
      localStorage.setItem(this.checksumKey, this.generateChecksum(payload));
      
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  /**
   * Load game data from localStorage
   * @returns {Object|null} Loaded data or null if invalid/not found
   */
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      const checksum = localStorage.getItem(this.checksumKey);
      
      // No save file exists
      if (!raw || !checksum) return null;
      
      // Parse JSON data
      const data = JSON.parse(raw);
      
      // Validate data structure
      if (!this.validate(data)) return null;
      
      // Verify checksum (prevent tampering)
      if (this.generateChecksum(data) !== checksum) return null;
      
      return data;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  /**
   * Check if save file exists
   * @returns {boolean} True if save exists
   */
  exists() {
    return localStorage.getItem(this.key) !== null;
  }

  /**
   * Clear saved data (start fresh)
   */
  clear() {
    localStorage.removeItem(this.key);
    localStorage.removeItem(this.checksumKey);
  }
}