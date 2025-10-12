// Type stubs for three/examples modules used in the project
// These are permissive (any) because examples don't ship full TS declarations.

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
  import { WebGLRenderer, Camera, WebGLRenderTarget } from 'three';
  export class EffectComposer {
    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
    setSize(width: number, height: number): void;
    render(delta?: number): void;
    dispose(): void;
    addPass(pass: any): void;
    removePass?(pass: any): void;
    readBuffer?: WebGLRenderTarget;
    writeBuffer?: WebGLRenderTarget;
  }
  // Provide both named and default export to match different import styles
  export default EffectComposer;
  export { EffectComposer };
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
  import { Scene, Camera } from 'three';
  export class RenderPass {
    constructor(scene?: Scene, camera?: Camera, overrideMaterial?: any, clearColor?: any);
    setSize?(w: number, h: number): void;
  }
  export default RenderPass;
  export { RenderPass };
}

declare module 'three/examples/jsm/postprocessing/ShaderPass' {
  import { WebGLRenderer, WebGLRenderTarget, Texture } from 'three';
  export class ShaderPass {
    constructor(shader?: any, textureID?: string);
    render(renderer: WebGLRenderer, writeBuffer?: WebGLRenderTarget, readBuffer?: WebGLRenderTarget, delta?: number, maskActive?: boolean): void;
    material: any;
    setSize?(w: number, h: number): void;
  }
  export default ShaderPass;
  export { ShaderPass };
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    update(): void;
    enableDamping: boolean;
    dampingFactor: number;
    dispose(): void;
  }
  export default OrbitControls;
  export { OrbitControls };
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { LoadingManager } from 'three';
  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    loadAsync(url: string): Promise<any>;
    load(url: string, onLoad: (gltf: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  }
  export default GLTFLoader;
  export { GLTFLoader };
}
