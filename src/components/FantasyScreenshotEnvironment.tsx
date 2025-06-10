
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { MagicalFantasySkybox } from './MagicalFantasySkybox';
import { ProceduralMountainTerrain } from './ProceduralMountainTerrain';
import { CleanPathSystem } from './CleanPathSystem';
import { ImprovedFantasyLighting } from './ImprovedFantasyLighting';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import * as THREE from 'three';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: THREE.Vector3;
}

export const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new THREE.Vector3(0, 0, 0)
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {/* Magical skybox */}
      <MagicalFantasySkybox />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -150]} receiveShadow>
        <planeGeometry args={[200, 600]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
      
      {/* Path system */}
      <CleanPathSystem chunks={chunks.slice(0, 30)} chunkSize={chunkSize} realm={realm} />
      
      {/* Hyper-realistic mountains */}
      <ProceduralMountainTerrain
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Enhanced Tree Distribution System with proper GLB loading */}
      <EnhancedTreeDistribution
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Optimized lighting */}
      <ImprovedFantasyLighting />
    </group>
  );
};
