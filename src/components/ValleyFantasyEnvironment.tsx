import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ValleyFantasyEnvironmentProps {
  playerPosition: THREE.Vector3;
}

const CHUNK_SIZE = 20;
const RENDER_DISTANCE = 15; // Increased to load chunks much further ahead

// Angular geometric mountain component matching the reference
const GeometricMountain: React.FC<{ 
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
      <coneGeometry args={[1, 1, 6]} />
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
  // Generate angular mountains like in reference image
  const mountainData = React.useMemo(() => {
    const mountains = [];
    
    // Close mountains forming valley walls - much closer to path
    for (let i = 0; i < 6; i++) {
      mountains.push({
        side: i % 2 === 0 ? -1 : 1,
        layer: 1,
        baseHeight: 8 + Math.random() * 4, // Moderate height
        width: 4 + Math.random() * 3,
        xOffset: (Math.random() - 0.5) * 2,
        zOffset: (i * 4) - 10 // Evenly spaced along chunk
      });
    }
    
    // Mid-distance mountains
    for (let i = 0; i < 4; i++) {
      mountains.push({
        side: i % 2 === 0 ? -1 : 1,
        layer: 2,
        baseHeight: 10 + Math.random() * 6,
        width: 6 + Math.random() * 4,
        xOffset: (Math.random() - 0.5) * 4,
        zOffset: (i * 6) - 8
      });
    }
    
    // Background mountains
    for (let i = 0; i < 3; i++) {
      mountains.push({
        side: i % 2 === 0 ? -1 : 1,
        layer: 3,
        baseHeight: 12 + Math.random() * 8,
        width: 8 + Math.random() * 6,
        xOffset: (Math.random() - 0.5) * 6,
        zOffset: (i * 8) - 6
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

      {/* Angular geometric mountains forming valley walls */}
      {mountainData.map((mountain, index) => {
        const { side, layer, baseHeight, width, xOffset, zOffset } = mountain;
        
        // Position mountains much closer to create valley effect like reference
        const baseX = side * (12 + layer * 6) + xOffset; // Much closer to path
        const y = baseHeight / 2;
        const z = zOffset;
        
        // Blue-grey colors matching reference with proper layering
        const colors = {
          1: "#3D4C5C", // Front mountains - darker
          2: "#4D5C6C", // Mid mountains
          3: "#5D6C7C"  // Back mountains - lighter
        };
        
        return (
          <GeometricMountain
            key={`mountain-${index}`}
            position={[baseX, y, z]}
            scale={[width, baseHeight, width]} // Proper cone proportions
            color={colors[layer as keyof typeof colors]}
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