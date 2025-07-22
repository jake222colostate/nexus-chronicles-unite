import React, { useMemo, Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { useFBX } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

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
      case 'tree1': return assetUrl('assets/LowPolyForrestAssets/Tree1.fbx');
      case 'tree2': return assetUrl('assets/LowPolyForrestAssets/Tree2.fbx');
      case 'rock1': return assetUrl('assets/LowPolyForrestAssets/Small Rock 1.fbx');
      case 'rock2': return assetUrl('assets/LowPolyForrestAssets/Small Rock 2.fbx');
      case 'rock3': return assetUrl('assets/LowPolyForrestAssets/Small Rock 3.fbx');
      case 'log': return assetUrl('assets/LowPolyForrestAssets/Fallen Log.fbx');
      case 'grass': return assetUrl('assets/LowPolyForrestAssets/Grass.fbx');
      default: return assetUrl('assets/LowPolyForrestAssets/Tree1.fbx');
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
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const forestObjects = useMemo(() => {
    const objects: ForestObject[] = [];
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    chunks.forEach((chunk) => {
      const chunkWorldX = chunk.x * chunkSize;
      const chunkWorldZ = chunk.z * chunkSize;
      const chunkSeed = chunk.x * 1000 + chunk.z;

      // Trees - main forest coverage
      const treeCount = 8 + Math.floor(seededRandom(chunkSeed) * 12);
      for (let i = 0; i < treeCount; i++) {
        const seed = chunkSeed + i * 100;
        const x = chunkWorldX + seededRandom(seed) * chunkSize;
        const z = chunkWorldZ + seededRandom(seed + 1) * chunkSize;
        
        // Avoid placing trees too close to the path (center)
        if (Math.abs(x) < 15) continue;
        
        const treeType = seededRandom(seed + 2) > 0.5 ? 'tree1' : 'tree2';
        const scale = 0.8 + seededRandom(seed + 3) * 0.6;
        
        objects.push({
          type: treeType,
          position: [x, -1, z],
          rotation: [0, seededRandom(seed + 4) * Math.PI * 2, 0],
          scale: [scale, scale, scale],
          chunkKey: `${chunk.x}_${chunk.z}_tree_${i}`
        });
      }

      // Rocks - scattered around
      const rockCount = 3 + Math.floor(seededRandom(chunkSeed + 200) * 5);
      for (let i = 0; i < rockCount; i++) {
        const seed = chunkSeed + i * 150 + 300;
        const x = chunkWorldX + seededRandom(seed) * chunkSize;
        const z = chunkWorldZ + seededRandom(seed + 1) * chunkSize;
        
        const rockTypes = ['rock1', 'rock2', 'rock3'];
        const rockType = rockTypes[Math.floor(seededRandom(seed + 2) * 3)] as 'rock1' | 'rock2' | 'rock3';
        const scale = 0.6 + seededRandom(seed + 3) * 0.8;
        
        objects.push({
          type: rockType,
          position: [x, -1, z],
          rotation: [0, seededRandom(seed + 4) * Math.PI * 2, 0],
          scale: [scale, scale, scale],
          chunkKey: `${chunk.x}_${chunk.z}_rock_${i}`
        });
      }

      // Fallen logs - less frequent but add character
      const logCount = Math.floor(seededRandom(chunkSeed + 400) * 3);
      for (let i = 0; i < logCount; i++) {
        const seed = chunkSeed + i * 200 + 500;
        const x = chunkWorldX + seededRandom(seed) * chunkSize;
        const z = chunkWorldZ + seededRandom(seed + 1) * chunkSize;
        
        const scale = 0.8 + seededRandom(seed + 2) * 0.4;
        
        objects.push({
          type: 'log',
          position: [x, -1, z],
          rotation: [0, seededRandom(seed + 3) * Math.PI * 2, 0],
          scale: [scale, scale, scale],
          chunkKey: `${chunk.x}_${chunk.z}_log_${i}`
        });
      }

      // Grass patches - fill in gaps
      const grassCount = 15 + Math.floor(seededRandom(chunkSeed + 600) * 10);
      for (let i = 0; i < grassCount; i++) {
        const seed = chunkSeed + i * 80 + 700;
        const x = chunkWorldX + seededRandom(seed) * chunkSize;
        const z = chunkWorldZ + seededRandom(seed + 1) * chunkSize;
        
        const scale = 0.5 + seededRandom(seed + 2) * 0.5;
        
        objects.push({
          type: 'grass',
          position: [x, -1, z],
          rotation: [0, seededRandom(seed + 3) * Math.PI * 2, 0],
          scale: [scale, scale, scale],
          chunkKey: `${chunk.x}_${chunk.z}_grass_${i}`
        });
      }
    });

    return objects;
  }, [chunks, chunkSize]);

  // Cull objects too far from player
  const visibleObjects = useMemo(() => {
    const renderDistance = 150;
    return forestObjects.filter(obj => {
      const distance = Math.sqrt(
        Math.pow(obj.position[0] - playerPosition.x, 2) +
        Math.pow(obj.position[2] - playerPosition.z, 2)
      );
      return distance < renderDistance;
    });
  }, [forestObjects, playerPosition]);

  return (
    <group>
      {visibleObjects.map((object, index) => (
        <ForestAsset key={`${object.chunkKey}_${index}`} object={object} />
      ))}
    </group>
  );
};