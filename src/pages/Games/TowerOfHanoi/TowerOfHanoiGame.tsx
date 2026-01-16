import { useState, useEffect, useMemo, useCallback } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid';
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid';
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';
import modelManager from '../../../components/ModelManager';

type GameStatus = 'paused' | 'playing' | 'won';

interface TowerState {
  pegs: number[][]; // each peg is array of disk sizes, bottom -> top
  diskCount: number;
  gameStatus: GameStatus;
}

const TowerOfHanoiGame = () => {
  const initialDiskCount = 3;
  const [state, setState] = useState<TowerState>(() => ({
    pegs: [
      Array.from({ length: initialDiskCount }, (_, i) => initialDiskCount - i), // [3,2,1]
      [],
      []
    ],
    diskCount: initialDiskCount,
    gameStatus: 'paused'
  }));

  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [hoveredPeg, setHoveredPeg] = useState<number | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);

  const cubeGrid = useMemo(() => new CubeGrid(), []);
  const objectGrid = useMemo(() => new ObjectGrid(), []);
  const decorationGrid = useMemo(() => new DecorationGrid(), []);

  // Define which object types are clickable
  const clickableTypes = useMemo(() => ['tower', 'disc', 'peg'], []);

  // Declare the model map for this game here so it's easy to change per-game
  const modelMap = {
    tower: '/Models/tower.gltf',
  } as const;


  // Preload models on mount for better UX. Renderer will fallback to spheres if not loaded.
  useEffect(() => {
    let mounted = true;
    modelManager.loadAll(modelMap)
      .then(() => {
        if (mounted) setModelsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to preload models:', err);
        if (mounted) setModelsLoaded(false);
      });
    return () => { mounted = false; };
  }, []);


  // Initialize ground + simple peg decorations once
  useEffect(() => {
    cubeGrid.clear();
    decorationGrid.clear();

    const gridWidth = 14;
    const gridHeight = 8;
    const xOffset = -Math.floor(gridWidth / 2);
    const yOffset = -Math.floor(gridHeight / 2);

    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        cubeGrid.addCube(x + xOffset, y + yOffset, 0x6A8B3A, 'ground');
      }
    }

    // Place 3 peg decorations (visual only)
    const pegXs = [xOffset + 3, xOffset + 7, xOffset + 11];
    pegXs.forEach((px) => {
      decorationGrid.addDecoration(px, yOffset + 3, 0.5, 'peg', 'peg');
    });

    setUpdateTrigger(u => u + 1);
  }, [cubeGrid, decorationGrid]);

  // Populate object grid from local pegs state
  useEffect(() => {
    objectGrid.clear();

    const pegPositions = [-4, 0, 4]; // visual positions (match decorations)
    const pegY = 1;

    // optionally draw peg bases as objects
    pegPositions.forEach((px) => {
      objectGrid.addObject(px, pegY, 0.6, 0.8, 0x8B5A2B, 'peg');
    });

    // Draw discs stacked on pegs (bottom -> top)
    state.pegs.forEach((stack, pegIndex) => {
      for (let i = 0; i < stack.length; i++) {
        const size = stack[i]; // 1..N where larger value = larger disk
        const px = pegPositions[pegIndex];
        const py = pegY;
        let z = 1 + i * 2.5; // stack upwards
        // If this is the smallest disk, adjust its height depending on the disk directly beneath it.
        // stack is bottom -> top, so the disk below the current one is at index i-1.
        if (size === 1 && i > 0) {
          const belowSize = stack[i - 1];
          if (belowSize === 2) {
            // smallest on top of middle -> slightly lower
            z -= 0.5;
          } else if (belowSize === 3) {
            // smallest on top of large -> slightly higher
            z += 0.2;
          }
        } else if (i >= 2) {
          // fallback adjustment for tall stacks
          z -= 0.5;
        }
        // If model loaded, scale model down to 0.8x; otherwise use previous simple height
        const modelScale = 0.2 + (size / state.diskCount) * 0.5;
        const height = modelsLoaded ? 0.18 * modelScale : 0.18;
        // color by size (kept for fallback rendering / material tint)
        const color = size === 1 ? 0xffdd88 : size === 2 ? 0xffb366 : 0xff7f7f;
        // Use type 'tower' when model is available, otherwise fallback to 'disc'
        const typeName = modelsLoaded ? 'tower' : 'disc';
        objectGrid.addObject(px, py, z, height, color, typeName, modelScale);
      }
    });32

    setUpdateTrigger(u => u + 1);
  }, [state, objectGrid, modelsLoaded]);

  // Move logic: from -> to (indices 0..2)
  const tryMove = useCallback((from: number, to: number) => {
    if (from === to) return;
    const pegsCopy = state.pegs.map(s => [...s]);
    if (pegsCopy[from].length === 0) return;
    const disk = pegsCopy[from].pop() as number;
    const destTop = pegsCopy[to][pegsCopy[to].length - 1];
    if (destTop !== undefined && destTop < disk) {
      // illegal move, put it back
      pegsCopy[from].push(disk);
      return;
    }
    pegsCopy[to].push(disk);

    const newState: TowerState = {
      ...state,
      pegs: pegsCopy
    };

    // check win: all disks moved to last peg
    const won = newState.pegs[2].length === state.diskCount;
    newState.gameStatus = won ? 'won' : 'playing';
    setState(newState);
  }, [state]);

  // Selection handler (source then destination). Supports keyboard 1/2/3
  const selectPeg = useCallback((index: number) => {
    if (selectedPeg === null) {
      setSelectedPeg(index);
      return;
    }
    tryMove(selectedPeg, index);
    setSelectedPeg(null);
  }, [selectedPeg, tryMove]);

  // Handler for object clicks (mouse control)
  const handleObjectClick = useCallback((id: string, _data?: any) => {
    if (state.gameStatus !== 'playing') return;
    
    // Parse the object ID to determine which peg was clicked
    // ID format: "tower_x_y_z" or "disc_x_y_z" or "peg_x_y_z" where x corresponds to peg position
    const parts = id.split('_');
    
    if ((parts[0] === 'tower' || parts[0] === 'disc' || parts[0] === 'peg') && parts.length >= 4) {
      const x = parseFloat(parts[1]);
      // Map x position to peg index
      const pegPositions = [-4, 0, 4];
      const pegIndex = pegPositions.findIndex(pos => Math.abs(pos - x) < 1);
      
      if (pegIndex !== -1) {
        selectPeg(pegIndex);
      }
    }
  }, [state.gameStatus, selectPeg]);

  // Handler for object hover (mouse feedback)
  const handleObjectHover = useCallback((id: string | null) => {
    if (!id) {
      setHoveredPeg(null);
      return;
    }
    
    const parts = id.split('_');
    if ((parts[0] === 'tower' || parts[0] === 'disc' || parts[0] === 'peg') && parts.length >= 4) {
      const x = parseFloat(parts[1]);
      const pegPositions = [-4, 0, 4];
      const pegIndex = pegPositions.findIndex(pos => Math.abs(pos - x) < 1);
      
      if (pegIndex !== -1) {
        setHoveredPeg(pegIndex);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        e.preventDefault();
        // reset
        setState({
          pegs: [
            Array.from({ length: state.diskCount }, (_, i) => state.diskCount - i),
            [],
            []
          ],
          diskCount: state.diskCount,
          gameStatus: 'paused'
        });
        setSelectedPeg(null);
        setShowTutorial(true);
        return;
      }
      if (e.key === 'p') {
        e.preventDefault();
        setState(prev => ({ ...prev, gameStatus: 'playing' }));
        return;
      }
      if (['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        selectPeg(parseInt(e.key, 10) - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectPeg, state.diskCount]);

  // Pause while tutorial visible
  useEffect(() => {
    if (showTutorial) setState(prev => ({ ...prev, gameStatus: 'paused' }));
  }, [showTutorial]);

  // Simple UI actions
  const startGame = () => {
    setShowTutorial(false);
    setState(prev => ({ ...prev, gameStatus: 'playing' }));
  };

  return (
    <div className="game-container">
      {showTutorial && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)'
        }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 520 }}>
              <button onClick={startGame}>Start</button>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute', top: 70, left: 20, zIndex: 100, color: 'white',
        background: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 6, fontSize: 14
      }}>
        <div>Controls: Click on discs or press 1/2/3 to select pegs</div>
        <div>Select source peg, then destination peg</div>
        <div>Selected peg: {selectedPeg === null ? 'none' : (selectedPeg + 1)}</div>
        {hoveredPeg !== null && <div style={{ color: '#4ade80' }}>Hovering: Peg {hoveredPeg + 1}</div>}
        <div>Status: {state.gameStatus}</div>
        <div>Press R to reset</div>
      </div>

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
          playerDirection={'right'} // not used here but renderer prop required
          playerCarry={false}
          gameStatus={state.gameStatus}
          onObjectClick={handleObjectClick}
          onObjectHover={handleObjectHover}
          clickableTypes={clickableTypes}
        />
      </div>
    </div>
  );
};

export default TowerOfHanoiGame;