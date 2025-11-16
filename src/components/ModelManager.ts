import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

type ModelKey = string;

class ModelManager {
	private loader: GLTFLoader;
		private cache: Map<ModelKey, any> = new Map();

	constructor() {
		this.loader = new GLTFLoader();
	}

	// Load a single model from a public URL (e.g. '/models/chicken.gltf')
		async load(name: ModelKey, url: string): Promise<any> {
		if (this.cache.has(name)) return this.cache.get(name)!;
		const gltf = await this.loader.loadAsync(url);
		this.cache.set(name, gltf);
		return gltf;
	}

	// Load multiple models in parallel. Accepts a mapping name -> url
		async loadAll(map: Record<ModelKey, string>): Promise<void> {
		const promises = Object.entries(map).map(([name, url]) => this.load(name, url).catch((err) => {
			console.error(`ModelManager: failed to load ${name} from ${url}:`, err);
			throw err;
		}));
		await Promise.all(promises);
	}

	has(name: ModelKey): boolean {
		return this.cache.has(name);
	}

	// Return the raw GLTF if needed
		getRaw(name: ModelKey): any | undefined {
		return this.cache.get(name);
	}

	// Return a deep-cloned Object3D ready to be inserted into a scene.
	// Returns null if the model hasn't been loaded.
	getClone(name: ModelKey, scale = 1): THREE.Object3D | null {
		const gltf = this.cache.get(name);
		if (!gltf) return null;

		// Deep clone scene and ensure geometry/materials are cloned to avoid shared mutation
		const cloned = gltf.scene.clone(true);

		cloned.traverse((node: any) => {
			if ((node as THREE.Mesh).isMesh) {
				const mesh = node as THREE.Mesh;
				// Clone geometry
				if (mesh.geometry) mesh.geometry = mesh.geometry.clone();
				// Clone material(s)
				if (Array.isArray(mesh.material)) {
					mesh.material = mesh.material.map((m: any) => (m && typeof m.clone === 'function') ? m.clone() : m);
				} else if (mesh.material && typeof mesh.material.clone === 'function') {
					mesh.material = mesh.material.clone();
				}
				// Ensure castShadow / receiveShadow defaults are settable
				mesh.castShadow = true;
				mesh.receiveShadow = true;
			}
		});

		// Apply uniform scale. Default behaviour: if model is 'tower' and no explicit scale passed, scale to 0.8
		const finalScale = (scale === 1 && name === 'tower') ? 0.8 : scale;
		if (finalScale !== 1) {
			cloned.scale.set(finalScale, finalScale, finalScale);
		}

		return cloned;
	}

	// Dispose of a cached model (geometries/materials/textures)
	dispose(name: ModelKey) {
		const gltf = this.cache.get(name);
		if (!gltf) return;
		gltf.scene.traverse((node: any) => {
			if ((node as THREE.Mesh).isMesh) {
				const mesh = node as THREE.Mesh;
				if (mesh.geometry) mesh.geometry.dispose();
				const disposeMaterial = (mat: any) => {
					if (!mat) return;
					if (mat.map) mat.map.dispose();
					if (mat.lightMap) mat.lightMap.dispose();
					if (mat.emissiveMap) mat.emissiveMap.dispose();
					if (mat.normalMap) mat.normalMap.dispose();
					if (mat.specularMap) mat.specularMap.dispose();
					if (mat.envMap) mat.envMap.dispose();
					if (typeof mat.dispose === 'function') mat.dispose();
				};
				if (Array.isArray(mesh.material)) mesh.material.forEach(disposeMaterial);
				else disposeMaterial(mesh.material);
			}
		});
		this.cache.delete(name);
	}

	// Dispose all cached models
	disposeAll() {
		for (const name of Array.from(this.cache.keys())) this.dispose(name);
	}
}

const modelManager = new ModelManager();
export default modelManager;

