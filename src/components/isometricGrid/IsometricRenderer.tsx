import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// Postprocessing imports (three examples)
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CubeGrid, type Cube } from './CubeGrid';
import { ObjectGrid, type Object } from './ObjectGrid';
import { DecorationGrid } from './DecorationGrid';
import ModelManager from '../ModelManager';

interface IsometricRendererProps {
    cubeGrid: CubeGrid;
    objectGrid: ObjectGrid;
    decorationGrid?: DecorationGrid;
    updateTrigger?: number; // Simple prop to force re-render
    modelsLoaded?: boolean;
    playerDirection?: 'left'|'right'|'up'|'down'; // <-- new prop
    playerCarry?: boolean;
    gameStatus?: 'playing' | 'won' | 'lost' | 'paused';
}

const IsometricRenderer = ({ cubeGrid, objectGrid, decorationGrid, updateTrigger, modelsLoaded, playerDirection, playerCarry, gameStatus }: IsometricRendererProps) => {
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
        const frustumSize = 16; // smaller -> zoom in a bit
        const camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );

        camera.position.set(8, 11, 8); // move camera slightly closer
        camera.lookAt(0, 3, 0);

        // Rotation state for win animation — initialize from the current camera so we don't "jump"
        // Compute spherical parameters from the current camera position.
        const initialRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
        let radius = initialRadius;
        let theta = Math.atan2(camera.position.z, camera.position.x); // derive from current position
        const baseCameraY = camera.position.y; // keep initial Y so bobbing is relative to it

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // Simple vibrance/brightness shader
        const VibranceShader = {
            uniforms: {
                tDiffuse: { value: null },
                brightness: { value: 1.20 }, // slightly reduced from 1.30
                vibrance: { value: 0.18 },   // toned down to avoid hue shifts
                exposure: { value: 1.1 },
                gamma: { value: 2.2 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float brightness;
                uniform float vibrance;
                uniform float exposure;
                uniform float gamma;
                varying vec2 vUv;

                vec3 aces(vec3 x) {
                    const float a = 2.51;
                    const float b = 0.03;
                    const float c = 2.43;
                    const float d = 0.59;
                    const float e = 0.14;
                    return clamp((x*(a*x + b)) / (x*(c*x + d) + e), 0.0, 1.0);
                }

                void main() {
                    vec4 c = texture2D(tDiffuse, vUv);
                    vec3 linear = pow(c.rgb, vec3(1.0 / gamma)); // sRGB -> linear

                    float luma = dot(linear, vec3(0.299, 0.587, 0.114));
                    vec3 sat = mix(vec3(luma), linear, 1.0 + vibrance * (1.0 - luma));

                    sat *= brightness;

                    vec3 mapped = aces(sat * exposure);
                    vec3 outColor = pow(mapped, vec3(gamma)); // linear -> sRGB
                    gl_FragColor = vec4(outColor, c.a);
                }

            `
        };

        // Setup composer + passes
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        const vibrancePass = new ShaderPass(VibranceShader);
        composer.addPass(renderPass);
        composer.addPass(vibrancePass);

        // Add lighting (slightly brighter)
        const ambientLight = new THREE.AmbientLight(0x404040, 3.0);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        // Place the light initially near the camera but slightly offset so shadows/highlights look natural
        directionalLight.position.copy(camera.position).multiplyScalar(0.9).add(new THREE.Vector3(2, 2, 0));
        // Ensure the light's target exists in the scene so we can update it during the orbit
        const lightTarget = new THREE.Object3D();
        lightTarget.position.set(0, 0, 0);
        scene.add(lightTarget);
        directionalLight.target = lightTarget;
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
        const decorationMeshes: THREE.Mesh[] = [];
        
        objects.forEach((object: Object) => {
            // Try to use GLTF models for chicken/fox/grain and farmer (player).
            const modelNames = ['chicken', 'fox', 'grain', 'farmer', 'farmer_hands_up'];
            const wantsModel = modelNames.includes(object.type) || (object.type === 'player' && ModelManager.has('farmer'));

            if (wantsModel) {
                // prefer explicit named model if present
                const modelKey = object.type === 'player' ? 'farmer' : object.type;
                let clone = ModelManager.getClone(modelKey);
                if (clone) {
                    // Position the clone appropriately. Models are centered at origin in many exports;
                    // place them so their base sits on top of the cube (object.z + object.height)
                    clone.position.set(object.x, object.z + object.height, object.y);
                    // Optionally scale models down to fit the grid; tweak this as needed
                    clone.scale.setScalar(0.8);

                    // If this is the player (farmer), rotate to face last movement direction
                    const isPlayer = object.type === 'player' || object.type === 'farmer';
                    if (isPlayer) {
                        // If player is carrying, try to use the 'farmer_hands_up' model (fallback to normal farmer)
                        if (playerCarry) {
                            const handsUp = ModelManager.getClone('farmer_hands_up');
                            if (handsUp) {
                                clone = handsUp;
                                clone.position.set(object.x, object.z + object.height, object.y);
                                clone.scale.setScalar(0.8);
                            }
                        }

                        const dir = playerDirection || 'right';
                        // Model originally faces left. Map directions to Y rotation:
                        // left -> 0, right -> PI, up -> -PI/2, down -> PI/2
                        let yRot = 0;
                        switch (dir) {
                            case 'left': yRot = Math.PI; break;
                            case 'right': yRot = 0; break;
                            case 'up': yRot = Math.PI / 2; break;
                            case 'down': yRot = -Math.PI / 2; break;
                        }
                        clone.rotation.set(0, yRot, 0);

                    }

                    scene.add(clone);
                    clonedObjects.push(clone);
                    return; // skip primitive creation
                }
                // fallthrough to primitives if model not available
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
    
        // Add all decorations (if decorationGrid is provided)
        if (decorationGrid) {
            const decorations = decorationGrid.getDecorations();
            decorations.forEach(dec => {
                // Try to use a GLTF model for the decoration
                const modelClone = ModelManager.getClone(dec.model);
                if (modelClone) {
                    // ModelManager.getClone() in this project returns a ready-to-add Object3D
                    // Position/scale/rotation may need tweaking per-model
                    modelClone.position.set(dec.x, dec.z + 0.01, dec.y);
                    modelClone.scale.setScalar(0.8);
                    // Apply optional rotation (expects radians). If you store degrees convert to radians first.
                    if (dec.rotation) {
                        modelClone.rotation.set(
                            dec.rotation.x ?? 0,
                            dec.rotation.y ?? 0,
                            dec.rotation.z ?? 0
                        );
                    }
                    scene.add(modelClone);
                    clonedObjects.push(modelClone);
                    return;
                }

                // Fallback: simple plane on the ground
                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(geometry, material);
                // Place slightly above the cube surface
                mesh.position.set(dec.x, dec.z + 0.01, dec.y);
                // Lay flat on XZ plane
                mesh.rotation.x = -Math.PI / 2;
                // Apply optional rotation on top of the base X rotation
                if (dec.rotation) {
                    mesh.rotation.x += dec.rotation.x ?? 0;
                    mesh.rotation.y += dec.rotation.y ?? 0;
                    mesh.rotation.z += dec.rotation.z ?? 0;
                }
                scene.add(mesh);
                decorationMeshes.push(mesh);
            });
        }

        // Handle window resize
        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            camera.left = frustumSize * aspect / -2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            // keep composer in sync
            try { composer.setSize(window.innerWidth, window.innerHeight); } catch (e) { /* ignore */ }
        };

        window.addEventListener('resize', handleResize);

        // Simple animation loop
        let animationId: number;
        let lastTime = performance.now();
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const now = performance.now();
            const dt = (now - lastTime) / 1000; // seconds
            lastTime = now;

            // If the player won, orbit the camera smoothly around the origin
            if (gameStatus === 'won') {
                theta += dt * 0.3; // rotation speed (radians/sec) — tweak as needed
                // keep radius stable (derived from the original camera) so we don't jump
                radius = initialRadius;
                // note: scene uses x and z for the ground plane, y is up
                camera.position.x = Math.cos(theta) * radius;
                camera.position.z = Math.sin(theta) * radius;
                camera.position.y = baseCameraY + Math.sin(theta * 0.5) * 0.55; // slight bob for interest
                camera.lookAt(0, 3, 0);

                // Move the light on a slightly offset orbit (phase-shifted) so highlights shift smoothly
                const lightTheta = theta + 0.3; // phase offset so light isn't exactly coincident with camera
                const lightRadius = radius * 0.85;
                directionalLight.position.set(Math.cos(lightTheta) * lightRadius, camera.position.y + 2.2, Math.sin(lightTheta) * lightRadius);
                // Keep the light targeting the center
                directionalLight.target.position.set(0, 0, 0);
            }

            // Render via composer so the vibrance shader is applied
            composer.render();
        };
        animate();

        // Cleanup function
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            
            // Dispose of all geometries and materials for meshes
            [...cubeMeshes, ...objectMeshes, ...decorationMeshes].forEach(mesh => {
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
            
            // dispose composer and renderer
            try { composer.dispose(); } catch (e) { /* ignore */ }
            renderer.dispose();
             
             if (mountRef.current) {
                 mountRef.current.innerHTML = '';
             }
         };
    }, [cubeGrid, objectGrid, updateTrigger, modelsLoaded, playerDirection, decorationGrid, playerCarry, gameStatus]); // Re-run when gameStatus changes too

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