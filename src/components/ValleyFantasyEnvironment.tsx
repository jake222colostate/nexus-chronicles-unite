import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ValleyFantasyEnvironmentProps {
  playerPosition: THREE.Vector3;
}

const CHUNK_SIZE = 20;
const RENDER_DISTANCE = 15; // Increased to load chunks much further ahead

// Realistic mountain component with varied heights and shapes
const RealisticMountain: React.FC<{ 
  position: [number, number, number], 
  scale: [number, number, number],
  color: string,
  opacity?: number 
}> = ({ position, scale, color, opacity = 1 }) => {
  const mountainGeometry = React.useMemo(() => {
    const geometry = new THREE.ConeGeometry(1, 1, 8);
    // Randomize vertices for more natural look
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i + 1] > 0) { // Only modify upper vertices
        positions[i] += (Math.random() - 0.5) * 0.3;
        positions[i + 2] += (Math.random() - 0.5) * 0.3;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    return geometry;
  }, []);

  return (
    <mesh 
      position={position} 
      scale={scale} 
      geometry={mountainGeometry}
      castShadow 
      receiveShadow
    >
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
  // Generate varied mountain heights and positions for this chunk
  const mountainData = React.useMemo(() => {
    const mountains = [];
    
    // Layer 1: Close mountains (darkest)
    for (let i = 0; i < 3; i++) {
      mountains.push({
        side: i % 2 === 0 ? -1 : 1,
        layer: 1,
        baseHeight: 12 + Math.random() * 8,
        width: 6 + Math.random() * 4,
        xOffset: (Math.random() - 0.5) * 4,
        zOffset: (Math.random() - 0.5) * CHUNK_SIZE * 0.8
      });
    }
    
    // Layer 2: Mid-distance mountains
    for (let i = 0; i < 4; i++) {
      mountains.push({
        side: i % 2 === 0 ? -1 : 1,
        layer: 2,
        baseHeight: 16 + Math.random() * 10,
        width: 8 + Math.random() * 6,
        xOffset: (Math.random() - 0.5) * 8,
        zOffset: (Math.random() - 0.5) * CHUNK_SIZE * 0.6
      });
    }
    
    // Layer 3: Distant mountains (lightest)
    for (let i = 0; i < 2; i++) {
      mountains.push({
        side: i % 2 === 0 ? -1 : 1,
        layer: 3,
        baseHeight: 20 + Math.random() * 12,
        width: 12 + Math.random() * 8,
        xOffset: (Math.random() - 0.5) * 12,
        zOffset: (Math.random() - 0.5) * CHUNK_SIZE * 0.4
      });
    }
    
    return mountains;
  }, [offsetZ]);

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

      {/* Layered realistic mountains */}
      {mountainData.map((mountain, index) => {
        const { side, layer, baseHeight, width, xOffset, zOffset } = mountain;
        
        // Calculate position based on layer
        const baseX = side * (18 + layer * 12) + xOffset;
        const y = baseHeight / 2;
        const z = zOffset;
        
        // Color based on distance (atmospheric perspective)
        const colors = {
          1: "#3A4A5C", // Closest - darkest
          2: "#4A5A6C", // Mid - medium
          3: "#6A7A8C"  // Farthest - lightest
        };
        
        // Opacity based on distance
        const opacity = layer === 3 ? 0.8 : 1;
        
        return (
          <RealisticMountain
            key={`mountain-${index}`}
            position={[baseX, y, z]}
            scale={[width, baseHeight, width * 0.8]}
            color={colors[layer as keyof typeof colors]}
            opacity={opacity}
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