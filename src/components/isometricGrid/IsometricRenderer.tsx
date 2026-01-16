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
import { createIsometricInputHandler } from './IsometricInputHandler';

interface IsometricRendererProps {
    cubeGrid: CubeGrid;
    objectGrid: ObjectGrid;
    decorationGrid?: DecorationGrid;
    updateTrigger?: number; 
    modelsLoaded?: boolean;
    playerDirection?: 'left'|'right'|'up'|'down';
    playerCarry?: boolean;
    gameStatus?: 'playing' | 'won' | 'lost' | 'paused';
    clickableTypes?: string[]; 
    
    // Callbacks
    onObjectClick?: (id: string, data?: any) => void;
    onObjectHover?: (id: string | null) => void;
    onDragStart?: (id: string, data?: any) => boolean;
    // Updated signature to include dropTargetId
    onDragEnd?: (draggedId: string, draggedData: any, dropPosition: THREE.Vector3, dropTargetId: string | null) => void;
}

const IsometricRenderer = ({ cubeGrid, objectGrid, decorationGrid, updateTrigger, modelsLoaded, playerDirection, playerCarry, gameStatus, onObjectClick, onObjectHover, onDragStart, onDragEnd, clickableTypes }: IsometricRendererProps) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        mountRef.current.innerHTML = '';

        // Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0.005, 0.0025, 0.015);

        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 16; 
        const camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );

        camera.position.set(8, 11, 8); 
        camera.lookAt(0, 3, 0);

        const initialRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
        let radius = initialRadius;
        let theta = Math.atan2(camera.position.z, camera.position.x);
        const baseCameraY = camera.position.y;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        const inputHandler = createIsometricInputHandler(camera, scene, renderer.domElement);
        
        // Pass Callbacks
        if (onObjectClick) inputHandler.setClickCallback(onObjectClick);
        if (onObjectHover) inputHandler.setHoverCallback(onObjectHover);
        if (onDragStart) inputHandler.setDragStartCallback(onDragStart);
        if (onDragEnd) inputHandler.setDragEndCallback(onDragEnd);

        // Shaders
        const VibranceShader = {
            uniforms: {
                tDiffuse: { value: null },
                brightness: { value: 1.20 },
                vibrance: { value: 0.18 },
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
                    vec3 linear = pow(c.rgb, vec3(1.0 / gamma));
                    float luma = dot(linear, vec3(0.299, 0.587, 0.114));
                    vec3 sat = mix(vec3(luma), linear, 1.0 + vibrance * (1.0 - luma));
                    sat *= brightness;
                    vec3 mapped = aces(sat * exposure);
                    vec3 outColor = pow(mapped, vec3(gamma));
                    gl_FragColor = vec4(outColor, c.a);
                }
            `
        };

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        const vibrancePass = new ShaderPass(VibranceShader);
        composer.addPass(renderPass);
        composer.addPass(vibrancePass);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 3.0);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        directionalLight.position.copy(camera.position).multiplyScalar(0.9).add(new THREE.Vector3(2, 2, 0));
        const lightTarget = new THREE.Object3D();
        lightTarget.position.set(0, 0, 0);
        scene.add(lightTarget);
        directionalLight.target = lightTarget;
        scene.add(directionalLight);

        // Grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Render Cubes
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

        // Render Objects
        const objects = objectGrid.getObjects();
        const objectMeshes: THREE.Mesh[] = [];
        const clonedObjects: THREE.Object3D[] = [];
        const decorationMeshes: THREE.Mesh[] = [];
        
        objects.forEach((object: Object) => {
            const modelNames = ['chicken', 'fox', 'grain', 'farmer', 'farmer_hands_up', 'tower'];
            const wantsModel = modelNames.includes(object.type) || (object.type === 'player' && ModelManager.has('farmer'));

            if (wantsModel) {
                const modelKey = object.type === 'player' ? 'farmer' : object.type;
                let clone = ModelManager.getClone(modelKey);
                if (clone) {
                    clone.position.set(object.x, object.z + object.height, object.y);
                    clone.scale.setScalar(object.scale || 0.8);

                    const isPlayer = object.type === 'player' || object.type === 'farmer';
                    if (isPlayer) {
                        if (playerCarry) {
                            const handsUp = ModelManager.getClone('farmer_hands_up');
                            if (handsUp) {
                                clone = handsUp;
                                clone.position.set(object.x, object.z + object.height, object.y);
                                clone.scale.setScalar(0.8);
                            }
                        }
                        const dir = playerDirection || 'right';
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
                    
                    if (clickableTypes?.includes(object.type)) {
                        const objectId = `${object.type}_${object.x}_${object.y}_${object.z}`;
                        inputHandler.registerClickable(clone, objectId, {
                            type: object.type,
                            position: { x: object.x, y: object.y, z: object.z },
                            object
                        });
                    }
                    return;
                }
            }

            // Fallback Geometries
            let mesh: THREE.Mesh;
            if (object.type === 'boat') {
                const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
                const material = new THREE.MeshLambertMaterial({ color: object.color });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(object.x + 0.5, object.z + object.height, object.y);
                mesh.scale.x = 2;
            } else {
                const geometry = new THREE.SphereGeometry(0.4, 16, 12);
                const material = new THREE.MeshLambertMaterial({ color: object.color });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(object.x, object.z + object.height, object.y);
            }

            scene.add(mesh);
            objectMeshes.push(mesh);
            
            if (clickableTypes?.includes(object.type)) {
                const objectId = `${object.type}_${object.x}_${object.y}_${object.z}`;
                inputHandler.registerClickable(mesh, objectId, {
                    type: object.type,
                    position: { x: object.x, y: object.y, z: object.z },
                    object
                });
            }
        });
    
        // Render Decorations
        if (decorationGrid) {
            const decorations = decorationGrid.getDecorations();
            decorations.forEach(dec => {
                const modelClone = ModelManager.getClone(dec.model);
                if (modelClone) {
                    modelClone.position.set(dec.x, dec.z + 0.01, dec.y);
                    modelClone.scale.setScalar(0.8);
                    if (dec.rotation) {
                        modelClone.rotation.set(dec.rotation.x ?? 0, dec.rotation.y ?? 0, dec.rotation.z ?? 0);
                    }
                    scene.add(modelClone);
                    clonedObjects.push(modelClone);
                    return;
                }

                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(dec.x, dec.z + 0.01, dec.y);
                mesh.rotation.x = -Math.PI / 2;
                if (dec.rotation) {
                    mesh.rotation.x += dec.rotation.x ?? 0;
                    mesh.rotation.y += dec.rotation.y ?? 0;
                    mesh.rotation.z += dec.rotation.z ?? 0;
                }
                scene.add(mesh);
                decorationMeshes.push(mesh);
            });
        }

        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            camera.left = frustumSize * aspect / -2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            try { composer.setSize(window.innerWidth, window.innerHeight); } catch (e) { /* ignore */ }
        };

        window.addEventListener('resize', handleResize);

        const handleMouseDown = (e: MouseEvent) => inputHandler.handleMouseDown(e);
        const handleMouseMove = (e: MouseEvent) => inputHandler.handleMouseMove(e);
        const handleMouseUp = (e: MouseEvent) => inputHandler.handleMouseUp(e);
        
        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('mouseup', handleMouseUp);

        // Animation
        let animationId: number;
        let lastTime = performance.now();
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const now = performance.now();
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            if (gameStatus === 'won') {
                theta += dt * 0.3;
                radius = initialRadius;
                camera.position.x = Math.cos(theta) * radius;
                camera.position.z = Math.sin(theta) * radius;
                camera.position.y = baseCameraY + Math.sin(theta * 0.5) * 0.55;
                camera.lookAt(0, 3, 0);

                const lightTheta = theta + 0.3;
                const lightRadius = radius * 0.85;
                directionalLight.position.set(Math.cos(lightTheta) * lightRadius, camera.position.y + 2.2, Math.sin(lightTheta) * lightRadius);
                directionalLight.target.position.set(0, 0, 0);
            }

            composer.render();
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            
            renderer.domElement.removeEventListener('mousedown', handleMouseDown);
            renderer.domElement.removeEventListener('mousemove', handleMouseMove);
            renderer.domElement.removeEventListener('mouseup', handleMouseUp);
            inputHandler.clearClickables();
            
            [...cubeMeshes, ...objectMeshes, ...decorationMeshes].forEach(mesh => {
                try { mesh.geometry.dispose(); } catch (e) {}
                try { (mesh.material as THREE.Material).dispose(); } catch (e) {}
            });

            clonedObjects.forEach(obj => {
                try {
                    obj.traverse((n: any) => {
                        if (n.isMesh) {
                            if (n.geometry) n.geometry.dispose();
                            if (n.material) {
                                if (Array.isArray(n.material)) n.material.forEach((m: any) => m.dispose());
                                else n.material.dispose();
                            }
                        }
                    });
                } catch (e) {}
                if (obj.parent) obj.parent.remove(obj);
            });
            
            try { composer.dispose(); } catch (e) {}
            renderer.dispose();
             if (mountRef.current) mountRef.current.innerHTML = '';
         };
    }, [cubeGrid, objectGrid, updateTrigger, modelsLoaded, playerDirection, decorationGrid, playerCarry, gameStatus, onObjectClick, onObjectHover, onDragStart, onDragEnd, clickableTypes]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div 
                ref={mountRef} 
                style={{ width: '100%', height: '100%', overflow: 'hidden' }} 
            />
            {!modelsLoaded && (
                <div style={{
                    position: 'absolute', left: 12, top: 12, zIndex: 200, padding: '6px 10px',
                    background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 6, fontSize: 12
                }}>
                    Loading models...
                </div>
            )}
        </div>
    );
};

export default IsometricRenderer;