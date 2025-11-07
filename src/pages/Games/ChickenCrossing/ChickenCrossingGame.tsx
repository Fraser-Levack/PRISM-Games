// import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer'
import ModelManager from '../../../components/ModelManager';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid'
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid'
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';
import { GameStateManager, type GameState } from './GameStateManager';
import GameStatusPopup from './GameStatusPopup';
import Tutorial from './Tutorial'; // <-- new import

const Chicken_Crossing = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    return GameStateManager.getDefaultState();
  });

  // NEW: show tutorial before play
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const previousStatusRef = useRef(gameState.gameStatus);

  const cubeGrid = useMemo(() => new CubeGrid(), []);
  const objectGrid = useMemo(() => new ObjectGrid(), []);
  const decorationGrid = useMemo(() => new DecorationGrid(), []);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Declare the model map for this game here so it's easy to change per-game
  const modelMap = {
    chicken: '/Models/chicken.gltf',
    fox: '/Models/fox.gltf',
    grain: '/Models/grain.gltf',
    farmer: '/Models/farmer.gltf', // <-- added farmer model for player
    farmer_hands_up: '/Models/farmer_hands_up.gltf', // <-- added carrying model
    tree: '/Models/tree.gltf',
    rocks: '/Models/rocks.gltf', 
    bush: '/Models/bush.gltf',
    fence: '/Models/fence.gltf',
    barn: '/Models/barn.gltf',
  } as const;

  // Track last player direction so we can rotate the farmer model to face movement
  const [playerDirection, setPlayerDirection] = useState<'left'|'right'|'up'|'down'>('right');
  const [playerCarry, setPlayerCarry] = useState<boolean>(false)


  // Preload models on mount for better UX. Renderer will fallback to spheres if not loaded.
  useEffect(() => {
    let mounted = true;
    ModelManager.loadAll(modelMap)
      .then(() => {
        if (mounted) setModelsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to preload models:', err);
        if (mounted) setModelsLoaded(false);
      });
    return () => { mounted = false; };
  }, []);

  // Show popup when game status changes
  useEffect(() => {
    const currentStatus = gameState.gameStatus;
    const previousStatus = previousStatusRef.current;
    
    console.log('Status check:', { currentStatus, previousStatus }); // Debug log
    
    if (currentStatus !== previousStatus && currentStatus !== 'playing') {
      console.log('Showing popup for status:', currentStatus); // Debug log
      setShowStatusPopup(true);
      
      // Update the ref to the new status
      previousStatusRef.current = currentStatus;
    }
    
    // Always update the ref to track the current status
    previousStatusRef.current = currentStatus;
  }, [gameState.gameStatus]);

  // Handle popup close
  const handleClosePopup = () => {
    setShowStatusPopup(false);
  };

  const setPlaying = () => {
    setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
    setShowStatusPopup(false);
  }

  // Handle restart from popup'
  const handleRestart = () => {
    const resetState = GameStateManager.resetToDefault();
    setGameState(resetState);
    setShowStatusPopup(false);
    setPlayerDirection('right'); // reset player facing
    // if user restarts from tutorial state show tutorial again
    setShowTutorial(true);
  };

  // NEW: start the game after tutorial
  const onStartTutorial = () => {
    setShowTutorial(false);
    // Resume playing
    setGameState(prev => ({ ...prev, gameStatus: 'playing', lossReason: null }));
    setShowStatusPopup(false);
  };

  // NEW: allow skipping tutorial (optional)
  const onSkipTutorial = () => {
    setShowTutorial(false);
    setGameState(prev => ({ ...prev, gameStatus: 'playing', lossReason: null }));
  };

  // Initialize the world (cubes) only once
  useEffect(() => {
    cubeGrid.clear();
    decorationGrid.clear(); // clear any previous decorations

    const gridWidth = 20;
    const gridHeight = 12;
    const riverStart = 3;
    const riverEnd = gridWidth - 4;
    const riverWidth = 6;

    const xOffset = -Math.floor(gridWidth / 2);
    const yOffset = -Math.floor(gridHeight / 2);

    // Fill the grid with ground first
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        cubeGrid.addCube(x + xOffset, y + yOffset, 0x5FC33B, 'ground');
      }
    }
    
    // Add a test tree decoration (one or more as needed)
    // DecorationGrid.addDecoration(x, y, z, type, modelKey)
    // z is vertical offset (0 places on top of ground)
    decorationGrid.addDecoration(xOffset + 2, yOffset + 1, 1, 'tree', 'tree');
    decorationGrid.addDecoration(xOffset + 5, yOffset + 1, 1, 'tree', 'tree');

    decorationGrid.addDecoration(xOffset + 17, yOffset + 11, 1, 'tree', 'tree');

    decorationGrid.addDecoration(xOffset + 7, yOffset + 3, 1.5, 'rocks', 'rocks');
    decorationGrid.addDecoration(xOffset + 7.4, yOffset + 1.8, 0.5, 'rocks', 'rocks');
    decorationGrid.addDecoration(xOffset + 1, yOffset + 1, 1.5, 'rocks', 'rocks',{ x: 0, y: -Math.PI / 2, z: 0 });
    decorationGrid.addDecoration(xOffset + 6, yOffset + 8, 0.5, 'rocks', 'rocks',{ x: 0, y: Math.PI / 2, z: 0 });
    decorationGrid.addDecoration(xOffset + 5.5, yOffset + 9, 0.098, 'rocks', 'rocks',{ x: 0, y: Math.PI, z: Math.PI });

    decorationGrid.addDecoration(xOffset + 18, yOffset + 11, 1.5, 'bush', 'bush');
    decorationGrid.addDecoration(xOffset + 5, yOffset + 8, 1.5, 'bush', 'bush');

    decorationGrid.addDecoration(xOffset + 1, yOffset + 11, 1.25, 'fence', 'fence');
    decorationGrid.addDecoration(xOffset + 0, yOffset + 9.5, 1.25, 'fence', 'fence',{ x: 0, y: Math.PI / 2, z: 0 });
    decorationGrid.addDecoration(xOffset + 0, yOffset + 7.25, 1.25, 'fence', 'fence',{ x: 0, y: Math.PI / 2, z: 0 });
    decorationGrid.addDecoration(xOffset + 0, yOffset + 5.0, 1.25, 'fence', 'fence',{ x: 0, y: Math.PI / 2, z: 0 });

    decorationGrid.addDecoration(xOffset + 12, yOffset + 11, 1.25, 'fence', 'fence');
    decorationGrid.addDecoration(xOffset + 14.25, yOffset + 11, 1.25, 'fence', 'fence');

    decorationGrid.addDecoration(xOffset + 17.25, yOffset + 2, 2.5, 'barn', 'barn');
    // River with meander
    for (let y = 0; y < gridHeight; y++) {
      const meander = Math.round(Math.sin(y / 2.5) * 2);
      const riverCenter = Math.floor((riverStart + riverEnd) / 2) + meander;
      for (let x = riverStart; x < riverEnd; x++) {
        if (Math.abs(x - riverCenter) <= Math.floor(riverWidth / 2)) {
          cubeGrid.removeCube(x + xOffset, y + yOffset);
          cubeGrid.addCube(x + xOffset, y + yOffset, 0x3399ff, 'water');
        }
      }
    }

    
    setUpdateTrigger(prev => prev + 1);
  }, [cubeGrid]);

  // Update object grid when game state changes
  useEffect(() => {
    objectGrid.clear();
    
    // Add player (use chosen model type derived above)
    objectGrid.addObject(
      gameState.player.position.x,
      gameState.player.position.y,
      gameState.player.position.z,
      gameState.player.height || 0.4,
      gameState.player.color,
      'player' // keep the object.type as 'player' and let the renderer use playerModelType prop
    );
    
    // Add all other objects
    gameState.objects.forEach(obj => {
      objectGrid.addObject(
        obj.position.x,
        obj.position.y,
        obj.position.z,
        obj.height || 0.4,
        obj.color,
        obj.type
      );
    });
    
    setUpdateTrigger(prev => prev + 1);
  }, [gameState, objectGrid]);

  // Handle player movement
  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const newState = GameStateManager.movePlayer(gameState, direction);
    
    // record facing direction for renderer
    setPlayerDirection(direction);

    // Check for collisions after movement
    const collision = GameStateManager.checkCollisions(newState);
    if (collision.collision) {
      // Handle collision logic here if needed
    }
    
    // Check win/loss conditions after movement
    const checkedState = GameStateManager.checkWinLossConditions(newState);
    
    setGameState(checkedState);
    // Handle collision logic here if needed
  }, [gameState]);
  
  // Keyboard event handling
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const code = event.code;

      // Space = pickup action (new)
      if (code === 'Space') {
        if (gameState.gameStatus !== 'playing') return;
        event.preventDefault();
        GameStateManager.handleEnter(gameState, (newState) => {
          const checkedState = GameStateManager.checkWinLossConditions(newState);
          setGameState(checkedState);
          setPlayerCarry(Boolean(checkedState.playerHolding));
        });
        return;
      }

      switch (key) {
        case 'p':
          event.preventDefault();
          setPlaying();
          break;
        case 'r':
          event.preventDefault();
          const resetState = GameStateManager.resetToDefault();
          setGameState(resetState);
          setShowStatusPopup(false); // Hide popup when resetting
          setPlayerDirection('right');
          break;
        case 'w':
        case 'arrowup':
          if (gameState.gameStatus !== 'playing') return;
          event.preventDefault();
          movePlayer('up');
          break;
        case 's':
        case 'arrowdown':
          if (gameState.gameStatus !== 'playing') return;
          event.preventDefault();
          movePlayer('down');
          break;
        case 'a':
        case 'arrowleft':
          if (gameState.gameStatus !== 'playing') return;
          event.preventDefault();
          movePlayer('left');
          break;
        case 'd':
        case 'arrowright':
          if (gameState.gameStatus !== 'playing') return;
          event.preventDefault();
          movePlayer('right');
          break;
        case 'enter':
          if (gameState.gameStatus !== 'playing') return;
          event.preventDefault();
          // Prefer a dedicated sail handler if it exists, otherwise fall back to the original handler
          if (typeof (GameStateManager as any).handleSail === 'function') {
            (GameStateManager as any).handleSail(gameState, (newState: any) => {
              const checkedState = GameStateManager.checkWinLossConditions(newState);
              setGameState(checkedState);
              setPlayerCarry(Boolean(checkedState.playerHolding));
            });
          } else {
            GameStateManager.handleEnter(gameState, (newState) => {
              const checkedState = GameStateManager.checkWinLossConditions(newState);
              setGameState(checkedState);
              setPlayerCarry(Boolean(checkedState.playerHolding));
            });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameState.gameStatus, gameState, setPlaying]);

  // Ensure the game is paused while tutorial is visible
  useEffect(() => {
    if (showTutorial) {
      setGameState(prev => ({ ...prev, gameStatus: 'paused' }));
    }
  }, [showTutorial]);

  return (
    <div className="game-container">
      {/* Tutorial overlay shown before first play */}
      {showTutorial && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          background: 'rgba(0,0,0,0.6)'
        }}>
          <Tutorial onStart={onStartTutorial} onSkip={onSkipTutorial} />
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '70px',
        left: '20px',
        zIndex: 100,
        color: 'white',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div>Controls: WASD or Arrow Keys</div>
        <div>Position: ({gameState.player.position.x}, {gameState.player.position.y})</div>
        <div>Status: {gameState.gameStatus}</div>
        <div>Press R to reset</div>
      </div>

      {/* Status Popup */}
      {showStatusPopup && gameState.gameStatus !== 'playing' && !showTutorial && (
        <GameStatusPopup
          gameStatus={gameState.gameStatus as 'won' | 'lost' | 'paused'}
          lossReason={gameState.lossReason ?? null}
          onClose={handleClosePopup}
          onRestart={handleRestart}
        />
      )}

      {/* Game content */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <IsometricRenderer 
          cubeGrid={cubeGrid} 
          objectGrid={objectGrid} 
          decorationGrid={decorationGrid}
          updateTrigger={updateTrigger}
          modelsLoaded={modelsLoaded}
          playerDirection={playerDirection}
          playerCarry={playerCarry}
          gameStatus={gameState.gameStatus}
        />
      </div>

      {/* CSS for popup animation */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default Chicken_Crossing;
