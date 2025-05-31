
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
  // Create dynamic skybox texture based on tier
  const skyboxTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Define sky configurations for each tier
    const skyConfigs = {
      1: {
        topColor: '#87CEEB',
        middleColor: '#B0E0E6', 
        bottomColor: '#E0F6FF',
        name: 'Morning Sky'
      },
      2: {
        topColor: '#FF6B35',
        middleColor: '#F7931E',
        bottomColor: '#FFD23F',
        name: 'Sunset Glow'
      },
      3: {
        topColor: '#4B0082',
        middleColor: '#8B008B',
        bottomColor: '#9932CC',
        name: 'Twilight Magic'
      },
      4: {
        topColor: '#191970',
        middleColor: '#483D8B',
        bottomColor: '#6A5ACD',
        name: 'Starry Night'
      },
      5: {
        topColor: '#0C0C0C',
        middleColor: '#2D1B69',
        bottomColor: '#4B0082',
        name: 'Aurora Dreams'
      }
    };
    
    const config = skyConfigs[Math.min(tier, 5) as keyof typeof skyConfigs];
    
    // Create sophisticated gradient skybox
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, config.topColor);
    gradient.addColorStop(0.3, config.middleColor);
    gradient.addColorStop(0.7, config.middleColor);
    gradient.addColorStop(1, config.bottomColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add tier-specific atmospheric effects
    if (tier >= 3) {
      // Add stars for night skies
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6; // Upper portion
        const size = Math.random() * 2 + 1;
        const brightness = Math.random() * 0.8 + 0.2;
        
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    
    if (tier >= 4) {
      // Add nebula clouds
      const nebulaGradient = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.3, 0,
        canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.3
      );
      nebulaGradient.addColorStop(0, 'rgba(138, 43, 226, 0.4)');
      nebulaGradient.addColorStop(0.6, 'rgba(75, 0, 130, 0.2)');
      nebulaGradient.addColorStop(1, 'rgba(25, 25, 112, 0.1)');
      
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (tier === 5) {
      // Add magical aurora effects
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 8) {
        const y = canvas.height * 0.25 + Math.sin(x * 0.008) * 60;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 0, 136, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 8) {
        const y = canvas.height * 0.35 + Math.cos(x * 0.006) * 40;
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
      {/* Main skybox sphere - larger for better horizon blending */}
      <mesh>
        <sphereGeometry args={[200, 64, 32]} />
        <meshBasicMaterial 
          map={skyboxTexture}
          transparent
          opacity={opacity}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
