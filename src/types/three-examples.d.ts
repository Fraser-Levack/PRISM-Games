// Minimal declarations for three/examples imports used in this project.
// This prevents TS errors when importing Example modules without full types.

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { LoadingManager, FileLoader } from 'three';
  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    loadAsync(url: string): Promise<any>;
    load(url: string, onLoad: (gltf: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  }
}
