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
    playerDirection?: 'left'|'right'|'up'|'down';
    playerCarry?: boolean;
    gameStatus?: 'playing' | 'won' | 'lost' | 'paused';
    clickableTypes?: string[]; 
    cameraLookAtY?: number;
    onObjectClick?: (id: string, data?: any) => void;
    onObjectHover?: (id: string | null) => void;
    onDragStart?: (id: string, data?: any) => boolean;
    onDragEnd?: (draggedId: string, draggedData: any, dropPosition: THREE.Vector3, dropTargetId: string | null) => void;
}

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

    useEffect(() => {
        if (!mountRef.current) return;
        mountRef.current.innerHTML = '';

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0.005, 0.0025, 0.015);

        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 16; 
        const camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, frustumSize * aspect / 2,
            frustumSize / 2, frustumSize / -2, 1, 1000
        );

        camera.position.set(8, 11, 8); 
        camera.lookAt(0, cameraLookAtY, 0);

        const initialRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
        let radius = initialRadius;
        let theta = Math.atan2(camera.position.z, camera.position.x);
        const baseCameraY = camera.position.y;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.domElement.style.display = 'block'; 
        mountRef.current.appendChild(renderer.domElement);

        const inputHandler = createIsometricInputHandler(camera, scene, renderer.domElement);
        
        if (onObjectClick) inputHandler.setClickCallback(onObjectClick);
        if (onObjectHover) inputHandler.setHoverCallback(onObjectHover);
        if (onDragStart) inputHandler.setDragStartCallback(onDragStart);
        if (onDragEnd) inputHandler.setDragEndCallback(onDragEnd);

        // --- Post Processing ---
        const VibranceShader = {
            uniforms: {
                tDiffuse: { value: null }, brightness: { value: 1.20 },
                vibrance: { value: 0.18 }, exposure: { value: 1.1 }, gamma: { value: 2.2 }
            },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
                uniform sampler2D tDiffuse; uniform float brightness; uniform float vibrance; uniform float exposure; uniform float gamma; varying vec2 vUv;
                vec3 aces(vec3 x) { return clamp((x*(2.51*x + 0.03)) / (x*(2.43*x + 0.59) + 0.14), 0.0, 1.0); }
                void main() {
                    vec4 c = texture2D(tDiffuse, vUv);
                    vec3 linear = pow(c.rgb, vec3(1.0 / gamma));
                    float luma = dot(linear, vec3(0.299, 0.587, 0.114));
                    vec3 sat = mix(vec3(luma), linear, 1.0 + vibrance * (1.0 - luma));
                    gl_FragColor = vec4(pow(aces(sat * brightness * exposure), vec3(gamma)), c.a);
                }
            `
        };

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(new ShaderPass(VibranceShader));

        // --- Lighting ---
        scene.add(new THREE.AmbientLight(0x404040, 3.0));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        directionalLight.position.copy(camera.position).multiplyScalar(0.9);
        const lightTarget = new THREE.Object3D();
        scene.add(lightTarget);
        directionalLight.target = lightTarget;
        scene.add(directionalLight);
        scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x222222));

        // --- Rendering Logic ---
        cubeGrid.getCubes().forEach((cube: Cube) => {
            const height = cube.type === 'water' ? 0.5 : 1;
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, height, 1), new THREE.MeshLambertMaterial({ color: cube.color }));
            mesh.position.set(cube.x, height / 2, cube.y);
            scene.add(mesh);
        });

        const clonedObjects: THREE.Object3D[] = [];
        objectGrid.getObjects().forEach((object: Object) => {
            const modelNames = ['chicken', 'fox', 'grain', 'farmer', 'farmer_hands_up', 'tower', 'pin', 'dice'];
            // Check if this specific object type (or its prefix) should be clickable
            const isClickable = clickableTypes?.some(t => object.type === t || object.type.startsWith(t + '_'));

            let activeObject: THREE.Object3D;
            const modelKey = object.type.startsWith('pin') ? 'pin' : (object.type === 'player' ? 'farmer' : object.type);

            if (ModelManager.has(modelKey)) {
                let clone = ModelManager.getClone(modelKey)!;
                if (object.type === 'player' && playerCarry) {
                    const handsUp = ModelManager.getClone('farmer_hands_up');
                    if (handsUp) clone = handsUp;
                }
                clone.position.set(object.x, object.z + object.height, object.y);
                clone.scale.setScalar(object.scale || 0.8);
                if (object.type === 'player' || object.type === 'farmer') {
                    const rotations: any = { left: Math.PI, right: 0, up: Math.PI / 2, down: -Math.PI / 2 };
                    clone.rotation.y = rotations[playerDirection || 'right'];
                }
                scene.add(clone);
                clonedObjects.push(clone);
                activeObject = clone;
            } else {
                const geo = object.type === 'boat' ? new THREE.CylinderGeometry(0.5, 0.5, 1, 24) : new THREE.SphereGeometry(0.4, 16, 12);
                const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: object.color }));
                mesh.position.set(object.x + (object.type === 'boat' ? 0.5 : 0), object.z + object.height, object.y);
                if (object.type === 'boat') mesh.scale.x = 2;
                scene.add(mesh);
                activeObject = mesh;
            }

            if (isClickable) {
                // If it's a coordinate ID (pin_-9_0), use it directly. 
                // If it's a simple legacy ID (chicken), generate the position-based string to avoid breaking old logic.
                const objectId = object.type.includes('_') ? object.type : `${object.type}_${object.x}_${object.y}_${object.z}`;
                inputHandler.registerClickable(activeObject, objectId, { type: object.type, position: { x: object.x, y: object.y, z: object.z }, object });
            }
        });

        if (decorationGrid) {
            decorationGrid.getDecorations().forEach(dec => {
                const modelClone = ModelManager.getClone(dec.model);
                if (modelClone) {
                    modelClone.position.set(dec.x, dec.z + 0.01, dec.y);
                    modelClone.scale.setScalar(0.8);
                    if (dec.rotation) modelClone.rotation.set(dec.rotation.x ?? 0, dec.rotation.y ?? 0, dec.rotation.z ?? 0);
                    scene.add(modelClone);
                    clonedObjects.push(modelClone);
                }
            });
        }

        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            camera.left = frustumSize * aspect / -2; camera.right = frustumSize * aspect / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        const animate = () => {
            const frameId = requestAnimationFrame(animate);
            if (gameStatus === 'won') {
                theta += 0.005;
                camera.position.x = Math.cos(theta) * initialRadius;
                camera.position.z = Math.sin(theta) * initialRadius;
                camera.lookAt(0, cameraLookAtY, 0);
            }
            composer.render();
            return frameId;
        };
        const animationId = animate();

        renderer.domElement.addEventListener('mousedown', inputHandler.handleMouseDown);
        renderer.domElement.addEventListener('mousemove', inputHandler.handleMouseMove);
        renderer.domElement.addEventListener('mouseup', inputHandler.handleMouseUp);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            inputHandler.clearClickables();
        };
    }, [cubeGrid, objectGrid, updateTrigger, modelsLoaded, playerDirection, decorationGrid, playerCarry, gameStatus, clickableTypes, cameraLookAtY]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
};

export default IsometricRenderer;