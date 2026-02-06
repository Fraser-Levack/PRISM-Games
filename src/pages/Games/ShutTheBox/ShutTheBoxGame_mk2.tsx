import { useState, useMemo, useEffect } from 'react';
import IsometricRenderer from '../../../components/isometricGrid/IsometricRenderer';
import { CubeGrid } from '../../../components/isometricGrid/CubeGrid';
import { ObjectGrid } from '../../../components/isometricGrid/ObjectGrid';
import { DecorationGrid } from '../../../components/isometricGrid/DecorationGrid';
import ModelManager from '../../../components/ModelManager';

// Sub-components & Logic
import Tutorial from './Tutorial';
import GameStatusPopup from './GameStatusPopup';
import BoxVisuals from './BoxVisuals';
import { useShutTheBox } from './useShutTheBox';
import { PIN_SPACING } from './GameTypes';

const ShutTheBoxGame = () => {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // 1. Hook into the Game Engine
    const game = useShutTheBox();

    // 2. Initialize Grids
    const grids = useMemo(() => ({
        cubeGrid: new CubeGrid(),
        objectGrid: new ObjectGrid(),
        decorationGrid: new DecorationGrid()
    }), []);

    // 3. Load Assets
    useEffect(() => {
        const modelMap: Record<string, string> = { 'dice': '/Models/ShutTheBox/dice.gltf' };
        for (let i = 1; i <= 9; i++) {
            modelMap[`pin_${i}`] = `/Models/ShutTheBox/pin_${i}.gltf`;
            modelMap[`pin_select_${i}`] = `/Models/ShutTheBox/pin_selection_models/pin_${i}.gltf`;
        }
        ModelManager.loadAll(modelMap).then(() => setModelsLoaded(true));
    }, []);

    // 4. Interaction Handler
    const handleObjectClick = (id: string) => {
        if (!id || game.turn === 'AI') return;
        
        const parts = id.split('_');
        const type = parts[0]; 
        const x = parseFloat(parts[1]);

        if (type === 'dice') {
            if (game.phase === 'ROLL') game.rollDice();
            else alert("Select pins to shut first!");
        } 
        else if (type === 'pin') {
            const xStart = -((9 - 1) * PIN_SPACING) / 2;
            const index = Math.round(((x - xStart) / PIN_SPACING));
            if (index >= 0 && index < 9) game.togglePin(index);
        }
    };

    // 5. Game Control Wrappers
    const startNewGame = (mode: any) => {
        setShowTutorial(false);
        game.handleRestart(mode);
    };

    return (
        <div className="game-container" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            
            {/* The Visual Engine (Updates Grids) */}
            <BoxVisuals 
                pins={game.pins} 
                displayDice={game.displayDice} 
                isRolling={game.isRolling} 
                diceRotationOffset={game.diceRotationOffset} 
                grids={grids} 
            />

            {/* --- UI OVERLAYS --- */}

            {showTutorial && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                    <Tutorial onStart={startNewGame} />
                </div>
            )}

            {/* Intermediate Round Popup (VS AI Mode) */}
            {!showTutorial && game.gameMode === 'VS_AI' && game.turn === 'PLAYER' && game.gameStatus === 'paused' && game.playerScore !== null && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="popup-card" style={{ background: '#222', color: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #444' }}>
                        <h2>Round Complete</h2>
                        <div style={{ marginBottom: '20px' }}>
                            <p>You scored:</p>
                            <div style={{ fontSize: '4em', fontWeight: 'bold', color: '#ffcc00' }}>{game.playerScore}</div>
                        </div>
                        <button onClick={game.handleNextRound} className="primary-button">Start AI Turn →</button>
                    </div>
                </div>
            )}

            {/* Standard Game Over Popup */}
            {!showTutorial && (game.gameStatus === 'won' || game.gameStatus === 'lost') && (
                <GameStatusPopup
                    gameStatus={game.gameStatus}
                    lossReason={game.lossReason}
                    customMessage={game.gameMode === 'VS_AI' && game.aiScore !== null && game.playerScore !== null ? 
                        (game.playerScore < game.aiScore ? `You Won! (${game.playerScore} vs ${game.aiScore})` : 
                         game.playerScore > game.aiScore ? `AI Won! (${game.aiScore} vs ${game.playerScore})` : "It's a Draw!") 
                        : undefined}
                    dice={game.gameStatus === 'lost' ? game.dice : undefined}
                    onClose={() => game.setGameStatus('paused')} 
                    onRestart={() => game.handleRestart(game.gameMode)}
                />
            )}

            {/* HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, color: 'white', background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px', minWidth: '220px', fontFamily: 'monospace' }}>
                <h3 style={{ margin: '0 0 10px 0', color: game.turn === 'AI' ? '#f472b6' : '#ffcc00' }}>
                    {game.gameMode === 'SOLO' ? 'SHUT THE BOX' : game.turn === 'AI' ? '🤖 AI TURN' : '👤 YOUR TURN'}
                </h3>
                <div style={{ marginBottom: '10px', fontSize: '1.2em' }}>
                    Roll: <span style={{ color: '#4ade80' }}>{game.dice[0]} + {game.dice[1]}</span> = {game.diceSum}
                </div>
                {game.turn === 'PLAYER' && (
                    <div style={{ marginBottom: '10px' }}>
                        Selected: <span style={{ color: game.selectedSum === game.diceSum ? '#4ade80' : 'white' }}>{game.selectedSum}</span> / {game.diceSum}
                    </div>
                )}
                <div style={{ marginBottom: '15px', padding: '8px', background: '#333', borderRadius: '4px', fontSize: '0.9em' }}>
                    {game.message}
                </div>

                {game.turn === 'PLAYER' && game.phase === 'SELECT' && (
                    <button onClick={() => game.confirmMove()} disabled={game.selectedSum !== game.diceSum} style={{ width: '100%', padding: '10px', background: game.selectedSum === game.diceSum ? '#4ade80' : '#444', cursor: 'pointer' }}>
                        CONFIRM MOVE
                    </button>
                )}
                
                {game.turn === 'PLAYER' && game.phase === 'ROLL' && (
                    <button onClick={game.rollDice} disabled={game.isRolling} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>
                        {game.isRolling ? 'ROLLING...' : 'ROLL DICE'}
                    </button>
                )}
            </div>

            <IsometricRenderer
                {...grids}
                updateTrigger={updateTrigger}
                modelsLoaded={modelsLoaded}
                gameStatus={game.gameStatus}
                clickableTypes={game.turn === 'PLAYER' ? ['pin', 'dice'] : []} 
                onObjectClick={handleObjectClick}
                cameraLookAtY={0} 
            />
        </div>
    );
};

export default ShutTheBoxGame;