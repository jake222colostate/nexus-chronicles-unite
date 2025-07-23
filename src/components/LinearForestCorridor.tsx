import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';
import { assetUrl } from '@/lib/utils';

interface LinearForestCorridorProps {
  playerPosition?: Vector3;
}

interface ForestElement {
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

const ForestAsset: React.FC<{ element: ForestElement }> = ({ element }) => {
  const getModelPath = (type: string): string => {
    const modelPaths: Record<string, string> = {
      tree1: assetUrl('assets/forestGLB/Tree1.glb'),
      tree2: assetUrl('assets/forestGLB/Tree2.glb'),
      grass: assetUrl('assets/forestGLB/Grass.glb'),
      log: assetUrl('assets/forestGLB/FallenLog.glb'),
      rock1: assetUrl('assets/forestGLB/SmallRock1.glb'),
      rock2: assetUrl('assets/forestGLB/SmallRock2.glb'),
      rock3: assetUrl('assets/forestGLB/SmallRock3.glb'),
    };
    return modelPaths[type] || modelPaths.tree1;
  };

  try {
    const { scene } = useGLTF(getModelPath(element.type));
    
    return (
      <primitive
        object={scene.clone()}
        position={element.position}
        rotation={element.rotation}
        scale={element.scale}
      />
    );
  } catch (error) {
    // Fallback geometry if GLB fails to load
    return (
      <mesh position={element.position} rotation={element.rotation} scale={element.scale}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    );
  }
};

export const LinearForestCorridor: React.FC<LinearForestCorridorProps> = ({
  playerPosition = new Vector3(0, 0, 0)
}) => {
  const forestElements = useMemo(() => {
    const elements: ForestElement[] = [];
    
    // Seeded random function for consistent placement
    const seededRandom = (seed: number): number => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Path configuration
    const pathLength = 80; // units forward  
    const pathWidth = 8; // clear center path width
    const pathStart = 20; // start well ahead of player spawn
    
    // Tree placement along the corridor
    for (let z = pathStart; z < pathLength; z += 6 + seededRandom(z * 123) * 4) {
      // Left side trees
      const leftX = -pathWidth - 2 - seededRandom(z * 456) * 8; // 2-10 units from path center
      const leftTreeType = seededRandom(z * 789) > 0.5 ? 'tree1' : 'tree2';
      const leftScale = 0.8 + seededRandom(z * 234) * 0.6; // 0.8-1.4 scale
      
      elements.push({
        type: leftTreeType,
        position: [leftX, -1, z],
        rotation: [0, seededRandom(z * 567) * Math.PI * 2, 0],
        scale: [leftScale, leftScale, leftScale]
      });

      // Right side trees
      const rightX = pathWidth + 2 + seededRandom(z * 678) * 8; // 2-10 units from path center
      const rightTreeType = seededRandom(z * 890) > 0.5 ? 'tree1' : 'tree2';
      const rightScale = 0.8 + seededRandom(z * 345) * 0.6; // 0.8-1.4 scale
      
      elements.push({
        type: rightTreeType,
        position: [rightX, -1, z],
        rotation: [0, seededRandom(z * 678) * Math.PI * 2, 0],
        scale: [rightScale, rightScale, rightScale]
      });

      // Additional density closer to mountains (farther from path)
      if (seededRandom(z * 999) > 0.6) {
        // Left mountain edge
        const farLeftX = -pathWidth - 8 - seededRandom(z * 111) * 6;
        elements.push({
          type: seededRandom(z * 222) > 0.5 ? 'tree1' : 'tree2',
          position: [farLeftX, -1, z + seededRandom(z * 333) * 3],
          rotation: [0, seededRandom(z * 444) * Math.PI * 2, 0],
          scale: [0.6 + seededRandom(z * 555) * 0.4, 0.6 + seededRandom(z * 555) * 0.4, 0.6 + seededRandom(z * 555) * 0.4]
        });

        // Right mountain edge
        const farRightX = pathWidth + 8 + seededRandom(z * 666) * 6;
        elements.push({
          type: seededRandom(z * 777) > 0.5 ? 'tree1' : 'tree2',
          position: [farRightX, -1, z + seededRandom(z * 888) * 3],
          rotation: [0, seededRandom(z * 999) * Math.PI * 2, 0],
          scale: [0.6 + seededRandom(z * 111) * 0.4, 0.6 + seededRandom(z * 111) * 0.4, 0.6 + seededRandom(z * 111) * 0.4]
        });
      }
    }

    // Fallen logs and rocks along path edges
    for (let z = pathStart; z < pathLength; z += 8 + seededRandom(z * 1234) * 6) {
      // Left side details
      if (seededRandom(z * 1111) > 0.7) {
        const detailType = seededRandom(z * 2222) > 0.6 ? 'log' : `rock${Math.floor(seededRandom(z * 3333) * 3) + 1}`;
        elements.push({
          type: detailType,
          position: [-pathWidth - 1 - seededRandom(z * 4444) * 2, -1, z],
          rotation: [0, seededRandom(z * 5555) * Math.PI * 2, 0],
          scale: [0.8 + seededRandom(z * 6666) * 0.4, 0.8 + seededRandom(z * 6666) * 0.4, 0.8 + seededRandom(z * 6666) * 0.4]
        });
      }

      // Right side details
      if (seededRandom(z * 7777) > 0.7) {
        const detailType = seededRandom(z * 8888) > 0.6 ? 'log' : `rock${Math.floor(seededRandom(z * 9999) * 3) + 1}`;
        elements.push({
          type: detailType,
          position: [pathWidth + 1 + seededRandom(z * 1212) * 2, -1, z],
          rotation: [0, seededRandom(z * 1313) * Math.PI * 2, 0],
          scale: [0.8 + seededRandom(z * 1414) * 0.4, 0.8 + seededRandom(z * 1414) * 0.4, 0.8 + seededRandom(z * 1414) * 0.4]
        });
      }
    }

    // Grass clusters throughout
    for (let z = pathStart; z < pathLength; z += 3 + seededRandom(z * 1515) * 2) {
      for (let side = 0; side < 2; side++) {
        const xSide = side === 0 ? -1 : 1;
        const grassX = xSide * (pathWidth + 1 + seededRandom(z * (1616 + side)) * 8);
        
        if (seededRandom(z * (1717 + side)) > 0.5) {
          elements.push({
            type: 'grass',
            position: [grassX, -1, z + seededRandom(z * (1818 + side)) * 2],
            rotation: [0, seededRandom(z * (1919 + side)) * Math.PI * 2, 0],
            scale: [0.6 + seededRandom(z * (2020 + side)) * 0.6, 0.6 + seededRandom(z * (2020 + side)) * 0.6, 0.6 + seededRandom(z * (2020 + side)) * 0.6]
          });
        }
      }
    }

    return elements;
  }, []);

  // Filter visible elements based on render distance
  const visibleElements = useMemo(() => {
    const renderDistance = 60;
    return forestElements.filter(element => {
      const distance = Math.sqrt(
        Math.pow(element.position[0] - playerPosition.x, 2) +
        Math.pow(element.position[2] - playerPosition.z, 2)
      );
      return distance < renderDistance;
    });
  }, [forestElements, playerPosition]);

  return (
    <group name="ForestLayer">
      {visibleElements.map((element, index) => (
        <ForestAsset
          key={`forest-${element.type}-${index}`}
          element={element}
        />
      ))}
    </group>
  );
};

// Preload GLB models
useGLTF.preload(assetUrl('assets/forestGLB/Tree1.glb'));
useGLTF.preload(assetUrl('assets/forestGLB/Tree2.glb'));
useGLTF.preload(assetUrl('assets/forestGLB/Grass.glb'));
useGLTF.preload(assetUrl('assets/forestGLB/FallenLog.glb'));
useGLTF.preload(assetUrl('assets/forestGLB/SmallRock1.glb'));
useGLTF.preload(assetUrl('assets/forestGLB/SmallRock2.glb'));
useGLTF.preload(assetUrl('assets/forestGLB/SmallRock3.glb'));