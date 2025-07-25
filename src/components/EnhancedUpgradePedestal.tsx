
import React, { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import { useRegisterCollider } from '@/lib/CollisionContext';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

interface EnhancedUpgradePedestalProps {
  position: [number, number, number];
  upgrade: any;
  isUnlocked: boolean;
  isPurchased: boolean;
  canAfford: boolean;
  onInteract: () => void;
  tier: number;
  modelType?: 'podium' | 'obelisk';
}

export const EnhancedUpgradePedestal: React.FC<EnhancedUpgradePedestalProps> = ({
  position,
  upgrade,
  isUnlocked,
  isPurchased,
  canAfford,
  onInteract,
  tier,
  modelType = 'podium'
}) => {
  const meshRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useRegisterCollider(
    `upgrade-${upgrade.id}`,
    new Vector3(...position),
    1.5
  );
  
  useFrame((state) => {
    if (meshRef.current) {
      // Only apply floating animation to podiums, not obelisks
      if (modelType !== 'obelisk') {
        // Gentle floating animation - additive to maintain ground level
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        
        // Rotation
        if (isPurchased) {
          meshRef.current.rotation.y += 0.01;
        } else if (isUnlocked) {
          meshRef.current.rotation.y += 0.02;
        }
      }
      // Obelisks: no position override, let them use their spawn position
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

  // Pedestal/obelisk model using GLB files with fallback
  const PedestalModel = () => {
    try {
      const assetPath =
        modelType === 'obelisk'
          ? assetUrl('assets/upgrades/LargeObelisk.glb')
          : assetUrl('assets/upgrades/Podiums.glb');

      const { scene } = useGLTF(assetPath);

      return (
        <group
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          scale={modelType === 'obelisk' ? [5.33, 5.33, 5.33] : (hovered ? 1.05 : 1.0)}
          position={modelType === 'obelisk' ? [0, 15, 0] : [0, 0, 0]} // Raise obelisk model up by 15 units
        >
          <primitive object={scene.clone()} />

          {/* Crystal on top for podiums */}
          {modelType !== 'obelisk' && (
            <mesh position={[0, 1.4, 0]} castShadow>
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
          )}
        </group>
      );
    } catch (error) {
      console.error('Error loading upgrade model:', error);
      // Fallback to basic geometry if GLB fails
      return (
        <group
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          scale={hovered ? 1.05 : 1.0}
        >
          {/* Basic pedestal fallback */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[1, 1.2, 1, 8]} />
            <meshLambertMaterial color={pedestalConfig.material} />
          </mesh>
          <mesh position={[0, 1.4, 0]} castShadow>
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
        </group>
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

      {/* Pedestal or obelisk model */}
      <Suspense fallback={null}>
        <PedestalModel />
      </Suspense>
      
      {/* Magical glow effect around podium base */}
      {isUnlocked && (
        <mesh ref={glowRef} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[2, 2.2, 0.5, 32]} />
          <meshBasicMaterial
            color={getCrystalColor()}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
      
      {/* Additional magical aura for enhanced visual appeal */}
      {isUnlocked && canAfford && (
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
          <ringGeometry args={[1.8, 2.5, 32]} />
          <meshBasicMaterial
            color={isPurchased ? '#10B981' : getCrystalColor()}
            transparent
            opacity={0.25}
            side={2} // Double-sided
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

// Preload the GLB model
useGLTF.preload(assetUrl('assets/upgrades/Podiums.glb'));
useGLTF.preload(assetUrl('assets/upgrades/LargeObelisk.glb'));
