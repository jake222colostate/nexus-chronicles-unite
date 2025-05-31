
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PixelFantasyTerrainProps {
  tier: number;
}

export const PixelFantasyTerrain: React.FC<PixelFantasyTerrainProps> = ({ tier }) => {
  // Create terrain colors based on tier
  const terrainData = useMemo(() => {
    switch (tier) {
      case 1:
        return {
          groundColor: '#4ade80', // Bright green
          mountainColor: '#84cc16', // Lime green
          skyTop: '#87CEEB', // Sky blue
          skyBottom: '#E0F6FF', // Light blue
          trees: true
        };
      case 2:
        return {
          groundColor: '#22c55e', // Green
          mountainColor: '#65a30d', // Darker green
          skyTop: '#FF6B9D', // Pink
          skyBottom: '#FFB347', // Orange
          trees: true
        };
      case 3:
        return {
          groundColor: '#16a34a', // Dark green
          mountainColor: '#15803d', // Very dark green
          skyTop: '#8B5CF6', // Purple
          skyBottom: '#4C1D95', // Dark purple
          trees: false
        };
      case 4:
        return {
          groundColor: '#166534', // Forest green
          mountainColor: '#14532d', // Very dark green
          skyTop: '#1E1B4B', // Dark indigo
          skyBottom: '#0F0C29', // Very dark purple
          trees: false
        };
      case 5:
      default:
        return {
          groundColor: '#0f172a', // Dark slate
          mountainColor: '#1e293b', // Slate
          skyTop: '#0C0C0C', // Almost black
          skyBottom: '#2D1B69', // Dark purple
          trees: false
        };
    }
  }, [tier]);

  // Create skybox gradient texture
  const skyboxTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, terrainData.skyTop);
    gradient.addColorStop(1, terrainData.skyBottom);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add stars for higher tiers
    if (tier >= 3) {
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [tier, terrainData]);

  return (
    <group>
      {/* Enhanced skybox sphere */}
      <mesh>
        <sphereGeometry args={[150, 32, 32]} />
        <meshBasicMaterial 
          map={skyboxTexture}
          side={THREE.BackSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Main ground plane - extended corridor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -70]} receiveShadow>
        <planeGeometry args={[20, 150]} />
        <meshLambertMaterial color={terrainData.groundColor} />
      </mesh>

      {/* Left mountain wall - pixel style */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`left-${i}`}>
          <mesh position={[-12, 2 + i * 1.5, -20 - (i * 15)]} castShadow>
            <boxGeometry args={[4, 8 + i * 2, 20]} />
            <meshLambertMaterial color={terrainData.mountainColor} />
          </mesh>
          <mesh position={[-16, 1 + i * 1.2, -20 - (i * 15)]} castShadow>
            <boxGeometry args={[2, 6 + i * 1.5, 18]} />
            <meshLambertMaterial color={terrainData.mountainColor} />
          </mesh>
        </group>
      ))}

      {/* Right mountain wall - pixel style */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`right-${i}`}>
          <mesh position={[12, 2 + i * 1.5, -20 - (i * 15)]} castShadow>
            <boxGeometry args={[4, 8 + i * 2, 20]} />
            <meshLambertMaterial color={terrainData.mountainColor} />
          </mesh>
          <mesh position={[16, 1 + i * 1.2, -20 - (i * 15)]} castShadow>
            <boxGeometry args={[2, 6 + i * 1.5, 18]} />
            <meshLambertMaterial color={terrainData.mountainColor} />
          </mesh>
        </group>
      ))}

      {/* Pixel-style trees (only for lower tiers) */}
      {terrainData.trees && Array.from({ length: 12 }, (_, i) => (
        <group key={`tree-${i}`} position={[
          (i % 2 === 0 ? -8 : 8) + (Math.random() - 0.5) * 2, 
          0, 
          -10 - (i * 8) + (Math.random() - 0.5) * 4
        ]}>
          {/* Tree trunk */}
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[0.5, 2, 0.5]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          {/* Tree leaves */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <boxGeometry args={[2, 2, 2]} />
            <meshLambertMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Decorative rocks along the path */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh 
          key={`rock-${i}`}
          position={[
            (i % 2 === 0 ? -4 : 4) + (Math.random() - 0.5), 
            0, 
            -5 - (i * 6)
          ]} 
          castShadow
        >
          <boxGeometry args={[0.8 + Math.random() * 0.4, 0.5 + Math.random() * 0.3, 0.8 + Math.random() * 0.4]} />
          <meshLambertMaterial color={terrainData.mountainColor} />
        </mesh>
      ))}

      {/* Enhanced fog for atmosphere */}
      <fog 
        attach="fog" 
        args={[terrainData.skyBottom, 40, 120]} 
      />
    </group>
  );
};
