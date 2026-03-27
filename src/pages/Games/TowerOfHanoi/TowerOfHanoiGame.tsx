import { useState, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid';
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid';
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';
import modelManager from '../../../components/ModelManager';
import Tutorial from './Tutorial';
import GameStatusPopup from './GameStatusPopup';

type GameStatus = 'paused' | 'playing' | 'won';

interface TowerState {
  pegs: number[][]; 
  diskCount: number;
  gameStatus: GameStatus;
}

const TowerOfHanoiGame = () => {
  const initialDiskCount = 3;
  const [state, setState] = useState<TowerState>(() => ({
    pegs: [
      Array.from({ length: initialDiskCount }, (_, i) => initialDiskCount - i),
      [],
      []
    ],
    diskCount: initialDiskCount,
    gameStatus: 'paused'
  }));

  const [showTutorial, setShowTutorial] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [hoveredPeg, setHoveredPeg] = useState<number | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const cubeGrid = useMemo(() => new CubeGrid(), []);
  const objectGrid = useMemo(() => new ObjectGrid(), []);
  const decorationGrid = useMemo(() => new DecorationGrid(), []);

  const clickableTypes = useMemo(() => ['tower', 'disc', 'peg'], []);

  const modelMap = {
    tower: '/Models/TowerOfHanoi/tower.gltf',
  } as const;

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

    const pegXs = [xOffset + 3, xOffset + 7, xOffset + 11];
    pegXs.forEach((px) => {
      decorationGrid.addDecoration(px, yOffset + 3, 0.5, 'peg', 'peg');
    });

    setUpdateTrigger(u => u + 1);
  }, [cubeGrid, decorationGrid]);

  useEffect(() => {
    objectGrid.clear();

    const pegPositions = [-4, 0, 4];
    const pegY = 1;
    // Distinct colors for the cylinders: Bronze, Silver, Gold
    const pegColors = [0xcd7f32, 0xa9a9a9, 0xffd700]; 

    // Draw peg bases using the NEW geometry property
    pegPositions.forEach((px, index) => {
      objectGrid.addObject(px, pegY, 0.6, 1.8, pegColors[index], 'peg', 1.0);
    });

    // Draw discs
    state.pegs.forEach((stack, pegIndex) => {
      for (let i = 0; i < stack.length; i++) {
        const size = stack[i]; 
        const px = pegPositions[pegIndex];
        const py = pegY;
        let z = 1 + i * 2.5; 

        if (size === 1 && i > 0) {
          const belowSize = stack[i - 1];
          if (belowSize === 2) z -= 0.5;
          else if (belowSize === 3) z += 0.2;
        } else if (i >= 2) {
          z -= 0.5;
        }
        
        const modelScale = 0.2 + (size / state.diskCount) * 0.5;
        const height = modelsLoaded ? 0.18 * modelScale : 0.18;
        const color = size === 1 ? 0xffdd88 : size === 2 ? 0xffb366 : 0xff7f7f;
        const typeName = modelsLoaded ? 'tower' : 'disc';
        
        objectGrid.addObject(px, py, z, height, color, typeName, modelScale);
      }
    });

    setUpdateTrigger(u => u + 1);
  }, [state, objectGrid, modelsLoaded]);

  const tryMove = useCallback((from: number, to: number) => {
    if (from === to) return false;
    const pegsCopy = state.pegs.map(s => [...s]);
    if (pegsCopy[from].length === 0) return false;
    
    const disk = pegsCopy[from][pegsCopy[from].length - 1]; 
    const destTop = pegsCopy[to][pegsCopy[to].length - 1];
    
    if (destTop !== undefined && destTop < disk) return false; 

    pegsCopy[from].pop();
    pegsCopy[to].push(disk);

    const newState: TowerState = {
      ...state,
      pegs: pegsCopy
    };

    const won = newState.pegs[2].length === state.diskCount;
    newState.gameStatus = won ? 'won' : 'playing';
    setState(newState);
    return true;
  }, [state]);

  const handleDragStart = useCallback((id: string, _data?: any): boolean => {
    if (state.gameStatus !== 'playing') return false;
    const parts = id.split('_');
    if (parts[0] !== 'disc' && parts[0] !== 'tower') return false;
    const x = parseFloat(parts[1]);
    const pegPositions = [-4, 0, 4];
    const pegIndex = pegPositions.findIndex(pos => Math.abs(pos - x) < 1);
    if (pegIndex === -1) return false;
    return state.pegs[pegIndex].length > 0;
  }, [state.gameStatus, state.pegs]);

  const handleDragEnd = useCallback((id: string, _data: any, dropPos: THREE.Vector3, dropTargetId: string | null) => {
    if (!id) {
        setUpdateTrigger(p => p + 1); 
        return;
    }
    const parts = id.split('_');
    const sourceX = parseFloat(parts[1]);
    const pegPositions = [-4, 0, 4];
    const sourcePegIndex = pegPositions.findIndex(pos => Math.abs(pos - sourceX) < 1);
    let destPegIndex = -1;

    if (dropTargetId) {
        const targetParts = dropTargetId.split('_');
        if (targetParts.length >= 2 && ['tower', 'disc', 'peg'].includes(targetParts[0])) {
            const targetX = parseFloat(targetParts[1]);
            destPegIndex = pegPositions.findIndex(pos => Math.abs(pos - targetX) < 1);
        }
    }

    if (destPegIndex === -1 && dropPos) {
        const dropX = dropPos.x;
        let minDist = 999;
        pegPositions.forEach((pos, index) => {
            const dist = Math.abs(dropX - pos);
            if (dist < 2.0 && dist < minDist) {
                minDist = dist;
                destPegIndex = index;
            }
        });
    }

    if (sourcePegIndex !== -1 && destPegIndex !== -1) {
        if (!tryMove(sourcePegIndex, destPegIndex)) setUpdateTrigger(p => p + 1);
    } else {
        setUpdateTrigger(p => p + 1);
    }
  }, [tryMove]);

  const handleObjectHover = useCallback((id: string | null) => {
    if (!id) {
      setHoveredPeg(null);
      return;
    }
    const parts = id.split('_');
    const x = parseFloat(parts[1]);
    const pegPositions = [-4, 0, 4];
    const pegIndex = pegPositions.findIndex(pos => Math.abs(pos - x) < 1);
    if (pegIndex !== -1) setHoveredPeg(pegIndex);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        e.preventDefault();
        setState({
          pegs: [Array.from({ length: state.diskCount }, (_, i) => state.diskCount - i), [], []],
          diskCount: state.diskCount,
          gameStatus: 'paused'
        });
        setShowTutorial(true);
      }
      if (e.key === 'p') {
        e.preventDefault();
        setState(prev => ({ ...prev, gameStatus: 'playing' }));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.diskCount]);

  useEffect(() => {
    if (showTutorial) setState(prev => ({ ...prev, gameStatus: 'paused' }));
  }, [showTutorial]);

  const startGame = () => {
    setShowTutorial(false);
    setState(prev => ({ ...prev, gameStatus: 'playing' }));
  };

  return (
    <div className="game-container">
      {showTutorial && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
          <Tutorial onStart={startGame} />
        </div>
      )}

      {(state.gameStatus === 'won' || state.gameStatus === 'paused') && !showTutorial && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
          <GameStatusPopup
            gameStatus={state.gameStatus}
            onClose={() => setState(prev => ({ ...prev, gameStatus: 'playing' }))}
            onRestart={() => {
              setState({
                pegs: [Array.from({ length: state.diskCount }, (_, i) => state.diskCount - i), [], []],
                diskCount: state.diskCount,
                gameStatus: 'paused'
              });
              setShowTutorial(true);
            }}
          />
        </div>
      )}

      <div style={{ position: 'absolute', top: 70, left: 20, zIndex: 100, color: 'white', background: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 6, fontSize: 14 }}>
        <div>Controls: Drag and drop disks between pegs</div>
        {hoveredPeg !== null && <div style={{ color: '#4ade80' }}>Hovering: Peg {hoveredPeg + 1}</div>}
        <div>Status: {state.gameStatus}</div>
        <div>Press R to reset</div>
      </div>

      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IsometricRenderer
          cubeGrid={cubeGrid}
          objectGrid={objectGrid}
          decorationGrid={decorationGrid}
          updateTrigger={updateTrigger}
          modelsLoaded={modelsLoaded}
          gameStatus={state.gameStatus}
          onObjectHover={handleObjectHover}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          clickableTypes={clickableTypes}
        />
      </div>
    </div>
  );
};

export default TowerOfHanoiGame;