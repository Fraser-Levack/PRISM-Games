import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CubeGrid, type Cube } from './CubeGrid';
import { ObjectGrid, type Object } from './ObjectGrid';
import ModelManager from '../ModelManager';

interface IsometricRendererProps {
    cubeGrid: CubeGrid;
    objectGrid: ObjectGrid;
    updateTrigger?: number; // Simple prop to force re-render
    modelsLoaded?: boolean;
}

const IsometricRenderer = ({ cubeGrid, objectGrid, updateTrigger, modelsLoaded }: IsometricRendererProps) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Clear any existing content
        mountRef.current.innerHTML = '';

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0.005, 0.0025, 0.015); // Pure base color without the additional terms

        // Create orthographic camera for true isometric view
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 20;
        const camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );

        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        mountRef.current.appendChild(renderer.domElement);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 1.2); // Increased from 0.6 to 1.2
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased from 0.8 to 1.5
        directionalLight.position.set(10, 8, 5);
        scene.add(directionalLight);

        // Create grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Add all cubes
        const cubes = cubeGrid.getCubes();
        const cubeMeshes: THREE.Mesh[] = [];
        
        cubes.forEach((cube: Cube) => {
            const height = cube.type === 'water' ? 0.5 : 1;
            const geometry = new THREE.BoxGeometry(1, height, 1);
            const material = new THREE.MeshLambertMaterial({ color: cube.color });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(cube.x, height / 2, cube.y);
            
            scene.add(mesh);
            cubeMeshes.push(mesh);
        });

        // Add all objects
        const objects = objectGrid.getObjects();
    const objectMeshes: THREE.Mesh[] = [];
    // Keep track of cloned Object3D instances (from GLTF) so we can dispose them on cleanup
    const clonedObjects: THREE.Object3D[] = [];
        
        objects.forEach((object: Object) => {
            // Try to use GLTF models for chicken/fox/grain. Boat and other objects keep existing primitives.
            const modelNames = ['chicken', 'fox', 'grain'];
            const wantsModel = modelNames.includes(object.type);

            if (wantsModel) {
                const clone = ModelManager.getClone(object.type);
                if (clone) {
                    // Position the clone appropriately. Models are centered at origin in many exports;
                    // place them so their base sits on top of the cube (object.z + object.height)
                    clone.position.set(object.x, object.z + object.height, object.y);
                    // Optionally scale models down to fit the grid; tweak this as needed
                    clone.scale.setScalar(0.8);
                    scene.add(clone);
                    clonedObjects.push(clone);
                    return; // skip primitive creation
                }
                // fallthrough to sphere if model not available
            }

            let mesh: THREE.Mesh;

            if (object.type === 'boat') {
                // Flat-top cylinder, occupies two spaces in X direction
                const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 24); // radius 1, height 1
                const material = new THREE.MeshLambertMaterial({ color: object.color });
                mesh = new THREE.Mesh(geometry, material);

                // Shift the boat forward by half its length so the stern is at object.x
                mesh.position.set(object.x + 0.5, object.z + object.height, object.y);
                mesh.scale.x = 2; // Stretch in X direction to occupy two spaces
            } else {
                // Default: sphere
                const geometry = new THREE.SphereGeometry(0.4, 16, 12);
                const material = new THREE.MeshLambertMaterial({ color: object.color });
                mesh = new THREE.Mesh(geometry, material);

                mesh.position.set(object.x, object.z + object.height, object.y);
            }

            scene.add(mesh);
            objectMeshes.push(mesh);
        });

        // Handle window resize
        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            camera.left = frustumSize * aspect / -2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Simple animation loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup function
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            
            // Dispose of all geometries and materials for meshes
            [...cubeMeshes, ...objectMeshes].forEach(mesh => {
                try {
                    mesh.geometry.dispose();
                } catch (e) {
                    // ignore
                }
                try {
                    (mesh.material as THREE.Material).dispose();
                } catch (e) {
                    // ignore
                }
            });

            // Remove and dispose cloned GLTF objects
            clonedObjects.forEach(obj => {
                try {
                    obj.traverse((n: any) => {
                        if (n.isMesh) {
                            if (n.geometry) n.geometry.dispose();
                            const disposeMaterial = (mat: any) => {
                                if (!mat) return;
                                if (mat.map) mat.map.dispose();
                                if (typeof mat.dispose === 'function') mat.dispose();
                            };
                            if (Array.isArray(n.material)) n.material.forEach(disposeMaterial);
                            else disposeMaterial(n.material);
                        }
                    });
                } catch (e) {
                    // ignore
                }
                if (obj.parent) obj.parent.remove(obj);
            });
            
            renderer.dispose();
            
            if (mountRef.current) {
                mountRef.current.innerHTML = '';
            }
        };
    }, [cubeGrid, objectGrid, updateTrigger, modelsLoaded]); // Re-run when any of these change

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div 
                ref={mountRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    overflow: 'hidden'
                }} 
            />
            {!modelsLoaded && (
                <div style={{
                    position: 'absolute',
                    left: 12,
                    top: 12,
                    zIndex: 200,
                    padding: '6px 10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    borderRadius: 6,
                    fontSize: 12
                }}>
                    Loading models...
                </div>
            )}
        </div>
    );
};

export default IsometricRenderer;