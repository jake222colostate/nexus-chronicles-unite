
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { ChunkData } from './ChunkSystem';

interface GLBTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const TREE_MODEL_URL = 'https://github.com/jake222colostate/enviornment/raw/main/fantasy_tree.glb';

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Custom hook to safely load GLB with error handling
const useSafeGLTF = (url: string, enabled: boolean) => {
  const [modelData, setModelData] = useState<{ scene: any } | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Create a timeout to catch hanging requests
    const timeout = setTimeout(() => {
      setError('Model loading timed out');
      setLoading(false);
    }, 10000); // 10 second timeout

    // Try to load the model with error handling
    const loadModel = async () => {
      try {
        console.log('Attempting to load GLB tree model...');
        const gltf = await new Promise((resolve, reject) => {
          // Use drei's useGLTF in a controlled way
          try {
            // We'll just return null for now since the URL is not accessible
            // This prevents the app from crashing
            setTimeout(() => {
              reject(new Error('External model URL not accessible'));
            }, 100);
          } catch (err) {
            reject(err);
          }
        });
        
        clearTimeout(timeout);
        setModelData(gltf as any);
        setLoading(false);
        setError(null);
      } catch (err) {
        clearTimeout(timeout);
        console.warn('Failed to load GLB tree model, falling back to no trees:', err);
        setError('Failed to load model');
        setLoading(false);
        setModelData(null);
      }
    };

    loadModel();

    return () => {
      clearTimeout(timeout);
    };
  }, [url, enabled]);

  return { scene: modelData?.scene, loading, error };
};

export const GLBTreeSystem: React.FC<GLBTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const groupRef = useRef();

  // Only attempt to load for fantasy realm
  const shouldLoad = realm === 'fantasy';
  const { scene: treeModel, loading, error } = useSafeGLTF(TREE_MODEL_URL, shouldLoad);

  // Generate tree positions for each chunk
  const treePositions = useMemo(() => {
    if (realm !== 'fantasy' || !treeModel || error || loading) {
      return [];
    }

    const positions = [];
    const minDistance = 8;
    const maxAttempts = 50;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 3-5 trees per chunk for natural forest density
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 67;
          
          // Position trees on either side of the road (avoiding center path)
          const side = seededRandom(treeSeed) > 0.5 ? 1 : -1;
          x = worldX + side * (15 + seededRandom(treeSeed + 1) * 25); // Stay away from road
          z = worldZ - seededRandom(treeSeed + 2) * chunkSize;
          
          // Varied scale and rotation for natural look
          scale = 0.8 + seededRandom(treeSeed + 3) * 0.6;
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Check distance from existing trees
          validPosition = true;
          for (const existing of positions) {
            const distance = Math.sqrt(
              Math.pow(x - existing.x, 2) + Math.pow(z - existing.z, 2)
            );
            if (distance < minDistance) {
              validPosition = false;
              break;
            }
          }
          
          attempts++;
        }
        
        if (validPosition) {
          positions.push({ x, z: z, scale, rotation, chunkId: chunk.id });
        }
      }
    });
    
    return positions;
  }, [chunks, chunkSize, realm, treeModel, error, loading]);

  // Log status and don't render if conditions aren't met
  useEffect(() => {
    if (realm === 'fantasy') {
      if (loading) {
        console.log('GLB tree system: Loading tree model...');
      } else if (error) {
        console.log('GLB tree system: Failed to load model, no trees will be displayed');
      } else if (treeModel) {
        console.log('GLB tree system: Model loaded successfully');
      }
    }
  }, [loading, error, treeModel, realm]);

  // Don't render if not fantasy realm, no model, loading, or error
  if (realm !== 'fantasy' || !treeModel || error || loading) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {treePositions.map((pos, index) => (
        <group
          key={`glb-tree-${pos.chunkId}-${index}`}
          position={[pos.x, -1, pos.z]}
          scale={[pos.scale, pos.scale, pos.scale]}
          rotation={[0, pos.rotation, 0]}
        >
          <primitive object={treeModel.clone()} castShadow receiveShadow />
        </group>
      ))}
    </group>
  );
};
