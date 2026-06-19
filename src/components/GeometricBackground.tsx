import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// Devices with ≤2 logical cores get a pure-CSS gradient — no WebGL shader at all.
// This threshold covers old Atom/Celeron CPUs and most low-end Android devices.
const isVeryLowEnd = () => (navigator.hardwareConcurrency ?? 8) <= 2;

const GeometricBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const handleResize = useCallback(() => {
    if (!rendererRef.current || !materialRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const isMobile = width < 768;
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5);

    rendererRef.current.setSize(width, height, false);
    rendererRef.current.setPixelRatio(pixelRatio);
    const canvas = rendererRef.current.domElement as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    materialRef.current.uniforms.u_resolution.value.set(width, height);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Very low-end: skip WebGL entirely — the CSS fallback background is already
    // applied via the container div's style below.
    if (isVeryLowEnd()) return;

    const isMobile = window.innerWidth < 768;
    const isLowEnd = (navigator.hardwareConcurrency ?? 8) < 4;

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
    
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    
    // Style the canvas element directly with proper mobile constraints
    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.maxWidth = '100vw';
    canvas.style.maxHeight = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.overflow = 'hidden';
    
    mountRef.current.appendChild(canvas);

    // Vertex shader - positions vertices
    const vertexShader = `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Replace the fragmentShader with optimized purple version
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

      // Optimized shatter function - reduced iterations
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

      // Purple-themed color function instead of full rainbow
      vec3 purpleSpectrum(float t) {
        t = fract(t);
        // Purple to pink to blue spectrum
        vec3 purple = vec3(0.5, 0.0, 0.8);
        vec3 pink = vec3(0.8, 0.2, 0.6);
        vec3 blue = vec3(0.2, 0.4, 0.9);
        vec3 cyan = vec3(0.0, 0.6, 0.8);
        
        if(t < 0.33) return mix(purple, pink, t * 3.0);
        else if(t < 0.66) return mix(pink, blue, (t - 0.33) * 3.0);
        else return mix(blue, cyan, (t - 0.66) * 3.0);
      }

      // Scene/map function with performance optimizations
      float mp(vec3 p) {
        // Rotate entire scene slowly
        p.xz *= rot(tt * 0.03 + 1.0);
        p.yz *= rot(tt * 0.05 + 0.5);
        
        // Create crystal structure
        float d = bx(p, vec3(3.0, 3.0, 3.0)) - 0.15;
        float c = bx(p, vec3(1.8, 1.8, 1.8));
        
        // Reduced fractures for better performance
        float fractures = 3.0 + u_complexity * 2.0; // Reduced from 5.0 + 4.0
        d = sh(p, d, fractures, sin(tt * 0.01 + 0.3) * 3.0, 
               (cos(tt * 0.1) * 0.5 + 0.5) * 0.5 + 0.008, 0.4);
        
        sd = d;
        
        // Reduced glow calculation for performance
        gl += 0.0008 / (0.001 + d * d) * 0.006 * u_complexity;
        
        // Set material properties when near surface
        if(sd < 0.001) {
          // Purple-themed crystal colors
          float colorShift = tt * 0.03 + length(p) * 0.1; // Slower color shift
          vec3 baseColor = purpleSpectrum(colorShift) * 0.6 + vec3(0.2, 0.1, 0.3);
          oc = baseColor * (1.0 + u_complexity * 0.2);
          
          // Purple subsurface scattering
          ss = pow(abs(c), 2.0) * purpleSpectrum(colorShift + 0.2) * 0.4;
          
          io = 1.4 + c * 0.1; // Slightly reduced for performance
          ot = 0.7 - c * 0.1;
        }
        
        return sd;
      }

      // Optimized raymarcher with fewer iterations
      void tr() {
        cd = 0.0;
        float maxSteps = 60.0 * u_complexity + 30.0; // Reduced from 100.0 + 50.0
        for(float i = 0.0; i < maxSteps; i++) {
          mp(ro + rd * cd);
          sd *= iv;
          cd += sd;
          if(sd < 0.0001 || cd > 12.0) break; // Increased threshold, reduced max distance
        }
      }

      // Optimized normal calculation
      void nm() {
        vec3 eps = vec3(0.0002, 0.0, 0.0); // Increased epsilon for faster calculation
        cn = normalize(vec3(
          mp(cp + eps.xyy) - mp(cp - eps.xyy),
          mp(cp + eps.yxy) - mp(cp - eps.yxy),
          mp(cp + eps.yyx) - mp(cp - eps.yyx)
        ));
      }

      // Simplified pixel shader for better performance
      void px() {
        // Dark purple background
        cc = vec3(0.02, 0.01, 0.06) + length(cr * cr) * 0.05 + gl;
        
        if(cd > 12.0) return;
        
        // Simplified lighting with purple theme
        float lightShift = tt * 0.02 + dot(cn, vec3(1.0, 0.5, 0.8));
        vec3 lightColor = purpleSpectrum(lightShift) * 0.6 + vec3(0.3, 0.2, 0.4);
        
        float df = max(0.15, dot(cn, normalize(lightColor)));
        
        // Simplified fresnel
        float fresnelAmount = pow(1.0 - df, 2.0); // Reduced power for performance
        vec3 fresnelColor = purpleSpectrum(lightShift + 0.1) * fresnelAmount * 0.5;
        
        // Simplified specular
        float specAmount = pow(max(0.0, dot(reflect(-rd, cn), normalize(lightColor))), 16.0); // Reduced power
        vec3 specColor = purpleSpectrum(lightShift + 0.3) * specAmount * 0.8;
        
        // Simplified ambient occlusion
        float ao = min(mp(cp + cn * 0.2) - 0.2, 0.15) * 0.2;
        
        // Combine lighting
        cc = oc * (df * 0.5 + 0.15) + fresnelColor + specColor + ss * 0.6 + ao + gl;
      }

      void main() {
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
        
        ro = vec3(0.0, 0.0, -6.5);
        rd = normalize(vec3(uv, 1.0));
        
        // Reduced transparency layers for better performance
        int maxLayers = int(2.0 + u_complexity * 2.0); // Reduced from 4.0 + 4.0
        for(int i = 0; i < 8; i++) { // Reduced from 16
          if(i >= maxLayers * 2) break;
          
          tr();
          cp = ro + rd * cd;
          nm();
          cr = rd;
          ro = cp - cn * (0.015 * iv);
          
          // Simplified refraction without chromatic dispersion for performance
          rd = refract(cr, cn * iv, iv > 0.0 ? 1.0 / io : io);
          if(length(rd) == 0.0) rd = reflect(cr, cn * iv);
          
          px();
          iv *= -1.0;
          
          // Simplified color mixing
          if(iv < 0.0) {
            fc = mix(fc, cc, ct);
          }
          
          ct *= ot;
          if(ct <= 0.01 || cd > 64.0) break; // Earlier termination
        }
        
        // Final output with purple emphasis
        gl_FragColor = vec4(fc * 0.8, 0.5 + u_complexity * 0.1);
      }
    `;

    // Enhanced performance optimizations in the material setup
    const complexity = isLowEnd || isMobile ? 0.2 : 0.8;
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

    // Animation loop — throttled FPS, paused when tab is hidden
    let lastTime = 0;
    const targetFPS = isMobile ? 20 : 40;
    const frameInterval = 1000 / targetFPS;
    let paused = false;

    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (paused) return;
      if (currentTime - lastTime >= frameInterval) {
        material.uniforms.u_time.value += isMobile ? 0.005 : 0.007;
        renderer.render(scene, camera);
        lastTime = currentTime;
      }
    };

    animate(0);

    const handleVisibilityChange = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        zIndex: -10,
        pointerEvents: 'none',
        overflow: 'hidden',
        // CSS fallback shown on very-low-end devices (no WebGL shader)
        background: 'radial-gradient(ellipse at 50% 60%, #1a0a2e 0%, #0d051a 60%, #050008 100%)',
      }}
    />
  );
};

export default GeometricBackground;