import { useState, useEffect, useMemo, useCallback } from 'react';
import type { PinState, GamePhase, GameMode, Turn, GameStatus } from './GameTypes';
import { ShutTheBoxStrategy } from './StrategyEngine';

export const useShutTheBox = () => {
    const strategyEngine = useMemo(() => new ShutTheBoxStrategy(), []);
    const [strategyLoaded, setStrategyLoaded] = useState(false);
    
    // State
    const [pins, setPins] = useState<PinState[]>(Array(9).fill('OPEN'));
    const [dice, setDice] = useState<number[]>([1, 1]);
    const [displayDice, setDisplayDice] = useState<number[]>([1, 1]);
    const [phase, setPhase] = useState<GamePhase>('ROLL');
    const [gameStatus, setGameStatus] = useState<GameStatus>('paused');
    const [turn, setTurn] = useState<Turn>('PLAYER');
    const [gameMode, setGameMode] = useState<GameMode>('SOLO');
    const [message, setMessage] = useState("Roll the dice to begin.");
    const [playerScore, setPlayerScore] = useState<number | null>(null);
    const [aiScore, setAiScore] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [lossReason, setLossReason] = useState<string | null>(null);
    const [diceRotationOffset, setDiceRotationOffset] = useState({ x: 0, z: 0 });

    const diceSum = dice[0] + dice[1];
    const selectedSum = pins.reduce((acc, s, i) => s === 'SELECTED' ? acc + (i + 1) : acc, 0);

    const handleRestart = (mode: GameMode = 'SOLO') => {
        setPins(Array(9).fill('OPEN'));
        setDice([1, 1]);
        setPhase('ROLL');
        setGameStatus('playing');
        setTurn('PLAYER');
        setGameMode(mode);
        setPlayerScore(null);
        setAiScore(null);
        setLossReason(null);
        setMessage("Roll the dice to begin.");
    };

    const handleNextRound = () => {
        setTurn('AI');
        setPins(Array(9).fill('OPEN'));
        setPhase('ROLL');
        setGameStatus('playing');
        setMessage("AI is starting its round...");
    };

    const handleRoundOver = useCallback((finalPins: PinState[], result: 'won' | 'lost') => {
        const score = finalPins.reduce((acc, s, i) => s !== 'SHUT' ? acc + (i + 1) : acc, 0);
        setPhase('GAME_OVER');
        
        if (gameMode === 'SOLO') {
            setGameStatus(result);
        } else if (turn === 'PLAYER') {
            setPlayerScore(score);
            setGameStatus('paused');
        } else {
            setAiScore(score);
            setGameStatus(playerScore !== null && score < playerScore ? 'won' : 'lost');
        }
    }, [gameMode, turn, playerScore]);

    const rollDice = useCallback(() => {
        if (gameStatus !== 'playing' || isRolling) return;
        setIsRolling(true);
        setMessage(turn === 'AI' ? "AI is Rolling..." : "Rolling...");

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        
        let frame = 0;
        const animate = () => {
            if (frame++ < 30) {
                setDisplayDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
                setDiceRotationOffset({ x: Math.random() * 2, z: Math.random() * 2 });
                requestAnimationFrame(animate);
            } else {
                setIsRolling(false);
                setDice([d1, d2]);
                setDisplayDice([d1, d2]);
                setDiceRotationOffset({ x: 0, z: 0 });
                
                const avail = pins.map((s, i) => s === 'OPEN' ? i + 1 : 0).filter(n => n > 0);
                const canMove = (t: number, a: number[]): boolean => {
                    if (t === 0) return true;
                    if (t < 0 || a.length === 0) return false;
                    return canMove(t - a[0], a.slice(1)) || canMove(t, a.slice(1));
                };

                if (!canMove(d1 + d2, avail)) {
                    setLossReason('no_moves');
                    setMessage(`Rolled ${d1+d2}. No moves!`);
                    handleRoundOver(pins, 'lost');
                } else {
                    setPhase('SELECT');
                    setMessage(`Rolled ${d1+d2}. Select pins.`);
                }
            }
        };
        animate();
    }, [gameStatus, isRolling, pins, turn, handleRoundOver]);

    const confirmMove = (overridePins?: PinState[]) => {
        const currentPins = overridePins || pins;
        const newPins = currentPins.map(p => p === 'SELECTED' ? 'SHUT' : p);
        setPins(newPins);
        if (newPins.every(p => p === 'SHUT')) handleRoundOver(newPins, 'won');
        else {
            setPhase('ROLL');
            setMessage(turn === 'AI' ? "AI's Turn." : "Roll the dice.");
        }
    };

    const togglePin = (index: number) => {
        if (turn === 'AI' || phase !== 'SELECT' || pins[index] === 'SHUT') return;
        setPins(prev => {
            const next = [...prev];
            next[index] = next[index] === 'OPEN' ? 'SELECTED' : 'OPEN';
            return next;
        });
    };

    // AI Logic Loop
    useEffect(() => {
        if (turn !== 'AI' || gameStatus !== 'playing' || !strategyLoaded || isRolling) return;
        const timer = setTimeout(() => {
            if (phase === 'ROLL') rollDice();
            else if (phase === 'SELECT') {
                const aiPins = pins.map(p => p === 'SHUT' ? 1 : 0) as any;
                const bestMove = strategyEngine.getBestMove(diceSum, aiPins);
                if (bestMove) {
                    const nextPins = pins.map((s, i) => bestMove.includes(i + 1) ? 'SELECTED' : s);
                    setPins(nextPins);
                    setTimeout(() => confirmMove(nextPins), 800);
                }
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [turn, phase, gameStatus, isRolling, strategyLoaded, diceSum]);

    // Strategy Loader
    useEffect(() => {
        fetch('/strategies/stb_strategy.txt').then(res => res.text()).then(text => {
            strategyEngine.loadStrategy(text);
            setStrategyLoaded(true);
        });
    }, [strategyEngine]);

    return {
        pins, dice, displayDice, phase, gameStatus, turn, gameMode, 
        message, playerScore, aiScore, isRolling, lossReason, diceRotationOffset,
        diceSum, selectedSum, strategyLoaded,
        rollDice, confirmMove, togglePin, handleRestart, handleNextRound, setGameStatus
    };
};