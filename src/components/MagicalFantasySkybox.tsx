
import React from 'react';
import * as THREE from 'three';

export const MagicalFantasySkybox: React.FC = () => {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[400, 64, 64]} />
      <meshBasicMaterial side={THREE.BackSide}>
        <primitive
          object={new THREE.CanvasTexture((() => {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d')!;

            // Bright blue radial gradient
            const gradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 512);
            gradient.addColorStop(0, '#87CEEB'); // Sky blue center
            gradient.addColorStop(0.4, '#4A90E2'); // Bright blue
            gradient.addColorStop(0.7, '#6BB6FF'); // Light blue
            gradient.addColorStop(1, '#B0E0E6'); // Powder blue edge

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw lighter magical rings
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
              ctx.beginPath();
              const radius = 150 + i * 40;
              ctx.arc(512, 512, radius, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Add fewer, brighter stars
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 100; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              const size = Math.random() * 3;
              ctx.fillRect(x, y, size, size);
            }

            return canvas;
          })())}
        />
      </meshBasicMaterial>
    </mesh>
  );
};
