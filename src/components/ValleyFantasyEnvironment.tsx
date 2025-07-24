import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ValleyFantasyEnvironmentProps {
  playerPosition: THREE.Vector3;
}

const CHUNK_SIZE = 20;
const RENDER_DISTANCE = 15; // Increased to load chunks much further ahead

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
const ValleyChunk: React.FC<{ offsetZ: number }> = ({ offsetZ }) => {
  // Generate close blocky mountains for trapped valley feeling
  const mountainData = React.useMemo(() => {
    const mountains = [];
    
    // Close valley walls - very close to path for trapped feeling
    // Left side wall
    for (let i = 0; i < 8; i++) {
      mountains.push({
        side: -1,
        layer: 1,
        baseHeight: 12 + (Math.random() * 6),
        width: 6 + (Math.random() * 4),
        depth: 8,
        xOffset: 0,
        zOffset: (i * 2.5) - 10
      });
    }
    
    // Right side wall  
    for (let i = 0; i < 8; i++) {
      mountains.push({
        side: 1,
        layer: 1,
        baseHeight: 12 + (Math.random() * 6),
        width: 6 + (Math.random() * 4),
        depth: 8,
        xOffset: 0,
        zOffset: (i * 2.5) - 10
      });
    }
    
    return mountains;
  }, [offsetZ]);

  return (
    <group position={[0, 0, offsetZ]}>
      {/* Brown earthy terrain (full width) */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, CHUNK_SIZE]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Bright green grass strips immediately beside path */}
      <mesh
        position={[-4, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2, CHUNK_SIZE]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh
        position={[4, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2, CHUNK_SIZE]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>

      {/* Purple center path area (shows between segments) */}
      <mesh
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, CHUNK_SIZE]} />
        <meshStandardMaterial color="#6A4C93" />
      </mesh>

      {/* Raised brown path segments with clear gaps */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={`path-segment-${i}`}
          position={[0, 0.2, (i * 5) - 7.5]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[5.5, 0.4, 2.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}

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