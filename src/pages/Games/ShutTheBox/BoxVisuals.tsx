import { useEffect } from 'react';
import type { PinState, Turn, GameMode } from './GameTypes';
import { BOX_WIDTH, BOX_DEPTH, PIN_SPACING } from './GameTypes';

interface VisualsProps {
    playerPins: PinState[];
    aiPins: PinState[];
    displayDice: number[];
    isRolling: boolean;
    turn: Turn;
    gameMode: GameMode;
    diceRotationOffset: { x: number; z: number };
    grids: { cubeGrid: any; objectGrid: any; decorationGrid: any };
}

const BoxVisuals = ({ playerPins, aiPins, displayDice, isRolling, turn, gameMode, diceRotationOffset, grids }: VisualsProps) => {
    const { cubeGrid, objectGrid, decorationGrid } = grids;

    // Layout Logic
    const isSolo = gameMode === 'SOLO';
    const PLAYER_Y_OFFSET = isSolo ? 0 : 6;
    const AI_Y_OFFSET = -6;

    useEffect(() => {
        cubeGrid.clear();
        const renderBoxBase = (offsetY: number, color: number) => {
            const xO = -Math.floor(BOX_WIDTH / 2);
            const yO = -Math.floor(BOX_DEPTH / 2) + offsetY;
            for (let x = 0; x < BOX_WIDTH; x++) {
                for (let y = 0; y < BOX_DEPTH; y++) {
                    const isB = x === 0 || x === BOX_WIDTH - 1 || y === 0 || y === BOX_DEPTH - 1;
                    cubeGrid.addCube(x + xO, y + yO, isB ? 0x8B4513 : color, isB ? 'wood' : 'felt');
                }
            }
        };

        renderBoxBase(PLAYER_Y_OFFSET, 0x2E8B57); 
        if (!isSolo) {
            renderBoxBase(AI_Y_OFFSET, 0x4B0082); 
        }
    }, [cubeGrid, isSolo, PLAYER_Y_OFFSET]);

    useEffect(() => {
        objectGrid.clear();
        decorationGrid.clear();

        const renderPinsAndDice = (pins: PinState[], offsetY: number, isCurrentTurn: boolean, isAI: boolean) => {
            const xStart = -((9 - 1) * PIN_SPACING) / 2;
            const pinYPos = offsetY - 2;

            pins.forEach((status, i) => {
                const px = xStart + (i * PIN_SPACING);
                const objectId = `pin_${offsetY}_${i}`; 
                if (status !== 'SHUT') objectGrid.addObject(px, pinYPos, 1.0, 0.5, 0x2E8B57, objectId);
                
                const rotation = status === 'SHUT' ? { x: -Math.PI / 2, y: 0, z: 0 } : { x: 0, y: 0, z: 0 };
                decorationGrid.addDecoration(px, pinYPos, status === 'SHUT' ? 1.55 : 1.5, 'pin', status === 'SELECTED' ? `pin_select_${i+1}` : `pin_${i+1}`, rotation);
            });

            if (isCurrentTurn) {
                const diceY = offsetY + 1;
                [ {x: -1.5, v: displayDice[0]}, {x: 1.5, v: displayDice[1]} ].forEach((d, i) => {
                    const rot = getDiceRot(d.v);
                    if (isRolling) { rot.x += diceRotationOffset.x + i; rot.z += diceRotationOffset.z + i; }
                    objectGrid.addObject(d.x, diceY, 1.0, 1.6, 0xffffff, 'dice', 0.5);
                    decorationGrid.addDecoration(d.x, diceY, 2.5, 'dice', 'dice', rot);
                });
            }
        };

        const getDiceRot = (val: number) => {
            const map: any = { 1:[0,0,0], 6:[Math.PI,0,0], 2:[0,0,Math.PI/2], 5:[0,0,-Math.PI/2], 3:[Math.PI/2,0,0], 4:[-Math.PI/2,0,0] };
            const r = map[val] || [0,0,0];
            return { x: r[0], y: r[1], z: r[2] };
        };

        renderPinsAndDice(playerPins, PLAYER_Y_OFFSET, turn === 'PLAYER', false);
        if (!isSolo) {
            renderPinsAndDice(aiPins, AI_Y_OFFSET, turn === 'AI', true);
        }
    }, [playerPins, aiPins, displayDice, isRolling, turn, isSolo, PLAYER_Y_OFFSET, diceRotationOffset]);

    return null;
};

export default BoxVisuals;