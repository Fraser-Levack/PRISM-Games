import { useState, useEffect, useMemo, useCallback } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid';
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid';
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';
import ModelManager from '../../../components/ModelManager';
import Tutorial from './Tutorial';
import GameStatusPopup from './GameStatusPopup';

// Types
type PinState = 'OPEN' | 'SELECTED' | 'SHUT';
type GamePhase = 'ROLL' | 'SELECT' | 'GAME_OVER';

const ShutTheBoxGame = () => {
    // --- Game State ---
    const [pins, setPins] = useState<PinState[]>(Array(9).fill('OPEN'));
    const [dice, setDice] = useState<number[]>([1, 1]); 
    const [phase, setPhase] = useState<GamePhase>('ROLL');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'paused'>('paused');
    const [message, setMessage] = useState<string>("Click the Dice to start!");
    
    // Animation State
    const [isRolling, setIsRolling] = useState(false);
    const [displayDice, setDisplayDice] = useState<number[]>([1, 1]); // Visual dice values (jitter during roll)
    const [diceRotationOffset, setDiceRotationOffset] = useState({ x: 0, z: 0 }); // Extra rotation for animation

    const [showTutorial, setShowTutorial] = useState(true);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Grids
    const cubeGrid = useMemo(() => new CubeGrid(), []);
    const objectGrid = useMemo(() => new ObjectGrid(), []);
    const decorationGrid = useMemo(() => new DecorationGrid(), []);

    // --- Constants ---
    const PIN_SPACING = 1.25; 
    const BOX_WIDTH = 15;
    const BOX_DEPTH = 9;

    // --- Model Loading ---
    useEffect(() => {
        let mounted = true;

        const modelMap: Record<string, string> = {
            'dice': '/Models/ShutTheBox/dice.gltf',
        };

        // Add Pins (1-9)
        for (let i = 1; i <= 9; i++) {
            modelMap[`pin_${i}`] = `/Models/ShutTheBox/pin_${i}.gltf`;
            modelMap[`pin_select_${i}`] = `/Models/ShutTheBox/pin_selection_models/pin_${i}.gltf`;
        }

        ModelManager.loadAll(modelMap)
            .then(() => {
                if (mounted) setModelsLoaded(true);
            })
            .catch((err) => {
                console.error('Failed to load ShutTheBox models:', err);
            });

        return () => { mounted = false; };
    }, []);

    // --- Helper Logic ---

    const diceSum = dice[0] + dice[1];
    const selectedSum = pins.reduce((acc, status, index) => {
        return status === 'SELECTED' ? acc + (index + 1) : acc;
    }, 0);

    // Check if sum is possible (recursive)
    const canMakeSum = (target: number, availableNumbers: number[]): boolean => {
        if (target === 0) return true;
        if (target < 0 || availableNumbers.length === 0) return false;
        const num = availableNumbers[0];
        const remaining = availableNumbers.slice(1);
        return canMakeSum(target - num, remaining) || canMakeSum(target, remaining);
    };

    // --- Animation & Roll Logic ---

    const rollDice = useCallback(() => {
        if (gameStatus !== 'playing' || isRolling) return;
        
        setIsRolling(true);
        setMessage("Rolling...");

        // Determine final result immediately
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const finalDice = [d1, d2];
        const total = d1 + d2;

        setDice(finalDice);

        // Start Animation Loop
        let frame = 0;
        const maxFrames = 30; // approx 0.5 seconds at 60fps
        
        const animateRoll = () => {
            frame++;
            if (frame < maxFrames) {
                // Jitter values and rotation
                setDisplayDice([
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1
                ]);
                setDiceRotationOffset({
                    x: Math.random() * Math.PI * 2,
                    z: Math.random() * Math.PI * 2
                });
                setUpdateTrigger(prev => prev + 1);
                requestAnimationFrame(animateRoll);
            } else {
                // End Animation
                setIsRolling(false);
                setDisplayDice(finalDice);
                setDiceRotationOffset({ x: 0, z: 0 }); // Reset offset so they snap to correct face
                
                // Check Moves
                const availablePins = pins
                    .map((status, index) => (status === 'OPEN' ? index + 1 : 0))
                    .filter(n => n > 0);

                if (!canMakeSum(total, availablePins)) {
                    setGameStatus('lost');
                    setPhase('GAME_OVER');
                    setMessage(`Rolled ${total}. No moves possible!`);
                } else {
                    setPhase('SELECT');
                    setMessage(`Rolled ${total}. Select pins matching sum.`);
                }
                setUpdateTrigger(prev => prev + 1);
            }
        };
        requestAnimationFrame(animateRoll);

    }, [pins, gameStatus, isRolling]);

    const togglePin = (index: number) => {
        if (phase !== 'SELECT' || gameStatus !== 'playing') return;
        if (pins[index] === 'SHUT') return;

        setPins(prev => {
            const newPins = [...prev];
            newPins[index] = newPins[index] === 'OPEN' ? 'SELECTED' : 'OPEN';
            return newPins;
        });
    };

    const confirmMove = () => {
        if (selectedSum !== diceSum) {
            setMessage(`Sum is ${selectedSum}, need ${diceSum}!`);
            return;
        }

        const newPins = pins.map(p => p === 'SELECTED' ? 'SHUT' : p);
        setPins(newPins);

        if (newPins.every(p => p === 'SHUT')) {
            setGameStatus('won');
            setPhase('GAME_OVER');
            setMessage("Jackpot! You shut the box!");
            return;
        }

        setPhase('ROLL');
        setMessage("Roll the dice.");
    };

    // --- 3D Visual Helpers ---

    // FIXED: Swapped logic for 3 and 4
    const getDiceRotation = (val: number) => {
        const base = { x: 0, y: 0, z: 0 };
        switch (val) {
            case 1: return { x: 0, y: 0, z: 0 };           // Top
            case 6: return { x: Math.PI, y: 0, z: 0 };     // Bottom
            
            // East (2) -> Roll Left (+Z)
            case 2: return { x: 0, y: 0, z: Math.PI / 2 }; 

            // West (5) -> Roll Right (-Z)
            case 5: return { x: 0, y: 0, z: -Math.PI / 2 }; 

            // North (3) -> Was -PI/2, Swapped to PI/2
            case 3: return { x: Math.PI / 2, y: 0, z: 0 }; 

            // South (4) -> Was PI/2, Swapped to -PI/2
            case 4: return { x: -Math.PI / 2, y: 0, z: 0 }; 

            default: return base;
        }
    };

    // --- Grid Construction ---

    // 1. Build the Box
    useEffect(() => {
        cubeGrid.clear();
        
        const xOffset = -Math.floor(BOX_WIDTH / 2);
        const yOffset = -Math.floor(BOX_DEPTH / 2);

        for (let x = 0; x < BOX_WIDTH; x++) {
            for (let y = 0; y < BOX_DEPTH; y++) {
                const isBorder = x === 0 || x === BOX_WIDTH - 1 || y === 0 || y === BOX_DEPTH - 1;
                
                if (isBorder) {
                    cubeGrid.addCube(x + xOffset, y + yOffset, 0x8B4513, 'wood');
                } else {
                    cubeGrid.addCube(x + xOffset, y + yOffset, 0x2E8B57, 'felt'); // Green felt
                }
            }
        }
    }, [cubeGrid]);

    // 2. Render Dynamic Objects (Pins & Dice)
    useEffect(() => {
        objectGrid.clear();
        decorationGrid.clear();

        const xOffset = -Math.floor(BOX_WIDTH / 2);
        const yOffset = -Math.floor(BOX_DEPTH / 2);
        
        // Re-add border height visuals
        for (let x = 0; x < BOX_WIDTH; x++) {
            for (let y = 0; y < BOX_DEPTH; y++) {
                if (x === 0 || x === BOX_WIDTH - 1 || y === 0 || y === BOX_DEPTH - 1) {
                   decorationGrid.addDecoration(x + xOffset, y + yOffset, 1, 'wood', 'wood');
                }
            }
        }

        // --- Pins ---
        const totalPinsWidth = (9 - 1) * PIN_SPACING;
        const xStart = -totalPinsWidth / 2;
        const pinY = -2; 
        
        const pinVisualZBase = 1.5; 
        const pinColliderZ = 1.0;

        pins.forEach((status, index) => {
            const pinNum = index + 1;
            const px = xStart + (index * PIN_SPACING);
            
            // 1. COLLIDER 
            if (status !== 'SHUT') {
                 objectGrid.addObject(px, pinY, pinColliderZ, 0.5, 0x2E8B57, 'pin');
            }

            // 2. VISUAL
            let modelName = `pin_${pinNum}`;
            if (status === 'SELECTED') modelName = `pin_select_${pinNum}`;
            
            const rotation = { x: 0, y: 0, z: 0 };
            let zPos = pinVisualZBase;

            if (status === 'SHUT') {
                rotation.x = -Math.PI / 2; 
                zPos = pinVisualZBase + 0.05; 
            }

            decorationGrid.addDecoration(px, pinY, zPos, 'pin', modelName, rotation);
        });

        // --- Dice ---
        const diceY = 2; 
        const d1Pos = { x: -1.5, y: diceY };
        const d2Pos = { x: 1.5, y: diceY };

        const diceVisualZ = 1.5;
        const diceColliderZ = 1.0;

        // Dice 1
        objectGrid.addObject(d1Pos.x, d1Pos.y, diceColliderZ, 0.65, 0xffffff, 'dice');
        
        const rot1 = getDiceRotation(displayDice[0]);
        if (isRolling) {
            rot1.x += diceRotationOffset.x;
            rot1.z += diceRotationOffset.z;
        }
        decorationGrid.addDecoration(d1Pos.x, d1Pos.y, diceVisualZ, 'dice', 'dice', rot1);

        // Dice 2
        objectGrid.addObject(d2Pos.x, d2Pos.y, diceColliderZ, 0.65, 0xffffff, 'dice');
        
        const rot2 = getDiceRotation(displayDice[1]);
        if (isRolling) {
            rot2.x += diceRotationOffset.x + 1; 
            rot2.z += diceRotationOffset.z + 1;
        }
        decorationGrid.addDecoration(d2Pos.x, d2Pos.y, diceVisualZ, 'dice', 'dice', rot2);

        setUpdateTrigger(prev => prev + 1);

    }, [pins, dice, displayDice, isRolling, diceRotationOffset, objectGrid, decorationGrid]);

    // --- Interaction ---

    const handleObjectClick = (id: string) => {
        if (!id) return;
        const parts = id.split('_');
        const type = parts[0]; 
        const x = parseFloat(parts[1]);

        if (type === 'dice') {
            if (phase === 'ROLL') rollDice();
            else setMessage("Select pins to shut first!");
        } 
        else if (type === 'pin') {
            // Find the closest pin index based on the clicked X coordinate
            const totalPinsWidth = (9 - 1) * PIN_SPACING;
            const xStart = -totalPinsWidth / 2;
            
            const estimatedIndex = (x - xStart) / PIN_SPACING;
            const index = Math.round(estimatedIndex);

            if (index >= 0 && index < 9) {
                togglePin(index);
            }
        }
    };

    const handleHover = (id: string | null) => {
        setHoveredId(id);
    };

    const handleRestart = () => {
        setPins(Array(9).fill('OPEN'));
        setDice([1, 1]);
        setDisplayDice([1, 1]);
        setPhase('ROLL');
        setGameStatus('playing');
        setMessage("Roll the dice to begin.");
        setShowTutorial(false);
    };

    return (
        <div className="game-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            
            {/* Tutorial */}
            {showTutorial && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 200, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    background: 'rgba(0,0,0,0.6)'
                }}>
                    <Tutorial onStart={handleRestart} />
                </div>
            )}

            {/* Game Over Popup */}
            {!showTutorial && (gameStatus === 'won' || gameStatus === 'lost') && (
                <GameStatusPopup
                    gameStatus={gameStatus}
                    onClose={() => {}} 
                    onRestart={handleRestart}
                />
            )}

            {/* HUD */}
            <div style={{
                position: 'absolute', top: 20, left: 20, zIndex: 100,
                color: 'white', background: 'rgba(0,0,0,0.8)',
                padding: '15px', borderRadius: '8px', minWidth: '220px',
                fontFamily: 'monospace', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                    SHUT THE BOX 
                </h3>
                
                <div style={{ marginBottom: '10px', fontSize: '1.2em' }}>
                    Roll: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{dice[0]}</span> + <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{dice[1]}</span> = <span style={{fontSize: '1.4em'}}>{diceSum}</span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    Selected: <span style={{ 
                        color: selectedSum === diceSum ? '#4ade80' : selectedSum > diceSum ? '#ff4444' : 'white',
                        fontWeight: 'bold' 
                    }}>{selectedSum}</span>
                    <span style={{color: '#aaa', fontSize: '0.9em'}}> / {diceSum}</span>
                </div>

                <div style={{ 
                    marginBottom: '15px', padding: '8px', 
                    background: '#333', borderRadius: '4px', fontStyle: 'italic', fontSize: '0.9em'
                }}>
                    {message}
                </div>

                {phase === 'SELECT' && (
                    <button 
                        onClick={confirmMove}
                        disabled={selectedSum !== diceSum}
                        style={{
                            width: '100%', padding: '10px', cursor: 'pointer',
                            background: selectedSum === diceSum ? '#4ade80' : '#444',
                            color: selectedSum === diceSum ? 'black' : '#888',
                            border: 'none', borderRadius: '4px', fontWeight: 'bold',
                            transition: 'background 0.2s'
                        }}
                    >
                        CONFIRM MOVE
                    </button>
                )}
                
                {phase === 'ROLL' && (
                    <button 
                        onClick={rollDice}
                        disabled={isRolling}
                        style={{
                            width: '100%', padding: '10px', cursor: 'pointer',
                            background: isRolling ? '#666' : '#3b82f6', color: 'white',
                            border: 'none', borderRadius: '4px', fontWeight: 'bold'
                        }}
                    >
                        {isRolling ? 'ROLLING...' : 'ROLL DICE'}
                    </button>
                )}
            </div>

            {/* Hover Tooltip */}
            {hoveredId && (
                <div style={{
                    position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 100, background: 'rgba(0,0,0,0.8)', color: 'white',
                    padding: '8px 16px', borderRadius: '20px', pointerEvents: 'none',
                    border: '1px solid #555'
                }}>
                    {hoveredId.startsWith('pin') ? `Pin ${Math.round((parseFloat(hoveredId.split('_')[1]) - (-(9 - 1) * 1.25 / 2)) / 1.25) + 1}` : 'Dice'}
                </div>
            )}

            {!modelsLoaded && (
                <div style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 100,
                    background: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px 10px', borderRadius: '4px'
                }}>
                    Loading assets...
                </div>
            )}
            
            <div style={{ width: '100%', height: '100%' }}>
                <IsometricRenderer
                    cubeGrid={cubeGrid}
                    objectGrid={objectGrid}
                    decorationGrid={decorationGrid}
                    updateTrigger={updateTrigger}
                    modelsLoaded={modelsLoaded}
                    gameStatus={gameStatus}
                    clickableTypes={['pin', 'dice']} 
                    onObjectClick={handleObjectClick}
                    onObjectHover={handleHover}
                />
            </div>
        </div>
    );
};

export default ShutTheBoxGame;