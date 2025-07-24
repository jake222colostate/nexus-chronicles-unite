
import React from 'react';
import * as THREE from 'three';

interface SimpleSkyboxProps {
  realm: 'fantasy' | 'scifi';
}

export const SimpleSkybox: React.FC<SimpleSkyboxProps> = ({ realm }) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Create atmospheric sky gradient like in reference image
  const skyTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Create sky gradient - bright blue to lighter blue
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Light blue at top
    gradient.addColorStop(0.3, '#87CEEB'); // Light blue
    gradient.addColorStop(0.7, '#B0E0E6'); // Powder blue
    gradient.addColorStop(1, '#E6F3FF'); // Very light blue at horizon
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[400, 32, 32]} />
      <meshBasicMaterial 
        side={THREE.BackSide}
        map={skyTexture}
      />
    </mesh>
  );
};
