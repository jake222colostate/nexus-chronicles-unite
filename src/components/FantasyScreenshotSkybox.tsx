
import React from 'react';
import * as THREE from 'three';

interface FantasyScreenshotSkyboxProps {
  realm: 'fantasy' | 'scifi';
}

export const FantasyScreenshotSkybox: React.FC<FantasyScreenshotSkyboxProps> = ({
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {/* Gradient skybox sphere matching the screenshot */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
        >
          <primitive 
            object={new THREE.CanvasTexture((() => {
              const canvas = document.createElement('canvas');
              canvas.width = 1024;
              canvas.height = 1024;
              const ctx = canvas.getContext('2d')!;
              
              // Create gradient matching the screenshot
              const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
              gradient.addColorStop(0, '#1E1B4B'); // Dark blue top
              gradient.addColorStop(0.3, '#3730A3'); // Medium blue
              gradient.addColorStop(0.6, '#7C3AED'); // Purple middle
              gradient.addColorStop(0.8, '#EC4899'); // Pink
              gradient.addColorStop(1, '#F59E0B'); // Golden bottom
              
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Add stars
              ctx.fillStyle = '#FFFFFF';
              for (let i = 0; i < 300; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height * 0.7; // Stars in upper portion
                const size = Math.random() * 3;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              }
              
              // Add magical shimmer effect
              ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
              for (let i = 0; i < 100; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = Math.random() * 8;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              }
              
              return canvas;
            })())}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Aurora-like magical atmosphere */}
      <group>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[0, 60 + i * 8, -80]} rotation={[0, i * 0.3, 0]}>
            <planeGeometry args={[120, 15]} />
            <meshBasicMaterial 
              color={i % 2 === 0 ? '#00FFFF' : '#FF00FF'}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
