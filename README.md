# PRISM Games

PRISM Games is an interactive, web-based educational platform designed to teach the principles of probabilistic model checking and formal verification. Built with React 19, TypeScript, Vite, and Three.js, the project abstracts complex mathematical structures (like Labelled Transition Systems and Markov Decision Processes) into intuitive 3D isometric puzzles.

This repository was created as an Honours Individual Project dissertation for a fourth-year Computer Science module. It serves as a playable educational tool, demonstrating how ludic contexts can lower the barrier to entry for formal methods.

## Key Goals
- **Educational Scaffolding:** Guide users through a "Play -> Watch -> Read" pipeline, transitioning from intuitive gameplay to formal PRISM syntax.
- **Interactive Formal Verification:** Demonstrate model checking in action by allowing users to play against mathematically optimal AI strategies synthesized directly from the PRISM model checker.
- **Extensible 3D Framework:** Provide a reusable isometric renderer and grid system so new games, rules, and assets can be added easily.

## Highlights
- **React 19 + TypeScript (Strict):** For predictable UI, robust state management, and component architecture.
- **Three.js Isometric Renderer:** A unified 3D orthographic rendering pipeline with custom post-processing (VibranceShader) for a modern, glass-like aesthetic.
- **PRISM Strategy Engine:** A dedicated TypeScript engine (`StrategyEngine`) that parses exported PRISM policy files into lookup tables for real-time optimal decision-making.

## Included Games / Modules
The platform scales in mathematical complexity through three distinct modules:
1. **Chicken Crossing Problem:** Introduces basic deterministic state spaces, safety properties, and simple reachability goals.
2. **Tower of Hanoi:** Introduces model scalability, module renaming (templates), and constraints within deterministic models.
3. **Shut the Box:** Acts as the capstone, introducing Markov Decision Processes (MDPs), probabilistic transitions, and optimal reward strategies.

---

## Quickstart

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm (or yarn)

### Install & Run
```bash
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

---

## Project Structure (Key Directories)
- `src/`
  - `pages/`
    - `Games/` — Contains individual game folders (`ChickenCrossing`, `TowerOfHanoi`, `ShutTheBox`), housing game entry UIs, state managers, and status popups.
    - `Solutions/` — The dynamic educational explanation pages mapping gameplay to PRISM code.
  - `components/`
    - `isometricGrid/` — The core 3D rendering pipeline (`IsometricRenderer`, `IsometricInputHandler`).
  - `utils/`
    - `ModelManager.ts` — Centralized GLTF model loading and caching.
    - `StrategyEngine.ts` — Decodes PRISM text file exports into playable AI lookup tables.
- `public/Models/` — GLTF 3D assets (`chicken.gltf`, `disks.gltf`, etc.) and PRISM strategy `.txt` files.

## Gameplay & Controls
- **Unified Perspective:** All games share a consistent 3D isometric camera.
- **Contextual Input:** Controls mimic natural interactions (e.g., WASD/Arrow keys for grid movement in Chicken Crossing; drag-and-drop mouse controls for Tower of Hanoi).
- **Fallback Rendering:** The renderer will fallback to primitive geometric shapes if GLTF models fail to load from the `public/Models` directory.

## Development Notes
- **State Management:** Use the per-game `GameStateManager` to encapsulate movement, collisions, and win/loss checks, keeping React components strictly for UI.
- **Adding Strategies:** To add new optimal AI behaviors, export the strategy from the PRISM GUI as a plain text file and load it via the `StrategyEngine`.
- **Educational Content:** Solution pages utilize the `IntersectionObserver` API to dynamically highlight sidebar navigation as users scroll through PRISM code explanations.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact / Author
- **Author:** Fraser W. Levack
- **Supervisor:** Professor Gethin Norman