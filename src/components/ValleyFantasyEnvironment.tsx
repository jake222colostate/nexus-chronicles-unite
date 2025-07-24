import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ValleyFantasyEnvironmentProps {
  playerPosition: THREE.Vector3;
}

const CHUNK_SIZE = 20;
const RENDER_DISTANCE = 8; // Number of chunks ahead to render

// Single chunk component
const ValleyChunk: React.FC<{ offsetZ: number }> = ({ offsetZ }) => {
  return (
    <group position={[0, 0, offsetZ]}>
      {/* Brown dirt path */}
      <mesh
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, CHUNK_SIZE]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Purple terrain on left side */}
      <mesh
        position={[-8, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, CHUNK_SIZE]} />
        <meshStandardMaterial color="#6A4C93" />
      </mesh>

      {/* Purple terrain on right side */}
      <mesh
        position={[8, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, CHUNK_SIZE]} />
        <meshStandardMaterial color="#6A4C93" />
      </mesh>

      {/* Valley mountains - left side */}
      <mesh
        position={[-20, 8, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[8, 16, CHUNK_SIZE]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>

      {/* Valley mountains - right side */}
      <mesh
        position={[20, 8, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[8, 16, CHUNK_SIZE]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>

      {/* Far mountains for depth - left */}
      <mesh
        position={[-35, 12, 0]}
        castShadow
      >
        <boxGeometry args={[10, 24, CHUNK_SIZE]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>

      {/* Far mountains for depth - right */}
      <mesh
        position={[35, 12, 0]}
        castShadow
      >
        <boxGeometry args={[10, 24, CHUNK_SIZE]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>

      {/* Occasional trees */}
      {Math.random() > 0.7 && (
        <group position={[Math.random() > 0.5 ? -12 : 12, 0, Math.random() * CHUNK_SIZE - CHUNK_SIZE/2]}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const ValleyFantasyEnvironment: React.FC<ValleyFantasyEnvironmentProps> = ({ playerPosition }) => {
  const { scene } = useThree();
  const [activeChunks, setActiveChunks] = useState<number[]>([]);
  const lastPlayerChunk = useRef(0);

  // Setup valley atmosphere with enhanced fog
  useEffect(() => {
    scene.fog = new THREE.Fog(0x87CEEB, 25, 80);
    scene.background = new THREE.Color(0x87CEEB);
  }, [scene]);

  // Infinite chunk generation
  useFrame(() => {
    const currentPlayerChunk = Math.floor(playerPosition.z / CHUNK_SIZE);
    
    if (currentPlayerChunk !== lastPlayerChunk.current) {
      lastPlayerChunk.current = currentPlayerChunk;
      
      // Generate chunks ahead of player
      const newChunks: number[] = [];
      for (let i = currentPlayerChunk - 2; i <= currentPlayerChunk + RENDER_DISTANCE; i++) {
        newChunks.push(i);
      }
      
      setActiveChunks(newChunks);
    }
  });

  // Initialize with starting chunks
  useEffect(() => {
    const initialChunks: number[] = [];
    for (let i = -2; i <= RENDER_DISTANCE; i++) {
      initialChunks.push(i);
    }
    setActiveChunks(initialChunks);
  }, []);

  return (
    <group name="ValleyFantasyEnvironment">
      {/* Render active chunks */}
      {activeChunks.map((chunkIndex) => (
        <ValleyChunk 
          key={chunkIndex} 
          offsetZ={chunkIndex * CHUNK_SIZE} 
        />
      ))}

      {/* Enhanced valley lighting */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      
      <ambientLight intensity={0.3} />

      {/* Additional atmospheric lighting */}
      <hemisphereLight 
        args={[0x87CEEB, 0x6A4C93, 0.2]}
      />
    </group>
  );
};