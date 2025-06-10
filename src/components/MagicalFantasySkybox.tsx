
import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

export const MagicalFantasySkybox: React.FC = () => {
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const texture = useMemo(() => {
    try {
      // OPTIMIZED: Reduced canvas resolution for better performance
      const canvas = document.createElement('canvas');
      canvas.width = 512; // Reduced from 1024
      canvas.height = 512; // Reduced from 1024
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.warn('Failed to get 2D context for MagicalFantasySkybox');
        return null;
      }

      // Bright blue radial gradient with fewer steps for performance
      const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
      gradient.addColorStop(0, '#87CEEB'); // Sky blue center
      gradient.addColorStop(0.5, '#4A90E2'); // Bright blue
      gradient.addColorStop(1, '#B0E0E6'); // Powder blue edge

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // REDUCED: Draw fewer magical rings
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { // Reduced from 6 rings
        ctx.beginPath();
        const radius = 100 + i * 60;
        ctx.arc(256, 256, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // REDUCED: Add fewer stars
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 50; i++) { // Reduced from 100 stars
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3;
        ctx.fillRect(x, y, size, size);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    } catch (error) {
      console.error('Error creating MagicalFantasySkybox texture:', error);
      return null;
    }
  }, []);

  // OPTIMIZED: Disable continuous updates for better performance
  useEffect(() => {
    return () => {
      if (materialRef.current && materialRef.current.map) {
        materialRef.current.map.dispose();
      }
    };
  }, []);

  return (
    <mesh scale={[-1, 1, 1]} frustumCulled={true} renderOrder={-1000}>
      <sphereGeometry args={[400, 32, 32]} /> {/* Reduced segment count */}
      <meshBasicMaterial 
        ref={materialRef}
        side={THREE.BackSide}
        transparent={false}
        depthWrite={false}
      >
        {texture && <primitive object={texture} />}
      </meshBasicMaterial>
    </mesh>
  );
};
