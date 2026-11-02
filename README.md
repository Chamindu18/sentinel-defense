# Sentinel Defense

**A browser-based tower defense game built with vanilla JavaScript and the HTML5 Canvas API.**
Place towers, manage gold and survive 10 waves of enemies. No frameworks, no build step.

[![Play](https://img.shields.io/badge/▶_Play_Now-chamindu18.github.io-ff3333?style=flat-square)](https://chamindu18.github.io/sentinel-defense/)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> Solo project · 2026

<!-- OPTIONAL BUT RECOMMENDED: a short gameplay GIF or screenshot here makes this README much stronger, e.g. ![Gameplay](docs/gameplay.gif) -->

---

## Features

- **10 waves** of increasing difficulty, with enemy health scaling each wave
- **4 tower types:** Archer, Cannon (area damage), Frost (slows enemies) and Sniper (long range, high damage)
- **5 enemy types:** Normal, Fast, Tank, Flying and Boss
- **Gold economy:** earn gold from kills and decide what to build
- **Procedural audio:** all sound effects are synthesized with the Web Audio API, so there are no audio files
- **Visual effects:** particles, explosions and screen shake
- **Save and load:** progress is stored in LocalStorage with structure and checksum validation
- **Game states:** pause, victory and defeat

<!-- VERIFY against the code before publishing: (1) Boss: your old README said "every 10 waves" and also "Wave 10 first boss" and "waves 11+", which contradicts a 10-wave game. State exactly when the boss appears. (2) The old README mentioned selling towers for an 80% refund and "upgrade paths", but its own roadmap lists tower upgrades as future work. Add "sell towers" here only if it exists. (3) Sniper "pierces multiple enemies" and Flying "ignores some tower effects": keep only if true. -->

---

## Towers and enemies

| Tower | Role |
|---|---|
| Archer | Fast, balanced all-rounder |
| Cannon | Slow, long range, splash (area) damage |
| Frost | Slows enemy movement |
| Sniper | Very long range, high single-target damage |

| Enemy | Trait |
|---|---|
| Normal | Standard balanced enemy |
| Fast | Moves quickly along the path |
| Tank | High health, slow |
| Flying | Fast, mid-health |
| Boss | Very high health, large reward |

<!-- VERIFY: exact costs, damage, health and speed values live in src/core/constants.js. I removed the numbers from the old tables because they may not match the code. Add a full stats table only if you copy the values from constants.js. -->

---

## How it works

- **Game loop:** a `requestAnimationFrame` loop updates and renders the game state every frame.
- **Rendering:** all graphics are drawn on an HTML5 Canvas.
- **Enemy movement:** enemies follow a waypoint path; towers pick targets with configurable targeting modes.
- **Combat:** projectiles, collision detection, area-of-effect damage and status effects (slow).
- **Persistence:** the save system serializes game state to JSON with a checksum, and rejects saves that fail validation.
- **Structure:** modular ES6 code with a clear separation between core logic, entities and systems.

<!-- VERIFY (important): the old README also claimed object pooling, quadtree spatial partitioning, dirty-region redrawing and lazy loading. Search the code for each. If it does not exist, leave it out: an interviewer may ask you to show it. Also confirm what the checksum is (a simple hash or SHA-256); the old README said SHA-256. -->

### Project structure

```
sentinel-defense/
├── index.html
├── assets/css/main.css
└── src/
    ├── main.js              # bootstrap
    ├── core/                # constants, game loop and state, utils
    ├── entities/            # tower, enemy, projectile, effects
    ├── systems/             # audio, waves, save/load
    └── views/               # UI rendering
```

---

## Run locally

ES modules need a local web server (opening `index.html` directly will not work).

```bash
git clone https://github.com/Chamindu18/sentinel-defense.git
cd sentinel-defense
python -m http.server 8000     # or: npx http-server
```

Then open `http://localhost:8000`.

---

## Roadmap

- More tower types and maps
- Tower upgrades and difficulty modes
- Leaderboard and achievements
- Touch controls and mobile layout
- Volume and audio settings

---

## Author

**Chamindu Hansana** · [Portfolio](https://chamindu18.github.io/Chamindu-Portfolio/) · [LinkedIn](https://www.linkedin.com/in/chamindu-hansana-a0b39a362/) · chamindu553@gmail.com

Released under the [MIT License](LICENSE).
