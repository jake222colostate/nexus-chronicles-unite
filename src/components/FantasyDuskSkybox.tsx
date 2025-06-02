
import React from 'react';
import * as THREE from 'three';

export const FantasyDuskSkybox: React.FC = () => {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[300, 32, 32]} />
      <meshBasicMaterial 
        side={THREE.BackSide}
      >
        <primitive 
          object={new THREE.CanvasTexture((() => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d')!;
            
            // Create the exact gradient from reference image
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1a0f2e'); // Dark purple top
            gradient.addColorStop(0.3, '#2d1b4e'); // Medium purple
            gradient.addColorStop(0.6, '#4a2c5a'); // Lighter purple
            gradient.addColorStop(0.8, '#6b4c87'); // Pink-purple
            gradient.addColorStop(1, '#8b6bb1'); // Light purple bottom
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add stars scattered throughout
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 150; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height * 0.7;
              const size = Math.random() * 2;
              ctx.fillRect(x, y, size, size);
            }
            
            // Add some larger glowing stars
            for (let i = 0; i < 20; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height * 0.5;
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fillStyle = '#FFD700';
              ctx.fill();
            }
            
            return canvas;
          })())}
        />
      </meshBasicMaterial>
    </mesh>
  );
};
