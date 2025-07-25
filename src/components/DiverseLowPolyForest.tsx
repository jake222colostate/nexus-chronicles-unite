import React, { useMemo } from 'react';
import { Vector3 } from 'three';

interface DiverseLowPolyForestProps {
  playerPosition: Vector3;
  chunkSize?: number;
  renderDistance?: number;
}

// Individual tree components
const PineTree: React.FC<{ position: [number, number, number]; scale: number; seed: number }> = ({ position, scale, seed }) => {
  const treeColor = useMemo(() => {
    const green = 0.3 + (seed % 100) / 200; // Slight color variation
    return `hsl(120, 60%, ${25 + green * 10}%)`;
  }, [seed]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Pine trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Pine layers - classic Christmas tree shape */}
      <mesh position={[0, 2.2, 0]}>
        <coneGeometry args={[0.8, 1.5, 6]} />
        <meshLambertMaterial color={treeColor} />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <coneGeometry args={[0.6, 1.2, 6]} />
        <meshLambertMaterial color={treeColor} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshLambertMaterial color={treeColor} />
      </mesh>
    </group>
  );
};

const OakTree: React.FC<{ position: [number, number, number]; scale: number; seed: number }> = ({ position, scale, seed }) => {
  const leafColor = useMemo(() => {
    const variation = (seed % 100) / 100;
    return `hsl(${110 + variation * 20}, 50%, ${30 + variation * 15}%)`;
  }, [seed]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Oak trunk - thicker */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 2.4]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
      {/* Oak canopy - round and full */}
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshLambertMaterial color={leafColor} />
      </mesh>
      {/* Additional smaller canopy sections for more organic look */}
      <mesh position={[0.3, 2.5, 0.2]}>
        <sphereGeometry args={[0.7, 6, 5]} />
        <meshLambertMaterial color={leafColor} />
      </mesh>
      <mesh position={[-0.2, 2.6, -0.3]}>
        <sphereGeometry args={[0.6, 6, 5]} />
        <meshLambertMaterial color={leafColor} />
      </mesh>
    </group>
  );
};

const BirchTree: React.FC<{ position: [number, number, number]; scale: number; seed: number }> = ({ position, scale, seed }) => {
  const leafColor = useMemo(() => {
    const variation = (seed % 100) / 100;
    return `hsl(${85 + variation * 15}, 40%, ${40 + variation * 10}%)`;
  }, [seed]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Birch trunk - white with black markings */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 3]} />
        <meshLambertMaterial color="#F5F5DC" />
      </mesh>
      {/* Dark markings on birch */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.2]} />
        <meshLambertMaterial color="#2F2F2F" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.15]} />
        <meshLambertMaterial color="#2F2F2F" />
      </mesh>
      {/* Birch leaves - lighter, more delicate */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.9, 8, 6]} />
        <meshLambertMaterial color={leafColor} />
      </mesh>
    </group>
  );
};

const FallenLog: React.FC<{ position: [number, number, number]; rotation: [number, number, number]; scale: number }> = ({ position, rotation, scale }) => (
  <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
    <mesh>
      <cylinderGeometry args={[0.2, 0.25, 3]} />
      <meshLambertMaterial color="#8B4513" />
    </mesh>
    {/* Moss on the log */}
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.18, 0.22, 3.1]} />
      <meshLambertMaterial color="#228B22" transparent opacity={0.7} />
    </mesh>
  </group>
);

const GrassPatch: React.FC<{ position: [number, number, number]; seed: number }> = ({ position, seed }) => {
  const grassElements = useMemo(() => {
    const elements = [];
    const grassCount = 5 + (seed % 8);
    
    for (let i = 0; i < grassCount; i++) {
      const angle = (i / grassCount) * Math.PI * 2;
      const radius = 0.3 + (seed + i) % 30 / 100;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 0.2 + ((seed + i) % 20) / 100;
      
      elements.push(
        <mesh key={i} position={[x, height / 2, z]} rotation={[0, angle, 0]}>
          <cylinderGeometry args={[0.01, 0.02, height]} />
          <meshLambertMaterial color="#228B22" />
        </mesh>
      );
    }
    return elements;
  }, [seed]);

  return (
    <group position={position}>
      {grassElements}
    </group>
  );
};

const Pebbles: React.FC<{ position: [number, number, number]; seed: number }> = ({ position, seed }) => {
  const pebbleElements = useMemo(() => {
    const elements = [];
    const pebbleCount = 3 + (seed % 5);
    
    for (let i = 0; i < pebbleCount; i++) {
      const angle = (i / pebbleCount) * Math.PI * 2 + (seed % 100) / 50;
      const radius = 0.2 + (seed + i) % 40 / 100;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const size = 0.05 + ((seed + i) % 15) / 300;
      
      const grayShade = 40 + ((seed + i) % 40);
      
      elements.push(
        <mesh key={i} position={[x, size / 2, z]}>
          <sphereGeometry args={[size, 6, 4]} />
          <meshLambertMaterial color={`hsl(0, 0%, ${grayShade}%)`} />
        </mesh>
      );
    }
    return elements;
  }, [seed]);

  return (
    <group position={position}>
      {pebbleElements}
    </group>
  );
};

export const DiverseLowPolyForest: React.FC<DiverseLowPolyForestProps> = ({
  playerPosition,
  chunkSize = 80,
  renderDistance = 200
}) => {
  const forestElements = useMemo(() => {
    const elements = [];
    const centerChunkX = Math.floor(playerPosition.x / chunkSize);
    const centerChunkZ = Math.floor(playerPosition.z / chunkSize);
    const chunksRadius = Math.ceil(renderDistance / chunkSize);

    for (let chunkX = centerChunkX - chunksRadius; chunkX <= centerChunkX + chunksRadius; chunkX++) {
      for (let chunkZ = centerChunkZ - chunksRadius; chunkZ <= centerChunkZ + chunksRadius; chunkZ++) {
        const chunkWorldX = chunkX * chunkSize;
        const chunkWorldZ = chunkZ * chunkSize;
        
        // Distance check for rendering
        const distance = Math.sqrt(
          Math.pow(chunkWorldX - playerPosition.x, 2) + 
          Math.pow(chunkWorldZ - playerPosition.z, 2)
        );
        
        if (distance > renderDistance) continue;

        // Generate consistent elements based on chunk coordinates
        const chunkSeed = chunkX * 1000 + chunkZ;
        
        // Trees - mix of different types
        const treeCount = 8 + (chunkSeed % 12);
        for (let i = 0; i < treeCount; i++) {
          const seed = chunkSeed + i * 123;
          const random1 = (seed % 1000) / 1000;
          const random2 = ((seed * 17) % 1000) / 1000;
          const random3 = ((seed * 31) % 1000) / 1000;
          
          const x = chunkWorldX + random1 * chunkSize;
          const z = chunkWorldZ + random2 * chunkSize;
          
          // Skip if too close to path center (±15 units)
          if (Math.abs(x) < 15) continue;
          
          const scale = 0.8 + random3 * 0.6;
          const treeType = seed % 3;
          
          if (treeType === 0) {
            elements.push(
              <PineTree 
                key={`pine-${chunkX}-${chunkZ}-${i}`}
                position={[x, 0, z]} 
                scale={scale} 
                seed={seed} 
              />
            );
          } else if (treeType === 1) {
            elements.push(
              <OakTree 
                key={`oak-${chunkX}-${chunkZ}-${i}`}
                position={[x, 0, z]} 
                scale={scale} 
                seed={seed} 
              />
            );
          } else {
            elements.push(
              <BirchTree 
                key={`birch-${chunkX}-${chunkZ}-${i}`}
                position={[x, 0, z]} 
                scale={scale} 
                seed={seed} 
              />
            );
          }
        }
        
        // Fallen logs
        const logCount = 1 + (chunkSeed % 3);
        for (let i = 0; i < logCount; i++) {
          const seed = chunkSeed + i * 456 + 10000;
          const random1 = (seed % 1000) / 1000;
          const random2 = ((seed * 23) % 1000) / 1000;
          const random3 = ((seed * 37) % 1000) / 1000;
          const random4 = ((seed * 41) % 1000) / 1000;
          
          const x = chunkWorldX + random1 * chunkSize;
          const z = chunkWorldZ + random2 * chunkSize;
          
          if (Math.abs(x) < 15) continue;
          
          const scale = 0.7 + random3 * 0.6;
          const rotationY = random4 * Math.PI * 2;
          
          elements.push(
            <FallenLog
              key={`log-${chunkX}-${chunkZ}-${i}`}
              position={[x, 0.1, z]}
              rotation={[0, rotationY, Math.PI / 2]}
              scale={scale}
            />
          );
        }
        
        // Grass patches
        const grassCount = 12 + (chunkSeed % 18);
        for (let i = 0; i < grassCount; i++) {
          const seed = chunkSeed + i * 789 + 20000;
          const random1 = (seed % 1000) / 1000;
          const random2 = ((seed * 29) % 1000) / 1000;
          
          const x = chunkWorldX + random1 * chunkSize;
          const z = chunkWorldZ + random2 * chunkSize;
          
          if (Math.abs(x) < 8) continue; // Keep closer to path clear
          
          elements.push(
            <GrassPatch
              key={`grass-${chunkX}-${chunkZ}-${i}`}
              position={[x, 0, z]}
              seed={seed}
            />
          );
        }
        
        // Pebbles
        const pebbleCount = 5 + (chunkSeed % 10);
        for (let i = 0; i < pebbleCount; i++) {
          const seed = chunkSeed + i * 654 + 30000;
          const random1 = (seed % 1000) / 1000;
          const random2 = ((seed * 43) % 1000) / 1000;
          
          const x = chunkWorldX + random1 * chunkSize;
          const z = chunkWorldZ + random2 * chunkSize;
          
          if (Math.abs(x) < 8) continue;
          
          elements.push(
            <Pebbles
              key={`pebbles-${chunkX}-${chunkZ}-${i}`}
              position={[x, 0, z]}
              seed={seed}
            />
          );
        }
      }
    }
    
    return elements;
  }, [playerPosition.x, playerPosition.z, chunkSize, renderDistance]);

  return <>{forestElements}</>;
};