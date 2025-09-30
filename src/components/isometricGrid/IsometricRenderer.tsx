import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CubeGrid, type Cube } from './Grid';

interface IsometricRendererProps {
    cubeGrid: CubeGrid;
}

const IsometricRenderer = ({ cubeGrid }: IsometricRendererProps) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x202020); // Dark gray background
        sceneRef.current = scene;

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

        // Position camera for isometric view (45° angles)
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;

        // Append to our ref instead of document.body
        mountRef.current.appendChild(renderer.domElement);

        // Add some lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 8, 5);
        scene.add(directionalLight);

        // Create a grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Create cubes from CubeGrid
        const cubes = cubeGrid.getCubes();
        const cubeMeshes: THREE.Mesh[] = [];

        cubes.forEach((cube: Cube) => {
            // Set height to 0.5 if type is 'water', else 1
            const height = cube.type === 'water' ? 0.5 : 1;
            const geometry = new THREE.BoxGeometry(1, height, 1);
            const material = new THREE.MeshLambertMaterial({ color: cube.color });
            const mesh = new THREE.Mesh(geometry, material);

            // Position the cube based on grid coordinates, adjust y for height
            mesh.position.set(cube.x, height / 2, cube.y);

            scene.add(mesh);
            cubeMeshes.push(mesh);
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

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup function
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            window.removeEventListener('resize', handleResize);
            
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            
            // Dispose of all cube geometries and materials
            cubeMeshes.forEach(mesh => {
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
            });
            
            renderer.dispose();
        };
    }, [cubeGrid]);

    return (
        <div 
            ref={mountRef} 
            style={{ 
                width: '100%', 
                height: '100%',
                overflow: 'hidden'
            }} 
        />
    );
};

export default IsometricRenderer;