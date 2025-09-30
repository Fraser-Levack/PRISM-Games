import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer'
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid'
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid'
import { GameStateManager, type GameState } from './GameStateManager';

const Chicken_Crossing = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = GameStateManager.loadState();
    return savedState || GameStateManager.getDefaultState();
  });

  const [updateTrigger, setUpdateTrigger] = useState(0);

  const cubeGrid = useMemo(() => new CubeGrid(), []);
  const objectGrid = useMemo(() => new ObjectGrid(), []);

  // Initialize the world (cubes) only once
  useEffect(() => {
    cubeGrid.clear();

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
        cubeGrid.addCube(x + xOffset, y + yOffset, 0x00ff00, 'ground');
      }
    }

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
    
    // Add player
    objectGrid.addObject(
      gameState.player.position.x,
      gameState.player.position.y,
      gameState.player.position.z,
      gameState.player.height || 0.4,
      gameState.player.color,
      gameState.player.type
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
    
    // Check for collisions after movement
    const collision = GameStateManager.checkCollisions(newState);
    if (collision.collision) {
      // Handle collision logic here if needed
    }
    
    setGameState(newState);
  }, [gameState]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameStatus !== 'playing') return;

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          event.preventDefault();
          movePlayer('up');
          break;
        case 's':
        case 'arrowdown':
          event.preventDefault();
          movePlayer('down');
          break;
        case 'a':
        case 'arrowleft':
          event.preventDefault();
          movePlayer('left');
          break;
        case 'd':
        case 'arrowright':
          event.preventDefault();
          movePlayer('right');
          break;
        case 'r':
          event.preventDefault();
          setGameState(GameStateManager.resetToDefault());
          break;
        case 'enter':
          event.preventDefault();
          GameStateManager.handleEnter(gameState, setGameState);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameState.gameStatus, gameState]);

  return (
    <div className="game-container">
      {/* Back to games button */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 100 
      }}>
        <Link 
          to="/games" 
          className="nav-link"
          style={{ 
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          ← Back to Games
        </Link>
      </div>
      
      {/* Game UI */}
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
        <div>Score: {gameState.score}</div>
        <div>Status: {gameState.gameStatus}</div>
        <div>Press R to reset</div>
      </div>

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
          updateTrigger={updateTrigger}
        />
      </div>
    </div>
  )
}

export default Chicken_Crossing
