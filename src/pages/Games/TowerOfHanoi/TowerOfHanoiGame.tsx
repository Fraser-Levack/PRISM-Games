import { useState, useEffect, useMemo, useCallback } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid';
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid';
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';

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

  const cubeGrid = useMemo(() => new CubeGrid(), []);
  const objectGrid = useMemo(() => new ObjectGrid(), []);
  const decorationGrid = useMemo(() => new DecorationGrid(), []);

  // No models available yet — renderer should fallback to simple shapes
  const modelsLoaded = false;

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
        const z = 1 + i * 0.22;
        const height = 0.18;
        // color by size
        const color = size === 1 ? 0xffdd88 : size === 2 ? 0xffb366 : 0xff7f7f;
        // Use type 'disc' so the renderer uses a simple fallback shape if no model
        objectGrid.addObject(px, py, z, height, color, 'disc');
      }
    });

    setUpdateTrigger(u => u + 1);
  }, [state, objectGrid]);

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
        <div>Controls: Press 1/2/3 to select pegs (source then destination)</div>
        <div>Selected peg: {selectedPeg === null ? 'none' : (selectedPeg + 1)}</div>
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
        />
      </div>
    </div>
  );
};

export default TowerOfHanoiGame;