import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Safety3DCanvas Component
 * Interactive WebGL 3D Safety Shield and Holographic Protective Radar.
 * Rendered using Three.js with mouse tracking, particle nodes, dynamic state lighting,
 * and automatic cleanup.
 */
export function Safety3DCanvas({ safetyState = 'SAFE', className = '' }) {
  const mountRef = useRef(null);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebGLError(true);
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    // Color definitions based on active safety state
    const getStateColor = (state) => {
      switch (state) {
        case 'EMERGENCY':
          return { primary: 0xef4444, secondary: 0xdc2626, core: 0xfca5a5 };
        case 'THREAT':
          return { primary: 0xf97316, secondary: 0xea580c, core: 0xfdba74 };
        case 'CAUTION':
          return { primary: 0xf59e0b, secondary: 0xd97706, core: 0xfde68a };
        case 'RECOVERED':
          return { primary: 0x06b6d4, secondary: 0x0891b2, core: 0xa5f3fc };
        case 'SAFE':
        default:
          return { primary: 0x10b981, secondary: 0x3b82f6, core: 0x6ee7b7 };
      }
    };

    let colors = getStateColor(safetyState);

    // 1. Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(colors.primary, 3, 20);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(colors.secondary, 2, 20);
    backLight.position.set(-3, -2, -3);
    scene.add(backLight);

    // Main 3D Group
    const group = new THREE.Group();
    scene.add(group);

    // 2. Outer Protective Geodesic Shield (Wireframe Icosahedron)
    const shieldGeometry = new THREE.IcosahedronGeometry(2.3, 2);
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: colors.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
    });
    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    group.add(shieldMesh);

    // 3. Inner Crystalline Energy Core (Smooth Octahedron)
    const coreGeometry = new THREE.OctahedronGeometry(1.2, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: colors.core,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
      emissive: colors.primary,
      emissiveIntensity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(coreMesh);

    // 4. Orbiting Geo-Radar Rings (Torus)
    const ringGeometry1 = new THREE.TorusGeometry(3.1, 0.02, 16, 100);
    const ringMaterial1 = new THREE.MeshBasicMaterial({
      color: colors.secondary,
      transparent: true,
      opacity: 0.45,
    });
    const ringMesh1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
    ringMesh1.rotation.x = Math.PI / 3;
    group.add(ringMesh1);

    const ringGeometry2 = new THREE.TorusGeometry(2.8, 0.02, 16, 100);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    ringMesh2.rotation.y = Math.PI / 4;
    ringMesh2.rotation.x = -Math.PI / 6;
    group.add(ringMesh2);

    // 5. Orbiting Beacon Particles (Guardians & Safe Havens)
    const particleCount = 48;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: colors.primary,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    // Mouse Tracking Interactivity
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotationY = mouseX * 0.8;
      targetRotationX = -mouseY * 0.8;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const speedMultiplier = safetyState === 'EMERGENCY' ? 2.5 : safetyState === 'THREAT' ? 1.8 : 1.0;

      if (!prefersReducedMotion) {
        // Continuous gentle rotation
        shieldMesh.rotation.y += 0.005 * speedMultiplier;
        shieldMesh.rotation.x += 0.002 * speedMultiplier;

        coreMesh.rotation.y -= 0.008 * speedMultiplier;
        coreMesh.rotation.z += 0.004 * speedMultiplier;

        ringMesh1.rotation.z += 0.004 * speedMultiplier;
        ringMesh2.rotation.z -= 0.006 * speedMultiplier;

        particles.rotation.y += 0.003 * speedMultiplier;

        // Pulse scale
        const pulse = 1 + Math.sin(elapsedTime * 2 * speedMultiplier) * 0.03;
        coreMesh.scale.set(pulse, pulse, pulse);
      }

      // Smooth mouse interpolation (damping)
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      shieldGeometry.dispose();
      shieldMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeometry1.dispose();
      ringMaterial1.dispose();
      ringGeometry2.dispose();
      ringMaterial2.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [safetyState]);

  if (webGLError) {
    return (
      <div
        className={`fallback-3d-shield ${className}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(55, 88, 249, 0.1) 0%, transparent 70%)',
          borderRadius: '24px',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: '2px dashed #3758F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spin 12s linear infinite',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3758F9 0%, #10B981 100%)',
              boxShadow: '0 0 30px rgba(55, 88, 249, 0.4)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`saheli-3d-viewport ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '380px',
        position: 'relative',
        cursor: 'grab',
      }}
      aria-label="Interactive 3D Holographic Safety Shield"
      role="img"
    />
  );
}
