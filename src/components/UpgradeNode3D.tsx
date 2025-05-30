
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface UpgradeNode3DProps {
  upgrade: any;
  position: [number, number, number];
  isUnlocked: boolean;
  isPurchased: boolean;
  canAfford: boolean;
  onClick: () => void;
  realm: 'fantasy' | 'scifi';
}

export const UpgradeNode3D: React.FC<UpgradeNode3DProps> = ({
  upgrade,
  position,
  isUnlocked,
  isPurchased,
  canAfford,
  onClick,
  realm
}) => {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      
      // Rotation based on state
      if (isPurchased) {
        meshRef.current.rotation.y += 0.01;
      } else if (isUnlocked && canAfford) {
        meshRef.current.rotation.y += 0.02;
      }
    }

    if (glowRef.current && isUnlocked && !isPurchased) {
      // Pulsing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const getNodeColor = () => {
    if (isPurchased) return '#10b981'; // Green
    if (isUnlocked && canAfford) return realm === 'fantasy' ? '#8b5cf6' : '#06b6d4';
    if (isUnlocked) return realm === 'fantasy' ? '#6b46c1' : '#0e7490';
    return '#6b7280'; // Gray
  };

  const getGlowColor = () => {
    if (isPurchased) return '#34d399';
    return realm === 'fantasy' ? '#c084fc' : '#67e8f9';
  };

  return (
    <group position={position}>
      {/* Glow effect for unlocked nodes */}
      {isUnlocked && !isPurchased && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial
            color={getGlowColor()}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Main node */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {/* Node shape based on type */}
        {upgrade.id.includes('core') || upgrade.id.includes('engine') ? (
          <octahedronGeometry args={[0.5]} />
        ) : upgrade.id.includes('dragon') || upgrade.id.includes('beacon') ? (
          <coneGeometry args={[0.5, 1, 6]} />
        ) : (
          <dodecahedronGeometry args={[0.5]} />
        )}
        
        <meshLambertMaterial
          color={getNodeColor()}
          transparent
          opacity={isUnlocked ? 0.9 : 0.5}
        />
      </mesh>

      {/* Connection lines to show tier relationships */}
      {position[1] > -1 && (
        <mesh position={[0, -0.8, 0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5]} />
          <meshBasicMaterial
            color={realm === 'fantasy' ? '#8b5cf6' : '#06b6d4'}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Status indicator */}
      {isPurchased && (
        <mesh position={[0.4, 0.4, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}
    </group>
  );
};
