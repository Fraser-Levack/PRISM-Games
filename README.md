# PRISM Games

PRISM Games is a small collection of web-based isometric mini-games built with React, TypeScript and Vite. The project focuses on a simple, extensible game framework with an isometric renderer, model/asset manager and per-game state managers so new games can be added quickly.

This repository was created as an individual project for a fourth-year Computer Science module and is intended as both a playable demo and a foundation for further experimentation.

Key goals
- Provide a reusable isometric renderer and grid system for tile/object/decorations.
- Demonstrate model loading and lightweight 3D usage in the browser.
- Keep code structured so new game rules and assets are simple to add.

Highlights
- React 19 + TypeScript (strict) for predictable UI and state management
- Vite for fast development and hot-reload
- Small, modular architecture:
  - Isometric renderer (three.js or canvas-backed rendering)
  - ModelManager for GLTF models
  - Per-game GameStateManager for rules and transitions

Projects / Games
- Chicken Crossing — a small puzzle/strategy game (src/pages/Games/ChickenCrossing). Rules and input handling live in the game's GameStateManager and UI components.

Quickstart

Prerequisites
- Node.js 16+ (LTS recommended)
- npm (or yarn)

Install
```bash
npm install
```

Run development server
```bash
npm run dev
```
Open http://localhost:5173/

Build for production
```bash
npm run build
npm run preview
```

Project structure (important files)
- src/
  - pages/
    - Games/
      - ChickenCrossing/ChickenCrossingGame.tsx — game entry + UI
      - ChickenCrossing/GameStateManager.ts — game rules & state transitions
      - ChickenCrossing/GameStatusPopup.tsx — end/paused UI
    - Home.tsx, Credits.tsx — app pages
  - components/
    - isometricGrid/ — CubeGrid, ObjectGrid, DecorationGrid, IsometricRenderer
    - ModelManager.ts — centralized model loading & caching
  - App.tsx, main.tsx — router and app bootstrap
  - styles/ — CSS modules / global styles
- public/Models/ — GLTF model assets (chicken.gltf, farmer.gltf, etc.)
- package.json — scripts and dependencies
- README.md — this file

Gameplay & controls (example: Chicken Crossing)
- Controls: WASD or arrow keys to move
- Enter to interact / pick up / drop where implemented
- R to reset, P to resume playing from paused
- The renderer will fallback to primitive shapes if GLTF models fail to load; put models in public/Models for the game to load.

Development notes
- Models: place GLTF files under public/Models and reference them by filename in each game's modelMap.
- State: use the per-game GameStateManager to encapsulate movement, collisions and win/loss checks.
- Renderer: updateTrigger prop is used to inform IsometricRenderer to re-render when the logical grids change.
- TypeScript: project uses strict settings — add types for new components and state shapes.

Testing and debugging
- Use the browser console to view debug logs from GameStateManager and model loading.
- Renderer fallbacks make it easy to test without all assets present.
- Add unit tests for pure game logic in GameStateManager (recommended using vitest or jest configured for Vite + TS).

Contributing
- Fork → feature branch → implement → run dev & lint → open PR
- Keep game logic modular; avoid UI code leaking into GameStateManager.
- Add unit tests for new game rules or utility functions.

Troubleshooting
- Blank screen: check console for model load errors and ensure public/Models paths exist.
- Keys not working: ensure game canvas has focus; global key handlers are registered on window.

Contact / author
- Repository owner: Fraser Levack
