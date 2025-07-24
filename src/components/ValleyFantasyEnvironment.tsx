import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ValleyFantasyEnvironmentProps {
  playerPosition: THREE.Vector3;
}

const CHUNK_SIZE = 20;
const RENDER_DISTANCE = 15; // Increased to load chunks much further ahead

// Triangular mountain component for proper valley formation
const TriangularMountain: React.FC<{ 
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
      <coneGeometry args={[1, 1, 5]} />
      <meshLambertMaterial 
        color={color} 
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
};

// Single chunk component with layered realistic mountains
const ValleyChunk: React.FC<{ offsetZ: number }> = ({ offsetZ }) => {
  // Generate proper valley mountains - distant and triangular like reference
  const mountainData = React.useMemo(() => {
    const mountains = [];
    
    // Left valley wall - fewer mountains, properly spaced
    mountains.push(
      { side: -1, baseHeight: 10, width: 6, xOffset: 0, zOffset: -8 },
      { side: -1, baseHeight: 12, width: 7, xOffset: 0, zOffset: 0 },
      { side: -1, baseHeight: 9, width: 5, xOffset: 0, zOffset: 8 },
      { side: -1, baseHeight: 14, width: 8, xOffset: 0, zOffset: 16 }
    );
    
    // Right valley wall
    mountains.push(
      { side: 1, baseHeight: 11, width: 6, xOffset: 0, zOffset: -6 },
      { side: 1, baseHeight: 13, width: 7, xOffset: 0, zOffset: 2 },
      { side: 1, baseHeight: 10, width: 6, xOffset: 0, zOffset: 10 },
      { side: 1, baseHeight: 15, width: 8, xOffset: 0, zOffset: 18 }
    );
    
    return mountains;
  }, [offsetZ]);

  return (
    <group position={[0, 0, offsetZ]}>
      {/* Wide purple base terrain */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, CHUNK_SIZE]} />
        <meshStandardMaterial color="#6A4C93" />
      </mesh>

      {/* Very thin green grass strips right next to path */}
      <mesh
        position={[-2.5, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1, CHUNK_SIZE]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>
      <mesh
        position={[2.5, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1, CHUNK_SIZE]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>

      {/* Narrow purple center path area */}
      <mesh
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[4, CHUNK_SIZE]} />
        <meshStandardMaterial color="#6A4C93" />
      </mesh>

      {/* Narrow brown path segments like reference */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={`path-segment-${i}`}
          position={[0, 0.15, (i * 4) - 8]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[3.5, 0.3, 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}

      {/* Proper valley mountains - distant and triangular */}
      {mountainData.map((mountain, index) => {
        const { side, baseHeight, width, xOffset, zOffset } = mountain;
        
        // Mountains positioned to form a proper valley (not tunnel)
        const baseX = side * 25 + xOffset; // 25 units from center - proper valley distance
        const y = baseHeight / 2;
        const z = zOffset;
        
        // Blue-grey mountain colors like reference
        const color = "#4A5A6A";
        
        return (
          <TriangularMountain
            key={`mountain-${index}`}
            position={[baseX, y, z]}
            scale={[width, baseHeight, width]}
            color={color}
            opacity={1}
          />
        );
      })}

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

  // Setup valley atmosphere with enhanced fog that covers chunk loading
  useEffect(() => {
    scene.fog = new THREE.Fog(0x87CEEB, 40, 250); // Extended fog to cover all chunk loading
    scene.background = new THREE.Color(0x87CEEB);
  }, [scene]);

  // Infinite chunk generation
  useFrame(() => {
    const currentPlayerChunk = Math.floor(playerPosition.z / CHUNK_SIZE);
    
    if (currentPlayerChunk !== lastPlayerChunk.current) {
      lastPlayerChunk.current = currentPlayerChunk;
      
      // Generate chunks much further ahead of player, within fog
      const newChunks: number[] = [];
      for (let i = currentPlayerChunk - 3; i <= currentPlayerChunk + RENDER_DISTANCE; i++) {
        newChunks.push(i);
      }
      
      setActiveChunks(newChunks);
    }
  });

  // Initialize with starting chunks that extend into fog
  useEffect(() => {
    const initialChunks: number[] = [];
    for (let i = -3; i <= RENDER_DISTANCE; i++) {
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