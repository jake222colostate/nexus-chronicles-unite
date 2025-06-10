
import React, { useMemo } from 'react';
import * as THREE from 'three';

export const FantasySkybox: React.FC = () => {
  // Create the gradient texture for the twilight sky
  const twilightTexture = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.warn('Failed to get 2D context for FantasySkybox');
        return null;
      }
      
      // Create the twilight gradient: deep indigo to violet-blue to dark purple
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#130c30'); // Deep indigo at horizon
      gradient.addColorStop(0.4, '#2d1b5f'); // Mid transition
      gradient.addColorStop(0.7, '#4c1b70'); // Violet-blue
      gradient.addColorStop(1, '#3d1454'); // Dark purple at zenith
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add scattered stars with varying brightness
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.7; // Stars in upper portion
        const size = Math.random() * 3 + 1;
        const opacity = 0.3 + Math.random() * 0.7;
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add the hero star (brighter, left of center)
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.35, canvas.height * 0.25, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow around hero star
      const heroGradient = ctx.createRadialGradient(
        canvas.width * 0.35, canvas.height * 0.25, 0,
        canvas.width * 0.35, canvas.height * 0.25, 15
      );
      heroGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      heroGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = heroGradient;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.35, canvas.height * 0.25, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      return new THREE.CanvasTexture(canvas);
    } catch (error) {
      console.error('Error creating FantasySkybox texture:', error);
      return null;
    }
  }, []);

  return (
    <group>
      {/* Main skybox sphere */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
          map={twilightTexture}
        />
      </mesh>

      {/* Aurora effects - teal ribbons in upper sky */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh 
          key={`aurora_${i}`}
          position={[
            (i - 1) * 80,
            100 + i * 20,
            -200
          ]}
          rotation={[0, 0, (i - 1) * 0.3]}
        >
          <planeGeometry args={[150, 30]} />
          <meshBasicMaterial 
            color="#00ffc8"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Additional atmospheric glow */}
      <ambientLight intensity={0.3} color="#4c1b70" />
    </group>
  );
};
