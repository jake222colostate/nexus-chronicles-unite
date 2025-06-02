
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyStonePortalSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  onTierProgression?: () => void;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const StonePortal: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  onTierProgression?: () => void;
}> = ({ position, seed, onTierProgression }) => {
  const portalRef = useRef<THREE.Group>(null);
  const runeRefs = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (portalRef.current) {
      const time = state.clock.elapsedTime + seed;
      portalRef.current.rotation.y = time * 0.2;
    }
    
    // Animate runes
    runeRefs.current.forEach((rune, i) => {
      if (rune) {
        const time = state.clock.elapsedTime + seed + i;
        const material = rune.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 1.0 + Math.sin(time * 2) * 0.5;
      }
    });
  });

  // Generate rune positions around the portal
  const runePositions = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 1.1,
        y: Math.sin(angle) * 1.1,
        rotation: angle
      };
    });
  }, []);

  return (
    <group ref={portalRef} position={position}>
      {/* Portal base */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2.5, 0.5]} />
        <meshLambertMaterial color="#5e5e5e" />
      </mesh>
      
      {/* Vertical legs */}
      <mesh position={[-1.5, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 3]} />
        <meshLambertMaterial color="#5e5e5e" />
      </mesh>
      
      <mesh position={[1.5, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 3]} />
        <meshLambertMaterial color="#5e5e5e" />
      </mesh>
      
      {/* Horizontal top piece */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[3.5, 0.4, 0.4]} />
        <meshLambertMaterial color="#5e5e5e" />
      </mesh>
      
      {/* Main portal ring */}
      <mesh castShadow>
        <torusGeometry args={[1.2, 0.2, 16, 100]} />
        <meshLambertMaterial color="#5e5e5e" />
      </mesh>
      
      {/* Glowing runes on inner ring */}
      {runePositions.map((rune, i) => (
        <mesh
          key={`rune_${i}`}
          ref={el => runeRefs.current[i] = el!}
          position={[rune.x, rune.y, 0.15]}
          rotation={[0, 0, rune.rotation]}
        >
          <planeGeometry args={[0.15, 0.3]} />
          <meshStandardMaterial 
            color="#00caff"
            emissive="#00caff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* Portal energy field */}
      <mesh>
        <circleGeometry args={[1.0]} />
        <meshBasicMaterial 
          color="#00caff"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Portal lights */}
      <pointLight 
        color="#00caff" 
        intensity={1.0} 
        distance={15}
        position={[0, 0, 1]}
      />
      
      <pointLight 
        color="#9c27b0" 
        intensity={0.5} 
        distance={10}
        position={[0, 0, -1]}
      />
      
      {/* Interaction area */}
      <mesh 
        visible={false}
        onClick={onTierProgression}
      >
        <sphereGeometry args={[3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export const FantasyStonePortalSystem: React.FC<FantasyStonePortalSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  onTierProgression
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate portal positions every 30-40 units in Z
  const portalPositions = useMemo(() => {
    const positions = [];
    const portalSpacing = 35; // Every 30-40 units
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Check if this chunk should have a portal
      const shouldHavePortal = Math.floor(worldZ / portalSpacing) * portalSpacing === Math.floor(worldZ / portalSpacing) * portalSpacing;
      
      if (shouldHavePortal && worldZ % portalSpacing < chunkSize) {
        const portalZ = Math.floor(worldZ / portalSpacing) * portalSpacing;
        
        positions.push({
          x: 0, // Center of path
          y: 0,
          z: portalZ,
          seed: seed + Math.floor(portalZ),
          chunkId: chunk.id
        });
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {portalPositions.map((pos, index) => (
        <StonePortal
          key={`stone_portal_${pos.chunkId}_${index}`}
          position={[pos.x, pos.y, pos.z]}
          seed={pos.seed}
          onTierProgression={onTierProgression}
        />
      ))}
    </group>
  );
};
