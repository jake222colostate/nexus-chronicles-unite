import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ValleyFantasyEnvironmentProps {
  playerPosition: THREE.Vector3;
}

// Seeded random number generator for consistent chunk generation
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const CHUNK_SIZE = 20;
const RENDER_DISTANCE = 25; // Further increased for smoother transitions
const FOG_TRANSITION_DISTANCE = 15; // Distance where chunks start fading in

// Blocky geometric mountain component for trapped valley feeling
const BlockyMountain: React.FC<{ 
  position: [number, number, number], 
  scale: [number, number, number],
  color: string,
  opacity?: number 
}> = ({ position, scale, color, opacity = 1 }) => {
  return (
    <mesh 
      position={position} 
      scale={scale} 
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial 
        color={color} 
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
};

// Single chunk component with layered realistic mountains
const ValleyChunk: React.FC<{ offsetZ: number; distanceFromPlayer: number }> = ({ offsetZ, distanceFromPlayer }) => {
  // Use offsetZ as seed for consistent generation
  const chunkSeed = Math.abs(offsetZ * 1000);
  
  // Let Three.js fog handle all distance-based fading naturally
  const chunkOpacity = 1.0; // Always fully opaque - fog will handle visibility
  
  // Generate close blocky mountains for trapped valley feeling
  const mountainData = React.useMemo(() => {
    const mountains = [];
    
    // Close valley walls - very close to path for trapped feeling
    // Left side wall
    for (let i = 0; i < 8; i++) {
      const mountainSeed = chunkSeed + i * 123;
      mountains.push({
        side: -1,
        layer: 1,
        baseHeight: 12 + (seededRandom(mountainSeed) * 6),
        width: 6 + (seededRandom(mountainSeed + 1) * 4),
        depth: 8,
        xOffset: 0,
        zOffset: (i * 2.5) - 10
      });
    }
    
    // Right side wall  
    for (let i = 0; i < 8; i++) {
      const mountainSeed = chunkSeed + i * 124 + 1000;
      mountains.push({
        side: 1,
        layer: 1,
        baseHeight: 12 + (seededRandom(mountainSeed) * 6),
        width: 6 + (seededRandom(mountainSeed + 1) * 4),
        depth: 8,
        xOffset: 0,
        zOffset: (i * 2.5) - 10
      });
    }
    
    return mountains;
  }, [chunkSeed]);

  return (
    <group position={[0, 0, offsetZ]}>
      {/* Brown earthy terrain (full width) */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, CHUNK_SIZE]} />
        <meshStandardMaterial 
          color="#8B7355" 
          transparent={chunkOpacity < 1}
          opacity={chunkOpacity}
        />
      </mesh>

      {/* Bright green grass strips immediately beside path */}
      <mesh
        position={[-4, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2, CHUNK_SIZE]} />
        <meshStandardMaterial 
          color="#4CAF50" 
          transparent={chunkOpacity < 1}
          opacity={chunkOpacity}
        />
      </mesh>
      <mesh
        position={[4, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2, CHUNK_SIZE]} />
        <meshStandardMaterial 
          color="#4CAF50" 
          transparent={chunkOpacity < 1}
          opacity={chunkOpacity}
        />
      </mesh>

      {/* Purple center path area (shows between segments) */}
      <mesh
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, CHUNK_SIZE]} />
        <meshStandardMaterial 
          color="#6A4C93" 
          transparent={chunkOpacity < 1}
          opacity={chunkOpacity}
        />
      </mesh>

      {/* Natural stone path segments with variation */}
      {Array.from({ length: 4 }, (_, i) => {
        const pathSeed = chunkSeed + i * 200;
        const width = 4.8 + (seededRandom(pathSeed) * 1.4); // 4.8-6.2
        const depth = 1.8 + (seededRandom(pathSeed + 1) * 1.4); // 1.8-3.2
        const height = 0.12 + (seededRandom(pathSeed + 2) * 0.08); // 0.12-0.2
        const xOffset = (seededRandom(pathSeed + 3) - 0.5) * 1.2; // -0.6 to 0.6
        const rotationY = (seededRandom(pathSeed + 4) - 0.5) * 0.3; // slight rotation
        const spacing = 4.5 + (seededRandom(pathSeed + 5) * 1); // varied spacing
        
        return (
          <mesh
            key={`path-segment-${i}`}
            position={[xOffset, 0.1 + height/2, (i * spacing) - 7]}
            rotation={[0, rotationY, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial 
              color="#8B4513" 
              transparent={chunkOpacity < 1}
              opacity={chunkOpacity}
            />
          </mesh>
        );
      })}

      {/* Close blocky mountains creating trapped valley feeling */}
      {mountainData.map((mountain, index) => {
        const { side, baseHeight, width, depth, xOffset, zOffset } = mountain;
        
        // Mountains very close to path for claustrophobic feel
        const baseX = side * 18 + xOffset; // Only 18 units from center - very close
        const y = baseHeight / 2;
        const z = zOffset;
        
        // Dark mountain colors for enclosed feeling
        const color = "#2D3D4D";
        
        return (
            <BlockyMountain
              key={`mountain-${index}`}
              position={[baseX, y, z]}
              scale={[width, baseHeight, depth]}
              color={color}
              opacity={chunkOpacity}
            />
        );
      })}

      {/* Consistent trees using seeded random */}
      {seededRandom(chunkSeed + 500) > 0.7 && (
        <group position={[
          seededRandom(chunkSeed + 501) > 0.5 ? -12 : 12, 
          0, 
          (seededRandom(chunkSeed + 502) * CHUNK_SIZE) - CHUNK_SIZE/2
        ]}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 2]} />
            <meshStandardMaterial 
              color="#8B4513" 
              transparent={chunkOpacity < 1}
              opacity={chunkOpacity}
            />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial 
              color="#2E7D32" 
              transparent={chunkOpacity < 1}
              opacity={chunkOpacity}
            />
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

  // Setup valley atmosphere with natural fog that matches environment colors
  useEffect(() => {
    // Use warm, earthy fog that complements the brown terrain and dark mountains
    scene.fog = new THREE.Fog(0x8B7D6B, 25, 120); // Warm brown-gray fog matching terrain
    scene.background = new THREE.Color(0x9B8B7A); // Slightly lighter background
  }, [scene]);

  // Infinite chunk generation
  useFrame(() => {
    const currentPlayerChunk = Math.floor(playerPosition.z / CHUNK_SIZE);
    
    if (currentPlayerChunk !== lastPlayerChunk.current) {
      lastPlayerChunk.current = currentPlayerChunk;
      
      // Generate chunks much further ahead of player, well within fog
      const newChunks: number[] = [];
      for (let i = currentPlayerChunk - 5; i <= currentPlayerChunk + RENDER_DISTANCE; i++) {
        newChunks.push(i);
      }
      
      setActiveChunks(newChunks);
    }
  });

  // Initialize with starting chunks that extend well into fog
  useEffect(() => {
    const initialChunks: number[] = [];
    for (let i = -5; i <= RENDER_DISTANCE; i++) {
      initialChunks.push(i);
    }
    setActiveChunks(initialChunks);
  }, []);

  return (
    <group name="ValleyFantasyEnvironment">
      {/* Render active chunks with distance-based opacity */}
      {activeChunks.map((chunkIndex) => {
        const chunkWorldZ = chunkIndex * CHUNK_SIZE;
        const distanceFromPlayer = chunkWorldZ - playerPosition.z;
        
        return (
          <ValleyChunk 
            key={chunkIndex} 
            offsetZ={chunkWorldZ} 
            distanceFromPlayer={distanceFromPlayer}
          />
        );
      })}

      {/* Enhanced valley lighting */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300} // Extended shadow distance to match fog
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      <ambientLight intensity={0.3} />

      {/* Additional atmospheric lighting */}
      <hemisphereLight 
        args={[0x87CEEB, 0x6A4C93, 0.2]}
      />
    </group>
  );
};