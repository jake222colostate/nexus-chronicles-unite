import React from 'react';
import * as THREE from 'three';

export const PolishedFantasySkybox: React.FC = () => {
  // Create bright blue gradient skybox matching reference image
  const skyTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Create sky gradient - bright daylight colors
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue at top
    gradient.addColorStop(0.2, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.5, '#B0E0E6'); // Powder blue
    gradient.addColorStop(0.8, '#E0F6FF'); // Very light blue
    gradient.addColorStop(1, '#F0FAFF'); // Almost white at horizon
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle cloud-like texture
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.4; // Clouds in upper portion
      const width = 50 + Math.random() * 100;
      const height = 20 + Math.random() * 30;
      
      ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group name="PolishedFantasySkybox">
      {/* Sky dome */}
      <mesh scale={[-1, 1, 1]} frustumCulled={false}>
        <sphereGeometry args={[500, 32, 16]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
          map={skyTexture}
          fog={false}
        />
      </mesh>
      
      {/* Horizon glow for depth */}
      <mesh position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
        <ringGeometry args={[200, 400, 32]} />
        <meshBasicMaterial
          color="#E0F6FF"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
    </group>
  );
};