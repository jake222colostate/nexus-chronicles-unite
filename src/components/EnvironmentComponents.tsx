
import React from 'react';
import { ArchwayComponent } from './ArchwayComponent';
import { CrystalComponent } from './CrystalComponent';
import { MountainComponent } from './MountainComponent';
import { SkyDomeComponent } from './SkyDomeComponent';
import { TerrainComponent } from './TerrainComponent';
import { TreeComponent } from './TreeComponent';

interface EnvironmentComponentsProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  tileIndex?: number;
}

export const EnvironmentComponents: React.FC<EnvironmentComponentsProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  tileIndex = 0
}) => {
  // Generate deterministic but varied positions for components
  const generatePositions = (index: number) => {
    const seed = index * 123;
    const random = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    return {
      // Mountains in background
      mountains: [
        [-20 + random(1) * 10, 0, -15 + random(2) * 5] as [number, number, number],
        [15 + random(3) * 10, 0, -20 + random(4) * 5] as [number, number, number],
      ],
      // Trees scattered around
      trees: [
        [-8 + random(5) * 4, 0, -5 + random(6) * 10] as [number, number, number],
        [6 + random(7) * 4, 0, -8 + random(8) * 10] as [number, number, number],
        [-12 + random(9) * 3, 0, 5 + random(10) * 8] as [number, number, number],
        [10 + random(11) * 3, 0, 8 + random(12) * 8] as [number, number, number],
      ],
      // Crystals along path
      crystals: [
        [-3 + random(13) * 2, 2, 10 + random(14) * 6] as [number, number, number],
        [3 + random(15) * 2, 2, 20 + random(16) * 6] as [number, number, number],
        [-2 + random(17) * 2, 2, 35 + random(18) * 6] as [number, number, number],
      ],
      // Archway at specific location
      archway: [0, 0, 30] as [number, number, number]
    };
  };

  const positions = generatePositions(tileIndex);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Sky Dome - always at origin, large scale */}
      <SkyDomeComponent 
        position={[0, 0, 0]} 
        scale={[100, 100, 100]} 
      />
      
      {/* Terrain - base ground plane */}
      <TerrainComponent 
        position={[0, -0.5, 0]} 
        scale={[2, 1, 2]} 
      />
      
      {/* Mountains - background elements */}
      {positions.mountains.map((pos, index) => (
        <MountainComponent
          key={`mountain-${tileIndex}-${index}`}
          position={pos}
          scale={[0.8 + Math.sin(tileIndex + index) * 0.2, 1, 0.8 + Math.cos(tileIndex + index) * 0.2]}
          rotation={[0, Math.sin(tileIndex + index) * Math.PI, 0]}
        />
      ))}
      
      {/* Trees - scattered vegetation */}
      {positions.trees.map((pos, index) => (
        <TreeComponent
          key={`tree-${tileIndex}-${index}`}
          position={pos}
          scale={[0.8 + Math.sin(tileIndex + index + 10) * 0.3, 1, 0.8 + Math.cos(tileIndex + index + 10) * 0.3]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
        />
      ))}
      
      {/* Crystals - magical elements with animation */}
      {positions.crystals.map((pos, index) => (
        <CrystalComponent
          key={`crystal-${tileIndex}-${index}`}
          position={pos}
          scale={[0.6, 0.6, 0.6]}
          animate={true}
        />
      ))}
      
      {/* Archway - major landmark */}
      <ArchwayComponent
        position={positions.archway}
        scale={[1.2, 1.2, 1.2]}
      />
    </group>
  );
};
