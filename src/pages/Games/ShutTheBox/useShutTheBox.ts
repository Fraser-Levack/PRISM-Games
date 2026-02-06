import { useState, useEffect, useMemo, useCallback } from 'react';
import type { PinState, GamePhase, GameMode, Turn, GameStatus } from './GameTypes';
import { ShutTheBoxStrategy } from './StrategyEngine';

export const useShutTheBox = () => {
    const strategyEngine = useMemo(() => new ShutTheBoxStrategy(), []);
    const [strategyLoaded, setStrategyLoaded] = useState(false);
    
    // Split State for Hot Potato
    const [playerPins, setPlayerPins] = useState<PinState[]>(Array(9).fill('OPEN'));
    const [aiPins, setAiPins] = useState<PinState[]>(Array(9).fill('OPEN'));
    
    const [dice, setDice] = useState<number[]>([1, 1]);
    const [displayDice, setDisplayDice] = useState<number[]>([1, 1]);
    const [phase, setPhase] = useState<GamePhase>('ROLL');
    const [gameStatus, setGameStatus] = useState<GameStatus>('paused');
    const [turn, setTurn] = useState<Turn>('PLAYER');
    const [gameMode, setGameMode] = useState<GameMode>('SOLO');
    const [message, setMessage] = useState("Roll the dice to begin.");
    const [isRolling, setIsRolling] = useState(false);
    const [lossReason, setLossReason] = useState<string | null>(null);
    const [diceRotationOffset, setDiceRotationOffset] = useState({ x: 0, z: 0 });

    // Derived State
    const currentPins = turn === 'PLAYER' ? playerPins : aiPins;
    const diceSum = dice[0] + dice[1];
    const selectedSum = currentPins.reduce((acc, s, i) => s === 'SELECTED' ? acc + (i + 1) : acc, 0);

    const calculateScore = (pins: PinState[]) => 
        pins.reduce((acc, s, i) => s !== 'SHUT' ? acc + (i + 1) : acc, 0);

    const handleRestart = (mode: GameMode = 'SOLO') => {
        setPlayerPins(Array(9).fill('OPEN'));
        setAiPins(Array(9).fill('OPEN'));
        setDice([1, 1]);
        setPhase('ROLL');
        setGameStatus('playing');
        setTurn('PLAYER');
        setGameMode(mode);
        setLossReason(null);
        setMessage("Player starts! Roll the dice.");
    };

    const checkCanMove = (target: number, pins: PinState[]): boolean => {
        const avail = pins.map((s, i) => s === 'OPEN' ? i + 1 : 0).filter(n => n > 0);
        const solve = (t: number, a: number[]): boolean => {
            if (t === 0) return true;
            if (t < 0 || a.length === 0) return false;
            return solve(t - a[0], a.slice(1)) || solve(t, a.slice(1));
        };
        return solve(target, avail);
    };

    const rollDice = useCallback(() => {
        if (gameStatus !== 'playing' || isRolling) return;
        setIsRolling(true);
        setMessage(turn === 'AI' ? "AI is Rolling..." : "You are Rolling...");

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        
        let frame = 0;
        const TOTAL_FRAMES = 10; // 30 FPS for dice animation


        const animate = () => {
            if (frame++ < TOTAL_FRAMES) {
                setDisplayDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
                setDiceRotationOffset({ x: Math.random() * 2, z: Math.random() * 2 });
                requestAnimationFrame(animate);
            } else {
                setIsRolling(false);
                setDice([d1, d2]);
                setDisplayDice([d1, d2]);
                setDiceRotationOffset({ x: 0, z: 0 });
                
                if (!checkCanMove(d1 + d2, turn === 'PLAYER' ? playerPins : aiPins)) {
                if (gameMode === 'SOLO') {
                    setLossReason('no_moves');
                    setMessage(`Rolled ${d1+d2}. No more moves!`);
                    setGameStatus('lost'); // In Solo, getting stuck is a loss (unless you shut the box)
                    setPhase('GAME_OVER');
                } else {
                    const finalPlayerScore = calculateScore(playerPins);
                    const finalAiScore = calculateScore(aiPins);
                    setLossReason('no_moves');
                    setMessage(`${turn} rolled ${d1+d2} and is stuck!`);
                    setGameStatus(finalPlayerScore <= finalAiScore ? 'won' : 'lost');
                    setPhase('GAME_OVER');
                }
                } else {
                    setPhase('SELECT');
                    setMessage(`Rolled ${d1+d2}. Select pins.`);
                }
            }
        };
        animate();
    }, [gameStatus, isRolling, playerPins, aiPins, turn]);

    const confirmMove = (overridePins?: PinState[]) => {
    const pinsToUpdate = overridePins || (turn === 'PLAYER' ? playerPins : aiPins);
    const nextState = pinsToUpdate.map(p => p === 'SELECTED' ? 'SHUT' : p);
    
    if (turn === 'PLAYER') setPlayerPins(nextState);
    else setAiPins(nextState);

    if (nextState.every(p => p === 'SHUT')) {
        setMessage(`${turn} SHUT THE BOX!`);
        setGameStatus(turn === 'PLAYER' ? 'won' : 'lost');
        setPhase('GAME_OVER');
        return;
    }

    // Logic for swapping turns
    if (gameMode === 'SOLO') {
        setPhase('ROLL');
        setMessage("Roll again!");
    } else {
        // Swap Turn (Hot Potato / VS_AI)
        const nextTurn = turn === 'PLAYER' ? 'AI' : 'PLAYER';
        setTurn(nextTurn);
        setPhase('ROLL');
        setMessage(`${nextTurn}'s turn to roll.`);
    }
    };

    const togglePin = (index: number) => {
        if (turn === 'AI' || phase !== 'SELECT' || playerPins[index] === 'SHUT') return;
        setPlayerPins(prev => {
            const next = [...prev];
            next[index] = next[index] === 'OPEN' ? 'SELECTED' : 'OPEN';
            return next;
        });
    };

    // AI Brain Logic
    useEffect(() => {
        if (turn !== 'AI' || gameStatus !== 'playing' || !strategyLoaded || isRolling) return;
        
        const timer = setTimeout(() => {
            if (phase === 'ROLL') rollDice();
            else if (phase === 'SELECT') {
                const aiBinary = aiPins.map(p => p === 'SHUT' ? 1 : 0);
                const bestMove = strategyEngine.getBestMove(diceSum, aiBinary as any);
                
                if (bestMove) {
                    const nextPins = aiPins.map((s, i) => bestMove.includes(i + 1) ? 'SELECTED' : s);
                    setAiPins(nextPins);
                    setTimeout(() => confirmMove(nextPins), 800);
                }
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [turn, phase, gameStatus, isRolling, strategyLoaded, diceSum, aiPins]);

    // Strategy Loader
    useEffect(() => {
        fetch('/strategies/stb_strategy.txt').then(res => res.text()).then(text => {
            strategyEngine.loadStrategy(text);
            setStrategyLoaded(true);
        });
    }, [strategyEngine]);

    return {
        playerPins, aiPins, dice, displayDice, phase, gameStatus, turn, gameMode, 
        message, isRolling, lossReason, diceRotationOffset,
        diceSum, selectedSum, strategyLoaded,
        rollDice, confirmMove, togglePin, handleRestart, setGameStatus,
        playerScore: calculateScore(playerPins),
        aiScore: calculateScore(aiPins)
    };
};