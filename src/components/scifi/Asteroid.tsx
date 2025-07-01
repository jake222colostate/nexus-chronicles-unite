
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
  isUpgrade?: boolean;
  upgradeId?: string;
  onUpgradeClick?: (upgradeId: string) => void;
  upgradeIndex?: number;
}

export const Asteroid: React.FC<AsteroidProps> = ({
  position,
  health,
  onReachTarget,
  isUpgrade = false,
  upgradeId,
  onUpgradeClick,
  upgradeIndex = 0
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
  
  // Create balanced size categories
  const sizeCategory = useMemo(() => {
    const rand = Math.random();
    if (rand < 0.4) return 'small';
    if (rand < 0.7) return 'medium';
    if (rand < 0.9) return 'large';
    return 'extra-large';
  }, []);

  // FIXED: Reduced all sizes by half as requested
  const randomScale = useMemo(() => {
    const sizeMultipliers = {
      'small': 0.075 + Math.random() * 0.05,     // 0.075-0.125 (half previous size)
      'medium': 0.125 + Math.random() * 0.075,   // 0.125-0.20 (half previous size)
      'large': 0.20 + Math.random() * 0.1,       // 0.20-0.30 (half previous size)
      'extra-large': 0.30 + Math.random() * 0.15 // 0.30-0.45 (half previous size)
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

  useFrame((state) => {
    if (group.current) {
      group.current.position.copy(position);
      
      if (isUpgrade) {
        // Special animations for upgrades
        group.current.rotation.x += 0.02;
        group.current.rotation.y += 0.03;
        group.current.rotation.z += 0.01;
        
        // Pulsing effect for upgrades
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
        group.current.scale.setScalar(pulse);
      } else {
        // Regular asteroid rotation
        group.current.rotation.x += 0.01;
        group.current.rotation.y += 0.005;
      }

      if (group.current.position.z >= 0) {
        onReachTarget?.();
      }
    }
  });

  // Create polygon meteor shape with proper scaling
  const renderPolygonMeteor = () => {
    // Direct scaling - no additional multipliers needed
    const polygonScale = randomScale * 8; // Simple multiplier to make polygon visible
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

  const handleClick = (e: any) => {
    if (isUpgrade && upgradeId && onUpgradeClick) {
      e.stopPropagation();
      onUpgradeClick(upgradeId);
    }
  };

  // Enhanced rendering with distinct upgrade visuals
  const renderMeteorModel = () => {
    const clickProps = isUpgrade ? { onClick: handleClick } : {};
    
    // For upgrades, render enhanced polygon with special effects
    if (isUpgrade) {
      // Color variation based on upgrade index
      const upgradeColors = [
        '#00ffff', '#ff00ff', '#ffff00', '#00ff00', 
        '#ff6600', '#ff0066', '#6600ff', '#66ff00'
      ];
      const upgradeColor = upgradeColors[upgradeIndex % upgradeColors.length];
      
      return (
        <group {...clickProps}>
          {/* Main upgrade polygon - same shape as meteors but enhanced */}
          <mesh scale={randomScale * 10}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color={upgradeColor} 
              roughness={0.2} 
              metalness={0.8}
              emissive={upgradeColor}
              emissiveIntensity={0.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          {/* Upgrade glow outline */}
          <mesh scale={randomScale * 11}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshBasicMaterial 
              color={upgradeColor}
              transparent
              opacity={0.3}
              wireframe={true}
            />
          </mesh>
          
          {/* Floating particles around upgrade */}
          {[...Array(4)].map((_, i) => (
            <mesh key={i} 
              position={[
                Math.cos(i * Math.PI / 2) * 1.5,
                Math.sin(i * 0.5) * 0.8,
                Math.sin(i * Math.PI / 2) * 1.5
              ]} 
              scale={randomScale * 2}
            >
              <octahedronGeometry args={[0.3, 0]} />
              <meshBasicMaterial 
                color={upgradeColor}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      );
    }
    
    // Regular meteor rendering (unchanged)
    try {
      if (randomModel === 'polygon') {
        return (
          <mesh scale={randomScale * 8} {...clickProps}>
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
      } else {
        const model = randomModel === 'fbx' ? fbx : glbScene;
        if (model) {
          return (
            <primitive
              object={model.clone()}
              scale={randomScale}
              {...clickProps}
            />
          );
        } else {
          // Fallback to polygon if model fails to load
          return (
            <mesh scale={randomScale * 8} {...clickProps}>
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
        }
      }
    } catch (error) {
      console.warn('Asteroid model render error, using fallback:', error);
      return (
        <mesh scale={randomScale * 8} {...clickProps}>
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
