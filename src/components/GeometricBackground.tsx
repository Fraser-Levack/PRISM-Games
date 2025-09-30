import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

const GeometricBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Performance optimization: Use callback for resize handler
  const handleResize = useCallback(() => {
    if (!rendererRef.current || !materialRef.current) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Reduce resolution on mobile for better performance
    const isMobile = width < 768;
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
    
    rendererRef.current.setSize(width, height);
    rendererRef.current.setPixelRatio(pixelRatio);
    materialRef.current.uniforms.u_resolution.value.set(width, height);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Detect device capabilities for performance optimization
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer setup with performance optimizations
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: !isMobile, // Disable antialiasing on mobile
      powerPreference: "high-performance",
      stencil: false,
      depth: false
    });
    rendererRef.current = renderer;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    
    // Style the canvas element directly
    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    mountRef.current.appendChild(canvas);

    // Vertex shader - positions vertices
    const vertexShader = `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Replace the fragmentShader with dimmed version
    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_complexity;
      varying vec2 vUv;

      #define rot(a) mat2(cos(a),sin(a),-sin(a),cos(a))

      // Global variables for the shader
      vec3 cp, cn, cr, ro, rd, cc, oc, fc, ss, gl;
      float tt, cd, sd, ot, ct, iv, io;

      // Cube SDF function
      float bx(vec3 p, vec3 s) {
        vec3 q = abs(p) - s;
        return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0));
      }

      // Shatter function - creates fractures in the crystal
      float sh(vec3 p, float d, float n, float a, float s, float o) {
        for(float i = 0.0; i < n; i++) {
          p.xy *= rot(a);
          p.xz *= rot(a * 0.5);
          p.yz *= rot(a + a);
          float c = mod(i, 3.0) == 0.0 ? p.x : mod(i, 3.0) == 1.0 ? p.y : p.z;
          c = abs(c - o) - s;
          d = max(d, -c);
        }
        return d;
      }

      // Scene/map function
      float mp(vec3 p) {
        // Rotate entire scene slowly
        p.xz *= rot(tt * 0.03 + 1.0);
        p.yz *= rot(tt * 0.05 + 0.5);
        
        // Create crystal structure - REDUCED SIZE
        float d = bx(p, vec3(3.0, 3.0, 3.0)) - 0.15;
        float c = bx(p, vec3(1.8, 1.8, 1.8));
        
        // Apply fracturing with complexity scaling
        float fractures = 5.0 + u_complexity * 4.0;
        d = sh(p, d, fractures, sin(tt * 0.01 + 0.3) * 3.0, 
               (cos(tt * 0.1) * 0.5 + 0.5) * 0.5 + 0.008, 0.4);
        
        sd = d;
        
        // DIMMED: Reduced glow intensity
        gl += 0.0005 / (0.001 + d * d) * normalize(p * p) * 0.004 * u_complexity;
        
        // Set material properties when near surface
        if(sd < 0.001) {
          // SLIGHTLY BRIGHTER: Increased crystal brightness just a bit
          oc = vec3(0.2, 0.15, 0.45) * (1.0 + u_complexity * 0.2);
          ss = pow(abs(c), 3.0) * vec3(0.25, 0.2, 0.5);
          io = 1.5 + c * 0.1;
          ot = 0.7 - c * 0.2;
        }
        
        return sd;
      }

      // Raymarcher
      void tr() {
        cd = 0.0;
        for(float i = 0.0; i < 100.0 * u_complexity + 50.0; i++) {
          mp(ro + rd * cd);
          sd *= iv;
          cd += sd;
          if(sd < 0.00005 || cd > 16.0) break;
        }
      }

      // Normal calculation
      void nm() {
        vec3 eps = vec3(0.0001, 0.0, 0.0);
        cn = normalize(vec3(
          mp(cp + eps.xyy) - mp(cp - eps.xyy),
          mp(cp + eps.yxy) - mp(cp - eps.yxy),
          mp(cp + eps.yyx) - mp(cp - eps.yyx)
        ));
      }

      // Pixel shader - lighting and color calculation
      void px() {
        // DIMMED: Much darker background
        cc = vec3(0.02, 0.02, 0.05) + length(cr * cr) * 0.1 + gl;
        
        if(cd > 16.0) return;
        
        // SLIGHTLY BRIGHTER: Increased lighting just a touch
        vec3 l = vec3(0.18, 0.13, 0.25);
        float df = length(cn * l);
        float fr = pow(1.0 - df, 2.0) * 0.35; // Slightly increased fresnel
        float sp = (1.0 - length(cross(cr, cn))) * 0.18; // Slightly increased specular
        float ao = min(mp(cp + cn * 0.5) - 0.5, 0.3) * 0.2; // Keep AO the same
        
        cc = oc * (df + fr + ss) + fr + sp + ao + gl;
      }

      void main() {
        // FIXED: Use vUv instead of gl_FragCoord for proper scaling
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;
        
        float iTime = u_time;
        
        // Initialize global variables
        sd = 1.0;
        ct = 1.0;
        iv = 1.0;
        fc = vec3(0.0);
        gl = vec3(0.0);
        
        tt = mod(iTime + 19.0, 120.0);
        
        // CAMERA POSITION - Adjusted for medium size
        ro = vec3(0.0, 0.0, -6.5);
        rd = normalize(vec3(uv, 1.0));
        
        // Transparency/refraction loop (reduced iterations for performance)
        int maxLayers = int(3.0 + u_complexity * 3.0);
        for(int i = 0; i < 12; i++) {
          if(i >= maxLayers * 2) break;
          
          tr();
          cp = ro + rd * cd;
          nm();
          cr = rd;
          ro = cp - cn * (0.01 * iv);
          
          // Refraction
          rd = refract(cr, cn * iv, iv > 0.0 ? 1.0 / io : io);
          if(length(rd) == 0.0) rd = reflect(cr, cn * iv);
          
          px();
          iv *= -1.0;
          
          if(iv < 0.0) fc = mix(fc, cc, ct);
          ct *= ot;
          
          if(ct <= 0.01 || cd > 128.0) break;
        }
        
        // DIMMED: Reduced overall output brightness and transparency
        gl_FragColor = vec4(fc * 0.6, 0.5 + u_complexity * 0.1);
      }
    `;

    // Create shader material with adaptive complexity
    const complexity = isLowEnd || isMobile ? 0.3 : 1.0;
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_complexity: { value: complexity }
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    materialRef.current = material;

    // Create geometry and mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop with adaptive frame rate
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Throttle frame rate on lower-end devices
      if (currentTime - lastTime >= frameInterval) {
        material.uniforms.u_time.value += 0.008;
        renderer.render(scene, camera);
        lastTime = currentTime;
      }
    };

    animate(0);

    // Set up resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [handleResize]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: -10,
        pointerEvents: 'none'
      }}
    />
  );
};

export default GeometricBackground;