import { useState, useEffect, useMemo, useCallback } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid';
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid';
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';
import Tutorial from './Tutorial';
import GameStatusPopup from './GameStatusPopup';

// Types
type PinState = 'OPEN' | 'SELECTED' | 'SHUT';
type GamePhase = 'ROLL' | 'SELECT' | 'GAME_OVER';

const ShutTheBoxGame = () => {
    // --- Game State ---
    const [pins, setPins] = useState<PinState[]>(Array(9).fill('OPEN'));
    const [dice, setDice] = useState<number[]>([1, 1]); // Two dice
    const [phase, setPhase] = useState<GamePhase>('ROLL');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'paused'>('paused');
    const [message, setMessage] = useState<string>("Click the Dice to start!");
    const [showTutorial, setShowTutorial] = useState(true);
    
    // Renderer Triggers
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Grids
    const cubeGrid = useMemo(() => new CubeGrid(), []);
    const objectGrid = useMemo(() => new ObjectGrid(), []);
    const decorationGrid = useMemo(() => new DecorationGrid(), []);

    // Helper: Calculate sum of dice and selected pins
    const diceSum = dice[0] + dice[1];
    const selectedSum = pins.reduce((acc, status, index) => {
        return status === 'SELECTED' ? acc + (index + 1) : acc;
    }, 0);

    // --- Game Logic ---

    // Algorithm to check if a set of numbers can sum to a target
    // Used to check if the player has lost after a roll
    const canMakeSum = (target: number, availableNumbers: number[]): boolean => {
        if (target === 0) return true;
        if (target < 0 || availableNumbers.length === 0) return false;

        const num = availableNumbers[0];
        const remaining = availableNumbers.slice(1);

        // Try including the number or excluding it
        return canMakeSum(target - num, remaining) || canMakeSum(target, remaining);
    };

    const rollDice = useCallback(() => {
        if (gameStatus !== 'playing') return;
        
        // 1. Roll
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const newDice = [d1, d2];
        const total = d1 + d2;
        
        setDice(newDice);
        
        // 2. Check if move is possible
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
    }, [pins, gameStatus]);

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

        // Lock selected pins
        const newPins = pins.map(p => p === 'SELECTED' ? 'SHUT' : p);
        setPins(newPins);

        // Check Win Condition
        if (newPins.every(p => p === 'SHUT')) {
            setGameStatus('won');
            setPhase('GAME_OVER');
            setMessage("Jackpot! You shut the box!");
            return;
        }

        // Reset for next turn
        setPhase('ROLL');
        setMessage("Roll the dice.");
    };

    // --- Grid Construction ---

    // 1. Build the Box (CubeGrid + DecorationGrid)
    useEffect(() => {
        cubeGrid.clear();
        decorationGrid.clear();

        const width = 13;
        const depth = 9;
        const xOffset = -Math.floor(width / 2);
        const yOffset = -Math.floor(depth / 2);

        // Build a "Box" with borders
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                const isBorder = x === 0 || x === width - 1 || y === 0 || y === depth - 1;
                
                if (isBorder) {
                    // Wood Rim
                    cubeGrid.addCube(x + xOffset, y + yOffset, 0x8B4513, 'wood');
                    // Add a second layer for height
                    decorationGrid.addDecoration(x + xOffset, y + yOffset, 1, 'wood', 'wood'); // Placeholder model fallback
                } else {
                    // Green Felt Center
                    cubeGrid.addCube(x + xOffset, y + yOffset, 0x2E8B57, 'felt');
                }
            }
        }
        
        setUpdateTrigger(prev => prev + 1);
    }, [cubeGrid, decorationGrid]);

    // 2. Render Objects (Pins & Dice)
    useEffect(() => {
        objectGrid.clear();

        const xStart = -4; // Center the 9 pins
        const pinY = -2;   // Back of the tray

        // Render Pins (1-9)
        pins.forEach((status, index) => {
            // Visual logic for pins
            const isOpen = status === 'OPEN';
            const isSelected = status === 'SELECTED';
            
            // Height: Open pins stand tall, Shut pins lie flat(ish)
            const height = isOpen || isSelected ? 0.8 : 0.2;
            
            // Color Coding
            let color = 0xaaaaaa; // Default Grey
            if (status === 'OPEN') color = 0x5FC33B; // Green
            if (status === 'SELECTED') color = 0xFFD700; // Gold/Yellow
            if (status === 'SHUT') color = 0x8B0000; // Dark Red

            // Position
            // We shift Z slightly for shut pins to look "down"
            const zPos = isOpen || isSelected ? height : 0.1;

            objectGrid.addObject(
                xStart + index, // X
                pinY,           // Y (Back of box)
                zPos,           // Z (Up)
                height,
                color,
                'pin' // Type
            );
        });

        // Render Dice
        // Use 'boat' type if possible to get Cylinder/different shape, 
        // otherwise stick to default sphere logic in renderer, but color distinctively.
        // We position them in the "tray" area.
        
        const diceY = 1; // Front area of tray
        
        objectGrid.addObject(
            -1.5, diceY, 0.4, 0.5, 0xFFFFFF, 'dice'
        );
        objectGrid.addObject(
            1.5, diceY, 0.4, 0.5, 0xFFFFFF, 'dice'
        );

        setUpdateTrigger(prev => prev + 1);
    }, [pins, dice, objectGrid]);

    // --- Interaction Handlers ---

    const handleObjectClick = (id: string) => {
        if (!id) return;
        const parts = id.split('_');
        const type = parts[0];
        const x = parseFloat(parts[1]);

        if (type === 'dice') {
            if (phase === 'ROLL') rollDice();
            else setMessage("You must select pins first!");
        } 
        else if (type === 'pin') {
            // Calculate index based on X position (since we placed them at xStart + index)
            // xStart was -4. So index = x - (-4) = x + 4
            const index = Math.round(x + 4);
            if (index >= 0 && index < 9) {
                togglePin(index);
            }
        }
    };

    const handleHover = (id: string | null) => {
        setHoveredId(id);
    };

    // Helper to get text for hovered object
    const getHoverText = () => {
        if (!hoveredId) return null;
        const parts = hoveredId.split('_');
        const type = parts[0];
        const x = parseFloat(parts[1]);

        if (type === 'pin') {
            const index = Math.round(x + 4);
            const num = index + 1;
            const status = pins[index];
            return `Pin ${num} (${status})`;
        }
        if (type === 'dice') return phase === 'ROLL' ? "Click to Roll" : `Dice (${dice[0]}, ${dice[1]})`;
        return null;
    };

    // Handle Reset / Start
    const handleRestart = () => {
        setPins(Array(9).fill('OPEN'));
        setDice([1, 1]);
        setPhase('ROLL');
        setGameStatus('playing');
        setMessage("Roll the dice to begin.");
        setShowTutorial(false);
    };

    return (
        <div className="game-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            
            {/* Tutorial / Start Screen */}
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
                    onClose={() => {}} // Keep showing it
                    onRestart={handleRestart}
                />
            )}

            {/* HUD */}
            <div style={{
                position: 'absolute', top: 20, left: 20, zIndex: 100,
                color: 'white', background: 'rgba(0,0,0,0.8)',
                padding: '15px', borderRadius: '8px', minWidth: '200px',
                fontFamily: 'monospace'
            }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>SHUT THE BOX</h3>
                
                <div style={{ marginBottom: '10px', fontSize: '1.2em' }}>
                    Dice: <span style={{ color: '#4ade80' }}>{dice[0]}</span> + <span style={{ color: '#4ade80' }}>{dice[1]}</span> = <strong>{diceSum}</strong>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    Selected Sum: <span style={{ 
                        color: selectedSum === diceSum ? '#4ade80' : selectedSum > diceSum ? '#ff4444' : 'white' 
                    }}>{selectedSum}</span>
                </div>

                <div style={{ 
                    marginBottom: '15px', padding: '8px', 
                    background: '#333', borderRadius: '4px', fontStyle: 'italic' 
                }}>
                    {message}
                </div>

                {/* Confirm Button */}
                {phase === 'SELECT' && (
                    <button 
                        onClick={confirmMove}
                        disabled={selectedSum !== diceSum}
                        style={{
                            width: '100%', padding: '10px', cursor: 'pointer',
                            background: selectedSum === diceSum ? '#4ade80' : '#555',
                            color: selectedSum === diceSum ? 'black' : '#888',
                            border: 'none', borderRadius: '4px', fontWeight: 'bold'
                        }}
                    >
                        CONFIRM MOVE
                    </button>
                )}
                
                {phase === 'ROLL' && (
                    <button 
                        onClick={rollDice}
                        style={{
                            width: '100%', padding: '10px', cursor: 'pointer',
                            background: '#3b82f6', color: 'white',
                            border: 'none', borderRadius: '4px', fontWeight: 'bold'
                        }}
                    >
                        ROLL DICE
                    </button>
                )}
            </div>

            {/* Hover Tooltip */}
            {hoveredId && (
                <div style={{
                    position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 100, background: 'rgba(0,0,0,0.8)', color: 'white',
                    padding: '8px 16px', borderRadius: '20px', pointerEvents: 'none'
                }}>
                    {getHoverText()}
                </div>
            )}
            
            <div style={{ width: '100%', height: '100%' }}>
                <IsometricRenderer
                    cubeGrid={cubeGrid}
                    objectGrid={objectGrid}
                    decorationGrid={decorationGrid}
                    updateTrigger={updateTrigger}
                    modelsLoaded={true} // No complex models needed, primitives are fine
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