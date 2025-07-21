
import React, { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useRegisterCollider } from '@/lib/CollisionContext';
import { useGLTFWithCors } from '@/lib/useGLTFWithCors';

interface EnhancedUpgradePedestalProps {
  position: [number, number, number];
  upgrade: any;
  isUnlocked: boolean;
  isPurchased: boolean;
  canAfford: boolean;
  onInteract: () => void;
  tier: number;
}

export const EnhancedUpgradePedestal: React.FC<EnhancedUpgradePedestalProps> = ({
  position,
  upgrade,
  isUnlocked,
  isPurchased,
  canAfford,
  onInteract,
  tier
}) => {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useRegisterCollider(
    `upgrade-${upgrade.id}`,
    new Vector3(...position),
    1.5
  );
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Rotation
      if (isPurchased) {
        meshRef.current.rotation.y += 0.01;
      } else if (isUnlocked) {
        meshRef.current.rotation.y += 0.02;
      }
    }
    
    if (glowRef.current && isUnlocked) {
      // Pulsing glow
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const tierColors = ['#a7f3d0', '#7dd3fc', '#818cf8', '#c084fc'];
  const getCrystalColor = () => {
    if (isPurchased) return '#10B981';
    const base = tierColors[Math.min(tier - 1, tierColors.length - 1)] || '#6B7280';
    if (isUnlocked) return base;
    return '#6B7280';
  };

  const getPedestalTier = () => {
    if (tier >= 5) return { height: 2, rings: 3, material: '#FFD700' }; // Gold
    if (tier >= 3) return { height: 1.5, rings: 2, material: '#C0C0C0' }; // Silver
    return { height: 1, rings: 1, material: '#8B7355' }; // Bronze
  };

  const pedestalConfig = getPedestalTier();

  // Enhanced click handler with better event handling
  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('EnhancedUpgradePedestal: Clicked on upgrade', upgrade.id);
    if (isUnlocked) {
      onInteract();
    }
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
  };

  // Check if this is every fifth upgrade (5, 10, 15, etc.)
  const isSpecialUpgrade = upgrade.id % 5 === 0;

  // Special upgrade model component - using one of the skeleton models for now
  const SpecialUpgradeModel = () => {
    try {
      const gltf = useGLTFWithCors('/assets/KayKit_Skeletons_1.0_FREE/characters/gltf/Skeleton_Mage.glb');
      return (
        <primitive
          ref={meshRef}
          object={gltf.scene.clone()}
          position={[0, 1, 0]}
          scale={hovered ? 0.55 : 0.5} // Smaller scale for pedestals
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      );
    } catch (error) {
      console.warn('Failed to load special upgrade model, falling back to default');
      // Fallback to default crystal
      return (
        <mesh
          ref={meshRef}
          position={[0, 1, 0]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          scale={hovered ? 1.1 : 1}
          castShadow
        >
          <icosahedronGeometry args={[0.8, 1]} />
          <meshLambertMaterial
            color="#FFD700"
            transparent
            opacity={isUnlocked ? 0.9 : 0.5}
          />
        </mesh>
      );
    }
  };

  return (
    <group position={position}>
      {/* Enhanced clickable area - larger invisible mesh for easier clicking */}
      <mesh
        position={[0, 1.5, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Render special model for every fifth upgrade */}
      {isSpecialUpgrade ? (
        <Suspense fallback={null}>
          <SpecialUpgradeModel />
        </Suspense>
      ) : (
        <>
          {/* Default pedestal base */}
          <mesh position={[0, 0, 0]} receiveShadow>
            <cylinderGeometry args={[1.2, 1.5, pedestalConfig.height, 8]} />
            <meshLambertMaterial color={pedestalConfig.material} />
          </mesh>
          
          {/* Pedestal rings for higher tiers */}
          {Array.from({ length: pedestalConfig.rings }).map((_, i) => (
            <mesh key={i} position={[0, pedestalConfig.height + 0.1 + (i * 0.3), 0]}>
              <torusGeometry args={[1.3 + i * 0.2, 0.05, 8, 16]} />
              <meshBasicMaterial color={pedestalConfig.material} />
            </mesh>
          ))}
          
          {/* Main crystal - also clickable */}
          <mesh
            ref={meshRef}
            position={[0, 1, 0]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            scale={hovered ? 1.1 : 1}
            castShadow
          >
            {tier === 1 && <tetrahedronGeometry args={[0.5]} />}
            {tier === 2 && <octahedronGeometry args={[0.6]} />}
            {tier === 3 && <dodecahedronGeometry args={[0.7]} />}
            {tier >= 4 && <icosahedronGeometry args={[0.8, 1]} />}
            <meshLambertMaterial
              color={getCrystalColor()}
              transparent
              opacity={isUnlocked ? 0.9 : 0.5}
            />
          </mesh>
        </>
      )}
      
      {/* Glow effect */}
      {isUnlocked && (
        <mesh ref={glowRef} position={[0, 1.5, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color={getCrystalColor()}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}
      
      {/* Upgrade tier indicators */}
      {isPurchased && tier > 1 && (
        <>
          {Array.from({ length: Math.min(tier - 1, 3) }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 2.1) * 1, 2 + i * 0.2, Math.sin(i * 2.1) * 1]}>
              <sphereGeometry args={[0.1]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          ))}
        </>
      )}
      
      {/* Particle effects for higher tiers */}
      {isPurchased && tier >= 3 && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * 1.26) * 2,
              1.5 + Math.sin(i * 1.26) * 0.5,
              Math.sin(i * 1.26) * 2
            ]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#A78BFA" transparent opacity={0.7} />
            </mesh>
          ))}
        </>
      )}
      
      {/* Interaction indicator */}
      {hovered && isUnlocked && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
