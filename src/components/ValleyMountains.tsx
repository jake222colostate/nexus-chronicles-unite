import React, { useMemo } from 'react';
import { Vector3 } from 'three';

interface ValleyMountainsProps {
  playerPosition: Vector3;
}

interface MountainWall {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  color: string;
  layer: number;
}

// Seeded random for consistent mountain generation
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const ValleyMountains: React.FC<ValleyMountainsProps> = ({
  playerPosition
}) => {
  const mountainWalls = useMemo(() => {
    const walls: MountainWall[] = [];
    const valleyWidth = 45; // Close mountains for valley feel
    
    // Generate left valley wall
    for (let i = 0; i < 12; i++) {
      const seed = i * 100;
      const z = playerPosition.z - 50 + (i * 30);
      
      // Multiple layers for realistic mountain depth
      for (let layer = 0; layer < 4; layer++) {
        const layerSeed = seed + layer * 15;
        const height = 35 + seededRandom(layerSeed) * 25;
        const width = 12 + seededRandom(layerSeed + 1) * 8;
        const depth = 8 + seededRandom(layerSeed + 2) * 6;
        
        // Color gets more blue-grey with distance
        const colors = ['#546E7A', '#607D8B', '#78909C', '#90A4AE'];
        
        walls.push({
          key: `mountain_left_${i}_${layer}`,
          position: [
            -valleyWidth - (layer * 8),
            height * 0.5 - 5,
            z + (seededRandom(layerSeed + 3) - 0.5) * 20
          ],
          scale: [width, height, depth],
          rotation: [0, seededRandom(layerSeed + 4) * Math.PI * 0.4, 0],
          color: colors[layer] || '#90A4AE',
          layer
        });
      }
    }
    
    // Generate right valley wall
    for (let i = 0; i < 12; i++) {
      const seed = i * 100 + 2000;
      const z = playerPosition.z - 50 + (i * 30);
      
      // Multiple layers for realistic mountain depth
      for (let layer = 0; layer < 4; layer++) {
        const layerSeed = seed + layer * 15;
        const height = 35 + seededRandom(layerSeed) * 25;
        const width = 12 + seededRandom(layerSeed + 1) * 8;
        const depth = 8 + seededRandom(layerSeed + 2) * 6;
        
        // Color gets more blue-grey with distance
        const colors = ['#546E7A', '#607D8B', '#78909C', '#90A4AE'];
        
        walls.push({
          key: `mountain_right_${i}_${layer}`,
          position: [
            valleyWidth + (layer * 8),
            height * 0.5 - 5,
            z + (seededRandom(layerSeed + 3) - 0.5) * 20
          ],
          scale: [width, height, depth],
          rotation: [0, seededRandom(layerSeed + 4) * Math.PI * 0.4, 0],
          color: colors[layer] || '#90A4AE',
          layer
        });
      }
    }
    
    // Add some closer rocky outcrops near the path
    for (let i = 0; i < 8; i++) {
      const seed = i * 50 + 5000;
      const z = playerPosition.z - 30 + (i * 25);
      const side = seededRandom(seed) > 0.5 ? 1 : -1;
      
      walls.push({
        key: `outcrop_${i}`,
        position: [
          side * (20 + seededRandom(seed + 1) * 10),
          8 + seededRandom(seed + 2) * 8,
          z
        ],
        scale: [
          4 + seededRandom(seed + 3) * 3,
          12 + seededRandom(seed + 4) * 8,
          5 + seededRandom(seed + 5) * 4
        ],
        rotation: [0, seededRandom(seed + 6) * Math.PI * 0.6, 0],
        color: '#455A64',
        layer: 0
      });
    }
    
    console.log(`ValleyMountains: Generated ${walls.length} mountain walls`);
    return walls;
  }, [playerPosition.z]);

  return (
    <group name="ValleyMountains">
      {mountainWalls.map((wall) => (
        <mesh
          key={wall.key}
          position={wall.position}
          scale={wall.scale}
          rotation={wall.rotation}
          frustumCulled={false}
          castShadow
          receiveShadow
        >
          <coneGeometry args={[1, 1, 6]} />
          <meshStandardMaterial
            color={wall.color}
            roughness={0.8}
            metalness={0.1}
            fog={true}
          />
        </mesh>
      ))}
    </group>
  );
};