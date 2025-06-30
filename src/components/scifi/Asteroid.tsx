
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
  
  // Create size categories with guaranteed visibility
  const sizeCategory = useMemo(() => {
    const rand = Math.random();
    if (rand < 0.25) return 'small';
    if (rand < 0.5) return 'medium';
    if (rand < 0.8) return 'large';
    return 'extra-large';
  }, []);

  // Adjusted size multipliers - reduced extra-large and ensured minimum visibility
  const randomScale = useMemo(() => {
    const sizeMultipliers = {
      'small': 0.02 + Math.random() * 0.015,      // 0.02-0.035 (guaranteed visible)
      'medium': 0.035 + Math.random() * 0.020,    // 0.035-0.055 (more visible)
      'large': 0.055 + Math.random() * 0.025,     // 0.055-0.080 (clearly visible)
      'extra-large': 0.055 + Math.random() * 0.025 // 0.055-0.080 (reduced from previous)
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

  // Create polygon meteor shape with guaranteed visibility
  const renderPolygonMeteor = () => {
    // Consistent polygon scale that ensures visibility
    const polygonScale = randomScale * (sizeCategory === 'small' ? 80 : 
                                       sizeCategory === 'medium' ? 100 : 
                                       sizeCategory === 'large' ? 120 : 120); // Same as large for extra-large
    return (
      <mesh scale={polygonScale}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#666666" 
          roughness={0.8} 
          metalness={0.2}
          emissive="#331100"
          emissiveIntensity={0.3}
        />
      </mesh>
    );
  };

  // Enhanced fallback rendering to ensure model is always visible
  const renderMeteorModel = () => {
    try {
      if (randomModel === 'polygon') {
        return renderPolygonMeteor();
      } else {
        const model = randomModel === 'fbx' ? fbx : glbScene;
        if (model) {
          return (
            <primitive
              object={model.clone()}
              scale={randomScale}
            />
          );
        } else {
          // Fallback to polygon if model fails to load
          return renderPolygonMeteor();
        }
      }
    } catch (error) {
      console.warn('Asteroid model render error, using fallback:', error);
      return renderPolygonMeteor();
    }
  };

  return (
    <group ref={group} position={position}>
      {renderMeteorModel()}
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
