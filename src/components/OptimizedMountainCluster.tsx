
import React from 'react';
import { 
  createLowPolyMountainGeometry, 
  createMountainBaseLayers, 
  createMountainPeaks, 
  createRockyOutcroppings 
} from './MountainGeometry';

interface OptimizedMountainClusterProps {
  position: [number, number, number];
  seed: number;
  scale: number;
  side: 'left' | 'right';
}

export const OptimizedMountainCluster: React.FC<OptimizedMountainClusterProps> = ({ 
  position, 
  seed, 
  scale, 
  side 
}) => {
  const baseLayers = createMountainBaseLayers(seed);
  const peaks = createMountainPeaks(seed);
  const rocks = createRockyOutcroppings(seed);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Wide mountain base extending towards the path */}
      {baseLayers.map((layer) => (
        <mesh
          key={layer.key}
          position={layer.position}
          receiveShadow
          castShadow
        >
          <cylinderGeometry args={[layer.radius * 0.8, layer.radius, layer.height, 8]} />
          <meshLambertMaterial color={layer.color} />
        </mesh>
      ))}
      
      {/* Main mountain peaks - positioned further back */}
      {peaks.map((peak) => (
        <mesh
          key={peak.key}
          position={peak.position}
          scale={peak.scale}
          castShadow
          receiveShadow
        >
          <primitive object={createLowPolyMountainGeometry(peak.seed)} />
          <meshLambertMaterial 
            color="#8B7355"
            flatShading={true} // Low-poly flat shading
          />
        </mesh>
      ))}
      
      {/* Rocky outcroppings near the base (closer to path) */}
      {rocks.map((rock) => {
        let geometry;
        
        switch (rock.type) {
          case 0:
            geometry = <boxGeometry args={[2, 2, 2]} />;
            break;
          case 1:
            geometry = <dodecahedronGeometry args={[1.5]} />;
            break;
          default:
            geometry = <octahedronGeometry args={[1.8]} />;
        }
        
        return (
          <mesh
            key={rock.key}
            position={rock.position}
            rotation={rock.rotation}
            scale={rock.scale}
            castShadow
            receiveShadow
          >
            {geometry}
            <meshLambertMaterial 
              color={rock.color}
              flatShading={true}
            />
          </mesh>
        );
      })}
      
      {/* Collision barriers - closer to accommodate new mountain shape */}
      <mesh
        position={[side === 'left' ? 12 : -12, 15, 5]}
        visible={false}
      >
        <boxGeometry args={[20, 30, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};
