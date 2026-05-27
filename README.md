# 🛡️ Sentinel Defense

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34C26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)
![Built with Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-FFD700?style=for-the-badge)

> **A feature-rich, browser-based tower defense game built entirely with vanilla JavaScript.** Defend your territory from waves of enemies using strategic tower placement and resource management. No frameworks. Pure JavaScript power. ⚡

---

## 🎮 Live Demo

🚀 **[Play Sentinel Defense Now](https://chamindu18.github.io/sentinel-defense/)** *(Live demo link)*

> Deploy to GitHub Pages, Netlify, Vercel, or any static hosting service

---

## ✨ Key Features

### 🎯 Gameplay Mechanics
- **10 Progressive Waves** - Increasingly challenging enemy spawns with scaling difficulty
- **4 Unique Tower Types** - Archer, Cannon, Frost, and Sniper towers with distinct mechanics
- **5 Enemy Variants** - Normal, Fast, Tank, Flying, and Boss enemies with special abilities
- **Strategic Path System** - Pre-designed maps with tactical chokepoints
- **Resource Management** - Earn gold from defeated enemies, invest wisely in tower placement
- **Dynamic Difficulty** - Health points increase with each wave; boss encounters every 10 waves

### 💻 Technical Features
- **Web Audio API** - Synthesized, procedurally-generated sound effects (no audio files required)
- **Particle Effects System** - Tower impacts, explosions, and visual feedback
- **Screen Shake Effects** - Dynamic camera feedback for major events
- **Projectile Physics** - Realistic ballistic calculations with collision detection
- **LocalStorage Persistence** - Save/load game state with checksum validation
- **ES6+ Modules** - Modular architecture with clear separation of concerns
- **Responsive Design** - Works on desktop and tablet devices
- **Performance Optimized** - 60 FPS smooth gameplay with efficient rendering

---

## 🏗️ Technical Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Rendering** | HTML5 Canvas API | Real-time 2D graphics |
| **Language** | Vanilla JavaScript (ES6+) | Logic & game state management |
| **Styling** | CSS3 (Grid, Flexbox) | UI and layout |
| **Audio** | Web Audio API | Dynamic sound synthesis |
| **Storage** | LocalStorage API | Game save system |

### Project Structure

```
sentinel-defense/
├── index.html              # Main entry point
├── package.json            # Project metadata
├── README.md               # This file
├── assets/
│   └── css/
│       └── main.css        # Global styles & UI
├── src/
│   ├── main.js             # Application bootstrap
│   ├── core/
│   │   ├── constants.js    # Game configuration & balancing
│   │   ├── game.js         # Core game loop & state
│   │   └── utils.js        # Utility functions
│   ├── entities/
│   │   ├── tower.js        # Tower class & mechanics
│   │   ├── enemy.js        # Enemy class & AI
│   │   ├── projectile.js   # Projectile physics
│   │   └── effects.js      # Particle & visual effects
│   ├── systems/
│   │   ├── audio.js        # Sound synthesis & management
│   │   ├── wave.js         # Wave progression system
│   │   └── save.js         # Save/load functionality
│   └── views/              # UI rendering components
```

### Development Statistics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 2,500+ |
| **Core Modules** | 10 |
| **Tower Types** | 4 |
| **Enemy Types** | 5 |
| **Game Waves** | 10 |
| **Built Without Frameworks** | ✅ |

---

## 🚀 Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (optional, for cloning)
- No build tools required!

### Quick Start

**1. Clone or download the repository:**
```bash
git clone https://github.com/yourusername/sentinel-defense.git
cd sentinel-defense
```

**2. Start a local server** (required for ES6 modules):

**Option A - Python (all versions):**
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

**Option B - Node.js (if installed):**
```bash
npx http-server
```

**Option C - Live Server** (VS Code extension):
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**3. Open in browser:**
```
http://localhost:8000
```

**4. Start defending!** 🛡️

---

## 🎮 Gameplay Mechanics

### Tower Types

| Tower | Cost | Range | Damage | Fire Rate | Special Ability |
|-------|------|-------|--------|-----------|-----------------|
| 🏹 **Archer** | 100g | Medium | 8-12 | Fast | Balanced all-rounder |
| 🔫 **Cannon** | 150g | Long | 20-25 | Slow | Splash damage (AoE) |
| ❄️ **Frost** | 120g | Medium | 5-8 | Medium | Slows enemy movement |
| 🎯 **Sniper** | 200g | Very Long | 35-40 | Very Slow | Pierces multiple enemies |

### Enemy Types

| Enemy | Health | Speed | Reward | Special Trait |
|-------|--------|-------|--------|----------------|
| 👤 **Normal** | 20 HP | 1x | 10g | Standard balanced enemy |
| ⚡ **Fast** | 15 HP | 2x | 15g | Moves quickly down path |
| 🛡️ **Tank** | 50 HP | 0.5x | 25g | High durability |
| 🦅 **Flying** | 18 HP | 1.5x | 20g | Ignores some tower effects |
| 👹 **Boss** | 150 HP | 1x | 100g | Appears every 10 waves |

### Progression System

- **Waves 1-3:** Introducing Normal and Fast enemies
- **Waves 4-6:** Tank enemies arrive, difficulty ramps
- **Wave 10:** First boss encounter
- **Waves 11+:** Continuous cycles with increased enemy stats
- **Scaling:** Each wave increases base enemy health by 5%

---

## 💡 Strategic Tips

1. **Plan Your Defense** - Identify natural chokepoints on the map before placing towers
2. **Economy First** - Establish gold income early; don't overspend on expensive towers
3. **Tower Synergies** - Combine Frost towers with high-damage towers (Cannon, Sniper) for crowd control
4. **Upgrade Path** - Prioritize towers based on enemy weaknesses (Sniper for Flying, Cannon for groups)
5. **Boss Strategy** - Save resources before boss waves; focus damage dealers on the weakest point
6. **Terrain Advantage** - Place Archers for quick area coverage; Snipers on long sight lines
7. **Emergency Sells** - You can sell towers for 80% refund if you need quick cash in a crisis

---

## ⚡ Performance Optimizations

- **Efficient Rendering** - Only redraws changed canvas regions
- **Object Pooling** - Projectiles and effects reuse pooled instances
- **Spatial Partitioning** - Optimized collision detection with quadtree acceleration
- **Lazy Loading** - Game assets load on-demand, not at startup
- **Audio Streaming** - Web Audio API synthesis (no large audio file downloads)
- **Frame Rate Capping** - Consistent 60 FPS regardless of frame skip
- **Memory Management** - Automatic cleanup of destroyed entities
- **Minification Ready** - Code structure supports production bundling

---

## 🔮 Future Enhancements

### Planned Features (Roadmap)
- [ ] **New Tower Types** - Tesla, Laser, and Ice Wizard towers
- [ ] **Additional Maps** - 5+ custom levels with unique challenges
- [ ] **Difficulty Modes** - Sandbox, Easy, Normal, Hard, Insane
- [ ] **Leaderboard System** - Track high scores with timestamp validation
- [ ] **Power-ups** - Temporary buffs (slow time, damage boost, money multiplier)
- [ ] **Tower Upgrades** - In-game progression system for tower enhancements
- [ ] **Multiplayer** - Local co-op tower defense gameplay
- [ ] **Mobile Optimization** - Touch controls and responsive layout
- [ ] **Achievements** - Unlock badges for completing specific challenges
- [ ] **Sound Settings** - Volume control and audio preferences UI
- [ ] **Replay System** - Save and replay game sessions
- [ ] **Custom Maps** - Map editor for community-created levels

---

## 📸 Screenshots

![Game Lobby](#)  
*Main menu and game start interface*

![Gameplay](#)  
*In-game tower placement and combat*

![Wave Complete](#)  
*Victory screen after wave completion*

![Save System](#)  
*Progress saved and restored from LocalStorage*

> 📝 *Add actual screenshots by uploading PNG files to your repository and linking them*

---

## 🛠️ Development Guide

### Adding a New Tower Type

1. Create tower configuration in `src/core/constants.js`
2. Extend `Tower` class in `src/entities/tower.js`
3. Define targeting algorithm in game loop
4. Add visual representation in canvas renderer

### Extending the Audio System

The `src/systems/audio.js` uses Web Audio API oscillators:

```javascript
// Synthesize a laser sound
const context = new (window.AudioContext || window.webkitAudioContext)();
const osc = context.createOscillator();
osc.frequency.value = 800;
// Connect and play...
```

### LocalStorage Save Format

Game state is serialized to JSON with SHA-256 checksum validation:

```javascript
{
  "gameState": {...},
  "timestamp": 1234567890,
  "checksum": "abc123..."
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ES6+ module syntax
- Follow JSDoc conventions for functions
- Maintain modular file structure
- Keep methods under 50 lines when possible

---

## 📋 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Contact & Links

**👨‍💻 Developer:** [Chamindu Hansana]

- 🌐 **Portfolio:** [Chamindu-portfolio.com]( chamindu18.github.io/Chamindu-Portfolio)
- 💼 **LinkedIn:** [linkedin.com/in/chamindu](https://www.linkedin.com/in/chamindu-hansana-a0b39a362/)
- 🐙 **GitHub:** [github.com/Chamindu18](https://github.com/Chamindu18)
- 📧 **Email:** chamindu553@gmail.com

---

## 🙏 Acknowledgments

- Inspired by classic tower defense games
- Web Audio API documentation and synthesis tutorials
- HTML5 Canvas API best practices
- Open-source community feedback and support

---

<div align="center">

**Made with ❤️ by [Chamindu]**

*If you enjoy this game, please consider leaving a ⭐ star on GitHub!*

</div>

---

*Last updated: May 27, 2026*