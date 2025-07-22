import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { InstancedGLBSystem } from '../InstancedGLBSystem';
import { LODGLBSystem } from '../LODGLBSystem';
import { assetUrl } from '@/lib/utils';

// Size of each spatial chunk in meters
const CHUNK_SIZE = 20;

// Map of chunk coordinates to assets inside that chunk
interface ChunkAsset {
  file: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  lod?: boolean; // whether to use LOD system
}

const worldChunks: Record<string, ChunkAsset[]> = {
  '0,0': [
    { file: 'assets/Path.glb', position: [0, -1, 0] },
    { file: 'assets/environment/AncientTree.glb', position: [2, 0, 5] },
    { file: 'assets/environment/AncientTree2.glb', position: [-3, 0, 4] }
  ],
  '1,0': [
    { file: 'assets/environment/Mountains.glb', position: [10, 0, 0], scale: 15, lod: true }
  ],
  '0,1': [
    { file: 'assets/upgrades/LargeObelisk.glb', position: [0, 0, 18], scale: 2, lod: true }
  ]
};

// Collect transforms for instanced assets across visible chunks
function collectInstancedData(keys: string[]) {
  const instanced: Record<string, ChunkAsset[]> = {};
  const lod: Array<{asset: ChunkAsset; key: string}> = [];
  keys.forEach((k) => {
    const assets = worldChunks[k];
    if (!assets) return;
    assets.forEach((a) => {
      if (a.lod) {
        lod.push({ asset: a, key: k + JSON.stringify(a.position) });
      } else {
        if (!instanced[a.file]) instanced[a.file] = [];
        instanced[a.file].push(a);
      }
    });
  });
  return { instanced, lod };
}

export const ChunkedFantasyWorld: React.FC = () => {
  const { camera } = useThree();

  // Determine which chunks are near the camera
  const visibleChunkKeys = useMemo(() => {
    const cx = Math.floor(camera.position.x / CHUNK_SIZE);
    const cz = Math.floor(camera.position.z / CHUNK_SIZE);
    const keys: string[] = [];
    for (let x = cx - 2; x <= cx + 2; x++) {
      for (let z = cz - 2; z <= cz + 2; z++) {
        keys.push(`${x},${z}`);
      }
    }
    return keys;
  }, [camera.position.x, camera.position.z]);

  const { instanced, lod } = useMemo(() => collectInstancedData(visibleChunkKeys), [visibleChunkKeys]);

  return (
    <group>
      {Object.entries(instanced).map(([file, transforms]) => (
        <InstancedGLBSystem
          key={file}
          modelUrl={assetUrl(file)}
          positions={transforms.map((t) => ({ position: t.position, rotation: t.rotation, scale: t.scale }))}
          maxCount={transforms.length}
        />
      ))}
      {lod.map(({ asset, key }) => (
        <LODGLBSystem
          key={key}
          modelUrl={assetUrl(asset.file)}
          position={asset.position}
          rotation={asset.rotation}
          scale={asset.scale}
          lodDistances={[40, 80, 120]}
          cameraPosition={camera.position as Vector3}
        />
      ))}
    </group>
  );
};
export default ChunkedFantasyWorld;
