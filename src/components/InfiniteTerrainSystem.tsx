
import React, { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { ChunkData } from './InfiniteChunkLoader';

interface InfiniteTerrainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

// Ground plane component for each chunk
const GroundChunk: React.FC<{ worldZ: number; chunkSize: number }> = ({ worldZ, chunkSize }) => {
  return (
    <mesh 
      position={[0, -2, worldZ]} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow
    >
      <planeGeometry args={[300, chunkSize]} />
      <meshStandardMaterial 
        color="#2d4a2b" 
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

// Mountain component using local GLB asset
const MountainChunk: React.FC<{ worldZ: number; chunkIndex: number }> = ({ worldZ, chunkIndex }) => {
  const { scene: mountainModel } = useGLTF('/assets/mountain_low_poly.glb');
  
  const mountainInstance = useMemo(() => {
    if (!mountainModel) return null;
    
    const clone = mountainModel.clone() as Group;
    
    // Configure mountain for proper rendering
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.visible = true;
          child.material.needsUpdate = true;
        }
      }
    });
    
    return clone;
  }, [mountainModel]);

  if (!mountainInstance) {
    return (
      // Fallback mountain while loading
      <group position={[0, -2, worldZ]}>
        <mesh position={[-80, 0, 0]} castShadow receiveShadow>
          <coneGeometry args={[20, 25, 12]} />
          <meshLambertMaterial color="#6B5B73" />
        </mesh>
        <mesh position={[80, 0, 0]} castShadow receiveShadow>
          <coneGeometry args={[20, 25, 12]} />
          <meshLambertMaterial color="#6B5B73" />
        </mesh>
      </group>
    );
  }

  return (
    <primitive 
      object={mountainInstance}
      position={[0, -2, worldZ]}
      scale={[1.2, 1.2, 1.2]} // Updated to 1.2x scale for proper valley size
      rotation={[0, 0, 0]}
    />
  );
};

export const InfiniteTerrainSystem: React.FC<InfiniteTerrainSystemProps> = ({
  chunks,
  chunkSize
}) => {
  console.log(`InfiniteTerrainSystem: Rendering ${chunks.length} terrain chunks with 1.2x mountain scale`);

  return (
    <group name="InfiniteTerrainSystem">
      <Suspense fallback={null}>
        {chunks.map((chunk) => (
          <group key={chunk.id} name={`TerrainChunk_${chunk.index}`}>
            {/* Ground plane for this chunk */}
            <GroundChunk worldZ={chunk.worldZ} chunkSize={chunkSize} />
            
            {/* Mountain for this chunk */}
            <MountainChunk worldZ={chunk.worldZ} chunkIndex={chunk.index} />
          </group>
        ))}
      </Suspense>
    </group>
  );
};

// Preload mountain model
useGLTF.preload('/assets/mountain_low_poly.glb');
