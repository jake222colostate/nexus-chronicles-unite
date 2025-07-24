import React from 'react';
import * as THREE from 'three';

export const ValleyFantasySkybox: React.FC = () => {
  // Create valley-appropriate skybox with blue-grey gradient
  const skyTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Create valley sky gradient - cooler, more atmospheric
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#B0BEC5'); // Light blue-grey at top
    gradient.addColorStop(0.3, '#CFD8DC'); // Slightly lighter
    gradient.addColorStop(0.6, '#ECEFF1'); // Very light grey-blue
    gradient.addColorStop(0.9, '#F5F5F5'); // Almost white
    gradient.addColorStop(1, '#FAFAFA'); // White at horizon
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add mountain silhouette effect at horizon
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#607D8B';
    
    // Create jagged mountain horizon line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.7);
    for (let x = 0; x < canvas.width; x += 20) {
      const y = canvas.height * (0.6 + Math.sin(x * 0.01) * 0.1 + Math.random() * 0.05);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group name="ValleyFantasySkybox">
      {/* Sky dome */}
      <mesh scale={[-1, 1, 1]} frustumCulled={false}>
        <sphereGeometry args={[400, 32, 16]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
          map={skyTexture}
          fog={false}
        />
      </mesh>
      
      {/* Valley atmospheric haze */}
      <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
        <ringGeometry args={[150, 300, 32]} />
        <meshBasicMaterial
          color="#CFD8DC"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
    </group>
  );
};