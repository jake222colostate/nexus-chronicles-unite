
import React, { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import { useRegisterCollider } from '@/lib/CollisionContext';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';
import { FantasyObeliskModels } from './FantasyObeliskModels';

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
  
  // Optimize useFrame - remove heavy animations to fix hover lag
  useFrame((state) => {
    // Only minimal animation for glow effect
    if (glowRef.current && isUnlocked && !isPurchased && !hovered) {
      // Very gentle pulsing only when not hovered - much reduced frequency
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 0.95;
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
    if (isUnlocked) {
      setHovered(true);
    }
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
  };

  // Pedestal/obelisk model using GLB files with fallback
  const PedestalModel = () => {
    // Use new fantasy obelisk models for obelisk type
    if (modelType === 'obelisk') {
      return (
        <FantasyObeliskModels
          upgradeId={upgrade.id}
          onInteract={onInteract}
          isUnlocked={isUnlocked}
          hovered={hovered}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      );
    }

    try {
      const assetPath = assetUrl('assets/upgrades/Podiums.glb');
      const { scene } = useGLTF(assetPath);

      return (
        <group
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          scale={hovered ? 1.05 : 1.0}
          position={[0, 0, 0]}
        >
          <primitive object={scene.clone()} />

          {/* Crystal on top for podiums */}
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
      
      {/* Optimized glow effect - only when unlocked and not purchased */}
      {isUnlocked && !isPurchased && (
        <mesh ref={glowRef} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.5, 1.7, 0.3, 16]} />
          <meshBasicMaterial
            color={getCrystalColor()}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}
      
      {/* Simple purchase indicator */}
      {isPurchased && (
        <mesh position={[0.8, 2, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      )}
      
      {/* Interaction indicator - simplified */}
      {hovered && isUnlocked && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      )}
    </group>
  );
};

// Preload the GLB model
useGLTF.preload(assetUrl('assets/upgrades/Podiums.glb'));
