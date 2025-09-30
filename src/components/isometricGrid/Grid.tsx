// Cube with color information
type Cube = {
    x: number;
    y: number;
    color: string | number; // Hex color string or THREE.js color number
    type: string; // cube type identifier
};

class CubeGrid {
    private cubes: Cube[];

    constructor() {
        this.cubes = [];
    }

    // Add a cube to the list
    addCube(x: number, y: number, color: string | number, type: string = 'default'): void {
        this.cubes.push({ x, y, color, type });
    }

    // Get all cubes
    getCubes(): Cube[] {
        return this.cubes;
    }

    // Clear all cubes
    clear(): void {
        this.cubes = [];
    }

    // Get cube count
    count(): number {
        return this.cubes.length;
    }
}

export { CubeGrid, type Cube };
