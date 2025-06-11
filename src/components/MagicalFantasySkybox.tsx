
import React, { useMemo } from 'react';
import * as THREE from 'three';

export const MagicalFantasySkybox: React.FC = () => {
  const texture = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512; // Reduced from 1024 for better performance
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.warn('Failed to get 2D context for MagicalFantasySkybox');
        return null;
      }

      // Simple gradient for better performance
      const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.5, '#4A90E2');
      gradient.addColorStop(1, '#B0E0E6');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fewer, simpler effects for performance
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) { // Reduced from 6
        ctx.beginPath();
        const radius = 100 + i * 50;
        ctx.arc(256, 256, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Fewer stars for better performance
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 50; i++) { // Reduced from 100
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2; // Smaller stars
        ctx.fillRect(x, y, size, size);
      }

      const canvasTexture = new THREE.CanvasTexture(canvas);
      canvasTexture.minFilter = THREE.LinearFilter; // Better performance
      canvasTexture.magFilter = THREE.LinearFilter;
      canvasTexture.generateMipmaps = false; // Disable mipmaps for performance
      
      return canvasTexture;
    } catch (error) {
      console.error('Error creating MagicalFantasySkybox texture:', error);
      return null;
    }
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[300, 32, 32]} /> {/* Reduced from 400, 64, 64 */}
      <meshBasicMaterial side={THREE.BackSide} fog={false}>
        {texture && <primitive object={texture} />}
      </meshBasicMaterial>
    </mesh>
  );
};
