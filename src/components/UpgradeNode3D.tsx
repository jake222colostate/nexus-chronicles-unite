
import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

interface UpgradeNode3DProps {
  upgrade: any;
  position: [number, number, number];
  isUnlocked: boolean;
  isPurchased: boolean;
  canAfford: boolean;
  onClick: () => void;
  realm: 'fantasy' | 'scifi';
}

export const UpgradeNode3D: React.FC<UpgradeNode3DProps> = React.memo(({
  upgrade,
  position,
  isUnlocked,
  isPurchased,
  canAfford,
  onClick,
  realm
}) => {
  const meshRef = useRef<Group>(null);
  const fallbackMeshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const tierColors = ['#a7f3d0', '#7dd3fc', '#818cf8', '#c084fc'];

  const nodeColor = useMemo(() => {
    const base = tierColors[Math.min(upgrade.tier - 1, tierColors.length - 1)] || '#6b7280';
    if (isPurchased) return '#10b981';
    if (isUnlocked && canAfford) return base;
    if (isUnlocked) return base;
    return '#6b7280';
  }, [isPurchased, isUnlocked, canAfford, upgrade.tier]);

  const glowColor = useMemo(() => {
    if (isPurchased) return '#34d399';
    return tierColors[Math.min(upgrade.tier - 1, tierColors.length - 1)] || '#c084fc';
  }, [isPurchased, upgrade.tier]);

  const geometry = useMemo(() => {
    switch (upgrade.tier) {
      case 1:
        return <tetrahedronGeometry args={[0.4]} />;
      case 2:
        return <octahedronGeometry args={[0.5]} />;
      case 3:
        return <dodecahedronGeometry args={[0.6]} />;
      default:
        return <icosahedronGeometry args={[0.7, 1]} />;
    }
  }, [upgrade.tier]);

  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation - reduced frequency
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Rotation based on state - reduced speed
      if (isPurchased) {
        // meshRef.current.rotation.y += 0.005; // DISABLED - static rotation
      } else if (isUnlocked && canAfford) {
        // meshRef.current.rotation.y += 0.01; // DISABLED - static rotation
      }
    }

    // Optimized glow effect - only when needed
    if (glowRef.current && isUnlocked && !isPurchased) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  // Fantasy podium model using GLB file
  const FantasyPodiumModel = () => {
    try {
      const { scene } = useGLTF(assetUrl('assets/upgrades/Podiums.glb'));
      
      return (
        <group
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 0.8 : 0.7}
        >
          <primitive object={scene.clone()} />
          
          {/* Crystal on top */}
          <mesh position={[0, 0.6, 0]} castShadow>
            {geometry}
            <meshLambertMaterial
              color={nodeColor}
              transparent
              opacity={isUnlocked ? 0.9 : 0.5}
            />
          </mesh>
        </group>
      );
    } catch (error) {
      console.error('Error loading Podiums.glb:', error);
      return null;
    }
  };

  return (
    <group position={position}>
      {/* Glow effect for unlocked nodes */}
      {isUnlocked && !isPurchased && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Main node - use podium model for fantasy realm */}
      {realm === 'fantasy' ? (
        <Suspense fallback={
          <mesh
            ref={fallbackMeshRef}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            scale={hovered ? 1.1 : 1}
          >
            {geometry}
            <meshLambertMaterial
              color={nodeColor}
              transparent
              opacity={isUnlocked ? 0.9 : 0.5}
            />
          </mesh>
        }>
          <FantasyPodiumModel />
        </Suspense>
      ) : (
        <mesh
          ref={fallbackMeshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.1 : 1}
        >
          {geometry}
          <meshLambertMaterial
            color={nodeColor}
            transparent
            opacity={isUnlocked ? 0.9 : 0.5}
          />
        </mesh>
      )}

      {/* Connection lines - simplified */}
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
});

UpgradeNode3D.displayName = 'UpgradeNode3D';

// Preload the GLB model
useGLTF.preload(assetUrl('assets/upgrades/Podiums.glb'));
