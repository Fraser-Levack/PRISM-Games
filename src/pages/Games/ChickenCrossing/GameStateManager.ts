export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface GameObject {
    id: string;
    type: string;
    position: Position;
    color: string | number;
    height?: number;
}

export interface GameState {
    player: GameObject;
    objects: GameObject[];
    cubeTypes: Map<string, string>; // Simple position->type mapping
    level: number;
    score: number;
    gameStatus: 'playing' | 'won' | 'lost' | 'paused';
    playerHolding?: string; // ID of object player is holding
}

export class GameStateManager {
    private static readonly STORAGE_KEY = 'chicken-crossing-isometric-game';

    public static saveState(state: GameState): void {
        // Convert Map to object for JSON serialization
        const serializableState = {
            ...state,
            cubeTypes: Object.fromEntries(state.cubeTypes)
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializableState));
    }

    public static loadState(): GameState | null {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return null;
        
        const parsed = JSON.parse(stored);
        
        // Convert object back to Map
        return {
            ...parsed,
            cubeTypes: new Map(Object.entries(parsed.cubeTypes || {}))
        };
    }

    public static clearState(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    private static createDefaultCubeTypes(): Map<string, string> {
        const cubeTypes = new Map<string, string>();
        
        const gridWidth = 20;
        const gridHeight = 12;
        const riverStart = 3;
        const riverEnd = gridWidth - 4;
        const riverWidth = 6;

        const xOffset = -Math.floor(gridWidth / 2);
        const yOffset = -Math.floor(gridHeight / 2);

        // Fill with ground first
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                const key = `${x + xOffset},${y + yOffset}`;
                cubeTypes.set(key, 'ground');
            }
        }

        // Add river
        for (let y = 0; y < gridHeight; y++) {
            const meander = Math.round(Math.sin(y / 2.5) * 2);
            const riverCenter = Math.floor((riverStart + riverEnd) / 2) + meander;
            for (let x = riverStart; x < riverEnd; x++) {
                if (Math.abs(x - riverCenter) <= Math.floor(riverWidth / 2)) {
                    const key = `${x + xOffset},${y + yOffset}`;
                    cubeTypes.set(key, 'water');
                }
            }
        }

        return cubeTypes;
    }

    public static getDefaultState(): GameState {
        return {
            player: {
                id: 'player',
                type: 'player',
                position: { x: -9, y: -5, z: 1 },
                color: 0xffff00,
                height: 0.4
            },
            objects: [
                {
                    id: 'chicken',
                    type: 'chicken',
                    position: { x: -9, y: 0, z: 1 },
                    color: 0xff0000,
                    height: 0.4
                },
                {
                    id: 'fox',
                    type: 'fox',
                    position: { x: -9, y: 2, z: 1 },
                    color: 0x00ff00,
                    height: 0.4
                },
                {
                    id: 'grain',
                    type: 'grain',
                    position: { x: -9, y: 4, z: 1 },
                    color: 0xffff00,
                    height: 0.4
                },
                {
                    id: 'boat',
                    type: 'boat',
                    position: { x: -2, y: -1, z: 0.5 },
                    color: 0x8B4513,
                    height: 0.2
                }
            ],
            cubeTypes: this.createDefaultCubeTypes(),
            level: 1,
            score: 0,
            gameStatus: 'playing'
        };
    }

    private static getCubeTypeAt(state: GameState, x: number, y: number): string | undefined {
        const key = `${x},${y}`;
        return state.cubeTypes.get(key);
    }

    public static movePlayer(state: GameState, direction: 'up' | 'down' | 'left' | 'right'): GameState {
        const newState = { 
            ...state,
            player: { ...state.player },
            objects: [...state.objects]
        };
        
        const newPosition = { ...newState.player.position };
        
        switch (direction) {
            case 'up':
                newPosition.y -= 1;
                break;
            case 'down':
                newPosition.y += 1;
                break;
            case 'left':
                newPosition.x -= 1;
                break;
            case 'right':
                newPosition.x += 1;
                break;
        }

        // Check bounds
        if (newPosition.x < -10 || newPosition.x > 9 || newPosition.y < -6 || newPosition.y > 5) {
            return state;
        }

        // Check cube type at target position, allow moving if ground or if boat object is present
        const isBoatAtTarget = newState.objects.some(obj =>
            obj.type === 'boat' &&
            (
            (obj.position.x === newPosition.x || obj.position.x + 1 === newPosition.x) &&
            obj.position.y === newPosition.y
            )
        );
        const cubeType = this.getCubeTypeAt(state, newPosition.x, newPosition.y);
        if (cubeType !== 'ground' && !isBoatAtTarget) {
            return state; // Don't move if not ground or boat
        }

        // check if other objects occupy the space (apart from boat)
        const occupied = newState.objects.some(obj => 
            obj.id !== 'boat' &&
            obj.position.x === newPosition.x &&
            obj.position.y === newPosition.y &&
            Math.abs(obj.position.z - newPosition.z) < 1
        );

        if (occupied) {
            return state; // Don't move if space is occupied
        }

        newState.player.position = newPosition;
        if (state.playerHolding) {
            // Move held object with player
            const heldObjectIndex = newState.objects.findIndex(obj => obj.id === state.playerHolding);
            if (heldObjectIndex !== -1) {
                // Create a separate position object for the held item
                const heldObjectPosition = { 
                    x: newPosition.x, 
                    y: newPosition.y, 
                    z: newState.player.position.z + 1 
                };
                newState.objects[heldObjectIndex].position = heldObjectPosition;
            }
        }

        this.saveState(newState);
        return newState;
    }

    public static handleEnter(state: GameState, setState: (state: GameState) => void): void {
        const playerPos = state.player.position;
        const nearestObj = this.getNearestObjectWithinRange(state, playerPos, 2);
        
        if (!nearestObj) {
            return;
        }

        if (state.playerHolding) {
            // If player is holding something, drop it
            const heldObjectIndex = state.objects.findIndex(obj => obj.id === state.playerHolding);
            // check available space around player to drop (eg not water or occupied)
            // Try to drop at adjacent positions around the player (including current position)
            const directions = [
                { dx: 0, dy: 0 }, // Current position first
                { dx: 1, dy: 0 },
                { dx: -1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: 0, dy: -1 }
            ];
            let dropPosition: Position | null = null;
            for (const dir of directions) {
                const candidate = { 
                    x: playerPos.x + dir.dx, 
                    y: playerPos.y + dir.dy, 
                    z: 1 // Explicitly set z to 1 instead of using playerPos.z
                };
                if (this.isPositionAvailable(state, candidate)) {
                    dropPosition = candidate;
                    break;
                }
            }
            const isSpaceAvailable = !!dropPosition;
            if (heldObjectIndex !== -1 && isSpaceAvailable && dropPosition) {
                console.log(`Dropping object at position:`, dropPosition); // Debug log
                const newState = { 
                    ...state,
                    objects: state.objects.map(obj =>
                        obj.id === state.playerHolding
                            ? { ...obj, position: { ...dropPosition } } // Spread the dropPosition to ensure it's a new object
                            : obj
                    ),
                    playerHolding: undefined
                };
                this.saveState(newState);
                setState(newState);
            } else {
                console.log('Cannot drop object: no available space or object not found', { heldObjectIndex, isSpaceAvailable, dropPosition }); // Debug log
            }
            return;
        }

        if (nearestObj.type === 'boat') {
            // Check if boat is at starting position or destination position
            const isAtStart = nearestObj.position.x === -2 && nearestObj.position.y === -1;
            const isAtDestination = nearestObj.position.x === 3 && nearestObj.position.y === -1;
            
            let newBoatPos: Position;
            let newPlayerPos: Position;
            
            if (isAtStart) {
                // Move to destination (across the river)
                newBoatPos = { x: 3, y: -1, z: nearestObj.position.z };
                newPlayerPos = { x: 3, y: -1, z: state.player.position.z };
            } else if (isAtDestination) {
                // Move back to start
                newBoatPos = { x: -2, y: -1, z: nearestObj.position.z };
                newPlayerPos = { x: -2, y: -1, z: state.player.position.z };
            } else {
                // If boat is in some other position, move to start as default
                newBoatPos = { x: -2, y: -1, z: nearestObj.position.z };
                newPlayerPos = { x: -2, y: -1, z: state.player.position.z };
            }
            
            // Update both boat and player positions
            const newState = this.moveObject(state, nearestObj.id, newBoatPos);
            const finalState = {
                ...newState,
                player: {
                    ...newState.player,
                    position: newPlayerPos
                }
            };
            
            this.saveState(finalState);
            setState(finalState);
        } else if (nearestObj.type === 'grain') {
            // just log pickup grain
            console.log('Picked up grain!');
            // set playerHolding to grain id and move the gain to same x and y as player but z +1
            const newState = { 
                ...state,
                playerHolding: nearestObj.id,
                objects: state.objects.map(obj =>
                    obj.id === nearestObj.id
                        ? { ...obj, position: { x: state.player.position.x, y: state.player.position.y, z: state.player.position.z + 1 } }
                        : obj
                )
            };
            this.saveState(newState);
            setState(newState);
        } else if (nearestObj.type === 'chicken') {
            // just log pickup chicken
            console.log('Picked up chicken!');
            // set playerHolding to chicken id and move the chicken to same x and y as player but z +1
            const newState = {
                ...state,
                playerHolding: nearestObj.id,
                objects: state.objects.map(obj =>
                    obj.id === nearestObj.id
                        ? { ...obj, position: { x: state.player.position.x, y: state.player.position.y, z: state.player.position.z + 1 } }
                        : obj
                )
            };
            this.saveState(newState);
            setState(newState);
        } else if (nearestObj.type === 'fox') {
            // just log pickup fox
            console.log('Picked up fox!');
            // set playerHolding to fox id and move the fox to same x and y as player but z +1
            const newState = {
                ...state,
                playerHolding: nearestObj.id,
                objects: state.objects.map(obj =>
                    obj.id === nearestObj.id
                        ? { ...obj, position: { x: state.player.position.x, y: state.player.position.y, z: state.player.position.z + 1 } }
                        : obj
                )   
            };
            this.saveState(newState);
            setState(newState);
        }
    }

    public static moveObject(state: GameState, objectId: string, newPosition: Position): GameState {
        const newState = { 
            ...state,
            objects: state.objects.map(obj => 
                obj.id === objectId 
                    ? { ...obj, position: { ...newPosition } }
                    : obj
            )
        };
        
        this.saveState(newState);
        return newState;
    }

    public static addObject(state: GameState, object: GameObject): GameState {
        const newState = { 
            ...state,
            objects: [...state.objects, object]
        };
        
        this.saveState(newState);
        return newState;
    }

    public static removeObject(state: GameState, objectId: string): GameState {
        const newState = { 
            ...state,
            objects: state.objects.filter(obj => obj.id !== objectId)
        };
        
        this.saveState(newState);
        return newState;
    }

    public static checkCollisions(state: GameState): { collision: boolean; objectId?: string } {
        const playerPos = state.player.position;

        for (const obj of state.objects) {
            // For boat, check both its position.x and position.x + 1
            if (
                (
                    obj.type === 'boat' &&
                    (
                        obj.position.x === playerPos.x ||
                        obj.position.x + 1 === playerPos.x
                    ) &&
                    obj.position.y === playerPos.y &&
                    Math.abs(obj.position.z - playerPos.z) < 1
                ) ||
                (
                    obj.type !== 'boat' &&
                    obj.position.x === playerPos.x &&
                    obj.position.y === playerPos.y &&
                    Math.abs(obj.position.z - playerPos.z) < 1
                )
            ) {
                return { collision: true, objectId: obj.id };
            }
        }

        return { collision: false };
    }

    public static updateScore(state: GameState, points: number): GameState {
        const newState = { 
            ...state,
            score: state.score + points
        };
        
        this.saveState(newState);
        return newState;
    }

    public static setGameStatus(state: GameState, status: GameState['gameStatus']): GameState {
        const newState = { 
            ...state,
            gameStatus: status
        };
        
        this.saveState(newState);
        return newState;
    }

    public static resetToDefault(): GameState {
        const defaultState = this.getDefaultState();
        this.saveState(defaultState);
        return defaultState;
    }

    public static getObjectsAtPosition(state: GameState, position: Position): GameObject[] {
        return state.objects.filter(obj => {
            if (obj.type === 'boat') {
                // Boat occupies both its position.x and position.x + 1
                return (
                    (obj.position.x === position.x || obj.position.x + 1 === position.x) &&
                    obj.position.y === position.y &&
                    Math.abs(obj.position.z - position.z) < 1
                );
            } else {
                return (
                    obj.position.x === position.x &&
                    obj.position.y === position.y &&
                    Math.abs(obj.position.z - position.z) < 1
                );
            }
        });
    }

    public static isPositionAvailable(state: GameState, position: Position): boolean {
        // Check bounds
        if (position.x < -10 || position.x > 9 || position.y < -6 || position.y > 5) {
            return false;
        }
        // Check cube type
        const cubeType = this.getCubeTypeAt(state, position.x, position.y);
        if (cubeType !== 'ground') {
            // Allow boat as valid position
            const isBoatAtTarget = state.objects.some(obj =>
                obj.type === 'boat' &&
                (
                    obj.position.x === position.x || obj.position.x + 1 === position.x
                ) &&
                obj.position.y === position.y
            );
            if (!isBoatAtTarget) {
                return false;
            }
        }
        // Check if occupied by other objects (except boat)
        const occupied = state.objects.some(obj =>
            obj.id !== 'boat' &&
            obj.position.x === position.x &&
            obj.position.y === position.y &&
            Math.abs(obj.position.z - position.z) < 1
        );
        if (occupied) {
            return false;
        }
        return true;
    }

    public static getNearestObjectWithinRange(state: GameState, position: Position, range: number): GameObject | null {
        
        let nearestObject: GameObject | null = null;
        let nearestDistance = Infinity;
        
        // Check all objects and calculate their actual distances
        state.objects.forEach(obj => {
            let distance: number;
            let positionInfo: string;
            
            if (obj.type === 'boat') {
                // For boat, calculate distance to both positions and use the minimum
                const dx1 = obj.position.x - position.x;
                const dy1 = obj.position.y - position.y;
                const dz1 = obj.position.z - position.z;
                const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1 + dz1 * dz1);
                
                const dx2 = (obj.position.x + 1) - position.x;
                const dy2 = obj.position.y - position.y;
                const dz2 = obj.position.z - position.z;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);
                
                distance = Math.min(distance1, distance2);
                positionInfo = `boat at (${obj.position.x}, ${obj.position.y}, ${obj.position.z}) & (${obj.position.x + 1}, ${obj.position.y}, ${obj.position.z})`;
            } else {
                const dx = obj.position.x - position.x;
                const dy = obj.position.y - position.y;
                const dz = obj.position.z - position.z;
                distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                positionInfo = `${obj.type} at (${obj.position.x}, ${obj.position.y}, ${obj.position.z})`;
            }
            
            
            // Only consider objects within range
            if (distance <= range && distance < nearestDistance) {
                nearestDistance = distance;
                nearestObject = obj;
            }
        });
        return nearestObject;
    }
}