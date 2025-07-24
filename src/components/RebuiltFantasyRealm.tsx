import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const chunkWidth = 20;
const chunkLength = 20;

interface RebuiltFantasyRealmProps {
  playerPosition: THREE.Vector3;
}

const PathChunk: React.FC<{ offsetZ: number }> = ({ offsetZ }) => {
  return (
    <group position={[0, 0, offsetZ]}>
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3, 0.4, chunkLength]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
    </group>
  );
};

const GrassChunk: React.FC<{ offsetZ: number }> = ({ offsetZ }) => {
  const tiles = [];
  for (let x = -chunkWidth / 2; x <= chunkWidth / 2; x += 3) {
    if (x < -4 || x > 4) {
      tiles.push(
        <mesh
          key={x}
          position={[x, 0, offsetZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[3, chunkLength]} />
          <meshStandardMaterial color="#2ecc40" />
        </mesh>
      );
    }
  }
  return <group>{tiles}</group>;
};

const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.75, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.2, 1.5]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    <mesh position={[0, 1.6, 0]} castShadow>
      <sphereGeometry args={[0.8, 8, 8]} />
      <meshStandardMaterial color="#2e8b57" />
    </mesh>
  </group>
);

const Chunk: React.FC<{ offsetZ: number }> = ({ offsetZ }) => {
  const trees = [] as JSX.Element[];
  const treeCount = Math.random() < 0.5 ? 1 : 2;
  for (let i = 0; i < treeCount; i++) {
    const treeX = Math.random() < 0.5 ? THREE.MathUtils.randFloat(-8, -5) : THREE.MathUtils.randFloat(5, 8);
    const treeZ = offsetZ + THREE.MathUtils.randFloat(2, chunkLength - 2);
    trees.push(<Tree key={i} position={[treeX, 0, treeZ]} />);
  }

  return (
    <group>
      <PathChunk offsetZ={offsetZ} />
      <GrassChunk offsetZ={offsetZ} />
      {trees}
    </group>
  );
};

export const RebuiltFantasyRealm: React.FC<RebuiltFantasyRealmProps> = ({ playerPosition }) => {
  const { scene } = useThree();
  const [chunkPositions, setChunkPositions] = useState<number[]>([]);
  const nextChunkZ = useRef(0);

  // Setup fog and sky
  useEffect(() => {
    scene.fog = new THREE.Fog(new THREE.Color(0.65, 0.85, 1), 20, 100);
    scene.background = new THREE.Color(0.65, 0.85, 1);
  }, [scene]);

  // Spawn mountains once
  const mountains = (
    <group>
      <mesh position={[-30, 0, 50]} receiveShadow castShadow>
        <coneGeometry args={[10, 20, 4]} />
        <meshStandardMaterial color="#556677" />
      </mesh>
      <mesh position={[30, 0, 50]} receiveShadow castShadow>
        <coneGeometry args={[10, 20, 4]} />
        <meshStandardMaterial color="#556677" />
      </mesh>
    </group>
  );

  useFrame(() => {
    if (playerPosition.z + 40 > nextChunkZ.current) {
      setChunkPositions((prev) => {
        const updated = [...prev, nextChunkZ.current];
        if (updated.length > 6) updated.shift();
        return updated;
      });
      nextChunkZ.current += chunkLength;
    }
  });

  return (
    <group name="RebuiltFantasyRealm">
      {mountains}
      {chunkPositions.map((z) => (
        <Chunk key={z} offsetZ={z} />
      ))}
    </group>
  );
};

