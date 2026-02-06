import { useEffect } from 'react';
import type { PinState } from './GameTypes';
import { BOX_WIDTH, BOX_DEPTH, PIN_SPACING } from './GameTypes';

interface VisualsProps {
    pins: PinState[];
    displayDice: number[];
    isRolling: boolean;
    diceRotationOffset: { x: number; z: number };
    grids: { cubeGrid: any; objectGrid: any; decorationGrid: any };
}

const BoxVisuals = ({ pins, displayDice, isRolling, diceRotationOffset, grids }: VisualsProps) => {
    const { cubeGrid, objectGrid, decorationGrid } = grids;

    useEffect(() => {
        cubeGrid.clear();
        const xO = -Math.floor(BOX_WIDTH / 2), yO = -Math.floor(BOX_DEPTH / 2);
        for (let x = 0; x < BOX_WIDTH; x++) {
            for (let y = 0; y < BOX_DEPTH; y++) {
                const isB = x === 0 || x === BOX_WIDTH - 1 || y === 0 || y === BOX_DEPTH - 1;
                cubeGrid.addCube(x + xO, y + yO, isB ? 0x8B4513 : 0x2E8B57, isB ? 'wood' : 'felt');
            }
        }
    }, [cubeGrid]);

    useEffect(() => {
        objectGrid.clear();
        decorationGrid.clear();
        
        // Render Pins
        const xStart = -((9 - 1) * PIN_SPACING) / 2;
        pins.forEach((status, i) => {
            const px = xStart + (i * PIN_SPACING);
            if (status !== 'SHUT') objectGrid.addObject(px, -2, 1.0, 0.5, 0x2E8B57, 'pin');
            const rotation = status === 'SHUT' ? { x: -Math.PI / 2, y: 0, z: 0 } : { x: 0, y: 0, z: 0 };
            decorationGrid.addDecoration(px, -2, status === 'SHUT' ? 1.55 : 1.5, 'pin', status === 'SELECTED' ? `pin_select_${i+1}` : `pin_${i+1}`, rotation);
        });

        // Render Dice
        const getDiceRot = (val: number) => {
            const map: any = { 1:[0,0,0], 6:[Math.PI,0,0], 2:[0,0,Math.PI/2], 5:[0,0,-Math.PI/2], 3:[Math.PI/2,0,0], 4:[-Math.PI/2,0,0] };
            const r = map[val] || [0,0,0];
            return { x: r[0], y: r[1], z: r[2] };
        };

        [ {x: -1.5, v: displayDice[0]}, {x: 1.5, v: displayDice[1]} ].forEach((d, i) => {
            const rot = getDiceRot(d.v);
            if (isRolling) { rot.x += diceRotationOffset.x + i; rot.z += diceRotationOffset.z + i; }
            objectGrid.addObject(d.x, 2, 1.0, 1.2, 0xffffff, 'dice');
            decorationGrid.addDecoration(d.x, 2, 2.5, 'dice', 'dice', rot);
        });
    }, [pins, displayDice, isRolling, diceRotationOffset, objectGrid, decorationGrid]);

    return null;
};

export default BoxVisuals;