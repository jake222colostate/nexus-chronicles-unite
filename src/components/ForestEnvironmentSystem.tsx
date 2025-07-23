import React, { useMemo, Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { useFBX } from '@react-three/drei';

interface ForestEnvironmentSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

interface ForestObject {
  type: 'tree1' | 'tree2' | 'rock1' | 'rock2' | 'rock3' | 'log' | 'grass';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  chunkKey: string;
}

const ForestAsset: React.FC<{ object: ForestObject }> = ({ object }) => {
  const getAssetPath = (type: string) => {
    switch (type) {
      case 'tree1': return '/assets/LowPolyForrestAssets/Tree1.fbx';
      case 'tree2': return '/assets/LowPolyForrestAssets/Tree2.fbx';
      case 'rock1': return '/assets/LowPolyForrestAssets/Small Rock 1.fbx';
      case 'rock2': return '/assets/LowPolyForrestAssets/Small Rock 2.fbx';
      case 'rock3': return '/assets/LowPolyForrestAssets/Small Rock 3.fbx';
      case 'log': return '/assets/LowPolyForrestAssets/Fallen Log.fbx';
      case 'grass': return '/assets/LowPolyForrestAssets/Grass.fbx';
      default: return '/assets/LowPolyForrestAssets/Tree1.fbx';
    }
  };

  try {
    const fbx = useFBX(getAssetPath(object.type));
    
    return (
      <Suspense fallback={null}>
        <primitive 
          object={fbx.clone()} 
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          castShadow
          receiveShadow
        />
      </Suspense>
    );
  } catch (error) {
    console.warn(`Failed to load ${object.type} asset:`, error);
    
    // Fallback to simple geometry
    const getFallbackGeometry = (type: string) => {
      switch (type) {
        case 'tree1':
        case 'tree2':
          return (
            <group>
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 2]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 3, 0]}>
                <coneGeometry args={[1.5, 3]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            </group>
          );
        case 'rock1':
        case 'rock2':
        case 'rock3':
          return (
            <mesh>
              <boxGeometry args={[1, 0.8, 1]} />
              <meshStandardMaterial color="#696969" />
            </mesh>
          );
        case 'log':
          return (
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 2]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          );
        case 'grass':
          return (
            <mesh>
              <planeGeometry args={[0.5, 0.5]} />
              <meshStandardMaterial color="#32CD32" />
            </mesh>
          );
        default:
          return null;
      }
    };
    
    return (
      <group 
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
      >
        {getFallbackGeometry(object.type)}
      </group>
    );
  }
};

export const ForestEnvironmentSystem: React.FC<ForestEnvironmentSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // DISABLED FOR PERFORMANCE - All forest elements removed
  console.log('ForestEnvironmentSystem: Disabled for performance');
  return null;
};

// Leftover code removed for performance