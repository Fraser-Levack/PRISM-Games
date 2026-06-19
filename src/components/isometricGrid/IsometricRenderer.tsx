import { useEffect, useRef } from 'react';
import * as THREE from 'three';
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
    playerDirection?: 'left' | 'right' | 'up' | 'down';
    playerCarry?: boolean;
    gameStatus?: 'playing' | 'won' | 'lost' | 'paused';
    clickableTypes?: string[];
    cameraLookAtY?: number;
    onObjectClick?: (id: string, data?: any) => void;
    onObjectHover?: (id: string | null) => void;
    onDragStart?: (id: string, data?: any) => boolean;
    onDragEnd?: (draggedId: string, draggedData: any, dropPosition: THREE.Vector3, dropTargetId: string | null) => void;
}

const FRUSTUM_SIZE = 16;

// Defined outside the component so it's never recreated
const VIBRANCE_SHADER = {
    uniforms: {
        tDiffuse: { value: null }, brightness: { value: 1.20 },
        vibrance: { value: 0.18 }, exposure: { value: 1.1 }, gamma: { value: 2.2 }
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse; uniform float brightness; uniform float vibrance;
        uniform float exposure; uniform float gamma; varying vec2 vUv;
        vec3 aces(vec3 x) { return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
        void main() {
            vec4 c = texture2D(tDiffuse, vUv);
            vec3 linear = pow(c.rgb, vec3(1.0/gamma));
            float luma = dot(linear, vec3(0.299,0.587,0.114));
            vec3 sat = mix(vec3(luma), linear, 1.0+vibrance*(1.0-luma));
            gl_FragColor = vec4(pow(aces(sat*brightness*exposure), vec3(gamma)), c.a);
        }
    `
};

const IsometricRenderer = ({
    cubeGrid,
    objectGrid,
    decorationGrid,
    updateTrigger,
    modelsLoaded,
    playerDirection,
    playerCarry,
    gameStatus,
    onObjectClick,
    onObjectHover,
    onDragStart,
    onDragEnd,
    clickableTypes,
    cameraLookAtY = 3
}: IsometricRendererProps) => {
    const mountRef = useRef<HTMLDivElement>(null);

    // THREE.js infrastructure — created once on mount
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const inputHandlerRef = useRef<ReturnType<typeof createIsometricInputHandler> | null>(null);
    const objectGroupRef = useRef<THREE.Group | null>(null);

    // Scene content tracking
    const cubeMeshesRef = useRef<THREE.Object3D[]>([]);
    const decorMeshesRef = useRef<THREE.Object3D[]>([]);
    const meshMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
    const lastCubeCountRef = useRef(-1);
    const lastDecorationCountRef = useRef(-1);
    const lastModelsLoadedRef = useRef<boolean | undefined>(undefined);

    // Animation / camera state
    const gameStatusRef = useRef(gameStatus);
    const cameraLookAtYRef = useRef(cameraLookAtY);
    const thetaRef = useRef(0);
    const initialRadiusRef = useRef(0);
    const frameIdRef = useRef(0);
    const dirtyRef = useRef(true);

    // Callback refs — always current without re-creating the input handler
    const callbacksRef = useRef({ onObjectClick, onObjectHover, onDragStart, onDragEnd });
    useEffect(() => {
        callbacksRef.current = { onObjectClick, onObjectHover, onDragStart, onDragEnd };
    });

    // Sync live props that the animation loop reads via refs
    useEffect(() => {
        gameStatusRef.current = gameStatus;
        cameraLookAtYRef.current = cameraLookAtY;
        dirtyRef.current = true;
    }, [gameStatus, cameraLookAtY]);

    // ── EFFECT 1: one-time THREE.js infrastructure ──────────────────────────
    useEffect(() => {
        if (!mountRef.current) return;
        mountRef.current.innerHTML = '';

        const isMobile = window.innerWidth < 768;
        const isLowEnd = (navigator.hardwareConcurrency ?? 8) < 4;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0.005, 0.0025, 0.015);
        sceneRef.current = scene;

        const aspect = window.innerWidth / window.innerHeight;
        const camera = new THREE.OrthographicCamera(
            FRUSTUM_SIZE * aspect / -2, FRUSTUM_SIZE * aspect / 2,
            FRUSTUM_SIZE / 2, FRUSTUM_SIZE / -2, 1, 1000
        );
        camera.position.set(8, 11, 8);
        camera.lookAt(0, cameraLookAtYRef.current, 0);
        cameraRef.current = camera;
        thetaRef.current = Math.atan2(camera.position.z, camera.position.x);
        initialRadiusRef.current = Math.sqrt(
            camera.position.x * camera.position.x + camera.position.z * camera.position.z
        );

        const renderer = new THREE.WebGLRenderer({ antialias: !isLowEnd && !isMobile });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.domElement.style.display = 'block';
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Skip post-processing on low-end devices — direct render is 2× faster
        let composer: EffectComposer | null = null;
        if (!isLowEnd) {
            composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));
            composer.addPass(new ShaderPass(VIBRANCE_SHADER));
        }
        composerRef.current = composer;

        scene.add(new THREE.AmbientLight(0x404040, 3.0));
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.copy(camera.position).multiplyScalar(0.9);
        const lightTarget = new THREE.Object3D();
        scene.add(lightTarget);
        dirLight.target = lightTarget;
        scene.add(dirLight);
        scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x222222));

        const objectGroup = new THREE.Group();
        scene.add(objectGroup);
        objectGroupRef.current = objectGroup;

        const inputHandler = createIsometricInputHandler(camera, scene, renderer.domElement);
        inputHandlerRef.current = inputHandler;
        inputHandler.setClickCallback((id, data) => callbacksRef.current.onObjectClick?.(id, data));
        inputHandler.setHoverCallback((id) => callbacksRef.current.onObjectHover?.(id));
        inputHandler.setDragStartCallback((id, data) => callbacksRef.current.onDragStart?.(id, data) ?? false);
        inputHandler.setDragEndCallback((id, data, pos, target) => callbacksRef.current.onDragEnd?.(id, data, pos, target));

        const handleResize = () => {
            const asp = window.innerWidth / window.innerHeight;
            camera.left = -FRUSTUM_SIZE * asp / 2;
            camera.right = FRUSTUM_SIZE * asp / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer?.setSize(window.innerWidth, window.innerHeight);
            dirtyRef.current = true;
        };
        window.addEventListener('resize', handleResize);

        let lastDraggedId: string | null = null;
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            const currentDragId = inputHandler.getDraggedId();

            if (currentDragId !== lastDraggedId) {
                if (lastDraggedId) {
                    const oldMesh = meshMapRef.current.get(lastDraggedId);
                    if (oldMesh) {
                        oldMesh.renderOrder = 0;
                        oldMesh.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                child.material.depthTest = true;
                                child.material.transparent = false;
                                child.material.needsUpdate = true;
                            }
                        });
                    }
                }
                if (currentDragId) {
                    const newMesh = meshMapRef.current.get(currentDragId);
                    if (newMesh) {
                        newMesh.renderOrder = 999;
                        newMesh.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                if (!Array.isArray(child.material)) child.material = child.material.clone();
                                child.material.depthTest = false;
                                child.material.transparent = true;
                                child.material.opacity = 0.9;
                                child.material.needsUpdate = true;
                            }
                        });
                    }
                }
                lastDraggedId = currentDragId;
                dirtyRef.current = true;
            }

            if (gameStatusRef.current === 'won') {
                thetaRef.current += 0.005;
                camera.position.x = Math.cos(thetaRef.current) * initialRadiusRef.current;
                camera.position.z = Math.sin(thetaRef.current) * initialRadiusRef.current;
                camera.lookAt(0, cameraLookAtYRef.current, 0);
                dirtyRef.current = true;
            }

            // Only call render when something has actually changed
            if (dirtyRef.current || currentDragId !== null) {
                if (composer) composer.render();
                else renderer.render(scene, camera);
                dirtyRef.current = false;
            }
        };
        animate();

        renderer.domElement.addEventListener('mousedown', inputHandler.handleMouseDown);
        renderer.domElement.addEventListener('mousemove', inputHandler.handleMouseMove);
        renderer.domElement.addEventListener('mouseup', inputHandler.handleMouseUp);

        return () => {
            cancelAnimationFrame(frameIdRef.current);
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousedown', inputHandler.handleMouseDown);
            renderer.domElement.removeEventListener('mousemove', inputHandler.handleMouseMove);
            renderer.domElement.removeEventListener('mouseup', inputHandler.handleMouseUp);
            renderer.dispose();
            inputHandler.clearClickables();
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            composerRef.current = null;
            inputHandlerRef.current = null;
            objectGroupRef.current = null;
            lastCubeCountRef.current = -1;
            lastDecorationCountRef.current = -1;
            lastModelsLoadedRef.current = undefined;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── EFFECT 2: rebuild scene content when game data changes ───────────────
    useEffect(() => {
        const scene = sceneRef.current;
        const objectGroup = objectGroupRef.current;
        const inputHandler = inputHandlerRef.current;
        if (!scene || !objectGroup || !inputHandler) return;

        const cubes = cubeGrid.getCubes();
        const cubeCount = cubes.length;
        const decorCount = decorationGrid?.count() ?? 0;
        const modelsReady = !!modelsLoaded;

        // Rebuild instanced cube meshes only when the grid count changes.
        // In all current games the cube grid is populated once and never mutated
        // again, so this block executes exactly once per game session.
        if (cubeCount !== lastCubeCountRef.current) {
            cubeMeshesRef.current.forEach(m => {
                scene.remove(m);
                if (m instanceof THREE.InstancedMesh) {
                    m.geometry.dispose();
                    (m.material as THREE.Material).dispose();
                }
            });
            cubeMeshesRef.current = [];

            if (cubeCount > 0) {
                // Group by (height × color) so each group becomes one InstancedMesh
                // — one draw call instead of one per tile.
                const groups = new Map<string, { cubes: Cube[]; height: number; color: number }>();
                cubes.forEach(cube => {
                    const height = cube.type === 'water' ? 0.5 : 1;
                    const color = typeof cube.color === 'number'
                        ? cube.color
                        : parseInt((cube.color as string).replace('#', ''), 16);
                    const key = `${height}_${color}`;
                    if (!groups.has(key)) groups.set(key, { cubes: [], height, color });
                    groups.get(key)!.cubes.push(cube);
                });

                const dummy = new THREE.Object3D();
                groups.forEach(({ cubes: grpCubes, height, color }) => {
                    const geo = new THREE.BoxGeometry(1, height, 1);
                    const mat = new THREE.MeshLambertMaterial({ color });
                    const instMesh = new THREE.InstancedMesh(geo, mat, grpCubes.length);
                    grpCubes.forEach((cube, i) => {
                        dummy.position.set(cube.x, height / 2, cube.y);
                        dummy.updateMatrix();
                        instMesh.setMatrixAt(i, dummy.matrix);
                    });
                    instMesh.instanceMatrix.needsUpdate = true;
                    scene.add(instMesh);
                    cubeMeshesRef.current.push(instMesh);
                });
            }
            lastCubeCountRef.current = cubeCount;
        }

        // Rebuild decorations whenever content may have changed.
        // Games like ShutTheBox mutate decoration model keys and rotations on every
        // action (pin selection, dice roll) without changing the count, so a count
        // guard would silently skip those updates. With shared geometry (ModelManager
        // now only clones materials) this loop is cheap enough to run every tick.
        if (decorationGrid) {
            decorMeshesRef.current.forEach(m => scene.remove(m));
            decorMeshesRef.current = [];

            decorationGrid.getDecorations().forEach(dec => {
                const modelClone = ModelManager.getClone(dec.model);
                if (modelClone) {
                    modelClone.position.set(dec.x, dec.z + 0.01, dec.y);
                    modelClone.scale.setScalar(0.8);
                    if (dec.rotation) {
                        modelClone.rotation.set(dec.rotation.x ?? 0, dec.rotation.y ?? 0, dec.rotation.z ?? 0);
                    }
                    scene.add(modelClone);
                    decorMeshesRef.current.push(modelClone);
                }
            });
            lastDecorationCountRef.current = decorCount;
            lastModelsLoadedRef.current = modelsReady;
        }

        // Always rebuild dynamic objects — there are only ~6-10 per game so
        // this is cheap even on every tick.
        for (let i = objectGroup.children.length - 1; i >= 0; i--) {
            const child = objectGroup.children[i];
            // Dispose fallback geometry/material (created inline, not from ModelManager)
            child.traverse(node => {
                if (node instanceof THREE.Mesh && node.userData.isFallback) {
                    node.geometry.dispose();
                    if (Array.isArray(node.material)) node.material.forEach(m => m.dispose());
                    else node.material.dispose();
                }
            });
            objectGroup.remove(child);
        }
        inputHandler.clearClickables();
        meshMapRef.current.clear();

        objectGrid.getObjects().forEach((object) => {
            const isClickable = clickableTypes?.some(
                t => object.type === t || object.type.startsWith(t + '_')
            );
            let activeObject: THREE.Object3D;
            const modelKey = object.type.startsWith('pin')
                ? 'pin'
                : (object.type === 'player' ? 'farmer' : object.type);

            if (ModelManager.has(modelKey)) {
                let clone = ModelManager.getClone(modelKey)!;
                if (object.type === 'player' && playerCarry) {
                    const handsUp = ModelManager.getClone('farmer_hands_up');
                    if (handsUp) clone = handsUp;
                }
                clone.position.set(object.x, object.z + object.height, object.y);
                clone.scale.setScalar(object.scale || 0.8);
                if (object.type === 'player') {
                    const rotations: Record<string, number> = { left: Math.PI, right: 0, up: Math.PI / 2, down: -Math.PI / 2 };
                    clone.rotation.y = rotations[playerDirection || 'right'];
                }
                objectGroup.add(clone);
                activeObject = clone;
            } else {
                let geo: THREE.BufferGeometry;
                if (object.type === 'peg') {
                    geo = new THREE.CylinderGeometry(0.4, 0.5, 6.5, 32);
                } else if (object.type === 'boat') {
                    geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
                    geo.scale(2, 0.5, 1);
                } else {
                    geo = new THREE.SphereGeometry(0.4, 16, 12);
                }
                const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: object.color }));
                mesh.position.set(
                    object.x + (object.type === 'boat' ? 0.5 : 0),
                    object.z + object.height,
                    object.y
                );
                mesh.userData.isFallback = true;
                objectGroup.add(mesh);
                activeObject = mesh;
            }

            const objectId = object.type.includes('_')
                ? object.type
                : `${object.type}_${object.x}_${object.y}_${object.z}`;
            meshMapRef.current.set(objectId, activeObject);

            if (isClickable) {
                inputHandler.registerClickable(activeObject, objectId, {
                    type: object.type,
                    position: { x: object.x, y: object.y, z: object.z },
                    object
                });
            }
        });

        dirtyRef.current = true;
    }, [cubeGrid, objectGrid, decorationGrid, updateTrigger, modelsLoaded, playerDirection, playerCarry, clickableTypes]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
};

export default IsometricRenderer;
