type Object = {
    x : number;
    y : number;
    z : number;
    height : number;
    color : string | number; // Hex color string or THREE.js color number
    type : string; // object type identifier
    scale: number; // optional scale for model sizing
};

class ObjectGrid {
    private objects: Object[];
    constructor() {
        this.objects = [];
    }

    // Add an object to the list
    addObject(x: number, y: number, z: number, height: number, color: string | number, type: string = 'default', scale: number = 1): void {
        this.objects.push({ x, y, z, height, color, type, scale });
    }

    // Remove an object at specific coordinates
    removeObject(x: number, y: number, z: number): void {
        this.objects = this.objects.filter(object => !(object.x === x && object.y === y && object.z === z));
    }

    // Get all objects
    getObjects(): Object[] {
        return this.objects;
    }

    // Clear all objects
    clear(): void {
        this.objects = [];
    }

    count(): number {
        return this.objects.length;
    }

}

export { ObjectGrid, type Object };