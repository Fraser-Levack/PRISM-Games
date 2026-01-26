import { useState, useEffect, useMemo, useCallback } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid';
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid';
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';
import ModelManager from '../../../components/ModelManager';
import Tutorial from './Tutorial';
import GameStatusPopup from './GameStatusPopup';
import { ShutTheBoxStrategy } from './StrategyEngine';

// Types
type PinState = 'OPEN' | 'SELECTED' | 'SHUT';
type GamePhase = 'ROLL' | 'SELECT' | 'GAME_OVER';
type GameMode = 'SOLO' | 'VS_AI';
type Turn = 'PLAYER' | 'AI';

const ShutTheBoxGame = () => {
    // --- Game Configuration & Logic ---
    const strategyEngine = useMemo(() => new ShutTheBoxStrategy(), []);
    const [strategyLoaded, setStrategyLoaded] = useState(false);
    const [gameMode, setGameMode] = useState<GameMode>('SOLO');
    const [turn, setTurn] = useState<Turn>('PLAYER');
    
    // Scores (Lower is better)
    const [playerScore, setPlayerScore] = useState<number | null>(null);
    const [aiScore, setAiScore] = useState<number | null>(null);

    // --- Standard Game State ---
    const [pins, setPins] = useState<PinState[]>(Array(9).fill('OPEN'));
    const [dice, setDice] = useState<number[]>([1, 1]); 
    const [phase, setPhase] = useState<GamePhase>('ROLL');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'paused'>('paused');
    const [lossReason, setLossReason] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("Click the Dice to start!");
    
    // Animation State
    const [isRolling, setIsRolling] = useState(false);
    const [displayDice, setDisplayDice] = useState<number[]>([1, 1]); 
    const [diceRotationOffset, setDiceRotationOffset] = useState({ x: 0, z: 0 });

    const [showTutorial, setShowTutorial] = useState(true);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Grids
    const cubeGrid = useMemo(() => new CubeGrid(), []);
    const objectGrid = useMemo(() => new ObjectGrid(), []);
    const decorationGrid = useMemo(() => new DecorationGrid(), []);

    // --- Constants ---
    const PIN_SPACING = 1.25; 
    const BOX_WIDTH = 15;
    const BOX_DEPTH = 9;

    // --- Initialization ---

    // 1. Load Strategy File
    useEffect(() => {
        fetch('/strategies/stb_strategy.txt') // Ensure this file exists in your public folder
            .then(res => res.text())
            .then(text => {
                strategyEngine.loadStrategy(text);
                setStrategyLoaded(true);
            })
            .catch(err => console.error("Failed to load strategy:", err));
    }, [strategyEngine]);

    // 2. Load Models
    useEffect(() => {
        let mounted = true;
        const modelMap: Record<string, string> = { 'dice': '/Models/ShutTheBox/dice.gltf' };
        for (let i = 1; i <= 9; i++) {
            modelMap[`pin_${i}`] = `/Models/ShutTheBox/pin_${i}.gltf`;
            modelMap[`pin_select_${i}`] = `/Models/ShutTheBox/pin_selection_models/pin_${i}.gltf`;
        }

        ModelManager.loadAll(modelMap).then(() => { if (mounted) setModelsLoaded(true); });
        return () => { mounted = false; };
    }, []);

    // --- Helper Logic ---

    const diceSum = dice[0] + dice[1];
    const selectedSum = pins.reduce((acc, status, index) => {
        return status === 'SELECTED' ? acc + (index + 1) : acc;
    }, 0);

    const calculateScore = (currentPins: PinState[]) => {
        return currentPins.reduce((acc, status, index) => (status !== 'SHUT' ? acc + (index + 1) : acc), 0);
    };

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
        setMessage(turn === 'AI' ? "AI is Rolling..." : "Rolling...");

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const finalDice = [d1, d2];
        const total = d1 + d2;

        setDice(finalDice);

        // Animation Loop
        let frame = 0;
        const maxFrames = 30; 
        
        const animateRoll = () => {
            frame++;
            if (frame < maxFrames) {
                setDisplayDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
                setDiceRotationOffset({ x: Math.random() * Math.PI * 2, z: Math.random() * Math.PI * 2 });
                setUpdateTrigger(prev => prev + 1);
                requestAnimationFrame(animateRoll);
            } else {
                setIsRolling(false);
                setDisplayDice(finalDice);
                setDiceRotationOffset({ x: 0, z: 0 });
                
                // Check Moves
                const availablePins = pins
                    .map((status, index) => (status === 'OPEN' ? index + 1 : 0))
                    .filter(n => n > 0);

                if (!canMakeSum(total, availablePins)) {
                    handleRoundOver(pins, 'lost');
                    setLossReason('no_moves');
                    setMessage(`Rolled ${total}. No moves possible!`);
                } else {
                    setPhase('SELECT');
                    setMessage(turn === 'AI' ? `AI Rolled ${total}. Thinking...` : `Rolled ${total}. Select pins.`);
                }
                setUpdateTrigger(prev => prev + 1);
            }
        };
        requestAnimationFrame(animateRoll);
    }, [pins, gameStatus, isRolling, turn]);

    // --- Game Flow Control ---

    const handleRoundOver = (finalPins: PinState[], result: 'won' | 'lost') => {
        setPhase('GAME_OVER');
        const score = calculateScore(finalPins);
        
        if (gameMode === 'SOLO') {
            setGameStatus(result);
            return;
        }

        // VS AI Logic
        if (turn === 'PLAYER') {
            setPlayerScore(score);
            setGameStatus('paused'); // Pause to show "Round Over" modal
        } else {
            setAiScore(score);
            const gameResult = playerScore !== null ?
                (score < playerScore ? 'lost' : score > playerScore ? 'won' : 'paused')
                : 'paused';
            setGameStatus(gameResult);
        }
    };

    const confirmMove = (overridePins?: PinState[]) => {
        const currentPins = overridePins || pins;
        
        // Validation for Player (AI skips this as its logic is trusted/pre-calculated)
        if (turn === 'PLAYER') {
            const currentSelectedSum = currentPins.reduce((acc, s, i) => s === 'SELECTED' ? acc + (i+1) : acc, 0);
            if (currentSelectedSum !== diceSum) {
                setMessage(`Sum is ${currentSelectedSum}, need ${diceSum}!`);
                return;
            }
        }

        const newPins = currentPins.map(p => p === 'SELECTED' ? 'SHUT' : p);
        setPins(newPins);

        if (newPins.every(p => p === 'SHUT')) {
            handleRoundOver(newPins, 'won');
            return;
        }

        setPhase('ROLL');
        setMessage(turn === 'AI' ? "AI's Turn." : "Roll the dice.");
    };

    // --- AI LOGIC LOOP ---
    // This effect runs whenever it is the AI's turn and the game state changes
    useEffect(() => {
        if (turn !== 'AI' || gameStatus !== 'playing' || !strategyLoaded) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        // 1. AI ROLLS
        if (phase === 'ROLL' && !isRolling) {
            timeoutId = setTimeout(() => {
                rollDice();
            }, 1000); // 1 second delay before rolling
        }

        // 2. AI THINKS AND SELECTS
        if (phase === 'SELECT' && !isRolling) {
            timeoutId = setTimeout(() => {
                // Convert Pins to AI Format (0=Open, 1=Shut)
                // Note: strategy treats 'Selected' as still 'Open' for calculation purposes, 
                // but we shouldn't have selected pins yet at start of phase.
                const aiPinsInput = pins.map(p => p === 'SHUT' ? 1 : 0) as any; // Type assertion for brevity
                
                const bestMove = strategyEngine.getBestMove(diceSum, aiPinsInput);

                if (bestMove) {
                    // Visual Phase: Select the pins
                    setPins(prev => prev.map((status, index) => {
                        return bestMove.includes(index + 1) ? 'SELECTED' : status;
                    }));

                    // Action Phase: Confirm after short delay
                    setTimeout(() => {
                         // We need to pass the state because setPins is async
                         const pinsAfterSelection = pins.map((status, index) => 
                            bestMove.includes(index + 1) ? 'SELECTED' : status
                         );
                         confirmMove(pinsAfterSelection);
                    }, 800);
                } else {
                    // This technically shouldn't happen if rollDice checked canMakeSum,
                    // but serves as a fallback.
                    console.warn("AI found no move in strategy, but roll logic said yes?");
                    handleRoundOver(pins, 'lost');
                }
            }, 1000);
        }

        return () => clearTimeout(timeoutId);
    }, [turn, gameStatus, phase, isRolling, strategyLoaded, diceSum, pins, strategyEngine, rollDice]);


    // --- Interaction ---

    const togglePin = (index: number) => {
        if (turn === 'AI') return; // Block input during AI turn
        if (phase !== 'SELECT' || gameStatus !== 'playing') return;
        if (pins[index] === 'SHUT') return;

        setPins(prev => {
            const newPins = [...prev];
            newPins[index] = newPins[index] === 'OPEN' ? 'SELECTED' : 'OPEN';
            return newPins;
        });
    };

    const handleObjectClick = (id: string) => {
        if (!id || turn === 'AI') return; // Block clicks during AI turn
        
        const parts = id.split('_');
        const type = parts[0]; 
        const x = parseFloat(parts[1]);

        if (type === 'dice') {
            if (phase === 'ROLL') rollDice();
            else setMessage("Select pins to shut first!");
        } 
        else if (type === 'pin') {
            const xStart = -((9 - 1) * 1.25) / 2;
            const index = Math.round(((x - xStart) / 1.25));
            if (index >= 0 && index < 9) togglePin(index);
        }
    };

    const handleStartGame = (mode: GameMode) => {
        setGameMode(mode);
        setTurn('PLAYER');
        setPlayerScore(null);
        setAiScore(null);
        handleRestart();
    };

    const handleNextRound = () => {
        // Player finished, now set up AI
        setTurn('AI');
        setPins(Array(9).fill('OPEN'));
        setDice([1, 1]);
        setPhase('ROLL');
        setGameStatus('playing');
        setLossReason(null);
        setMessage("AI is starting its round...");
    };

    const handleRestart = () => {
        setPins(Array(9).fill('OPEN'));
        setDice([1, 1]);
        setDisplayDice([1, 1]);
        setPhase('ROLL');
        setGameStatus('playing');
        setLossReason(null);
        setMessage("Roll the dice to begin.");
        setShowTutorial(false);

        if (gameMode === 'VS_AI') {
            // Full Reset
            setTurn('PLAYER');
            setPlayerScore(null);
            setAiScore(null);
        }
    };

    // --- Grid Construction (Visuals) ---
    // (Kept largely the same, just removed the boilerplate for brevity)
    // ... [Insert your existing Grid Construction useEffects here] ...
    // ... Copy exact useEffect blocks from your original code for:
    // ... 1. Build the Box
    // ... 2. Render Dynamic Objects
    // ... They depend on [pins, dice, displayDice, isRolling, diceRotationOffset]
    
    // RE-INSERTED FOR COMPLETENESS OF THE SNIPPET:
    useEffect(() => {
        cubeGrid.clear();
        const xOffset = -Math.floor(BOX_WIDTH / 2);
        const yOffset = -Math.floor(BOX_DEPTH / 2);
        for (let x = 0; x < BOX_WIDTH; x++) {
            for (let y = 0; y < BOX_DEPTH; y++) {
                const isBorder = x === 0 || x === BOX_WIDTH - 1 || y === 0 || y === BOX_DEPTH - 1;
                if (isBorder) cubeGrid.addCube(x + xOffset, y + yOffset, 0x8B4513, 'wood');
                else cubeGrid.addCube(x + xOffset, y + yOffset, 0x2E8B57, 'felt');
            }
        }
    }, [cubeGrid]);

    useEffect(() => {
        objectGrid.clear();
        decorationGrid.clear();
        const xOffset = -Math.floor(BOX_WIDTH / 2);
        const yOffset = -Math.floor(BOX_DEPTH / 2);
        for (let x = 0; x < BOX_WIDTH; x++) {
            for (let y = 0; y < BOX_DEPTH; y++) {
               if (x === 0 || x === BOX_WIDTH - 1 || y === 0 || y === BOX_DEPTH - 1) 
                   decorationGrid.addDecoration(x + xOffset, y + yOffset, 1, 'wood', 'wood');
            }
        }
        const totalPinsWidth = (9 - 1) * PIN_SPACING;
        const xStart = -totalPinsWidth / 2;
        pins.forEach((status, index) => {
            const pinNum = index + 1;
            const px = xStart + (index * PIN_SPACING);
            if (status !== 'SHUT') objectGrid.addObject(px, -2, 1.0, 0.5, 0x2E8B57, 'pin');
            let modelName = status === 'SELECTED' ? `pin_select_${pinNum}` : `pin_${pinNum}`;
            const rotation = status === 'SHUT' ? { x: -Math.PI / 2, y: 0, z: 0 } : { x: 0, y: 0, z: 0 };
            const zPos = status === 'SHUT' ? 1.55 : 1.5;
            decorationGrid.addDecoration(px, -2, zPos, 'pin', modelName, rotation);
        });
        
        // Dice
        const d1Pos = { x: -1.5, y: 2 };
        const d2Pos = { x: 1.5, y: 2 };
        const getDiceRotation = (val: number) => { /* ... copy your helper ... */ 
            const base = { x: 0, y: 0, z: 0 };
            switch (val) {
                case 1: return { x: 0, y: 0, z: 0 };
                case 6: return { x: Math.PI, y: 0, z: 0 };
                case 2: return { x: 0, y: 0, z: Math.PI / 2 };
                case 5: return { x: 0, y: 0, z: -Math.PI / 2 };
                case 3: return { x: Math.PI / 2, y: 0, z: 0 };
                case 4: return { x: -Math.PI / 2, y: 0, z: 0 };
                default: return base;
            }
        };

        const rot1 = getDiceRotation(displayDice[0]);
        const rot2 = getDiceRotation(displayDice[1]);
        if (isRolling) {
            rot1.x += diceRotationOffset.x; rot1.z += diceRotationOffset.z;
            rot2.x += diceRotationOffset.x + 1; rot2.z += diceRotationOffset.z + 1;
        }
        
        objectGrid.addObject(d1Pos.x, d1Pos.y, 1.0, 0.65, 0xffffff, 'dice');
        decorationGrid.addDecoration(d1Pos.x, d1Pos.y, 1.5, 'dice', 'dice', rot1);
        objectGrid.addObject(d2Pos.x, d2Pos.y, 1.0, 0.65, 0xffffff, 'dice');
        decorationGrid.addDecoration(d2Pos.x, d2Pos.y, 1.5, 'dice', 'dice', rot2);
        
        setUpdateTrigger(prev => prev + 1);
    }, [pins, dice, displayDice, isRolling, diceRotationOffset, objectGrid, decorationGrid]);

    // --- JSX Render ---

    return (
        <div className="game-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            
            {showTutorial && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                    <Tutorial onStart={handleStartGame} />
                </div>
            )}

            {/* Intermediate Round Popup (Player Finished, waiting for AI) */}
            {!showTutorial && gameMode === 'VS_AI' && turn === 'PLAYER' && gameStatus === 'paused' && playerScore !== null && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.4)' }}>
                    {/* We use the popup-card class here for the styling */}
                    <div className="popup-card">
                        <h2 style={{ margin: '0 0 15px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
                            Round Complete
                        </h2>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ margin: 0, fontSize: '1.1em', opacity: 0.8 }}>You achieved a score of</p>
                            {/* Large Score Display */}
                            <div style={{ fontSize: '4em', fontWeight: 'bold', color: '#ffcc00', textShadow: '0 2px 10px rgba(0,0,0,0.3)', lineHeight: '1' }}>
                                {playerScore}
                            </div>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', fontStyle: 'italic', opacity: 0.6 }}>
                                (Lower is better)
                            </p>
                        </div>

                        <p style={{ marginBottom: '20px' }}>
                            The AI will now attempt to beat your score.
                        </p>

                        <button 
                            onClick={handleNextRound} 
                            style={{ 
                                padding: '12px 30px', 
                                background: 'linear-gradient(135deg, #622f71 0%, #8845a0 100%)', 
                                color: 'white', 
                                border: '1px solid rgba(255,255,255,0.3)', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: 'bold',
                                fontSize: '1.1em',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                transition: 'transform 0.1s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Start AI Turn →
                        </button>
                    </div>
                </div>
            )}

            {/* Standard Game Over or Final VS Result */}
            {!showTutorial && (gameStatus === 'won' || gameStatus === 'lost') && (
                <GameStatusPopup
                    gameStatus={gameStatus}
                    lossReason={lossReason}
                    // For VS AI, we override the display to show comparison
                    customMessage={gameMode === 'VS_AI' && aiScore !== null && playerScore !== null ? 
                        (playerScore < aiScore ? `You Won! (You: ${playerScore} vs AI: ${aiScore})` : 
                         playerScore > aiScore ? `AI Won! (AI: ${aiScore} vs You: ${playerScore})` : "It's a Draw!") 
                        : undefined}
                    dice={gameStatus === 'lost' ? dice : undefined}
                    onClose={() => setGameStatus('paused')} 
                    onRestart={handleRestart}
                />
            )}

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, color: 'white', background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px', minWidth: '220px', fontFamily: 'monospace' }}>
                <h3 style={{ margin: '0 0 10px 0', color: turn === 'AI' ? '#f472b6' : '#ffcc00', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                    {gameMode === 'SOLO' ? 'SHUT THE BOX' : turn === 'AI' ? '🤖 AI TURN' : '👤 YOUR TURN'}
                </h3>
                
                <div style={{ marginBottom: '10px', fontSize: '1.2em' }}>
                    Roll: <span style={{ color: '#4ade80' }}>{dice[0]} + {dice[1]}</span> = <span style={{fontSize: '1.4em'}}>{diceSum}</span>
                </div>

                {turn === 'PLAYER' && (
                    <div style={{ marginBottom: '10px' }}>
                        Selected: <span style={{ color: selectedSum === diceSum ? '#4ade80' : selectedSum > diceSum ? '#ff4444' : 'white', fontWeight: 'bold' }}>{selectedSum}</span> / {diceSum}
                    </div>
                )}

                <div style={{ marginBottom: '15px', padding: '8px', background: '#333', borderRadius: '4px', fontStyle: 'italic', fontSize: '0.9em' }}>
                    {message}
                </div>

                {turn === 'PLAYER' && phase === 'SELECT' && (
                    <button onClick={() => confirmMove()} disabled={selectedSum !== diceSum} style={{ width: '100%', padding: '10px', cursor: 'pointer', background: selectedSum === diceSum ? '#4ade80' : '#444', color: selectedSum === diceSum ? 'black' : '#888', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        CONFIRM MOVE
                    </button>
                )}
                
                {turn === 'PLAYER' && phase === 'ROLL' && (
                    <button onClick={rollDice} disabled={isRolling} style={{ width: '100%', padding: '10px', cursor: 'pointer', background: isRolling ? '#666' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        {isRolling ? 'ROLLING...' : 'ROLL DICE'}
                    </button>
                )}

                {turn === 'AI' && (
                    <div style={{ color: '#aaa', fontSize: '0.8em', textAlign: 'center' }}>AI is thinking...</div>
                )}
            </div>
            
            {/* Loading Indicator for Strategy */}
            {gameMode === 'VS_AI' && !strategyLoaded && (
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 100, background: 'red', color: 'white', padding: '5px 10px' }}>
                   ⚠️ AI Strategy not loaded
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
                    clickableTypes={turn === 'PLAYER' ? ['pin', 'dice'] : []} 
                    onObjectClick={handleObjectClick}
                    cameraLookAtY={0} 
                />
            </div>
        </div>
    );
};

export default ShutTheBoxGame;