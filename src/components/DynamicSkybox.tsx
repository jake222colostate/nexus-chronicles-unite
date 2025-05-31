
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface DynamicSkyboxProps {
  tier: number;
  opacity?: number;
}

export const DynamicSkybox: React.FC<DynamicSkyboxProps> = ({ 
  tier, 
  opacity = 1 
}) => {
  // Create skybox texture based on tier
  const skyboxTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Define sky colors for each tier
    const skyConfigs = {
      1: {
        topColor: '#87CEEB',
        bottomColor: '#E0F6FF',
        middleColor: '#B0E0E6',
        name: 'Clear Day'
      },
      2: {
        topColor: '#FF8C42',
        bottomColor: '#FFE4B5',
        middleColor: '#FFA500',
        name: 'Evening Glow'
      },
      3: {
        topColor: '#4B0082',
        bottomColor: '#8B008B',
        middleColor: '#9932CC',
        name: 'Twilight'
      },
      4: {
        topColor: '#191970',
        bottomColor: '#000080',
        middleColor: '#483D8B',
        name: 'Starry Night'
      },
      5: {
        topColor: '#0C0C0C',
        bottomColor: '#2D1B69',
        middleColor: '#4B0082',
        name: 'Magical Aurora'
      }
    };
    
    const config = skyConfigs[Math.min(tier, 5) as keyof typeof skyConfigs];
    
    // Create sophisticated gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, config.topColor);
    gradient.addColorStop(0.4, config.middleColor);
    gradient.addColorStop(1, config.bottomColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add atmospheric effects based on tier
    if (tier >= 3) {
      // Add stars for night tiers
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.7; // Upper portion
        const size = Math.random() * 3 + 1;
        const brightness = Math.random();
        
        ctx.globalAlpha = brightness;
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1;
    }
    
    if (tier >= 4) {
      // Add nebula effects
      const nebulaGradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.2, 0,
        canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.4
      );
      nebulaGradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)');
      nebulaGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.2)');
      nebulaGradient.addColorStop(1, 'rgba(25, 25, 112, 0.1)');
      
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (tier === 5) {
      // Add aurora effects
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 10) {
        const y = canvas.height * 0.3 + Math.sin(x * 0.01) * 50;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 0, 136, 0.4)';
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 10) {
        const y = canvas.height * 0.4 + Math.cos(x * 0.008) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
  }, [tier]);

  return (
    <group>
      {/* Main skybox sphere */}
      <mesh>
        <sphereGeometry args={[150, 32, 32]} />
        <meshBasicMaterial 
          map={skyboxTexture}
          transparent
          opacity={opacity}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Atmospheric fog for depth */}
      <mesh position={[0, -10, -80]}>
        <planeGeometry args={[200, 40]} />
        <meshBasicMaterial
          color={tier <= 2 ? '#E0F6FF' : tier <= 3 ? '#8B008B' : '#191970'}
          transparent
          opacity={opacity * 0.3}
        />
      </mesh>
    </group>
  );
};
