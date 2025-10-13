type Decoration = {
    x: number;
    y: number;
    z: number;
    type: string; // decoration type identifier
    model: string; // model key
};

class DecorationGrid {
    private decorations: Decoration[];

    constructor() {
        this.decorations = [];
    }

    // Add a decoration to the list
    addDecoration(x: number, y: number, z: number, type: string, model: string): void {
        this.decorations.push({ x, y, z, type, model });
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