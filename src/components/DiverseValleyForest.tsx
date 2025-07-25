import React, { useMemo } from 'react';
import { Vector3 } from 'three';

interface DiverseValleyForestProps {
  playerPosition: Vector3;
  chunkSize?: number;
  renderDistance?: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const isWithinValley = (x: number, z: number) => {
  // Valley boundaries: stay within ±30 units from center, avoid path (±8 units)
  const distanceFromCenter = Math.abs(x);
  const isOnPath = distanceFromCenter < 8;
  const isWithinMountains = distanceFromCenter < 30;
  
  return isWithinMountains && !isOnPath;
};

export const DiverseValleyForest: React.FC<DiverseValleyForestProps> = ({
  playerPosition,
  chunkSize = 40,
  renderDistance = 120
}) => {
  const forestElements = useMemo(() => {
    const elements = [];
    const chunkX = Math.floor(playerPosition.x / chunkSize);
    const chunkZ = Math.floor(playerPosition.z / chunkSize);
    
    // Generate chunks around player
    for (let cx = chunkX - 2; cx <= chunkX + 2; cx++) {
      for (let cz = chunkZ - 2; cz <= chunkZ + 2; cz++) {
        const worldX = cx * chunkSize;
        const worldZ = cz * chunkSize;
        const seed = cx * 1000 + cz;
        
        // Pine Trees - tall and narrow
        const pineCount = 8 + Math.floor(seededRandom(seed + 100) * 12);
        for (let i = 0; i < pineCount; i++) {
          const treeSeed = seed + i * 73 + 1000;
          const x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize;
          const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize;
          
          if (!isWithinValley(x, z)) continue;
          
          const height = 4 + seededRandom(treeSeed + 2) * 6;
          const scale = 0.6 + seededRandom(treeSeed + 3) * 0.8;
          
          elements.push(
            <group key={`pine_${cx}_${cz}_${i}`} position={[x, height / 2, z]}>
              {/* Trunk */}
              <mesh position={[0, -height / 4, 0]}>
                <cylinderGeometry args={[0.3 * scale, 0.4 * scale, height / 2, 6]} />
                <meshStandardMaterial color="#4a3c28" />
              </mesh>
              {/* Tree layers */}
              <mesh position={[0, height / 4, 0]}>
                <coneGeometry args={[1.2 * scale, height / 2, 8]} />
                <meshStandardMaterial color="#2d4a2d" />
              </mesh>
              <mesh position={[0, height / 6, 0]}>
                <coneGeometry args={[1.5 * scale, height / 3, 8]} />
                <meshStandardMaterial color="#1e3a1e" />
              </mesh>
            </group>
          );
        }
        
        // Oak Trees - wider and bushier
        const oakCount = 4 + Math.floor(seededRandom(seed + 200) * 6);
        for (let i = 0; i < oakCount; i++) {
          const treeSeed = seed + i * 89 + 2000;
          const x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize;
          const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize;
          
          if (!isWithinValley(x, z)) continue;
          
          const height = 3 + seededRandom(treeSeed + 2) * 4;
          const scale = 0.8 + seededRandom(treeSeed + 3) * 0.6;
          
          elements.push(
            <group key={`oak_${cx}_${cz}_${i}`} position={[x, height / 2, z]}>
              {/* Trunk */}
              <mesh position={[0, -height / 4, 0]}>
                <cylinderGeometry args={[0.4 * scale, 0.6 * scale, height / 2, 8]} />
                <meshStandardMaterial color="#3d2f1f" />
              </mesh>
              {/* Canopy */}
              <mesh position={[0, height / 4, 0]}>
                <sphereGeometry args={[2 * scale, 12, 8]} />
                <meshStandardMaterial color="#4a6741" />
              </mesh>
            </group>
          );
        }
        
        // Fallen Logs
        const logCount = 2 + Math.floor(seededRandom(seed + 300) * 4);
        for (let i = 0; i < logCount; i++) {
          const logSeed = seed + i * 97 + 3000;
          const x = worldX + (seededRandom(logSeed) - 0.5) * chunkSize;
          const z = worldZ + (seededRandom(logSeed + 1) - 0.5) * chunkSize;
          
          if (!isWithinValley(x, z)) continue;
          
          const length = 3 + seededRandom(logSeed + 2) * 4;
          const thickness = 0.3 + seededRandom(logSeed + 3) * 0.4;
          const rotationY = seededRandom(logSeed + 4) * Math.PI * 2;
          
          elements.push(
            <mesh
              key={`log_${cx}_${cz}_${i}`}
              position={[x, thickness / 2, z]}
              rotation={[0, rotationY, Math.PI / 2]}
            >
              <cylinderGeometry args={[thickness, thickness, length, 8]} />
              <meshStandardMaterial color="#5d4e37" />
            </mesh>
          );
        }
        
        // Grass Patches
        const grassCount = 15 + Math.floor(seededRandom(seed + 400) * 20);
        for (let i = 0; i < grassCount; i++) {
          const grassSeed = seed + i * 101 + 4000;
          const x = worldX + (seededRandom(grassSeed) - 0.5) * chunkSize;
          const z = worldZ + (seededRandom(grassSeed + 1) - 0.5) * chunkSize;
          
          if (!isWithinValley(x, z)) continue;
          
          const height = 0.5 + seededRandom(grassSeed + 2) * 0.8;
          const scale = 0.4 + seededRandom(grassSeed + 3) * 0.6;
          const rotationY = seededRandom(grassSeed + 4) * Math.PI * 2;
          
          elements.push(
            <mesh
              key={`grass_${cx}_${cz}_${i}`}
              position={[x, height / 2, z]}
              rotation={[0, rotationY, 0]}
              scale={[scale, 1, scale]}
            >
              <coneGeometry args={[0.1, height, 6]} />
              <meshStandardMaterial color="#5a7c47" />
            </mesh>
          );
        }
        
        // Small Bushes
        const bushCount = 6 + Math.floor(seededRandom(seed + 500) * 8);
        for (let i = 0; i < bushCount; i++) {
          const bushSeed = seed + i * 107 + 5000;
          const x = worldX + (seededRandom(bushSeed) - 0.5) * chunkSize;
          const z = worldZ + (seededRandom(bushSeed + 1) - 0.5) * chunkSize;
          
          if (!isWithinValley(x, z)) continue;
          
          const scale = 0.4 + seededRandom(bushSeed + 2) * 0.4;
          const height = 0.6 + seededRandom(bushSeed + 3) * 0.6;
          
          elements.push(
            <mesh
              key={`bush_${cx}_${cz}_${i}`}
              position={[x, height / 2, z]}
              scale={[scale, scale, scale]}
            >
              <sphereGeometry args={[height, 8, 6]} />
              <meshStandardMaterial color="#3a5d32" />
            </mesh>
          );
        }
        
        // Pebbles and Small Rocks
        const pebbleCount = 20 + Math.floor(seededRandom(seed + 600) * 25);
        for (let i = 0; i < pebbleCount; i++) {
          const pebbleSeed = seed + i * 113 + 6000;
          const x = worldX + (seededRandom(pebbleSeed) - 0.5) * chunkSize;
          const z = worldZ + (seededRandom(pebbleSeed + 1) - 0.5) * chunkSize;
          
          if (!isWithinValley(x, z)) continue;
          
          const size = 0.1 + seededRandom(pebbleSeed + 2) * 0.3;
          const rotationX = seededRandom(pebbleSeed + 3) * Math.PI;
          const rotationY = seededRandom(pebbleSeed + 4) * Math.PI * 2;
          const rotationZ = seededRandom(pebbleSeed + 5) * Math.PI;
          
          elements.push(
            <mesh
              key={`pebble_${cx}_${cz}_${i}`}
              position={[x, size / 2, z]}
              rotation={[rotationX, rotationY, rotationZ]}
              scale={[size, size * 0.7, size]}
            >
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
          );
        }
        
        // Wild Flowers (occasional color spots)
        const flowerCount = 3 + Math.floor(seededRandom(seed + 700) * 5);
        for (let i = 0; i < flowerCount; i++) {
          const flowerSeed = seed + i * 127 + 7000;
          const x = worldX + (seededRandom(flowerSeed) - 0.5) * chunkSize;
          const z = worldZ + (seededRandom(flowerSeed + 1) - 0.5) * chunkSize;
          
          if (!isWithinValley(x, z)) continue;
          
          const colorChoice = Math.floor(seededRandom(flowerSeed + 2) * 4);
          const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#a8e6cf'];
          const size = 0.15 + seededRandom(flowerSeed + 3) * 0.1;
          
          elements.push(
            <mesh
              key={`flower_${cx}_${cz}_${i}`}
              position={[x, 0.3, z]}
              scale={[size, size, size]}
            >
              <sphereGeometry args={[1, 6, 4]} />
              <meshStandardMaterial color={colors[colorChoice]} />
            </mesh>
          );
        }
      }
    }
    
    return elements;
  }, [playerPosition.x, playerPosition.z, chunkSize, renderDistance]);

  return <group>{forestElements}</group>;
};