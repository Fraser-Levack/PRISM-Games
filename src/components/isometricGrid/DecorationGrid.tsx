type Decoration = {
    x: number;
    y: number;
    z: number;
    type: string; // decoration type identifier
    model: string; // model key
    rotation?: { x: number; y: number; z: number }; // optional Euler rotation in degrees/radians
};

class DecorationGrid {
    private decorations: Decoration[];

    constructor() {
        this.decorations = [];
    }

    // Add a decoration to the list
    addDecoration(
        x: number,
        y: number,
        z: number,
        type: string,
        model: string,
        rotation?: { x: number; y: number; z: number }
    ): void {
        const deco: Decoration = { x, y, z, type, model };
        if (rotation) deco.rotation = rotation;
        this.decorations.push(deco);
    }

    // Set rotation for an existing decoration at coordinates (x,y,z)
    setRotation(
        x: number,
        y: number,
        z: number,
        rotation: { x: number; y: number; z: number }
    ): void {
        const idx = this.decorations.findIndex(d => d.x === x && d.y === y && d.z === z);
        if (idx >= 0) {
            this.decorations[idx].rotation = rotation;
        }
    }

    // Remove a decoration at specific coordinates
    removeDecoration(x: number, y: number, z: number): void {
        this.decorations = this.decorations.filter(dec => !(dec.x === x && dec.y === y && dec.z === z));
    }

    // Get all decorations
    getDecorations(): Decoration[] {
        return this.decorations;
    }

    // Clear all decorations
    clear(): void {
        this.decorations = [];
    }

    // Get decoration count
    count(): number {
        return this.decorations.length;
    }

}

export { DecorationGrid, type Decoration };