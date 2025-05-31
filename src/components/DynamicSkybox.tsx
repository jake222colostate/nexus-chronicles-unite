
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
  // Define skybox colors for each tier
  const skyboxData = useMemo(() => {
    switch (tier) {
      case 1:
        return {
          topColor: '#87CEEB', // Sky blue
          bottomColor: '#E0F6FF', // Light blue
          description: 'Clear Dawn Sky'
        };
      case 2:
        return {
          topColor: '#FF6B9D', // Pink
          bottomColor: '#FFB347', // Orange
          description: 'Magical Sunrise'
        };
      case 3:
        return {
          topColor: '#8B5CF6', // Purple
          bottomColor: '#4C1D95', // Dark purple
          description: 'Storm Clouds'
        };
      case 4:
        return {
          topColor: '#1E1B4B', // Dark indigo
          bottomColor: '#0F0C29', // Very dark purple
          description: 'Starry Nebula'
        };
      case 5:
      default:
        return {
          topColor: '#0C0C0C', // Almost black
          bottomColor: '#2D1B69', // Dark purple
          description: 'Cosmic Void'
        };
    }
  }, [tier]);

  return (
    <group>
      {/* Gradient skybox sphere */}
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial 
          transparent
          opacity={opacity}
          side={THREE.BackSide}
        >
          <primitive 
            object={new THREE.CanvasTexture((() => {
              const canvas = document.createElement('canvas');
              canvas.width = 512;
              canvas.height = 512;
              const ctx = canvas.getContext('2d')!;
              
              // Create gradient
              const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
              gradient.addColorStop(0, skyboxData.topColor);
              gradient.addColorStop(1, skyboxData.bottomColor);
              
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Add stars for higher tiers
              if (tier >= 3) {
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i < 200; i++) {
                  const x = Math.random() * canvas.width;
                  const y = Math.random() * canvas.height * 0.6; // Stars in upper portion
                  const size = Math.random() * 2;
                  ctx.fillRect(x, y, size, size);
                }
              }
              
              return canvas;
            })())}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Additional atmospheric effects for higher tiers */}
      {tier >= 4 && (
        <group>
          {/* Aurora effects */}
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={i} position={[0, 40 + i * 5, -60]} rotation={[0, i * 0.5, 0]}>
              <planeGeometry args={[80, 10]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? '#00FF88' : '#FF0088'}
                transparent
                opacity={opacity * 0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
