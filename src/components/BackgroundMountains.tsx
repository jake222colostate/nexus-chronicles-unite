import React, { useMemo } from 'react';
import { Vector3 } from 'three';

interface BackgroundMountainsProps {
  playerPosition: Vector3;
}

interface MountainPeak {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  layer: number;
}

// Seeded random for consistent mountain generation
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const BackgroundMountains: React.FC<BackgroundMountainsProps> = ({
  playerPosition
}) => {
  const mountainPeaks = useMemo(() => {
    const peaks: MountainPeak[] = [];
    const mountainDistance = 150; // Far background
    
    // Generate left mountain range
    for (let i = 0; i < 8; i++) {
      const seed = i * 100;
      const z = playerPosition.z - 100 + (i * 50);
      
      // Multiple layers for depth
      for (let layer = 0; layer < 3; layer++) {
        const layerSeed = seed + layer * 10;
        const height = 25 + seededRandom(layerSeed) * 20;
        const width = 15 + seededRandom(layerSeed + 1) * 10;
        const depth = 10 + seededRandom(layerSeed + 2) * 8;
        
        peaks.push({
          key: `mountain_left_${i}_${layer}`,
          position: [
            -mountainDistance - (layer * 20),
            height * 0.5,
            z + (seededRandom(layerSeed + 3) - 0.5) * 30
          ],
          scale: [width, height, depth],
          rotation: [0, seededRandom(layerSeed + 4) * Math.PI * 0.3, 0],
          layer
        });
      }
    }
    
    // Generate right mountain range
    for (let i = 0; i < 8; i++) {
      const seed = i * 100 + 1000;
      const z = playerPosition.z - 100 + (i * 50);
      
      // Multiple layers for depth
      for (let layer = 0; layer < 3; layer++) {
        const layerSeed = seed + layer * 10;
        const height = 25 + seededRandom(layerSeed) * 20;
        const width = 15 + seededRandom(layerSeed + 1) * 10;
        const depth = 10 + seededRandom(layerSeed + 2) * 8;
        
        peaks.push({
          key: `mountain_right_${i}_${layer}`,
          position: [
            mountainDistance + (layer * 20),
            height * 0.5,
            z + (seededRandom(layerSeed + 3) - 0.5) * 30
          ],
          scale: [width, height, depth],
          rotation: [0, seededRandom(layerSeed + 4) * Math.PI * 0.3, 0],
          layer
        });
      }
    }
    
    console.log(`BackgroundMountains: Generated ${peaks.length} mountain peaks`);
    return peaks;
  }, [playerPosition.z]);

  return (
    <group name="BackgroundMountains">
      {mountainPeaks.map((peak) => {
        // Color gets darker and more blue for distant layers
        const baseColor = peak.layer === 0 ? '#546E7A' : peak.layer === 1 ? '#455A64' : '#37474F';
        
        return (
          <mesh
            key={peak.key}
            position={peak.position}
            scale={peak.scale}
            rotation={peak.rotation}
            frustumCulled={false}
          >
            <coneGeometry args={[1, 1, 6]} />
            <meshStandardMaterial
              color={baseColor}
              roughness={0.8}
              metalness={0.1}
              fog={true}
            />
          </mesh>
        );
      })}
    </group>
  );
};