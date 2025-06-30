
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { Html, useFBX, useGLTF } from '@react-three/drei';
import { Progress } from '../ui/progress';
import { assetPath } from '../../lib/assetPath';
import { useRegisterCollider } from '../../lib/CollisionContext';

const MAX_HEALTH = 5;

interface AsteroidProps {
  position: Vector3;
  health: number;
  onReachTarget?: () => void;
}

export const Asteroid: React.FC<AsteroidProps> = ({
  position,
  health,
  onReachTarget
}) => {
  const group = useRef<Group>(null);

  const fbx = useFBX(assetPath('assets/asteroid_01.fbx'));
  const { scene: glbScene } = useGLTF(assetPath('assets/asteroid_pack_01.glb'));

  const randomModel = useMemo(() => {
    const rand = Math.random();
    if (rand < 0.33) return 'fbx';
    if (rand < 0.66) return 'glb';
    return 'polygon';
  }, []);
  
  // Create size categories with much larger sizes for visibility
  const sizeCategory = useMemo(() => {
    const rand = Math.random();
    if (rand < 0.3) return 'small';
    if (rand < 0.6) return 'medium';
    if (rand < 0.85) return 'large';
    return 'extra-large';
  }, []);

  // SIGNIFICANTLY increased all size multipliers for better visibility
  const randomScale = useMemo(() => {
    const sizeMultipliers = {
      'small': 0.015 + Math.random() * 0.010,      // 0.015-0.025 (5x larger)
      'medium': 0.025 + Math.random() * 0.015,     // 0.025-0.040 (4x larger)
      'large': 0.045 + Math.random() * 0.020,      // 0.045-0.065 (3.5x larger)
      'extra-large': 0.070 + Math.random() * 0.030 // 0.070-0.100 (3x larger)
    };
    return sizeMultipliers[sizeCategory];
  }, [sizeCategory]);
  
  // Calculate hitbox radius based on the scaled asteroid
  const hitboxRadius = useMemo(() => {
    // Base asteroid size is approximately 100 units, so scaled radius is:
    const baseRadius = 50; // Approximate radius of the asteroid models
    return baseRadius * randomScale;
  }, [randomScale]);

  // Register collider with proper size
  useRegisterCollider(
    `asteroid-${position.x}-${position.y}-${position.z}`,
    position,
    hitboxRadius
  );

  useFrame(() => {
    if (group.current) {
      group.current.position.copy(position);
      group.current.rotation.x += 0.01;
      group.current.rotation.y += 0.005;

      if (group.current.position.z >= 0) {
        onReachTarget?.();
      }
    }
  });

  // Create polygon meteor shape with much larger scaling for visibility
  const renderPolygonMeteor = () => {
    // Increased polygon scale multipliers significantly
    const polygonScale = randomScale * (sizeCategory === 'small' ? 60 : 
                                       sizeCategory === 'medium' ? 80 : 
                                       sizeCategory === 'large' ? 100 : 120);
    return (
      <mesh scale={polygonScale}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#666666" 
          roughness={0.8} 
          metalness={0.2}
          emissive="#331100"
          emissiveIntensity={0.2}
        />
      </mesh>
    );
  };

  return (
    <group ref={group} position={position}>
      {randomModel === 'polygon' ? renderPolygonMeteor() : (
        <primitive
          object={randomModel === 'fbx' ? fbx.clone() : glbScene.clone()}
          scale={randomScale}
        />
      )}
      <Html position={[0, 1, 0]} center style={{ pointerEvents: 'none' }} transform distanceFactor={8}>
        <div className="w-12">
          <Progress
            value={Math.max(0, (health / MAX_HEALTH) * 100)}
            className="h-1"
            indicatorClassName={health <= 1 ? 'bg-red-600' : 'bg-green-500'}
          />
        </div>
      </Html>
    </group>
  );
};
