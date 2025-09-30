import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CubeGrid, type Cube } from './CubeGrid';
import { ObjectGrid, type Object } from './ObjectGrid';

interface IsometricRendererProps {
    cubeGrid: CubeGrid;
    objectGrid: ObjectGrid;
    updateTrigger?: number; // Simple prop to force re-render
}

const IsometricRenderer = ({ cubeGrid, objectGrid, updateTrigger }: IsometricRendererProps) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Clear any existing content
        mountRef.current.innerHTML = '';

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x202020);

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
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
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
        
        objects.forEach((object: Object) => {
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
            
            // Dispose of all geometries and materials
            [...cubeMeshes, ...objectMeshes].forEach(mesh => {
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
            });
            
            renderer.dispose();
            
            if (mountRef.current) {
                mountRef.current.innerHTML = '';
            }
        };
    }, [cubeGrid, objectGrid, updateTrigger]); // Re-run when any of these change

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